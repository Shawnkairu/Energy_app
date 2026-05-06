# Pilot Scope

Single source of truth for what the pilot covers and what is deferred. Where this document conflicts with [ROADMAP.md](../ROADMAP.md), [TEST.md](../TEST.md), or other product docs, **PILOT_SCOPE.md wins for the pilot release**.

> **IA companion:** [IA_SPEC.md](IA_SPEC.md) is the canonical screen layout for mobile and website portals — six roles, max 5 tabs each, profile always rightmost. Provider and Supplier are merged into a single Provider role with `business_type` (panels / infrastructure / both). Installer is renamed to Electrician. Owner is renamed to Building Owner (role string `building_owner`). Admin is never publicly selectable — see [IA_SPEC §8.5](IA_SPEC.md).

## Doctrine carve-outs (pilot only)

The product doctrine in [PRODUCT_SPEC.md](PRODUCT_SPEC.md) and the Core Rules in [README.md](../README.md) remain the long-term truth. The pilot temporarily relaxes three of them so we can ship and validate the model without external integrations:

| Long-term rule | Pilot behavior | Reverted when |
|---|---|---|
| Phone + SMS OTP | **Email OTP only** | After SMS sender ID is approved by carrier (post-pilot) |
| Prepaid cash gates allocation | **Pledge gates allocation** — residents commit a non-binding KES amount; no money moves | After M-Pesa Daraja Go-Live approval (post-pilot) |
| Live energy from on-site IoT | **Synthesized generation, load, irradiance** | After hardware deployment + meter integration (post-pilot) |

Every release gate in TEST.md still applies, but its pilot-mode interpretation is documented below.

---

## 1. Authentication: email OTP

### What ships

- `POST /auth/request-otp` accepts `{ email }` (was `{ phone }`), generates a 6-digit code with 10-minute TTL, sends via transactional email provider (Resend or AWS SES).
- `POST /auth/verify-otp` accepts `{ email, code }` and returns `{ token, user }`.
- Mobile login screen takes an email instead of a phone number; OTP input unchanged.
- Existing JWT middleware, session storage in SecureStore, and "remember me across restarts" all still apply.

### What is deferred

- SMS-based OTP and Africa's Talking / Twilio integration.
- Phone-number-as-identity (post-pilot users may have phone added as a secondary identifier).

### Provider choice

Resend (default) — 3,000 emails/month free, ~5-minute SDK integration, deliverability is solid for transactional codes. Fallback: AWS SES.

### Feasibility & cost

Trivial. ~15 minutes of integration. No carrier approvals.

---

## 2. Money flow: pledge mode (no real payment)

### What ships

- Resident "Top up solar" screen renames to **"Pledge solar"**. Inputs are unchanged: amount in KES + preset chips (500 / 1,000 / 2,000 / 5,000).
- Backend stores pledges in `prepaid_commitments` with `payment_method = 'pledge'` and `status = 'confirmed'` immediately on submit (no separate confirm step needed).
- The DRS calculator and projector treat confirmed pledges identically to confirmed prepaid for the purposes of gating allocation — but the resident UI clearly labels the amount as **"pledged, not charged"**.
- Settlement runs in **simulation mode**: it computes the waterfall and displays projected splits, but writes a `settlement_period.simulation = true` flag and never produces a payout instruction.
- Cockpit shows pledged totals separately from "would-be cash" so we can validate the demand model against actual willingness-to-pay.

### What is deferred

- M-Pesa Daraja STK push, paybill, callback handling.
- Payout instructions to provider/financier/owner wallets.
- Reconciliation between confirmed pledges and actual cash receipts (no cash exists yet).
- Partial commitments, refunds, dispute flows.

### UI requirements

- All buttons, copy, and screens that mention "commit", "top up", "pay", or "balance" must be relabeled in pilot mode to "pledge", "intent", or "projected" respectively.
- A persistent banner on every wallet/pledge screen reads: *"Pilot: pledges are non-binding and no money is charged."*
- Admin/cockpit views show both perspectives: pledge total and the simulated cash equivalent.

### Doctrine reconciliation

The Core Rule "no prepaid → no allocation" becomes **"no pledge → no allocation simulation"** for pilot mode. The invariant that DRS, projector, and settlement only run with positive committed value at the building level is preserved — pledges replace prepaid as the gating signal.

### Feasibility & cost

Trivial. The existing `prepaid_commitments` table and endpoints already support this with a single column rename / additional enum value. ~2 hours of work.

---

## 3. Synthetic energy data

We ship the pilot with no on-site meters. Three streams are synthesized server-side and treated as the canonical source for the pilot:

1. **Solar generation per building** — kWh by hour
2. **Load profile per resident / per building** — kWh by hour
3. **Sun intensity / GHI per building location** — W/m² by hour

### Data sources

| Stream | Source | Cost | Coverage in Kenya |
|---|---|---|---|
| Hourly POA generation per building | **NREL PVWatts v8 API** | Free, no API key needed for `pvwatts/v8` JSON endpoint | Excellent (uses NSRDB v3 → falls back to international datasets including Kenya) |
| Daily / hourly GHI & DNI for any lat/lon | **NASA POWER API** | Free, no key | Global, back to 1981; ~½° resolution |
| Hourly solar radiation forecast | **Open-Meteo Solar Radiation API** | Free, no key, no signup | Global, hourly, includes Kenya |
| Load profile templates | Parameterized internal model + **USAID/KPLC East African Power Pool** load curves | Free / public reports | Kenya-specific peaks (6–9 AM, 6–10 PM) |

### Generation model (per array)

```
inputs:  array_kw, lat, lon, tilt_deg (default = lat), azimuth_deg (default = 0/north for southern hemisphere; Kenya straddles equator so default = south-facing 0 for now)
process:
  1. PVWatts call → returns hourly AC kWh for a typical meteorological year (TMY)
  2. apply local degradation factor (default 0.5%/yr after year 1)
  3. apply soiling factor (default 5% for Kenya; tunable per region)
  4. inject simulated cloud noise (gaussian, σ=8% during daylight) so the curves look realistic
output:  E_gen[hour] for the period
```

Cache per-array TMY locally so we hit PVWatts at most once per array per quarter. PVWatts is rate-limited to ~1,000 calls/day per IP — fine.

### Load model (per resident → aggregated to building)

Resident is assigned a profile from one of four archetypes (already scaffolded in [Simulation/files/customers.py](../Simulation/files/customers.py)):

- `basic_lighting` — 1.5–3 kWh/day, evening-only peak
- `lighting_tv` — 3–6 kWh/day, evening peak + small afternoon
- `emerging_appliance` — 6–12 kWh/day, morning + evening peaks
- `microbiz_kiosk` — 10–25 kWh/day, daytime + evening

Each archetype has a 24-hour shape vector. Daily totals randomized with σ=15%. Building load is the sum of resident loads.

### Irradiance display (resident "today" card)

For the **"How sunny was today?"** UI, hit Open-Meteo's hourly `shortwave_radiation` for the building lat/lon and cache for 30 minutes. Free, no key.

### Truth labeling

Every synthesized data point in the UI must be tagged. The shared `EnergyReading` type adds `source: 'synthetic' | 'measured'`. Cockpit and admin home screens must show a synthetic-data badge on any chart fed by synthetic streams.

### Feasibility & cost

Solid. ~2–3 days end-to-end (PVWatts integration → caching → load profile generator → irradiance fetcher → source tagging in shared types). Existing PoC code in [Simulation/](../Simulation/) can be lifted into [packages/shared/](../packages/shared/) and called from [backend/](../backend/).

---

## 4. Roof footprint capture

Building owners list a building by drawing or confirming the roof polygon. We compute usable roof area (m²) and use it to:

- Constrain the maximum array kWp at design time (typical rooftop solar density: 5.5 m² per 1 kWp for residential modules)
- Inform DRS load profile vs available capacity scoring
- Render a roof outline on the building card for credibility

### Approach (pilot)

Three-tier waterfall, each step is optional fallback:

1. **Auto-suggest from Microsoft GlobalMLBuildingFootprints**
   Open dataset (CC BY 4.0), includes Africa. Owner enters address → we geocode → query the open footprint dataset → suggest a polygon with a confidence score. Owner taps "looks right" or "let me redraw".

2. **Manual polygon trace on satellite tile**
   Render a Google Maps Static API or Mapbox satellite tile centered on the address. Owner taps roof corners; app draws polygon and computes area on a Web Mercator → equirectangular projection (shoelace formula scaled by latitude).

3. **Manual sqm entry**
   For owners who can't use either (low connectivity, missing imagery), accept a typed m² number with a sworn-by-owner flag. DRS scores this lower until verified by installer site visit.

### What does NOT ship in the pilot

- **Google Solar API** — high-quality roof segmentation, tilt, and shade modeling. **Not available in Kenya** as of late 2024 (US, parts of EU, JP, AU only). Watch for coverage expansion; integrate post-pilot if Kenya is added.
- 3D roof reconstruction, automated tilt/azimuth detection, shade analysis.
- LiDAR / drone surveys.

### Provider choice for satellite tiles

Google Maps Static API (default) — $2 per 1,000 loads, very high imagery quality in Kenyan cities. Fallback: Mapbox Static API (50,000 free loads/month).

### Schema additions

```
buildings:
  + roof_area_m2          numeric         -- computed from polygon or manually entered
  + roof_polygon_geojson  jsonb           -- the GeoJSON Polygon, lat/lon
  + roof_source           text            -- 'microsoft_footprints' | 'owner_traced' | 'owner_typed'
  + roof_confidence       numeric         -- 0..1, used in DRS
```

### Feasibility & cost

Solid. ~2 days end-to-end:
- ½ day: Microsoft footprints fetcher + caching
- ½ day: satellite-tile polygon UI in mobile (`react-native-maps` already on the dependency list)
- ½ day: shoelace area math + projection handling + unit tests
- ½ day: cockpit view + DRS integration

Recurring cost: roughly $20/month at 10,000 building list events (Google Static API). Free if Mapbox is used.

---

## 5. What this means for the existing docs

### ROADMAP.md changes

- **Step 3 (Auth)** — phone OTP → email OTP. Drop SMS integration plan.
- **Step 4 (Prepaid)** — rename to **Pledge Flow**; remove M-Pesa references.
- **New Step 4.5 (Synthetic energy data)** — PVWatts + NASA POWER + Open-Meteo integration before settlement step.
- **New Step 5.5 (Roof capture)** — between DRS qualification and settlement; required input for accurate DRS.
- "Post-pilot" appendix lists: SMS OTP, M-Pesa Daraja, on-site meters, Google Solar API integration once Kenya is covered.

### TEST.md changes

- Auth section (4.3) — replace phone/SMS gates with email gates.
- Prepaid section (4.4) — rename to Pledge; assert `payment_method='pledge'`, no cash side-effects.
- New section: **Synthetic data integrity** — every chart fed by synthetic streams must render a "synthetic" badge; toggle in cockpit must distinguish measured from synthetic.
- New section: **Roof capture** — area computation correctness, polygon storage, fallback behavior, DRS integration.

### USER_FLOWS.md changes

- Resident: "verify phone, preload solar tokens" → "verify email, **pledge solar**".
- Building Owner: "submit basics" → "submit basics **and confirm roof polygon**".

### DATA_MODEL.md additions

- Building gains: `roof_area_m2`, `roof_polygon_geojson`, `roof_source`, `roof_confidence`.
- Resident Account: `email` becomes primary identifier; `phone` is optional secondary.
- Settlement Period gains: `simulation` boolean, `data_source` enum (`synthetic` | `measured` | `mixed`).
- New table **EnergyReading**: `building_id`, `timestamp`, `kind` (gen/load/irradiance), `value`, `unit`, `source` (synthetic/measured), `provenance` (which API + cache key).

---

## 6. Pilot exit criteria

The pilot ends and we revert each carve-out when:

- **SMS OTP**: carrier sender ID approved AND email-OTP error rate < 1% over 30 days.
- **Real money**: M-Pesa Daraja production credentials issued AND ≥ 80% of pilot pledgers convert when payment is enabled in a follow-up cohort.
- **On-site IoT**: at least one building has a working production meter feed AND synthetic-vs-measured residuals are within ±15% on a 30-day window.
- **Google Solar API**: Kenya appears on the Google coverage list AND a 50-building eval shows roof-area agreement within ±10% of our owner-traced polygons.

---

## 7. What this changes for the 2-day sprint

The path-to-shippable from the audit just got shorter:

- ✅ Carrier approvals removed → no external clock dependency
- ✅ M-Pesa removed → no external clock dependency
- ➕ PVWatts + Open-Meteo integration → +½ day
- ➕ Roof polygon UI + Microsoft footprints → +1 day

Net effect: **the pilot is now achievable end-to-end in ~3 working days of focused parallel agent work.**
