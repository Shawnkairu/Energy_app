# IA Spec — Definitive Screen Inventory

> **Source of truth:** `docs/imported-specs/` — every screen, state, field, flow, gate, and component below is derived entirely from scenario specs A–F, installation/DRS/LBRS, and AI-native doctrine. No invented requirements; cite each spec section inline. Once locked, this doc answers the build phase: *"For role X on surface Y, what are all screens, what does each screen render in each state, what fields does it capture, what flows does it expose, what gates does it enforce?"*

---

## Universal Rules (Preserved & Reinforced)

These rules carry forward from IA_SPEC.md v2, validated against all imported-specs:

- **IA-U1:** Max 5 tab-bar screens per stakeholder. Anything beyond is embedded (push from card/row). ✓ Scenario A §10, Scenario B §5, Scenario C §7, Scenario D §8, Scenario E §13, Scenario F §6 all conform.
- **IA-U2:** Profile always rightmost tab. ✓ All scenarios.
- **IA-U3:** Wallet exists for every role that touches money (all except admin-mobile). ✓ Scenarios A–F, Financier §16.
- **IA-U4:** First tab by intent:
  - **Ecosystem contributors** (Provider, Electrician, Financier) → **Discover** (project marketplace). ✓ Scenario D §8, Scenario E §9, Scenario F §7.
  - **Building/home operators** (Building Owner, Homeowner) → **Home** (project status). ✓ Scenario B §5, Scenario C §7.
  - **Resident** → **Home** (token balance). ✓ Scenario A §10.
- **IA-U5:** No non-working buttons; every interactive element has a real handler, route, modal, or API call.
- **IA-U6:** No mock data; every metric real or labeled synthetic/projected. ✓ Scenario A §10 (synthetic badge), Scenario F §17 (projected return labeling).
- **IA-U7:** Settings, support, compliance (electricians only) live embedded in **Profile**, not as separate tabs. ✓ Scenario D §4, existing IA v2.
- **IA-U8:** Profile always contains: account info, settings (embedded), support (embedded), logout. Electrician compliance lives embedded in Profile. ✓ Scenario D §18–19.
- **IA-U9:** Generation visibility is **share-gated**: appears only if user holds ≥0% ownership in any relevant array/infrastructure. Empty state shown (no screen hidden). ✓ Scenario A §8.5, Scenario B §5, Scenario C §7, Scenario E §13.
- **IA-U10:** **Mobile and website portals must mirror exactly**: same screens, same order, same data. Website responsive (tab bar → left rail desktop / bottom bar mobile-web). ✓ Existing IA v2 §9.

---

## Role Naming + Terminology (Enforced)

- **Electrician** (NOT Installer) — Scenario D §2 mandates.
- **Building Owner** (NOT Owner; "I own or manage an apartment building") — Scenario B §3.
- **Homeowner** — distinct first-class role (single-family, sole resident). Scenario C §1.
- **Provider** — single role with `businessType ∈ {panels, infrastructure, both}` per Scenario E §2.
- **Financier** — Scenario F.
- **Resident** — Scenario A.
- **Admin** — never in public picker; four gates enforce (IA v2 §8.5).

**No role aliases.** Code must use exact names.

---

## Resident (4 screens: mobile + web parity)

*Scenario A: apartment resident, ATS-based allocation, capacity queue, pledges, tokens, ownership roadmap.*

### Tab structure
1. **Home** — token/pledge status + building availability state
2. **Energy** — 24h flow + generation (if owner)
3. **Wallet** — pledges, token purchases, ownership
4. **Profile** — building membership, unit/meter, load profile, support

### Resident · Home (mobile + web)

**Purpose:** branched dashboard — pre-activation vs live. Scenario A §10.

**States rendered (each must be supported):**

- **Loading:** skeleton with 4 KPI placeholders.
- **Pre-live / not activated** (apartment not ATS-verified):
  - **Building availability state pill** (A0–A6 per Scenario A §3, 7 distinct states, each with UI copy and action from §3):
    - A0: "e.mappa is not active here yet" → pledge + owner/neighbor invite CTAs
    - A1: "Owner joined, no project started" → pledge + load estimate CTA
    - A2: "Project organizing / DRS" → DRS progress + pledge adjust + load-profile improve CTAs
    - A3: "Funding / provider coordination" → timeline + capacity slots + stay-in-queue CTA
    - A4: "Installation in progress" → installation progress + confirm access CTA
    - A5: "Installed, apartment not activated" → "Solar installed, your unit not yet connected" + ATS activation steps
    - A6: "Live and connected" → branches to live state below
  - **Capacity queue status pill** (7 states per Scenario A §6.2: interested / pledged / capacity_review / capacity_cleared / queued / waitlisted / activated):
    - Residents see their queue position, priority factors (Scenario A §6.3: timestamp, load fit, confidence, equity guardrail), and projected activation timeline.
  - **Pledge balance card** (KES):
    - Amount pledged
    - "No money charged" banner per Scenario A §5
    - Edit/cancel pledge CTAs (allowed pre-activation per §5)
    - If capacity full: "Join capacity queue" CTA
  - **DRS demand score card** (if visible):
    - Building's overall DRS progress
    - Resident's load-profile contribution to DRS (Scenario A §7: Level 1 fast estimate during onboarding, improveable to L2/L3)
    - Load-profile confidence meter (low/medium/high)
  - **Next-action card:** contextual CTA (complete load profile / confirm unit access / wait for ATS / etc.)
  - **Owner/neighbor invite tools:** share building code, copy building link.

- **Live / activated** (apartment ATS-verified, capacity-cleared, tokens purchasable):
  - **Token balance hero** (KES + estimated kWh remaining):
    - Big number: prepaid balance
    - "Buy/top up tokens" CTA → token purchase flow (real money, post-activation per Scenario A §5)
    - "Estimated kWh remaining based on load profile"
  - **Live supply status** (from ATS state):
    - Current source: "e.mappa solar" vs "KPLC grid"
    - Battery SoC if available
    - Today's e.mappa consumption (kWh)
    - Grid fallback amount (kWh)
  - **Today's solar consumption** (kWh delivered + saved vs grid cost)
  - **System health indicator** (all green / warnings / alerts)
  - **Ownership marketplace CTA** (if project terms approved per Scenario A §8.6) → embedded marketplace

- **Error state:** explicit error message (network, data unavailable) + retry button; never silent fallback.
- **Empty state:** "No building joined yet" + onboarding CTA.

**Fields displayed (source-mapped):**
- building name, address, building state (A0–A6 label)
- resident unit number
- meter ID (if mapped)
- pledged amount (KES)
- queue status, position, priority score (if in queue)
- load-profile confidence (L1/L2/L3)
- ATS state (not mapped / mapped / capacity-cleared / scheduled / installed / verified / activated / suspended)
- token balance (KES + kWh equiv)
- today's solar (kWh), today's grid fallback (kWh), savings (KES)
- current source (e.mappa vs KPLC)
- ownership % if shares held
- latest incident/alert if any

**Flows triggered from Home:**
- Tap pledge card → `/pledge-detail` (edit/cancel, Scenario A §7)
- Tap capacity state pill → modal explaining all 7 states (Scenario A §6.2)
- Tap DRS score → `/drs-detail` (DRS progress, blockers, Scenario A §3)
- Tap "buy tokens" (live only) → `/token-purchase` (Scenario A §5)
- Tap "join capacity queue" (full) → `/queue-request`
- Tap "invite owner/neighbors" → share sheet
- Tap ownership CTA → `/marketplace` (embedded, Scenario A §8.6)
- Tap alert → `/alert-detail`

**Gates enforced client-side:**
- Hide "buy tokens" CTA unless `apartment.is_activated` AND `apartment.capacity_status = 'capacity_cleared'` (Scenario A §5 product law)
- Hide "ownership marketplace" CTA unless `project.stage in ('funding', 'approved', 'live')` (Scenario A §8.6)
- Show load-profile edit CTA if `confidence < 'high'` (Scenario A §7)
- Never show both A5 and "buy tokens" simultaneously; they are mutually exclusive states.

**Components needed:**
- `BuildingAvailabilityStatePill` (7 states: A0–A6, each with distinct color/icon/copy)
- `CapacityQueueStatusPill` (7 states: interested / pledged / capacity_review / cleared / queued / waitlisted / activated)
- `PledgeBalanceCard` (edit/cancel CTAs pre-activation only)
- `TokenBalanceHero` (live only)
- `LoadProfileConfidenceMeter` (L1–L3)
- `DRSProgressCard` (building-level DRS, not apartment-level)
- `SystemHealthIndicator` (green / warning / error)

**Spec citations:** Scenario A §3 (A0–A6 states), §5 (pledge vs buy rules), §6.2 (queue statuses), §6.3 (queue priority), §7 (load profile), §8.6 (ownership marketplace), §10 (Home screen purpose + layout).

---

### Resident · Energy (mobile + web)

**Purpose:** show where power came from today, future generation, self-consumption savings. Scenario A §10.

**States:**

- **Pre-live / not activated:**
  - Projected monthly load (from resident's load-profile estimate, Scenario A §7 L1/L2/L3)
  - Expected solar generation (from capacity plan, Scenario A §6.1)
  - Projected solar-first → battery → grid split (synthetic/projected badge)
  - Expected savings vs grid-only (KES and %)
  - Load-profile confidence indicator
  - Synthetic-data badge top-right
  - CTA: "Complete your load estimate to improve accuracy" (if L1 or unverified)

- **Live / activated:**
  - 24-hour stacked area chart: solar (apartment's share) / battery / grid fallback (Tesla/Enphase-inspired)
  - Synthetic-data badge top-right if applicable
  - Today summary KPIs:
    - kWh consumed (from meter)
    - kWh from e.mappa solar
    - KES saved vs grid
  - **Generation panel** (only if resident owns ≥1 share of any array on building, Scenario A §8.1, §9):
    - Today's generation kWh (proportional to ownership %)
    - 30-day generation history sparkline
    - **Empty state if zero shares:** "Buy a share to see live generation" + marketplace CTA
  - 30-day usage toggle
  - Allocation breakdown explainer (modal): solar-first → battery time-shift → grid fallback, with kWh and KES.

**Flows:**
- Tap 30-day usage detail → embedded 30-day chart + CSV export option
- Tap generation panel (if owner) → per-array generation detail (ownership %, payout share)
- Tap allocation explainer icon → modal explaining priority
- Tap load profile edit → `/load-profile-edit` (Scenario A §7 L2/L3 capture)

**Gates:**
- Hide generation panel unless `resident.ownership.shares > 0` (IA-U9)
- Show "synthetic" badge on all pre-live data
- After go-live, measured data only; if meter missing or stale, show conservative fallback.

**Components:**
- `EnergyTodayChart` (24-hour stacked area)
- `GenerationPanel` (share-gated)
- `SyntheticBadge`
- `AllocationExplainer` (modal)

**Spec citations:** Scenario A §7 (load profile), §8.1 (generation ownership), §9 (external monetization note), §10 (Energy screen).

---

### Resident · Wallet (mobile + web)

**Purpose:** track money and ownership. Three segmented sections per Scenario A §10.

**Segmented control (mobile tabs):**
1. **Pledges**
   - Pledge total (KES)
   - Pledge history (chronological, with status pills: active / cancelled / archived)
   - Edit/cancel CTA if pre-activation (Scenario A §5)
   - "No money charged in pilot" disclosure banner

2. **Token purchases** (live only)
   - Token balance (KES + kWh)
   - Consumption ledger (chronological debits with kWh, date, balance)
   - Top-up/buy CTA
   - Refund/rollover note if applicable

3. **Ownership** (if shares held)
   - Array/asset name, ownership %
   - Current valuation (cost-basis, replacement-cost, or income approach; cite Scenario A §8.3 method)
   - Share price per unit (if applicable)
   - Projected payouts (conservative range if not yet live; actual payouts if live)
   - **Empty state:** "You don't own shares yet" + marketplace CTA (Scenario A §8.6)

**Top cards (always visible):**
- Pledged total (KES)
- Earnings from shares (0 if none; only from monetized solar per Scenario A §8.5)
- Net savings vs grid (KES, including avoided cost + any external credits)

**Flows:**
- Tap pledge card → `/pledge-detail` (edit, cancel, history)
- Tap token balance → `/token-detail` (recharge, history)
- Tap ownership card → `/asset-detail` (valuation breakdown, buy/sell options)
- Tap "buy shares" (empty state) → `/marketplace` (embedded, Scenario A §8.6)

**Gates:**
- Ownership section hidden unless `resident.ownership.shares > 0` (IA-U9)
- "Buy tokens" visible only if `apartment.is_activated` (Scenario A §5)
- Earnings shown only if monetized solar exists (never from pledge alone per Scenario A §5)

**Components:**
- `TokenBalanceHero`
- `PledgeHistoryList`
- `OwnershipPositionCard`
- `OwnershipMarketplaceCard` (embedded)

**Spec citations:** Scenario A §5 (pledge vs buy), §8 (ownership), §8.3 (valuation methods), §8.5 (settlement rule), §10 (Wallet layout).

---

### Resident · Profile (mobile + web)

**Purpose:** account + settings + support + logout. Scenario A §10, IA-U8.

**Sections:**
- **Account:**
  - Email
  - Phone (optional)
  - Role: "Resident"
  - Building membership: [building name, address, unit number, meter ID]
  - Status: "Active" / "Invited" / "Pending verification"
  - Leave building CTA (if applicable)

- **Building & Unit Profile** (embedded section):
  - Building address, unit number, meter ID
  - ATS state (mapped / capacity-cleared / scheduled / installed / verified / activated / suspended)
  - Roof polygon thumbnail (if building-wide detail available)
  - [Edit meter details] (if manually entered)

- **Load Profile** (embedded section):
  - Current level (L1 / L2 / L3, per Scenario A §7)
  - Estimated monthly kWh
  - Daytime/evening split
  - [Edit load profile] CTA (Scenario A §7 L2/L3 capture form)
  - Confidence indicator

- **Notifications** (embedded section):
  - Toggle: ATS activation ready
  - Toggle: Pledge capacity cleared
  - Toggle: DRS milestone alerts
  - Toggle: Token low balance
  - Toggle: System fault alerts
  - Language: English / Swahili (future)

- **Support** (embedded section):
  - Help articles (FAQ link)
  - Contact support → email/in-app chat
  - Known issues + workarounds
  - Link to offline grid fallback guide

- **Logout**

**Flows:**
- Tap [Edit load profile] → `/load-profile-edit` (L2/L3 guided capture, Scenario A §7)
- Tap [Edit meter] → `/meter-edit-modal`
- Tap [Contact support] → email or in-app chat

**Gates:**
- Load profile editable if pre-activation or L1 confidence (Scenario A §7: "Residents should be able to... edit... pledge before activation")
- Load profile edit disabled post-activation unless explicitly allowed (Scenario A §7 lock rule)

**Components:**
- Standard settings/support sections

**Spec citations:** Scenario A §10, IA-U8.

---

### Resident Embedded Routes (not tab-bar)

These push from cards/rows; mobile: `mobile/app/(resident)/_embedded/`, web: `website/src/screens/stakeholders/resident/_embedded/`

- **`/(resident)/pledge-detail`** — pledge amount, edit/increase/decrease, cancel, show non-binding copy per Scenario A §5
- **`/(resident)/queue-detail`** — capacity queue position, priority factors (§6.3: timestamp, load fit, confidence, equity), projected activation
- **`/(resident)/ats-detail`** — ATS state machine (§2.1: 8 states: not mapped / mapped / capacity-cleared / scheduled / installed / verified / activated / suspended), status, next action
- **`/(resident)/marketplace`** — ownership marketplace, browse buyable shares (Scenario A §8.6 UI, risk disclosures, valuation basis), purchase flow
- **`/(resident)/load-profile-edit`** — L2/L3 capture (Scenario A §7: appliance checklist, daytime/evening, optional electrician visit, receipt photos)
- **`/(resident)/drs-detail`** — building's DRS progress, blocker list, what resident can do
- **`/(resident)/token-purchase`** — buy/top-up flow (KES input, confirmation, real money per Scenario A §5)
- **`/(resident)/alert-detail`** — incident detail, fallback status, issue owner, estimated resolution

---

### Resident Onboarding (`mobile/app/(onboard)/resident/...` + website equivalent)

Per Scenario A §4 + IA v2 §7.1:

1. **Welcome** — brand splash, "e.mappa: cheaper local energy for your building"
2. **Email/OTP** — email input + 6-digit OTP (note: pilot uses email; production should support SMS/M-Pesa identity per Scenario A §4)
3. **Verify OTP** — input verification code
4. **Role select** → "I live in an apartment building" (hidden role selection if pre-assigned)
5. **Find building** — location permission + building name (searchable) + **unit number** + optional owner invite code + manual address fallback (Scenario A §4)
6. **Confirm building** — show building name/address from API, "This is my building" confirmation
7. **Load profile L1** — KPLC spend (KES/month) + appliance checklist + daytime/evening pattern + optional receipt photo (Scenario A §4, §7)
8. **Capacity check** — system shows queue position projection (Scenario A §6)
9. **Pledge or buy decision** — non-binding pledge (pre-activation) OR token purchase (if live) (Scenario A §5)
10. → Home screen (branches per Scenario A §10)

**Boundary:** Do not put DRS inside onboarding. Onboarding proves building exists and resident is interested. DRS is project-ops driven. Scenario A §4.

**Spec citations:** Scenario A §4, §7 (load profile), IA v2 §7.1, §7.6 (geocoding).

---

## Homeowner (4 screens: mobile + web parity, same depth as Resident)

*Scenario C: single-family-home owner who is sole resident. Combines building-owner project lifecycle with resident token/consumption flow. Distinct role (not building-owner with flag). `buildings.kind='single_family' AND unit_count=1`.*

### Tab structure
1. **Home** — adaptive hero (TokenBalanceHero live / ProjectHero pre-live)
2. **Energy** — usage + generation (always visible)
3. **Wallet** — three-stream (pledges/tokens, contributions, ownership payouts)
4. **Profile** — property/building profile + roof + account

### Homeowner · Home (mobile + web)

**Purpose:** adaptive by `project.stage` per Scenario C §7.1. Homeowner's dual identity (owner + resident) is reflected in branching display.

**Pre-live** (`stage in ('listed', 'qualifying', 'funding', 'installing')`):
- **PilotBanner**
- **Hero: ProjectHero** — DRS card, decision pill, deployment progress bar (qualifying → funding → installing → live), top 3 blockers, "Cooking up your energy project" framing
- **Secondary card: TokenBalanceHero** — disabled, *"Tokens activate once your project goes live."*
- **Action rail:** View blockers / Approve terms / Compare to grid bill / Deployment timeline / Roof polygon detail / Edit load profile

**Live** (`stage='live'`):
- **PilotBanner**
- **Hero: TokenBalanceHero** — pledged token balance, big number, [Pledge tokens] CTA, today's solar coverage
- **Secondary card: ProjectHero** — collapsed: DRS (100%) + LBRS (100%) + system uptime + deployment retrospective + top 3 current alerts
- **Action rail:** Pledge / View energy / Wallet detail / Roof detail / System settings

**Embedded screens (push):**
- Pledge entry / pledge history
- DRS detail (site feasibility, load fit, stakeholder readiness, capital, hardware, legal; Scenario C §8)
- Deployment timeline (per-phase milestones)
- Terms approval (read-only homeowner-specific royalty + ownership terms; Scenario C §6)
- Compare bill (current grid vs projected with e.mappa)
- Roof polygon detail (renders polygon over satellite tile; Scenario C §6)
- System health / live dashboard (inverter, battery, Solar DB, ATS, generation, consumption, grid fallback, incidents)

**Fields:**
- property address, owner name
- DRS % / LBRS % / project stage
- blockers (title, severity, owner)
- deployment progress (%)
- token balance (live only, KES + kWh)
- today's solar (kWh, live only)
- system uptime / health status (live only)
- incidents / alerts (if any)
- ownership % retained (if shares held)
- projected vs actual payback (if live)

**Flows:**
- Tap DRS card → `/drs-detail` (Scenario C §8)
- Tap blocker pill → blocker detail (owner contact, resolution steps)
- Tap "view deployment timeline" → embedded timeline detail
- Tap "approve terms" → terms review modal (Scenario C §6)
- Tap "compare bill" → bill comparison screen
- Tap "roof detail" → polygon detail (Scenario C §6)
- Tap "buy tokens" (live) → `/token-purchase`
- Tap "system health" → live dashboard (Scenario C §7.3)

**Gates:**
- Hide TokenBalanceHero pre-live (Scenario C §7.1: *"disabled with copy: Tokens activate once your project goes live"*)
- Hide ProjectHero if live (or collapse to secondary)
- Hide "approve terms" CTA if already approved
- Hide "buy tokens" CTA unless `project.stage='live'` (Scenario C product law: *"homeowner can only buy usable energy tokens after the home is physically capable"*)

**Components:**
- `ProjectHero` (DRS + blockers + timeline)
- `TokenBalanceHero` (tokens + solar coverage)
- `DeploymentProgressBar`
- `BlockerPill`
- `SystemHealthIndicator`

**Spec citations:** Scenario C §1 (homeowner as distinct role), §6 (onboarding, roof capture, terms), §7.1 (Home adaptive), §8 (DRS for homeowners), §10 (LBRS for homeowners).

---

### Homeowner · Energy (mobile + web)

**Purpose:** show usage + generation. Homeowner **always** sees generation (sole consumer of own rooftop). Scenario C §7.2.

**Pre-live:**
- Projected monthly load (from homeowner's load-profile estimate, Scenario C §7)
- Expected solar generation (from system sizing, Scenario C §7.2)
- Expected battery use, expected grid fallback
- Expected utilization, expected savings range
- Load-profile confidence

**Live:**
- 24-hour stacked area chart: solar / battery / grid (homeowner = sole household consumer)
- Synthetic-data badge if applicable
- Today summary: kWh consumed, kWh from solar, KES saved vs grid
- **Generation panel** (always visible; homeowner owns rooftop unconditionally):
  - Today's array generation (kWh)
  - 30-day generation history sparkline
  - Share % retained (often 100% initially; less if sold to financiers/providers per Scenario C §11)
  - **If shares < 100%:** ring chart showing share split (homeowner retained % vs buyers' %)
- System sizing explanation (why array size / battery size / inverter size fits the home, Scenario C §7.2)
- **Consumption timeline:** daily/weekly/monthly kWh, token burn rate, savings vs grid, solar coverage %
- **Warnings if applicable:**
  - System oversized (waste risk, poor payback, per Scenario C §15: *"warn about waste, poor utilization, slower payback"*)
  - Under-batteried (insufficient storage)
  - Under-loaded (low utilization risk)
  - Low production (below expected, weather / shading / fault diagnosis)
- **Alerts:** battery degradation, inverter faults, data missing, grid fallback unusually high

**Flows:**
- Tap 30-day detail → `/energy-detail` (daily/weekly/monthly views, CSV export)
- Tap generation ownership → `/ownership-detail` (valuation, share splits, payout basis, external monetization info per Scenario C §11.1)
- Tap system sizing explainer → modal (Scenario C §7.2)
- Tap alert → incident detail (cause, resolution, support contact)

**Gates:**
- Generation always visible (homeowner is sole resident)
- Show net metering / export credits / trading proceeds **only if enabled** (Scenario C §15: *"Do not project export earnings. Size the system primarily around self-consumption and battery use, or require trading/other demand before oversizing."*)
- Conservatively settle if data missing (AI-native doctrine)

**Components:**
- `EnergyTodayChart` (24-hour)
- `GenerationPanel` (always on, share-aware)
- `OwnershipRingChart` (if shares < 100%)
- `SystemSizingExplainer` (modal)
- `ConsumptionTimeline`

**Spec citations:** Scenario C §7.2 (Energy screen), §11 (ownership), §11.1 (payout sources), §15 (edge cases: oversizing, export, trading).

---

### Homeowner · Wallet (mobile + web)

**Purpose:** consolidate three cashflow streams. Scenario C §7.3. **Critical:** no host royalty for homeowner (Scenario C product law).

**Top cards (always visible):**
- Pledged total (KES) [pre-live only]
- Royalties earned as building owner — **0 by default** (Scenario C §3: homeowners do NOT earn host royalty from own roof)
- Share earnings from ownership (0 if none; only from external monetization per Scenario C §11.1)

**Segmented control:**

1. **Cashflow** (live):
   - Chronological transactions (pledges out, token top-ups, solar delivered + savings, ownership payouts if enabled, export/trading credits if enabled, maintenance reserve deductions, platform fees)
   - Each row: date, type, amount (KES), description

2. **Ownership** (if shares held):
   - Array/asset name, ownership %
   - Current valuation (Scenario C §8.3: cost-basis, replacement-cost, or income approach)
   - Share price per unit
   - Payouts conditional on external monetization (net metering / export credit / trading; Scenario C §11.1, §15)
   - [Buy back shares] CTA if shares < 100% (Scenario C §15 edge case: homeowner want to reacquire sold shares)
   - Transfer history (if any)

3. **Pledges** (pre-live):
   - Pledge history with status pills (active / cancelled / archived)
   - Edit/cancel CTA (allowed pre-activation, Scenario A §5)

**Flows:**
- Tap pledge → `/pledge-detail` (edit, cancel)
- Tap ownership position → `/asset-detail` (valuation, buy-back, transfer)
- Tap cashflow entry → detail (breakdown, evidence if applicable)
- Tap [buy back shares] → `/marketplace-buyback` (Scenario C §15)

**Critical gates:**
- **Never show "you earned money from paying yourself."** (Scenario C §11.1, §11 UI rule: *"Do not show the homeowner earning cash by paying themselves"*)
- Show token spend + avoided grid cost separately from ownership payouts
- Ownership payouts only from external sources (export credit, trading, third-party consumption)
- No host royalty pool (Scenario C §3: homeowner does not earn host royalty; only consumption savings + external monetization)

**Components:**
- `TokenBalanceHero` / `PledgeBalanceCard`
- `OwnershipPositionCard` (with buy-back)
- `CashflowLedger`

**Spec citations:** Scenario C §3 (homeowner does not earn host royalty), §7.3 (Wallet), §11 (ownership), §11.1 (payout sources), UI rule about no self-payment.

---

### Homeowner · Profile (mobile + web)

**Purpose:** account + property/roof profile + settings + support.

**Sections:**
- **Account:** email, phone (optional), role pill "Homeowner"
- **Property & Roof Profile** (embedded):
  - Address, GPS pin, property type (single-family / maisonette / small compound)
  - Ownership/authority verification status
  - Roof source/confidence (Microsoft footprint / owner-traced / manual sqm)
  - Roof polygon thumbnail
  - [Edit roof] CTA (can retrace or re-measure)
  - DB photos, meter photos, access notes
- **Settings** (embedded): notifications, units (KES/USD), language
- **Support** (embedded): help articles, "Contact support", offline grid-fallback guide
- **Logout**

**Flows:**
- [Edit roof] → `/roof-edit` (three-tier waterfall per Scenario C §6: auto-suggest / owner-traced / manual sqm)

**Spec citations:** Scenario C §6 (roof capture 3-tier), §7.4 (Profile), IA-U8.

---

### Homeowner Embedded Routes

- **`/(homeowner)/pledge-detail`** — edit/cancel pledge
- **`/(homeowner)/drs-detail`** — homeowner-specific DRS (property authority, site feasibility, load profile + sizing, stakeholder readiness, capital, hardware, legal; Scenario C §8)
- **`/(homeowner)/lbrs-detail`** — LBRS test checklist (safety, isolation, inverter/battery, switching, metering, token-state, dry run; Scenario C §10)
- **`/(homeowner)/deployment-timeline`** — per-phase milestones
- **`/(homeowner)/terms-approval`** — read-only homeowner-specific terms (Scenario C §6)
- **`/(homeowner)/compare-bill`** — current grid vs e.mappa projection
- **`/(homeowner)/roof-detail`** — polygon over satellite tile (Scenario C §6)
- **`/(homeowner)/system-health`** — live dashboard (inverter, battery, Solar DB, ATS, generation, consumption, incidents; Scenario C §7)
- **`/(homeowner)/ownership-detail`** — valuation, share splits, payout basis, external monetization eligibility
- **`/(homeowner)/energy-detail`** — daily/weekly/monthly views, CSV export
- **`/(homeowner)/alert-detail`** — incident, cause, resolution

---

### Homeowner Onboarding (`mobile/app/(onboard)/homeowner/...`)

Per Scenario C §6 + IA v2 §7.1.5:

1. **Welcome** — "e.mappa: turn your home into a local energy node"
2. **Email/OTP** → verify
3. **Role select** → "I own or control a home/property"
4. **Property location** — address, GPS, property type (single-family / maisonette / small compound / shop-home), roof type if known
5. **Authority verification** — upload title/lease/owner authorization, utility account evidence, national ID, site inspection consent
6. **Utility & meter context** — KPLC meter type, meter number, photos of meter area + DB, monthly spend, prepaid usage pattern
7. **Fast load profile L1** — current monthly spend (KES), major appliances, daytime/evening usage, peak loads, critical loads, optional receipt photo (Scenario C §6, §7)
8. **Site preview** — roof photos, available area, shade/obstructions, preferred equipment location, WiFi/cellular signal, access constraints (Scenario C §6)
9. **Readiness summary** — "home energy project potential" card (verified status, rough load fit, roof potential, next missing steps)
10. **Deployment decision** — "Ready to initiate a project?" Yes → starts DRS; No → keeps property enrolled but inactive (Scenario C §6)
11. → Home (adaptive, will show ProjectHero pre-live)

**Boundary:** Do not put DRS inside onboarding. Onboarding verifies homeowner + property. DRS begins only when verified homeowner clicks initiate. Scenario C §6.

**Spec citations:** Scenario C §6 (full onboarding), §7 (load profile).

---

## Building Owner (4 screens: mobile + web parity)

*Scenario B: apartment building owner, host role (no default infrastructure buy), DRS/LBRS gating, host royalty from monetized solar, optional ownership of array/infrastructure.*

### Tab structure
1. **Home** — building/project status, DRS, blockers, resident demand
2. **Energy** — building generation, usage, solar/battery/grid flows
3. **Wallet** — host royalty, payouts, cashflow, optional ownership earnings
4. **Profile** — building documents, payout account, settings, support

### Building Owner · Home (mobile + web)

**Purpose:** see building's state of play. Scenario B §5.

**States:**

- **No building yet:**
  - Giant [Start project] CTA → onboarding flow

- **Building exists, pre-live:**
  - **Building card:** name, address, unit count, roof polygon thumbnail
  - **DRS score card:** percentage + decision pill (approve / review / block) + top 3 blockers (list)
  - **Deployment progress bar:** qualifying → funding → installing → live
  - **Resident demand summary:** pledged kWh, number of pledgers, queue status (interested / capacity-cleared / queued)
  - **Capacity estimate:** available kW, apartments per phase, phase timeline
  - **Host royalty education:** "You earn from roof/site hosting" (pre-live only, no cashflow yet)
  - **Action rail:** [View blockers] [Compare to today's bill] [Resident roster] [Approve terms] [Roof detail] [Deployment timeline]

- **Building exists, live:**
  - **Building overview:** name, address, units, roof polygon
  - **DRS/LBRS status:** both 100%, go-live date
  - **System health:** inverter status, battery SoC, Solar DB status, ATS fault count, last updated
  - **Energy today:** array output (kWh), building consumption (kWh), solar served, grid fallback, revenue earned (KES)
  - **Building visual:** animated diagram showing roof array → inverter → battery → Solar DB → ATS nodes → apartments + KPLC fallback path
  - **Host royalty earned this month** (KES)
  - **Incidents alert** (if any critical fault)
  - **Action rail:** [View energy] [Wallet] [System settings] [Maintenance request] [Roof detail]

**Flows:**
- Tap DRS card → `/drs-detail` (all 6 components, history chart per Scenario B §3)
- Tap blocker → blocker detail (owner contact, resolution)
- Tap resident roster → `/resident-roster` (list of pledgers, capacity status, unit/meter info)
- Tap "approve terms" → `/terms-approval` (read terms, accept per Scenario B §3)
- Tap "compare to today's bill" → `/bill-comparison` (current grid cost vs e.mappa projection)
- Tap "view energy" → Energy tab
- Tap incident alert → `/incident-detail`

**Gates:**
- Hide host royalty numbers pre-live (only show education, Scenario B §5: *"No payout numbers before revenue exists except projections clearly labeled"*)
- Show energy flows (generation, consumption) only if live (Scenario B §5: *"All energy data labeled projected/synthetic"* pre-live)
- Hide "system health" pre-live

**Components:**
- `ProjectHero` (DRS + blockers + timeline)
- `DRSProgressCard`
- `SystemHealthIndicator`
- `EnergyTodayCard` (live only)
- `HostRoyaltyCard` (pre-live: education; live: earned)

**Spec citations:** Scenario B §3 (onboarding), §5 (screens per building state), §1 (host role, no default infrastructure buy).

---

### Building Owner · Energy (mobile + web)

**Purpose:** generation and usage. Scenario B §5.

**Pre-live:**
- Building load estimate (from resident pledges + load profiles)
- Pledged demand (sum of kWh pledges)
- Projected solar coverage (from capacity plan)
- Projected grid fallback
- Load-profile confidence
- Capacity phase plan

**Live:**
- Building load (measured, from meter)
- Energy served from array (from inverter)
- Energy from battery (discharged)
- Grid fallback (kWh)
- Solar sold (monetized, settlement-driven)
- Wasted/curtailed solar (if any)
- Utilization (E_sold / E_gen)
- Daily / 30-day toggle
- **Generation panel** (if owner holds ≥1 share of any array):
  - Today's generation (kWh)
  - 30-day sparkline
  - Ownership %, payout share (Scenario B §6: ownership is separate from host royalty)
  - Empty state if zero shares: *"You own the rooftop, not the panels. Buy a share to see your earnings."*

**Flows:**
- Tap 30-day detail → `/energy-detail` (daily/weekly/monthly)
- Tap ownership card → `/asset-detail` (ownership %, valuation, payout)

**Gates:**
- Generation panel hidden unless `owner.ownership.shares > 0` (IA-U9)
- Owner always sees generation (owns rooftop, even if didn't fund panels per Scenario B §2)
- Use "synthetic" badge pre-live, measured data post-live

**Components:**
- `EnergyTodayChart`
- `GenerationPanel`
- `OwnershipCard`

**Spec citations:** Scenario B §2 (owner owns rooftop, can see generation), §5 (Energy screen), §6 (ownership separate from royalty).

---

### Building Owner · Wallet (mobile + web)

**Purpose:** host royalty + cashflow. Scenario B §5.

**Pre-live:**
- **Host royalty education card:** "You earn from roof/site hosting once prepaid solar is consumed" (Scenario B §5: no payout numbers before revenue)
- Projected monthly royalty range (conservative estimate only, clearly labeled)
- Ownership education CTA (if terms approved)

**Live:**
- **Host royalty earned** (KES): balance, payout status
- **Royalty history:** payout statement, monthly breakdown, settlement statements
- **Projected next-month royalty** (from projector against current load)
- **Optional ownership earnings** (if owner bought shares):
  - Ownership % and shares held
  - Monthly payout from ownership pool (Scenario B §6: ownership is separate economic identity from host)
  - Valuation basis and share history
- **Cashflow ledger:** chronological (host payouts in, share payouts in, deductions, reserves)

**Flows:**
- Tap payout statement → `/settlement-detail` (per-apartment breakdown, waterfall, owner's claim)
- Tap ownership card → `/asset-detail` (buy more / sell shares / valuation)

**Critical gates:**
- **Separate host royalty from ownership** (Scenario B §6: *"Ownership changes who receives an existing payout pool. It does not create extra revenue... a building owner... may earn host royalty as site host and separate owner payouts"*)
- Host royalty pre-live: education + projection only, never actual numbers
- Host royalty live: show earned + payout schedule + next projected
- Show reserve/maintenance deductions explicitly

**Components:**
- `HostRoyaltyCard`
- `OwnershipCard`
- `CashflowLedger`

**Spec citations:** Scenario B §5 (Wallet pre-live / live), §6 (ownership separate from host royalty).

---

### Building Owner · Profile (mobile + web)

**Purpose:** owner identity + building documents + payout account + settings.

**Sections:**
- **Account:** name, email, phone, role "Building Owner"
- **Building Profile** (embedded):
  - Building name, address, unit count, occupancy
  - Ownership verification status
  - Roof type, roof source/confidence
  - [Upload documents] CTA
  - Building amenities (meter bank location, cable access, DB space, etc.)
- **Payout Account** (embedded):
  - Bank / M-Pesa details
  - KYC verification status
  - [Update payout details] CTA
- **Settings** (embedded): notifications, units, language
- **Support** (embedded): help articles, "Contact support"
- **Logout**

**Flows:**
- [Upload documents] → `/document-upload` (title deed, lease, tax, utility, ID, photos)
- [Update payout] → `/payout-setup` (bank details or M-Pesa)

**Spec citations:** Scenario B §3 (onboarding includes verification), §5 (Profile), IA-U8.

---

### Building Owner Embedded Routes

- **`/(building-owner)/drs-detail`** — all 6 DRS components (owner authorization, site inspection, capacity, demand, hardware, electrician payment, contracts/waterfall; Scenario B §3), history chart
- **`/(building-owner)/bill-comparison`** — current grid bill vs e.mappa projection
- **`/(building-owner)/resident-roster`** — list of pledging residents, capacity status, unit/meter, queue position
- **`/(building-owner)/terms-approval`** — review + accept host royalty terms, ownership terms, settlement waterfall (Scenario B §3)
- **`/(building-owner)/roof-detail`** — polygon over satellite tile
- **`/(building-owner)/deployment-timeline`** — per-phase milestones
- **`/(building-owner)/settlement-detail`** — monthly statement, per-apartment waterfall, owner's claim, deductions
- **`/(building-owner)/asset-detail`** — ownership position, valuation, payout history, buy/sell options
- **`/(building-owner)/energy-detail`** — daily/weekly/monthly views
- **`/(building-owner)/incident-detail`** — system fault, affected apartments, recovery steps

---

### Building Owner Onboarding (`mobile/app/(onboard)/building-owner/...`)

Per Scenario B §3 + IA v2 §7.2:

1. **Welcome** — "e.mappa: turn your building's roof into a local energy platform"
2. **Email/OTP** → verify
3. **Role select** → "I own or manage an apartment building"
4. **Building location** — name, address (auto-geocode), pin, unit count, occupancy estimate
5. **Ownership/authority verification** — upload title deed, lease/management agreement, tax/utility docs, national ID / company docs, contact for manual review
6. **Initial building profile** — apartment count, roof type, roof access, known shaded areas, meter bank location, resident occupancy, pain points
7. **Roof capture** (3-tier waterfall, Scenario B §3):
   - Auto-suggest from Microsoft footprints ("Looks right" / "Let me redraw" / "Type sqm")
   - Owner-traced polygon on satellite tile
   - Manual sqm entry fallback
8. **Terms preview** — read-only host royalty model, ownership model (Scenario B §3)
9. → Home

**Boundary:** Roof capture is onboarding only (soft capacity preview). Final array sizing is DRS (site inspection + electrician + provider input). Scenario B §3: *"A rough roof estimate can happen during onboarding, but final array sizing belongs in project qualification/DRS"*

**Spec citations:** Scenario B §3 (full onboarding), IA v2 §7.2.

---

## Provider (panels + infra merged) (5 screens: mobile + web parity)

*Scenario E: supplier/provider network. Merged role with businessType ∈ {panels, infrastructure, both}. Hardware suppliers, solar-panel providers, hybrid.*

### Tab structure
1. **Discover** — project marketplace (Airbnb-style)
2. **Projects** — committed projects, quote/BOM status, delivery, DRS/LBRS
3. **Generation** — share-gated generation, retained claim, array performance
4. **Wallet** — equipment sales, provider kWh revenue, EaaS, buyouts, share buy-downs, predicted income
5. **Profile** — business verification, inventory catalog, quotes, warranties, reliability score

### Provider · Discover (mobile + web)

**Purpose:** find projects to supply equipment / panels. Airbnb-style marketplace. Scenario E §9.

**Project card (high-fidelity):**
- Project image (rooftop hero)
- Location / proximity (town, distance)
- Project type (apartment building / homeowner / small compound)
- DRS score (%) + top blockers (hardware missing / funding / electrician / inspection)
- Component gaps (e.g., "Needs: 12 panels + inverter + ATS units")
- Funding status (funded / partially funded / seeking equipment-as-a-service / seeking provider panels)
- Potential equipment value (KES range)
- Inventory match score (how much of BOM this provider can satisfy, %)
- Projected income range (sale revenue / EaaS projection / provider kWh projection, with risk label)

**Filter bar:**
- Stage (DRS / funding / installation / LBRS / live)
- Region / proximity
- Equipment type needed (panels / inverter / battery / ATS / meters / Solar DB / etc.)
- Deal size (KES range)
- Business type match (panels / infra / both)

**Tap card → Embedded project detail** (Scenario E §10):
- Hero: image, type, DRS/LBRS, location, timeline
- Readiness summary: DRS blockers, what's needed
- Technical scope: array kW, battery kWh, inverter kW, ATS count, metering count
- BOM requirements: list with specs, quantities, allowed substitutes
- Stakeholder commitments: other providers, electrician, financiers
- Economic options: sell / lease / EaaS / provider ownership / hybrid / buy-down eligible
- Commit CTA: Submit quote / Offer panels / Offer EaaS / Offer buyout

**Flows:**
- Filter + search
- Tap card → project detail
- Tap "Submit quote" / "Offer equipment" → commit flow (Scenario E §11)

**Empty state:** "No matching projects near you. Adjust service radius, improve catalog, or check later."

**Components:**
- `ProjectCard` (Airbnb-style)
- `FilterBar`

**Spec citations:** Scenario E §9 (Discover screen), §10 (project detail fields).

---

### Provider · Projects (mobile + web)

**Purpose:** track committed projects, quote/BOM status, delivery, DRS/LBRS, live assets. Scenario E §13.

**Layout:**
- **Committed projects grouped by stage:**
  - DRS (active)
  - Installation
  - LBRS
  - Live
  - Completed / exited

**Project status card (per Scenario E §13):**
- Project name/code, type, location, DRS/LBRS state
- Provider's contribution: asset category, quantity, value, economic model (sale / EaaS / provider-owned / hybrid)
- DRS dependency: whether this contribution is blocking readiness
- BOM match: approved items, missing specs, substitute requests
- Delivery tracker: schedule, proof upload, recipient confirmation
- LBRS dependency: as-built verification, safety, monitoring, metering, go-live blockers
- Share buy-down tracker (if applicable): asset valuation, % sold, retained claim, proceeds received
- Action buttons: [Update inventory] [Upload serials] [Adjust quote] [Approve substitute] [Schedule delivery] [Respond to issue] [Accept/reject buy-down] [Warranty claim]

**Tap project → Project detail** (richer view of same info + full readiness/scope/documents):

**Flows:**
- Tap delivery schedule → `/delivery-tracker` (logistics, proof upload)
- Tap "approve substitute" → modal (specs, compatibility, price delta, confirm)
- Tap "warranty claim" → `/warranty-ticket` (issue type, root cause, evidence, replacement decision)
- Tap buy-down offer → `/buydown-detail` (buyer, price, terms, accept/reject)

**Gates:**
- Show DRS dependency only if relevant to this contribution
- Show LBRS only if project in LBRS stage or later
- Share buy-down tracker visible only if applicable

**Components:**
- `ProjectStatusCard`
- `ProjectTimeline`
- `DeliveryTracker`
- `BOMMatchCard`

**Spec citations:** Scenario E §13 (Project Status screen), §14 (project status detail).

---

### Provider · Generation (mobile + web)

**Purpose:** live generation performance, monetized kWh, asset ownership. Share-gated. Scenario E §13.

**Pre-live (if panels committed but not yet installed):**
- Projected generation (kWh) for relevant project
- Expected utilization range (%)
- Expected revenue range (conservative/base/upside)
- Installation readiness

**Live (if provider owns ≥1 array):**
- **Total array generation** (kWh this period)
- **Monetized solar sold** (E_sold, prepaid kWh from residents)
- **Original provider ownership** (%) — establishes baseline
- **Shares sold** (%) — if buy-downs occurred
- **Retained claim** (%) — your remaining economic share
- **Buy-down proceeds** (KES received from share sales)
- **Future provider revenue** (based on retained % × E_sold × pool rate)
- Wasted/curtailed solar (if any)
- Battery contribution (charged/discharged)
- Grid fallback context
- Data quality status
- Performance vs forecast (if applicable)

**Empty state (if shares = 0):**
- *"When residents buy your shares, you receive payouts but lose live generation visibility."*

**Flows:**
- Tap array detail → `/array-detail` (specs, performance history, valuation, ownership splits)
- Tap [Offer buy-down] → `/buydown-offer` (set price, terms)

**Critical gates:**
- Generation visible only if provider owns ≥1 share (IA-U9)
- Show "retained claim" prominently (Scenario E §15.1: *"correctly describes reduced economic claim"*)
- **Never say generation decreases when shares sold** (Scenario E §2, §15.1: *"Physical generation does not decrease. The provider's retained economic claim decreases."*)

**Components:**
- `GenerationChart` (24h or daily/weekly/monthly)
- `OwnershipBreakdown` (ring chart if shares < 100%)
- `RetainedClaimCard` (show impact of buy-downs)
- `PerformanceMetrics`

**Spec citations:** Scenario E §13 (Energy Generation screen), §15 (provider-side economics), §15.1 (share buy-down display with correct language).

---

### Provider · Wallet (mobile + web)

**Purpose:** equipment sales, EaaS, provider kWh revenue, buy-downs, predicted income. Scenario E §16.

**Wallet sections:**

1. **Cash sales:**
   - Equipment sale payouts (pending / paid)
   - Delivery / logistics fees
   - Deposits, refunds, tax/VAT
   - Invoice/PO details

2. **Usage-linked revenue:**
   - Provider pool revenue (per-project, per-month)
   - EaaS revenue (infrastructure-pool or lease claims)
   - Retained ownership percentage (updated per buy-downs)
   - Settlement period, data quality

3. **Share buy-downs:**
   - Assets sold (which arrays / which pools)
   - Buyer categories (residents / owners / homeowners / financiers)
   - Sale value, retained claim after
   - Proceeds received (KES)
   - Future revenue effect (e.g., "retained claim reduced from 100% to 70%")

4. **Predicted income:**
   - Scenario models for current inventory (conservative / base / upside)
   - Assumptions shown (utilization, E_sold, downtime, reserve %)
   - Clearly labeled as projected (Scenario E §17: *"Make projections useful but conservative. Always show assumptions and ranges."*)

5. **Inventory pipeline:**
   - Quoted value, approved value, reserved value, committed value, delivered value, installed value, live earning value

6. **Disputes and holds:**
   - Why money is pending (KYC review, warranty dispute, evidence missing, etc.)
   - Who must act, what's needed, expected resolution

7. **Scaling trajectory:**
   - How many projects current inventory could support
   - Expected monthly revenue under conservative/base/upside utilization
   - Bottlenecks (delivery radius, stock gaps, capital locked)

**Flows:**
- Tap settlement period → `/settlement-detail` (E_gen, E_sold, utilization, payout calculation, waterfall)
- Tap buy-down → `/buydown-detail` (buyer, terms, valuations)
- Tap pending item → evidence / dispute dialog
- Tap predicted income scenario → assumptions breakdown

**Gates:**
- Predicted income must use ranges, never "guaranteed monthly income" (Scenario E §17 guardrail)
- Equipment sale income visible immediately (Scenario E §13: *"Supplier/provider earn... one-shot equipment sale"*)
- Provider kWh revenue visible only after project goes live and prepaid solar is monetized
- EaaS/lease income visible only when contract is active and readings verified

**Components:**
- `CashSalesLedger`
- `UsageLedgerBreakdown`
- `ShareBuydownTracker`
- `PredictedIncomeScenarios`

**Spec citations:** Scenario E §13 (Wallet sections), §16 (income types and release conditions), §17 (predicted income modeling, guardrails).

---

### Provider · Profile (mobile + web)

**Purpose:** business/individual verification, inventory, quotes, warranties, reliability score.

**Sections:**
- **Account / Business:**
  - Account type (business / individual)
  - Business name / legal name
  - Registration status, verification status
  - Contact, location, service area
  - Payout account (bank / M-Pesa)

- **Business Profile** (embedded):
  - Business registration docs
  - Address, operation area, delivery radius
  - Role flags (supplier / provider / both)
  - KYC / KYB verification status
  - [Update business info] CTA

- **Inventory Catalog** (embedded):
  - Asset category list (panels / inverter / battery / ATS / meters / etc.)
  - SKU-level catalog, quantities, stock availability, condition, price, quote validity, warranty
  - [Add inventory] / [Edit SKU] CTAs
  - Stale inventory flag (if > 90 days without match or sale)

- **Quote Templates** (embedded):
  - Line-item quotes, bulk discounts, delivery fees, VAT handling
  - Quote validity period (default 7–14 days, configurable)
  - Reservation deposit rules
  - [Create quote template] CTA

- **Warranties & Service** (embedded):
  - Manufacturer warranty docs (PDFs)
  - Replacement policy, support contact
  - Warranty support response time metric
  - [Upload warranty] CTA

- **Ratings & Performance** (embedded, read-only):
  - Inventory accuracy (quoted stock vs real)
  - Quote fairness (market comparison)
  - Delivery reliability (on-time %, condition on arrival)
  - Compatibility quality (LBRS pass rate)
  - Warranty responsiveness (time to resolution)
  - Dispute rate
  - Overall supplier score

- **Settings** (embedded): notifications, units, language
- **Support** (embedded): help articles, contact support
- **Logout**

**Flows:**
- [Add inventory] → `/inventory-add` (asset category, brand, model, specs, condition, ownership proof, price, warranty, allowed economic models)
- [Edit SKU] → edit modal
- [Create quote template] → quote builder
- [Upload warranty] → file upload

**Gates:**
- Inventory must have ownership proof (Scenario E §4: *"inventory offered by individuals must be verified for ownership"*)
- Stale inventory flagged after 90 days without commitment
- Warranty docs required for LBRS signoff (Scenario E §20)

**Components:**
- Standard business profile sections
- `InventoryCatalog`
- `RatingsSummary`

**Spec citations:** Scenario E §5 (onboarding), §4 (verification), §13 (Profile screen), §23 (ratings), §27 (UX requirements).

---

### Provider Embedded Routes

- **`/(provider)/project-detail`** — full project scope, BOM, stake, opportunities, commit button
- **`/(provider)/quote-builder`** — line-item quote, delivery fee, validity, VAT, reservation, submit
- **`/(provider)/quote-request-detail`** — electrician/e.mappa specific request, respond with quote
- **`/(provider)/delivery-tracker`** — logistics, proof upload, recipient confirmation
- **`/(provider)/warranty-ticket`** — open, root-cause audit, replacement decision, payout/hold
- **`/(provider)/settlement-detail`** — monthly breakdown, E_gen, E_sold, utilization, payout calc, waterfall
- **`/(provider)/buydown-detail`** — offer, buyer, price, terms, accept/reject
- **`/(provider)/asset-detail`** — valuation, ownership history, performance, specs
- **`/(provider)/inventory-add`** — asset category, brand, specs, condition, proof, price, warranty

---

### Provider Onboarding (`mobile/app/(onboard)/provider/...`)

Per Scenario E §5 + IA v2 §7.3:

1. **Welcome** — "e.mappa: turn your inventory and panels into productive local energy assets"
2. **Email/OTP** → verify
3. **Role fork:** "I supply installation hardware" / "I provide solar panels" / "I do both"
4. **Account type:** business / individual
5. **Business verification path** (if business):
   - Business name, registration, address, tax/PIN, contact person, operating area, delivery capability, warranties, supplier references
6. **Individual verification path** (if individual):
   - Legal name, national ID/passport, asset ownership proof, asset photos, serial numbers, prior use history, inspection consent
7. **Inventory snapshot** (optional):
   - Add a few SKUs or skip
   - Asset category, brand, model, specs, quantity, condition, price, warranty, location
8. **Compatibility pre-check:**
   - e.mappa flags missing specs, unknown brands, unsupported ratings, no monitoring, weak warranty, poor condition, architecture mismatch
9. **Inventory earning model scenarios:**
   - Outright sale, EaaS, lease, provider ownership, share buy-down eligibility
   - Show projections clearly labeled as estimates (Scenario E §5.1)
10. **Training / standards module:**
    - DRS, LBRS, approved components, no silent substitutions, monetized-solar doctrine, warranty obligations
11. **Verification decision:** approved / provisionally approved / supplier-only / provider-only / restricted / rejected
12. → Discover

**Spec citations:** Scenario E §5 (full onboarding), §5.1 (business vs individual requirements).

---

## Electrician (4 screens: mobile + web parity)

*Scenario D: verified and certified execution partners. **Electrician** (NOT Installer). DRS/LBRS tasking, evidence capture, signoff, wallet settlement, live maintenance.*

### Tab structure
1. **Discover** — project marketplace (Airbnb-style jobs)
2. **Projects** — committed projects, DRS/LBRS tasks, evidence, signoff status
3. **Wallet** — milestone earnings, labor-as-capital claims, household requests, payouts
4. **Profile** — certification tier, documents, crew, ratings, compliance

### Electrician · Discover (mobile + web)

**Purpose:** find projects to execute. Airbnb-style marketplace. Scenario D §9.

**Project card:**
- Project image (building/home photo, privacy-safe)
- Location / proximity (town, distance)
- Project type (apartment building / homeowner / small compound)
- DRS score (%) + top blockers (site inspection pending / capacity plan pending / funding missing / labor unresolved)
- Scope (DRS inspection only / installation / ATS rollout / LBRS test / maintenance / household request)
- Crew requirement (solo / 1–2 / 3–4 / 4–6+ / lead required)
- Funding status (funded / partially funded / labor-as-capital available)
- Projected payout (milestone range or labor-as-capital estimate, with risk label)
- Urgency (owner access window, target go-live, incident severity if live)

**Filter bar:**
- Region / proximity
- Scope (DRS / installation / ATS / LBRS / maintenance)
- Pay band (KES range)
- Crew size (solo / team)
- Urgency (low / medium / high)

**Tap card → Embedded project detail** (Scenario D §10):
- Hero: image, type, location, DRS/LBRS, crew need, funding, timeline
- Readiness summary: DRS blockers, required electrician actions, documents uploaded
- Site details: apartment count or home load, roof type, meter/DB photos, cable route, connectivity, access constraints
- Stakeholders: owner, providers, financiers, existing crew
- Hardware needs: BOM draft, missing items, supplier availability, substitution restrictions
- Payment terms: upfront milestones, DRS payout, LBRS payout, labor-as-capital option, household request rate
- Risk & compliance: known blockers, safety concerns, special approvals, privacy restrictions
- Commit CTA: [Accept job] [Request to join] [Message ops]

**Flows:**
- Filter + search
- Tap card → project detail
- Tap [Accept job] / [Request to join] → commit flow (Scenario D §11)

**Empty state:** "No matching projects near you. Adjust service radius, improve certification, or check later."

**Components:**
- `ProjectCard` (Airbnb-style jobs)
- `FilterBar` (scope, pay, crew, urgency)

**Spec citations:** Scenario D §9 (Discover), §10 (project detail).

---

### Electrician · Projects (mobile + web)

**Purpose:** committed projects, DRS/LBRS task board, evidence, signoff. Scenario D §14–18.

**Layout:**
- **Committed projects grouped by state:**
  - DRS (active, site survey + readiness tasks)
  - Deployment-ready (installation scheduled)
  - Installation (hardware + wiring in progress)
  - LBRS (testing + signoff)
  - Live monitoring (health + maintenance)
  - Completed

**Project status card (per Scenario D §14–18):**
- Project name/code, type, location, DRS/LBRS state
- Electrician's role (solo / lead / crew member / limited scope)
- Next action (clear CTA: "Complete site survey" / "Upload meter mapping" / "Test ATS for Unit A" / "Sign off LBRS")
- DRS task list (site access / meter topology / roof assessment / cable route / capacity inputs / hardware requirements / labor estimate / compliance risk):
  - Status pill (not started / in progress / evidence needed / completed / blocked)
  - Evidence required (photos, GPS/timestamp, measurements, diagrams, notes)
  - [Upload evidence] CTA
- Installation task list (per-phase, tracked by milestone):
  - Hardware checklist (panels / mounting / inverter / battery / Solar DB / ATS units / meters / cabling / grounding / labeling / connectivity)
  - Per-task: assign to crew member, mark in progress, upload evidence, mark done
- LBRS test checklist (Scenario D §18, all critical):
  - As-built verification (serials match, BOM match, wiring diagram, apartment map)
  - Electrical safety (breakers, SPD, grounding, polarity, insulation, cable sizing, enclosure, labels)
  - Solar bus isolation (no backfeed to KPLC)
  - Inverter/battery operation (mode, charge/discharge, monitoring)
  - ATS switching per apartment (KPLC works, solar works, correct apartment, failover)
  - Meter mapping (each apartment meter maps correctly, accurate readings)
  - Token-state simulation (token available / exhausted / solar unavailable / KPLC unavailable / suspend)
  - Settlement dry run (E_gen, E_sold, E_waste, E_grid correct, no payout from unmonetized)
  - Per-test: measured value, pass/fail, evidence photos, signed by whom, date
- Signoff grid (Scenario D §19):
  - Task signoff (assigned electrician: did my work correctly)
  - Workstream signoff (lead: this workstream is LBRS-ready)
  - Safety signoff (qualified lead/inspector: meets safety standards)
  - Crew signoff (all critical-work electricians: no known issues)
  - e.mappa ops signoff (internal reviewer: accept activation)
  - If someone refuses: blocker category, description, evidence, required remediation
- Crew roster: [name, role, permissions, status]
- Evidence gallery: [photo thumbnails with metadata, grouped by task/date]

**Tap project → Full project view** (contract, safety brief, hardware package, stakeholder contacts, timeline, prior photos/diagrams):

**Flows:**
- Tap DRS task → `/task-detail` (why it matters, evidence requirements, examples, upload modal)
- Tap installation task → task detail (assign to crew, mark done, upload)
- Tap LBRS test → `/test-detail` (pass/fail criteria, photo requirements, measurement guidance, sign-off modal)
- [Upload evidence] → camera-first flow (photo + metadata, serial scanning, meter mapping prompt, offline draft saving per Scenario D §28)
- [Request signoff] → modal (who to request from, deadline, what's being signed off)
- [Refuse signoff] → modal (reason: technical issue / missing evidence / safety concern / payment dispute; must enter blocker category + description + evidence)

**Critical gates (Scenario D §29):**
- Do not allow installation to begin until DRS = 100%
- Do not allow go-live until LBRS = 100%
- UI percentages do not override critical blockers
- One electrician refusing signoff blocks go-live unless reason is resolved or overridden by senior review

**Components:**
- `ProjectStatusCard`
- `TaskBoard` (DRS / installation / LBRS)
- `SignoffGrid`
- `EvidenceGallery`
- `CrewRoster`
- `TaskDetail` (modal)
- `CameraCapture` (offline-capable)

**Spec citations:** Scenario D §14 (electrician project state machine), §15 (DRS responsibilities), §18 (LBRS), §19 (signoff rules), §28 (UX requirements: evidence capture).

---

### Electrician · Wallet (mobile + web)

**Purpose:** milestone earnings, labor-as-capital claims, household requests, pending payouts. Scenario D §22.

**Wallet sections (per Scenario D §22, §22.1):**

1. **DRS inspection payout:**
   - Payout amount (KES), status (pending / released)
   - Release condition: "DRS work package accepted"
   - Milestone date

2. **Installation milestone payouts:**
   - Mobilization, rough-in, hardware install, ATS completion, etc.
   - Per-milestone: amount, status, evidence accepted, release date
   - Milestones pending (next 3 upcoming)

3. **LBRS payout:**
   - Testing, remediation, signoff amount (KES)
   - Status: pending / released
   - Release condition: "LBRS reaches required state, evidence accepted"

4. **Labor-as-capital** (if elected, Scenario D §22.1, §29: *"Do not treat labor-as-capital as default compensation. Upfront or milestone labor payment should be the default."*):
   - Labor value (KES) converted to infrastructure-pool claim (%)
   - Claim details: pool type, percentage, start date, terms version
   - Monthly payout from infrastructure pool (live projects only)
   - **Clearly show:** "Your KSh X labor value is 20% of the infrastructure pool, not 20% of gross revenue" (Scenario D §5.1, installation spec §5.1: *"not 35% of every shilling/kWh unless the whole waterfall is redesigned"*)

5. **Household request income:**
   - Open requests (pending completion / pending household approval)
   - Completed requests with payout amount (KES), dispute window, released date
   - Household-approved work scope and price

6. **Maintenance reserve work:**
   - Approved system maintenance tasks (root cause, work completion accepted)
   - Payout amount (KES), status, release date

7. **Pending / disputed:**
   - Why money is held (KYC review, warranty dispute, work quality issue, safety concern, payment hold for other reason)
   - Who must act, evidence needed, expected resolution

8. **Payout history:**
   - Batch releases, payment method, settlement statements
   - CSV export, tax docs (if applicable)

**Flows:**
- Tap milestone → `/milestone-detail` (evidence checklist, upload proof of completion)
- Tap labor-as-capital claim → `/claim-detail` (valuation, pool, terms, expected payout range)
- Tap household request → `/request-detail` (scope, approval, estimated fee, accept/reject)
- Tap hold/dispute → dialog (reason, resolution steps, contact for questions)
- [Export statements] → CSV or PDF

**Critical gates:**
- Labor-as-capital must be opt-in with explicit signed terms (Scenario D §29: *"Do not treat labor-as-capital as default compensation"*)
- Labor-as-capital claim must reference the infrastructure pool correctly, never gross revenue (Scenario D §5.1, installation §5.1)
- Household request must have clear scope and household approval before payment (Scenario D §21, §27: *"Household must be scoped separately"*)
- Payouts visible in real-time as milestones complete

**Components:**
- `MilestonePayoutCard`
- `LaborCapitalClaimCard`
- `HouseholdRequestCard`
- `CashflowLedger`

**Spec citations:** Scenario D §22 (wallet sections), §22.1 (labor-as-capital), §21 (household requests), §29 (critical rules on labor defaults).

---

### Electrician · Profile (mobile + web)

**Purpose:** certification, credentials, crew, ratings, compliance. Scenario D §4.

**Sections:**
- **Account:**
  - Legal name, phone, email
  - Role pill: "Electrician"
  - Service area, primary location

- **Certification & Compliance** (embedded, Scenario D §4, §5, §27):
  - Certification tier: Helper / Verified / Lead / Senior / Restricted
  - Certification status: approved / provisionally approved / probation / rejected
  - Certification expiry (if applicable)
  - Training progress: [list completed modules] (e.mappa operating model, apartment architecture, homeowner architecture, DRS, LBRS, hardware selection, evidence capture, safety)
  - Practice test result: score %, pass/fail, date
  - [Retake certification] CTA
  - [Refresh training] CTA

- **Credentials & Documents** (embedded):
  - Electrical license / certificate (country-specific, if available)
  - Solar training certs, safety certs, business permit
  - Work portfolio: [prior job photos]
  - Background check status
  - Insurance / liability docs (if available)
  - [Upload new document] CTA
  - Expiry alerts (certifications due to expire in < 30 days)

- **Crew & Team** (embedded):
  - Crew membership: member / lead / founder
  - Crew name, description, service area
  - Crew members (if lead or founder): [list with roles]
  - [Create crew] or [Join crew] CTA (if solo)

- **Ratings & Reputation** (embedded, read-only per Scenario D §23):
  - Overall rating (1–5 stars or numeric, based on: completion speed adjusted for context, safety quality, evidence quality, reliability, technical scope, post-live performance, dispute rate)
  - Completion speed (planned vs actual, adjusted for owner access / supplier delays / weather / funding blockers)
  - Safety quality (LBRS pass rate, rework rate, critical defect history)
  - Evidence quality (completeness, clarity, serial mapping, photo standards)
  - Reliability (follow-through, no-shows, response time, blocker updates)
  - Technical scope (projects and complexity completed)
  - Post-live performance (faults traced to workmanship, warranty callbacks, maintenance recurrence)
  - Owner/homeowner/resident reviews (moderated, recent)
  - Safety record: incident reports, safety flag history

- **Skills & Specialization** (read-only):
  - Roofing / DB / metering / ATS / inverter/battery / apartment installation / home installation / maintenance
  - Brands/models handled (Growatt, Deye, etc.)

- **Payout Account** (embedded):
  - Bank / M-Pesa details
  - KYC verification status
  - [Update payout] CTA

- **Settings** (embedded): notifications, units, language
- **Support** (embedded): help articles, contact support
- **Logout**

**Flows:**
- [Upload document] → file upload (photo + metadata, expiry date if cert)
- [Retake certification] → quiz workflow (Scenario D §7)
- [View crew detail] → crew card
- [Create crew] → crew setup (name, lead, invite members)

**Gates:**
- Certification must be current to see projects (Scenario D §4: *"must be e.mappa-certified"*)
- Tier-based project visibility (helper / verified / lead / senior show different Discover feeds per Scenario D §5)
- Expiry alerts pre-emptive (30-day warning)
- Safety record visible; low score may limit project access

**Components:**
- `CertificationCard`
- `CrewCard`
- `RatingsSummary`
- `DocumentUploadCard`

**Spec citations:** Scenario D §4 (onboarding includes certification), §5 (certification tiers), §23 (ratings), §27 (UX requirements).

---

### Electrician Embedded Routes

- **`/(electrician)/project-detail`** — full scope, site details, stakeholders, hardware needs, payment terms, risks, commit button
- **`/(electrician)/task-detail`** — DRS or installation task, why it matters, evidence requirements, examples, upload modal
- **`/(electrician)/test-detail`** — LBRS test, pass condition, measured value, photo requirements, sign-off
- **`/(electrician)/evidence-upload`** — camera-first flow, checklist, serial scanning, meter mapping prompts, offline draft saving
- **`/(electrician)/signoff-request`** — who to request from, what's being signed, deadline, submit
- **`/(electrician)/signoff-refuse`** — reason (technical / safety / evidence / payment), blocker description + evidence, submit
- **`/(electrician)/household-request-detail`** — scope, estimated fee, household approval, accept/reject
- **`/(electrician)/milestone-detail`** — evidence checklist, proof of completion, release status
- **`/(electrician)/claim-detail`** — labor-as-capital: valuation, pool details, terms, expected payout

---

### Electrician Onboarding (`mobile/app/(onboard)/electrician/...`)

Per Scenario D §4 + IA v2 §7.4:

1. **Welcome** — "e.mappa: professional network for deployment, maintenance, and energy infrastructure work"
2. **Email/OTP** → verify
3. **Role selection** → "Electrician" + secondary choices: solo / existing crew / lead crew / apprentice / looking for crew
4. **Personal basics** — legal name, phone, location/service area, years of experience
5. **Identity** — national ID/passport, photo/liveness, phone, emergency contact
6. **Experience profile** — solar installation history, wiring/DB/meter experience, ATS/changeover experience, inverter/battery brands, photos of prior work, specialization tags
7. **Credentials/documents** — electrical license (where applicable), training certs, safety certs, business permit, work portfolio, insurance (if available)
8. **Background & references** — manual or automated review of identity, work claims, safety incidents, references
9. **e.mappa Certification Training** (mandatory, Scenario D §6):
   - Module: e.mappa operating model (prepaid-only, tokens, monetized solar, settlement, no payout from waste)
   - Module: Apartment architecture (separate e.mappa solar bus, Solar DB, per-apartment ATS, KPLC fallback, no common-bus leakage)
   - Module: Homeowner architecture (home-level controlled switching, inverter/battery, load fit, export/backfeed discipline)
   - Module: DRS (site inspection, capacity plan, hardware package, stakeholder readiness, funding/labor, compliance)
   - Module: LBRS (safety tests, isolation, inverter/battery, ATS switching, meter mapping, token-state, settlement dry run, signoff)
   - Module: Hardware selection (approved inverter/battery/ATS/meter/breaker/SPD/cable/conduit/mounting/connectivity specs, substitution process)
   - Module: Evidence capture (photos, serials, GPS/timestamp, before/after, diagrams, meter maps, test readings, defect notes)
   - Module: Safety & conduct (lockout/tagout, PPE, labeling, household access, incident escalation, fraud prevention)
10. **Practice test & scenario simulation** (Scenario D §7):
    - DRS judgment (building has funding/permission but no resident demand; can install start?)
    - ATS mapping (match unit / PAYG meter / solar meter / ATS output / resident account)
    - Hardware substitution (specified ATS unavailable; choose substitute/escalate/pause?)
    - Safety fault (photos show exposed conductor; can LBRS pass?)
    - Token-state simulation (tokens available / exhausted / solar unavailable / KPLC unavailable; describe switching states)
    - Settlement dry run (given E_gen, E_sold, E_waste; identify which kWh trigger payout)
    - Crew accountability (one crew member refuses signoff; next step?)
    - **Must pass:** ≥80% overall, 100% on critical safety/no-backfeed/go-live questions (Scenario D §31 recommended)
11. **Certification decision** → approved / provisionally approved / needs documents / limited helper role / limited small projects / restricted / rejected
12. → Discover

**Spec citations:** Scenario D §4 (full onboarding), §6 (training design), §7 (practice test), IA v2 §7.4.

---

## Financier (5 screens: mobile + web parity)

*Scenario F: investor path, capital commitment, DRS/LBRS gating, asset ownership, returns, payback tracking, regulatory gating.*

### Tab structure
1. **Discover** — project investment marketplace (deal-oriented)
2. **Project status** (route: portfolio) — committed projects, DRS/LBRS, escrow, milestones, live health
3. **Energy generation** — project generation, E_sold, utilization, asset ownership, performance alerts
4. **Wallet** — principal deployed, cashflows, returns, projected payback, fees, reserves, taxes
5. **Profile** — identity, KYC/KYB, investor eligibility, risk profile, limits, documents, payout account

### Financier · Discover (mobile + web)

**Purpose:** financial marketplace of projects. Deal-oriented. Scenario F §7.

**Project card (high-fidelity, investment-focused):**
- Project image (building/home photo)
- Location / jurisdiction (town, legal availability label, currency)
- DRS score (%) + hard blockers
- Capital raised (KES) + capital gap (KES)
- Stakeholder-as-a-service claims available (supplier / provider / electrician, with buyout price ranges)
- Projected economics:
  - Tariff (KES/kWh)
  - Expected E_gen / E_sold (kWh range)
  - Target utilization (%)
  - Projected monthly gross revenue
  - Payout pool (to investors)
  - Projected payback range (conservative/base/upside, years)
- Risk badge (pre-live / live expansion / low demand / high utilization / data quality / regulatory dependency / currency risk)
- Instrument type (infrastructure share / array share / supplier buyout / labor-as-capital buyout / revenue-share note / expansion tranche / portfolio)
- Eligibility state (invest now / watch only / documents needed / limit reached / restricted jurisdiction)

**Filter bar:**
- Deal size (KES range)
- Projected return (% range)
- Region / country / jurisdiction
- Stage (DRS / installation / LBRS / live / expansion)
- Instrument type (shares / buyout / notes / tranches)
- Risk profile (low / medium / high)

**Tap card → Embedded deal-room** (Scenario F §8):
- Hero: image, type, region, DRS/LBRS, capital raised, gap, timeline
- Funding stack: provider contribution, supplier equipment, electrician labor, financiers, owner/homeowner, gap
- Use of funds: exactly what capital funds (battery / inverter / ATS / meters / Solar DB / panels / cable / labor / logistics / expansion / buyout)
- Asset rights: what investor owns or claims (infrastructure pool % / provider pool % / buyout claim / note / lease / tranche claim)
- Readiness summary: DRS categories + blockers + what happens if financed
- Demand and capacity: pledges, load confidence, utilization sensitivity
- Projected returns: monthly revenue range, payback range, downside/base/upside scenarios, assumptions
- Risk disclosures: no guarantee, illiquidity, construction risk, utilization risk, hardware risk, regulatory risk, data risk, currency risk
- Documents: term sheet, waterfall, valuation, project budget, contracts, disclosures
- Commit CTA: [Invest] [Commit] [Buy out claim] [Watch only]

**Flows:**
- Filter + search
- Tap card → deal-room
- Tap [Invest / Commit] → commit flow (Scenario F §9)
- Tap [Buy out claim] → buyout flow (Scenario F §19)
- Tap [Watch only] → add to watchlist (no capital commitment, track for future)

**Empty state (if no eligible projects):** "No investable projects in your region yet. Check watchlist or adjust filters."

**Critical gates (Scenario F §1, §3, §7):**
- Do not show ineligible projects as investable (Scenario F §7, §20: *"app should never show an ineligible project as investable"*)
- If user jurisdiction or investor status doesn't permit: show education/watchlist only or hide entirely
- All projections must be ranges, never guaranteed ROI (Scenario F §17, §25: *"never show a single guaranteed payback"*)

**Components:**
- `ProjectCard` (deal-style, high-fidelity)
- `FilterBar` (deal size, return, jurisdiction, stage, instrument, risk)
- `EligibilityBadge`

**Spec citations:** Scenario F §7 (Discover screen), §8 (project detail fields), §20 (discover rule).

---

### Financier · Project Status (route: `portfolio`) (mobile + web)

**Purpose:** committed/watched projects, DRS/LBRS progress, escrow, milestones, live health. Scenario F §12.

**Layout:**
- **Committed projects grouped by stage:**
  - Watchlisted (user watching, no capital)
  - Pending (KYC/legal/payment incomplete)
  - Escrowed (funds held, pending DRS / contracts)
  - DRS active (capital helping readiness)
  - Deployment-ready
  - Installation (funds released by milestone)
  - LBRS testing
  - Live and earning
  - Suspended / defaulted
  - Exited / bought out

**Project status card (per Scenario F §12):**
- Project name/code, type, location, DRS/LBRS state
- Financier's commitment: amount (KES), instrument type (infrastructure share / array / buyout / note / tranche), claim percentage, status
- Escrow status (if applicable): escrowed amount, release conditions, cancellation/refund rules
- DRS/LBRS progress: % complete, blockers, timeline to deployment/launch
- Capital status: committed / deployed / escrowed, by milestone
- Release schedule: upcoming milestone, evidence needed, expected release date
- Asset rights: ownership % or claim type, payout pool, priority, payback projection (updated as measured data replaces projections)
- Live health (if applicable): generation performance, utilization vs forecast, settlement status, any issues
- Incident alerts (if any)
- Actions: [View detail] [Accept terms] [Withdraw (if pre-DRS)] [Message ops] [Dispute] [Buy out] [Sell claim]

**Tap project → Full project view** (richer: all details, documents, settlement statements, email history):

**Flows:**
- Tap DRS progress → `/drs-detail` (blockers, what capital helps, what blocks)
- Tap LBRS progress → `/lbrs-detail` (test checklist, failures, estimated fixes)
- Tap incident → `/incident-detail` (status, remediation, impact on returns)
- Tap settlement statement → `/statement-detail` (monthly breakdown, utilization, payouts, deductions)
- Tap [Withdraw] (pre-DRS) → modal (confirm, funds refund?)
- Tap [Buy out claim] → `/buyout-flow` (seller, price, terms, sign-off)
- Tap [Dispute] → `/dispute-flow` (reason, evidence, support contact)

**Gates:**
- Escrowed amount visible clearly (Scenario F §9: *"funds are held pending DRS"*)
- Release schedule transparent (milestone, evidence, expected date)
- No payout visible pre-LBRS/pre-live (Scenario F §12, §15: *"Usage-linked returns do not begin until live"*)
- Settlement statements visible only post-go-live
- Incident alerts pre-emptive (data missing / downtime / maintenance / utilization drop)

**Components:**
- `ProjectStatusCard`
- `ProjectTimeline` (DRS → installation → LBRS → live)
- `EscrowStatusCard`
- `ReleaseSchedule`
- `SettlementStatement`

**Spec citations:** Scenario F §12 (Project Status screen).

---

### Financier · Energy Generation (mobile + web)

**Purpose:** project generation, monetized kWh, utilization, asset ownership. Scenario F §13.

**Pre-live (projected only):**
- Expected E_gen (kWh range)
- Expected utilization (% range)
- Downtime assumptions (%)
- Degradation assumptions (%)
- Expected E_sold (kWh range under utilization scenarios)
- Expected monthly gross revenue (KES range)
- Expected payout (to investor's pool, KES range)
- Assumptions displayed (tariff, array kW, battery kWh, efficiency, reserve %, pool rate)

**Live (actual + projected):**
- **E_gen:** total solar generated (kWh this period)
- **E_direct:** solar consumed immediately by eligible load
- **E_charge:** solar sent into battery
- **E_battery_used:** stored solar later delivered
- **E_sold:** prepaid, delivered, measured solar consumed (payout base per Scenario F §15 doctrine: *"pay on monetized solar"*)
- **E_waste:** generated but not monetized (if legal export/trading not enabled)
- **E_grid:** demand served by KPLC fallback
- **Utilization:** E_sold / E_gen (main economic driver)
- **Coverage:** E_sold / total demand
- **Data quality:** verified / estimated / missing / disputed / conservative
- **Performance vs forecast:** actual vs base-case expectation (chart)
- **Financier's economic exposure:**
  - Asset claim type (infrastructure / array / buyout / note)
  - Claim percentage (%)
  - Monthly payout from relevant pool (KES)
  - Remaining principal to recover (KES)
  - Projected additional months to full recovery

**Flows:**
- Tap utilization trend → `/utilization-detail` (demand spike? low solar? storage issue? grid reliance? weather?)
- Tap data quality → modal (why disputed or missing? resolution steps?)
- Tap asset claim → `/claim-detail` (ownership %, pool economics, payout projection updates)

**Gates:**
- Before LBRS: show projections only, clearly labeled
- After go-live: show measured data
- Never show E_gen as investor revenue; show E_sold × pool rate × claim %
- Conservative settlement if data missing (Scenario F §15 + AI-native doctrine)

**Components:**
- `EnergyFlowChart` (24h or daily/weekly/monthly)
- `UtilizationTrend`
- `DataQualityBadge`
- `ClaimPerformanceCard`

**Spec citations:** Scenario F §13 (Energy Generation screen), §15 (settlement doctrine).

---

### Financier · Wallet (mobile + web)

**Purpose:** principal deployed, cashflows, returns, payback, fees, risk alerts. Scenario F §16, §17.

**Wallet sections:**

1. **Available balance:**
   - Cash available for new eligible commitments or withdrawal
   - Subject to payment rail, compliance rules, and per-investor/per-project limits

2. **Pending commitments:**
   - Investments selected but not yet accepted, paid, escrowed, approved
   - Cancel CTA (if pre-payment)

3. **Escrowed funds:**
   - Funds held pending DRS, contracts, milestone release, or cancellation window
   - Escrow agent, release condition, expected release date

4. **Deployed principal:**
   - Total capital released to projects, by project, asset, pool, tranche, currency
   - vs. original commitment (shows if milestones released partial funds)

5. **Cashflow received:**
   - Settlement payouts from infrastructure pool, provider/array pool, buyouts, royalties, export/trading if enabled
   - Chronological, by settlement period

6. **Projected income:**
   - Base/downside/upside modeled cashflow per project
   - Clearly labeled estimates with assumptions shown
   - Updated as measured data replaces projections post-go-live

7. **Payback tracker:**
   - Principal recovered (KES)
   - Remaining principal (KES)
   - Projected payback period (months, updated per actual)
   - Actual payback velocity (progress vs forecast)
   - Scenario-adjusted payback (if utilization changes)

8. **Fees and reserves:**
   - Platform fees (%, KES per period)
   - Maintenance reserve deductions
   - Utility/wheeling fees (where enabled)
   - Custody/payment fees (if any)
   - Taxes withheld (if applicable)

9. **Risk and performance alerts:**
   - Low utilization (< forecast)
   - Data missing
   - Downtime
   - Maintenance event
   - LBRS delay
   - Stakeholder dispute
   - Regulatory hold
   - Currency depreciation

10. **Statements and exports:**
    - Monthly statements, project-level ledger, tax docs, contract copies, audit trail
    - CSV/PDF export

**Flows:**
- Tap settlement statement → `/statement-detail` (E_gen, E_sold, utilization, payout calc, waterfall breakdown, investor's share)
- Tap payback projection → `/payback-scenarios` (downside/base/upside, what affects payback)
- Tap fee → explanation (platform fee policy, maintenance reserve rules, why deducted)
- Tap alert → remediation info (what to do, who to contact)
- [Export statements] → CSV or PDF

**Critical gates (Scenario F §16, §25, §26):**
- Escrowed amount separated from deployed (Scenario F §9: *"funds held... not yet released to project spending"*)
- Projected returns must use ranges, never guaranteed (Scenario F §17: *"never show a single guaranteed payback"*)
- Assumptions must be visible (utilization %, downtime %, degradation %, reserve %, fees, currency)
- Pre-live: no usage-linked payout (Scenario F §15, §25: *"Usage-linked returns do not begin until LBRS = 100%"*)
- Live: measured data replaces projections; projections update as actuals come in
- Fees, reserves, taxes visible and deducted transparently
- Risk alerts pre-emptive (utilization drop triggers payback extension, not magical higher returns)

**Components:**
- `BalanceSummary`
- `CashflowTimeline`
- `PaybackTracker`
- `ProjectionScenarios`
- `RiskAlertList`
- `SettlementStatement`

**Spec citations:** Scenario F §16 (Wallet screen), §17 (projected returns), §25 (no usage-linked before LBRS), §26 (risk controls).

---

### Financier · Profile (mobile + web)

**Purpose:** identity, KYC/KYB, eligibility, risk profile, compliance, limits. Scenario F §5, §6.

**Sections:**
- **Account / Identity:**
  - Account type: individual / business / fund / investment club / diaspora / institutional
  - Legal name / business name
  - Email, phone, country of residence, tax residency
  - Payout / withdrawal account (bank / M-Pesa / escrow)
  - KYC / KYB verification status

- **Investor Profile** (embedded, per Scenario F §5.1):
  - **Individual path:**
    - National ID/passport, selfie/liveness, address, DOB, tax residency, phone
    - Sanctions screening status
  - **Business/entity path:**
    - Company registration, directors, beneficial owners, board authorization
    - Source of funds verification
    - Authorized signatory(ies)
    - Tax/PIN, bank/M-Pesa
  - [Update documents] CTA
  - Expiry alerts (documents / certifications / approvals due to refresh)

- **Eligibility & Risk Profile** (embedded, per Scenario F §5):
  - Investor classification: retail / sophisticated / accredited / qualified / professional / institutional / restricted
  - Evidence of eligibility (where required by law)
  - Risk questionnaire results: income/asset band, loss tolerance, time horizon, liquidity needs, concentration comfort, investment experience, comprehension score
  - Suitability assessment: suitable for (simple products / complex products / high-risk products)
  - Per-investor limits: amount per commitment, amount per project, amount per period, per-jurisdiction concentration
  - [Retake risk questionnaire] CTA (if needed)

- **Jurisdiction & Compliance** (embedded, per Scenario F §5):
  - Country of residence, tax residency, citizenship/residency status where relevant
  - Eligible offerings (based on jurisdiction, investor tier, limits)
  - Restricted jurisdictions (if any)
  - Cross-border restrictions (if any)
  - Cooling-off period (if applicable, e.g., 5 business days for some retail products)
  - Marketing restrictions (e.g., passive only, no active solicitation)
  - Compliance status: approved / limited / restricted / documents needed / expired

- **Payout & Tax** (embedded):
  - Payout account (bank / M-Pesa / escrow) + verification status
  - Tax forms (W-9 / T-form / local equivalent), if required
  - Tax withholding rate (if applicable)
  - [Update payout account] CTA
  - [View tax documents] (annual 1099 / settlement statement)

- **Documents & Agreements** (embedded):
  - Signed participation agreement(s)
  - Risk disclosure(s)
  - Conflicts disclosure(s)
  - No-guarantee acknowledgement
  - Transfer restrictions (if applicable)
  - Custody/escrow agreement (if applicable)
  - [View document] CTA

- **Settings** (embedded): notifications, units (KES/USD), language, currency preference
- **Support** (embedded): help articles, contact support, investor education, FAQ
- **Logout**

**Flows:**
- [Update documents] → file upload (ID / passport / company registration / board mins / tax forms)
- [Retake risk questionnaire] → guided questions (Scenario F §5)
- [Update payout account] → bank / M-Pesa / escrow details
- [View document] → PDF viewer (agreement, disclosure, tax statement)
- [Contact support] → email or in-app chat

**Critical gates (Scenario F §3, §5, §26):**
- KYC / KYB must pass before investing (Scenario F §3, §26: *"Do not let an unverified or ineligible user commit capital"*)
- Jurisdiction gating must be enforced (Scenario F §7, §20: *"if the offering is not legally available to that user"*, don't show as investable)
- Eligibility tier limits investment access (retail ≠ accredited; different products available)
- Risk profile must match product complexity (Scenario F §5: suitability check)
- Compliance status visible and understandable (verified / limited / restricted / documents needed / expired)
- Cooling-off period honored for retail retail products (where applicable)
- Concentration warnings enforced (can't over-allocate to one project/sector/geography)
- Tax documents generated and available post-payout

**Components:**
- `IdentityCard`
- `KYCStatusBadge`
- `RiskProfileSummary`
- `EligibilityTierbadge`
- `PayoutAccountCard`
- `DocumentUploadCard`
- `ComplianceStatusIndicator`

**Spec citations:** Scenario F §5 (onboarding), §5.1 (individual vs business), §3 (regulatory positioning), §25 (investor risk controls), §26 (compliance controls).

---

### Financier Embedded Routes

- **`/(financier)/project-detail`** — full deal room (funding stack, use of funds, asset rights, readiness, demand, projections, risks, documents, commit button)
- **`/(financier)/drs-detail`** — DRS blockers, what capital helps, what still blocks
- **`/(financier)/lbrs-detail`** — LBRS test checklist, failures, go-live blockers
- **`/(financier)/statement-detail`** — monthly breakdown, E_gen, E_sold, utilization, payout calc, waterfall, investor's share
- **`/(financier)/claim-detail`** — asset claim: ownership %, pool, terms, payout projection, interest sell option
- **`/(financier)/payback-scenarios`** — downside/base/upside, what affects payback, sensitivity analysis
- **`/(financier)/buyout-flow`** — target claim, seller, terms, price, due diligence, sign-off
- **`/(financier)/incident-detail`** — system fault, cause, remediation, impact on returns, resolution timeline
- **`/(financier)/dispute-flow`** — reason, evidence, escalation path, contact

---

### Financier Onboarding (`mobile/app/(onboard)/financier/...`)

Per Scenario F §5 + IA v2 §7.5 (adapted):

1. **Welcome** — "e.mappa: finance verified local energy infrastructure and earn from measured, monetized energy performance"
2. **Email/OTP** → verify
3. **Role select** → "Financier / investor"
4. **Account creation** — phone/email, secure password/passkey, country of residence, preferred currency, payout setup placeholder
5. **Account type selection** — individual / business / entity / investment club / fund / institutional / watch-only
6. **Identity verification:**
   - **Individual:** ID/passport, selfie/liveness, address, DOB, tax residency, sanctions screening
   - **Business/entity:** company registration, directors, beneficial owners, board authorization, tax/PIN, source of funds, authorized signatory, bank/M-Pesa
7. **Investor eligibility classification** — determine tier (retail / sophisticated / accredited / qualified / professional / institutional / restricted) per jurisdiction rules; do not allow self-selection without verification where law requires evidence
8. **Risk profile & suitability:**
   - Income/asset band (where allowed)
   - Loss tolerance, time horizon, liquidity needs
   - Investment experience (none / some / extensive)
   - Concentration comfort
   - Comprehension of revenue-share / project risk
9. **Regulatory disclosures:**
   - No guarantee, possible total loss
   - Illiquidity, variable payback, utilization risk, downtime risk, regulatory risk, currency risk, project-specific risk
   - [Accept] CTA (mandatory)
10. **Jurisdiction gating** — determine which offerings visible based on residence, citizenship/tax status, local rules, currency rails, platform licenses
11. **Payment rail setup** — connect bank / M-Pesa / escrow / custody account, withdrawal destination, anti-fraud checks
12. **Investment limits** — set per-investor, per-project, per-period, per-jurisdiction, concentration limits based on eligibility and internal risk
13. **Education module** — DRS, LBRS, monetized solar, settlement waterfall, utilization, payback ranges, provider vs infrastructure pools, buyout mechanics
14. **Access decision** → approved / limited retail access / sophisticated-only / entity-approved / watch-only / restricted jurisdiction / documents needed / rejected
15. → Discover (or watch-only landing)

**Spec citations:** Scenario F §5 (full onboarding), §5.1 (individual vs business/entity), IA v2 §7.5 (adapted for investor context).

---

## Admin (Cockpit primary; mobile read-only subset)

*Admin is never a public role. The mobile surface is a small read-only triage app for ops staff on the move; Cockpit (web) is the full operational console. Per IA v2 §8.5 + AI-native doctrine: every mutation is audit-logged, every agent action is attributable, and admin is enforced by five interlocking gates (preserved verbatim at the bottom of this section).*

### Tab structure (mobile, 3 tabs — read-only triage)
1. **Alerts** — operational alerts feed, embedded alert detail
2. **Projects** — read-only portfolio scan, embedded project detail
3. **Profile** — account + Settings + Support + logout

> Mobile is deliberately narrow: no mutation surface, no queue sign-off, no agent panels. Decisions land in Cockpit (web). This preserves the audit + RBAC posture per AI-native §4 (governance) and IA v2 §8.5.

---

### Admin · Alerts (mobile, read-only)

**Purpose:** at-a-glance triage queue for paged ops staff. AI-native §6 (failure-mode awareness).

**Layout/states:**
- **Loading:** skeleton with 5 alert row placeholders.
- **Empty:** "No active alerts" + last-checked timestamp.
- **Populated:** chronological list grouped by severity (P0 / P1 / P2 / info), each row tappable to embedded detail.
- **Error:** explicit network/auth error + retry; never silent.

**Fields/columns:**
- Severity pill (P0 critical / P1 high / P2 medium / info)
- Alert title (e.g., "Solar bus backfeed detected — building X")
- Affected entity (building / project / apartment / electrician / financier / provider)
- First seen (relative time), last updated
- Owner-on-call (if assigned)
- Status (open / acknowledged / mitigating / resolved)
- Source (agent name / monitor / human report)

**Flows/actions (read-only on mobile):**
- Tap row → `/admin/alert-detail` (read-only): full incident timeline, agent-suggested remediation, links to Cockpit for action
- Pull-to-refresh
- "Open in Cockpit" deep-link (copy URL)

**Gates:** No mutation buttons on mobile. Severity filter visible to all admins; per-jurisdiction restriction respected via JWT scope.

**Components:**
- `AlertRow` (mobile) — Build status: stub
- `AlertDetailReadOnly` — Build status: stub

**Spec citations:** AI-native §3.3 (controller / monitoring), §6 (failure modes); installation §10 (blocker rules); IA v2 §8.5.

---

### Admin · Projects (mobile, read-only)

**Purpose:** portfolio scan + per-project glance for paged staff. Installation §6 (deployment workflow).

**Layout/states:**
- **Loading:** skeleton list.
- **Empty:** "No projects in your scope."
- **Populated:** searchable list, grouped by phase (initiated / DRS / funding / installation / LBRS / live / paused / blocked).
- **Error:** retry.

**Fields/columns:**
- Building name + address
- Phase pill (DRS / funding / installation / LBRS / live)
- DRS % + critical-blocker count
- LBRS % + critical-blocker count (if installation complete)
- Owner-on-call
- Last-event timestamp

**Flows/actions:**
- Tap row → `/admin/project-detail-mobile` (read-only summary of DRS gates, LBRS tests, settlement status, open blockers); "Open in Cockpit" deep-link.
- Filter by phase, region, severity.

**Gates:** Read-only. No score override, no gate signoff, no waterfall mutation on mobile.

**Components:**
- `ProjectRowAdmin` — Build status: stub
- `ProjectDetailReadOnly` — Build status: stub

**Spec citations:** Installation §3 (DRS), §8 (LBRS), §6 (workflow); AI-native §3 (closed loop).

---

### Admin · Profile (mobile)

**Purpose:** account + ops-staff settings + support + logout. IA-U7, IA-U8.

**Sections:**
- Account: name, email, role "Admin", JWT scope summary (jurisdictions + queues unlocked)
- Settings (embedded): push notification severity threshold, units, language
- Support (embedded): internal runbook links, on-call rotation
- Logout

**Gates:** No role-switch UI (admin is never a self-selectable role; see §8.5 below).

**Spec citations:** IA v2 §8.5; IA-U7/U8.

---

## Cockpit (web, internal ops — NOT bound by 5-tab rule)

Cockpit is the full operational console. The 5-tab limit (IA-U1) does not apply: Cockpit is a desktop-first console with left-rail navigation and persistent global filters (jurisdiction, phase, severity). All surfaces below are first-class routes, not modals.

### Universal Cockpit Rules

These rules apply to every Cockpit surface (enforced by app-level guards, middleware, and UI primitives):

- **CR-1 — Admin role isolation:** Cockpit is admin-only. Non-admin sessions are rejected at `cockpit/src/App.tsx` (see §8.5 gate 5). Admin is never a selectable role for public users.
- **CR-2 — Every mutation is audited:** Any state-changing action (queue approval, gate override, classification, RBAC change, agent dispatch) writes to the audit log with `{admin_id, action, target_entity, before, after, reason, timestamp, agent_attribution?}`. The mutation UI must require a free-text `reason` before submit; submit is disabled until reason is non-empty. AI-native §4 (governance constitution).
- **CR-3 — No PII without authorization:** Resident phone / national ID / payout account numbers are masked by default. Unmask requires a documented "PII view" claim in JWT scope and writes an audit entry. AI-native §4 (correctness over convenience).
- **CR-4 — Agent-action attribution:** Any AI-agent-proposed action surfaced in Cockpit must show `agent_id`, `agent_version`, `confidence`, `evidence_uris[]`, and `recommended_action`. Admin must explicitly accept/reject; no agent can mutate state without admin co-sign (except inside the closed-loop economic engine, which logs autonomously per AI-native §3.4 and is observable via the Audit Log Viewer).
- **CR-5 — Conservative-by-default:** When data quality is missing/disputed, Cockpit defaults to the pause/downgrade path and surfaces a "conservative-settle banner" on the affected surface. AI-native implementation anchor.
- **CR-6 — Critical-gate override discipline:** A critical DRS or LBRS gate cannot be marked complete without evidence URI + signed-by attribution. UI override of a *failed* critical gate is forbidden (installation §12). Cockpit surfaces "Block reason" + "Request remediation," not "Force complete."
- **CR-7 — RBAC-scoped queues:** Each queue respects the admin's scope (jurisdiction, queue type, severity ceiling). Items outside scope are hidden, not greyed.
- **CR-8 — No silent fallback:** Every surface has explicit loading / empty / error / partial states. No mock data; synthetic data is badged. (IA-U5, IA-U6.)
- **CR-9 — Deep-linkable everywhere:** Every queue item, building drill-down tab, agent panel, and audit entry is a permalink (shareable in runbooks, paging tools).

---

### Cockpit · Command (default landing)

**Purpose:** single-screen portfolio overview — answers "what needs my attention now?" AI-native §3.1 (Measure → Evaluate → Adjust).

**Layout/states:**
- **Loading:** skeleton with 4 KPI tiles + 2 lists.
- **Populated:** 4-tile KPI strip on top, 2-column body (alerts left, queues right), footer settlement summary.
- **Empty (rare):** "All clear — last incident N hours ago."
- **Error:** per-tile error chip, retry, no silent fallback.

**Fields/columns:**
- KPI strip: active projects (count by phase), open P0/P1 alerts, queue backlog totals, system-wide solvency status (green/amber/red per AI-native §2.3)
- Alerts panel: top 10 by severity (compact rows: severity / title / entity / age / owner)
- Queues panel: each queue + backlog count + oldest item age (DRS, LBRS, Provider Verification, Electrician Certification, Financier Eligibility, Doc Review)
- Settlement summary: total prepaid inflows (24h), total payouts (24h), monetized-solar invariant check (E_sold ≤ E_gen, payouts ≤ inflows), conservative-settle count
- Agent activity ribbon: last N agent actions awaiting admin co-sign

**Flows/actions:**
- Click any tile → drilled queue / settlement monitor / alerts
- Click any KPI → filtered list view
- Global filter bar: jurisdiction, phase, severity (persists across surfaces)

**Gates:** Tiles obey CR-7 (scope). Solvency tile turns red if `Σ payouts > Σ prepaid inflows`; this is a system-level invariant per AI-native §2.3 — no admin can dismiss it.

**Components:**
- `CommandKPITile` — Build status: stub
- `AlertsPanel` — Build status: stub
- `QueueBacklogPanel` — Build status: stub
- `SettlementSummaryStrip` — Build status: stub
- `AgentActivityRibbon` — Build status: stub

**Spec citations:** AI-native §2.3 (solvency), §3 (closed loop), §6 (failure modes); installation §1 (DRS/LBRS gates).

---

### Cockpit · Stress Test

**Purpose:** scenario simulator for economic + capacity stress. AI-native §6, §7 (optimization).

**Layout/states:** scenario picker (left), parameter form (centre), result panel (right).

**Fields:**
- Scenario presets: demand spike, provider drop-out, financier withdrawal, low utilization, ROI overpromise
- Parameters: kWh price, α (provider share), β (financier share), demand multiplier, supply multiplier, jurisdiction subset
- Results: solvency check, per-stakeholder payout deltas, conservative-settle trigger count, projected ROI curves, violation list

**Flows/actions:**
- Run scenario → result panel with green/amber/red verdict + flagged invariants
- "Promote to production proposal" → routes to RBAC console / governance review (writes audit entry per CR-2)
- Export run as PDF / JSON

**Gates:** Read-only against production state by default. Promotion requires a separate JWT claim (`stress:promote`).

**Components:** existing `cockpit/src/stress-test/` — Build status: exists, needs spec alignment with AI-native §6.

**Spec citations:** AI-native §6 (failure modes), §7 (objective), §9 Phase 2 (simulation).

---

### Cockpit · Settlement Monitor

**Purpose:** per-project waterfall verification + solvency invariant. AI-native §2.3, §5.

**Layout/states:**
- Project picker (left, with phase/jurisdiction filter)
- Waterfall view (centre): per-kWh decomposition (reserve / providers / financiers / owner host royalty / e.mappa fee)
- Invariants strip (top): `Σ payouts ≤ Σ prepaid inflows`, `E_sold ≤ E_gen`, no payout from unmonetized solar, monetized-only flag green
- Time toggle (24h / 7d / 30d / billing period)

**Fields/columns:**
- Per-project: prepaid inflow (KES), E_sold (kWh), E_gen (kWh), E_waste (kWh), E_grid (kWh)
- Waterfall rows: pool name, configured ratio, KES distributed, recipients count
- Anomaly column: conservative-settle flag, data-quality flag, disputed-reading flag
- Per-stakeholder rollup: provider pool, financier pool, owner royalty, e.mappa fee, maintenance reserve

**Flows/actions:**
- Click row → per-recipient breakdown (read-only by default; mutation requires CR-2 reason)
- "Trigger dry-run reconciliation" → invokes reconciliation agent panel (see Agent Panels)
- "Hold payout" → requires reason + writes audit (CR-2, CR-6)
- Export statement (CSV / PDF)

**Gates:** Payout-hold action requires `settlement:hold` claim. Monetized-only invariant cannot be overridden — only paused with reason.

**Components:**
- `WaterfallView` — Build status: stub
- `SolvencyInvariantStrip` — Build status: stub
- `SettlementProjectPicker` — Build status: stub

**Spec citations:** AI-native §2.3, §5 (economic model), §6.3 (provider underpayment); installation §8 (LBRS settlement dry-run), §12 (decision rules).

---

### Cockpit · Alerts

**Purpose:** full alert triage queue (Mobile-Alerts surfaces a subset). AI-native §6.

**Layout/states:** filterable table (severity, source, entity type, status, age, jurisdiction); detail drawer on row click.

**Fields/columns:** severity, title, entity, source (agent / monitor / human), first-seen, last-updated, status, owner, remediation status, evidence URIs, agent recommendation (if any).

**Flows/actions:**
- Acknowledge (writes audit + clears P-page)
- Assign owner (admin id from RBAC scope)
- Link to incident detail / building drill-down
- Resolve with mandatory `reason` (CR-2)
- "Dispatch agent" → routes to relevant Agent Panel with pre-filled context

**Gates:** P0 resolution requires two-admin sign-off (`alerts:resolve_p0` claim plus second approver). All resolutions audit-logged.

**Components:**
- `AlertsTable` — Build status: stub
- `AlertDetailDrawer` — Build status: stub
- `RemediationStatusPill` — Build status: stub

**Spec citations:** AI-native §6; installation §10 (blocker rules).

---

## Cockpit Ops Decision Queues

All queues share a uniform shape: filterable table → detail drawer → decision form (with mandatory CR-2 reason) → audit-logged commit. Each enumerated below.

### DRS Queue

**Purpose:** every project in DRS phase, gate-by-gate progress, blockers, ops actions. Installation §3, §4, §6.

**Columns:** building name, owner, jurisdiction, DRS %, critical-blocker count, gate-by-gate status (owner-auth / stakeholders / site / capacity / demand / hardware / electrician-payment / contracts-compliance), oldest blocker age, next action, owner-on-call.

**Detail drawer (per project):**
- Each of the 9 DRS components from installation §3, with status (pending / in-progress / passed / blocked-critical), evidence URI, reviewer, completed-at
- Blocker list with `blocker_type` (installation §10)
- Capacity plan + BOM links
- Stakeholder commitments roster (provider / financier / electrician)

**Flows/actions:**
- Mark gate complete (requires evidence URI + reason; CR-2, CR-6)
- Request remediation from named stakeholder (sends notification, writes audit)
- Block project (with reason)
- Move to "ready to schedule installation" — gated on `drs_score == 100` AND no critical blockers (installation §12)
- Dispatch DRS agent for AI-assisted blocker analysis

**Gates:** Cannot mark `drs_score = 100` if any critical gate is `failed`. UI hides "complete" button until evidence URI present. Per CR-6, force-complete is not a Cockpit affordance.

**Components:**
- `DRSQueueTable` — Build status: stub
- `DRSGateCard` — Build status: stub
- `DRSBlockerList` — Build status: stub

**Spec citations:** Installation §3, §4 (scoring), §6 (workflow), §10 (blockers), §12 (decision rules).

---

### LBRS Queue

**Purpose:** every project in LBRS phase, test-by-test progress, signoff status. Installation §8, §9.

**Columns:** building, electrician-of-record, LBRS %, critical-test count failed, as-built / safety / isolation / inverter-battery / ATS / meter-mapping / token-state / settlement-dry-run / activation-readiness / launch-packet status, last test timestamp.

**Detail drawer:**
- Per LBRS test (installation §8 table): test name, pass condition, measured value, evidence URI, signed_by (electrician), reviewer
- Per-apartment ATS test grid
- Settlement dry-run output (E_gen / E_sold / E_waste / E_grid + waterfall sample)
- Activation readiness checklist

**Flows/actions:**
- Counter-sign LBRS test (admin co-sign; writes audit)
- Reject test result → return to electrician with reason
- Approve go-live — gated on `lbrs_score == 100` AND all critical tests pass AND settlement dry-run passes
- Dispatch DRS/LBRS agent for evidence triage

**Gates:** Go-live button disabled unless every critical test green (installation §9). Solar-bus-isolation failure is non-overridable (installation §10). Per-apartment ATS mapping must be `verified` for that apartment to be activatable.

**Components:**
- `LBRSQueueTable` — Build status: stub
- `LBRSTestRow` — Build status: stub
- `ATSApartmentGrid` — Build status: stub
- `SettlementDryRunPanel` — Build status: stub

**Spec citations:** Installation §8 (tests), §9 (scoring), §10 (blockers), §11 (data model), §12 (rules).

---

### Provider Verification Queue

**Purpose:** providers awaiting verification decision (business or individual path). Scenario E §5, §6.

**Columns:** applicant name, account_type (business / individual), claimed role (panels / infrastructure / both), documents-uploaded count, service area, last-update.

**Detail drawer:**
- Business path: business registration, address, shop/warehouse, tax/PIN, contact, operating area, delivery capability, warranty docs, supplier references (Scenario E §5)
- Individual path: national ID, proof of asset ownership, asset photos, serial numbers, location, condition disclosure, prior-use history, inspection consent
- Inventory catalog draft
- Reference checks
- Risk flags

**Flows/actions (Scenario E §5 verification decisions):** approved / provisionally approved / supplier-only / provider-only / individual-asset-contributor / needs-inspection / needs-more-documents / restricted-catalog / rejected. Each decision requires reason + writes audit.

**Gates:** Catalog cannot be activated until decision != needs-*. "Restricted catalog" limits the items the provider can offer; surfaced as policy tags on the provider record.

**Components:**
- `ProviderVerificationTable` — Build status: stub
- `ProviderVerificationDecisionForm` — Build status: stub
- `DocumentReviewerPane` — Build status: stub (shared)

**Spec citations:** Scenario E §5 (verification paths), §6 (tiers), §11 (data model — `SupplierBusinessVerification`).

---

### Electrician Certification Queue

**Purpose:** electricians awaiting certification tier assignment. Scenario D §4 step 10, §6 (verification layer).

**Columns:** applicant, service area, identity-doc status, license/cert docs status, training-module completion %, references, work-portfolio, safety-training evidence, insurance status, current tier (none / probation / standard / preferred).

**Detail drawer:**
- Identity & eligibility (Scenario D §4): legal name, phone, location, ID, business registration (if applicable), references, emergency contact
- Credentials: licenses, training certificates, business permits, portfolio, safety training, insurance/liability
- e.mappa certification training module scores (per Scenario D §4: architecture, DRS, LBRS, safety, software, evidence, anti-fraud, crew accountability)
- Crew membership and lead-electrician status
- Safety record
- KYC / reference results

**Flows/actions:**
- Assign certification tier (probation / standard / preferred / restricted / rejected) — per Scenario D §6 + §11 (`certification_tier`)
- Require additional module / retake
- Restrict scope (e.g., no homeowner projects, no lead role)
- Suspend (with reason)

**Gates:** Tier affects project access cap (Scenario D §13 — concurrency cap). Cannot certify "preferred" without passing all training modules + ≥N completed projects (per Scenario D §6).

**Components:**
- `ElectricianCertificationTable` — Build status: stub
- `CertificationTierAssignmentForm` — Build status: stub
- `TrainingModuleScoreGrid` — Build status: stub

**Spec citations:** Scenario D §4 step 10 (verification + training), §6 (verification layer + tiers), §11 (data model — `ElectricianProfile`, `TrainingProgress`).

---

### Financier Eligibility Queue

**Purpose:** financiers awaiting eligibility classification + jurisdiction gating. Scenario F §5 step 6, §7 (jurisdiction), §22 (cross-border).

**Columns:** applicant, account_type (individual / entity / fund), country of residence, tax residency, KYC/KYB status, claimed investor class, jurisdiction, documents-uploaded.

**Detail drawer:**
- Identity (individual) / beneficial ownership + directors (entity)
- KYC/KYB documents, AML screening
- Investor-eligibility evidence (retail / sophisticated / accredited / qualified / professional / institutional / restricted) — Scenario F §5
- Risk profile responses
- Tax forms, payout account, currency rail
- Concentration / per-period / per-jurisdiction limits proposed by system
- Source-of-funds (for sophisticated/accredited paths)

**Flows/actions (Scenario F §5 access decisions):** approved / limited-retail-access / sophisticated-only-access / entity-approved / watch-only / restricted-jurisdiction / needs-more-documents / rejected. Set per-investor, per-project, per-period limits.

**Gates:** Cannot approve "sophisticated" or "accredited" without supporting evidence URI. Jurisdiction-gating respects the Restricted Jurisdictions list (Scenario F §22). All commitments downstream are filtered by the assigned eligibility (`OfferingDoc.eligible_investor_types`).

**Components:**
- `FinancierEligibilityTable` — Build status: stub
- `EligibilityDecisionForm` — Build status: stub
- `JurisdictionGateBadge` — Build status: stub
- `InvestorLimitsEditor` — Build status: stub

**Spec citations:** Scenario F §3 (compliance-by-design), §5 (eligibility decisions), §7 (investor classes), §22 (cross-border), §27 (data model — `FinancierProfile`, `EligibilityEvidence`).

---

### Authority / Identity Document Review Queue

**Purpose:** review uploaded title / lease / authority / ID documents from homeowners + building owners. Scenarios B §3 step 5, C §6 step 5.

**Columns:** applicant, role (Homeowner / Building Owner), property/building address, doc types uploaded (title / lease / management agreement / utility / national ID / company docs), upload age, status.

**Detail drawer:**
- Document viewer (per doc: type, file URI, uploaded-at, OCR extract if available)
- Property record summary (address, unit count, occupancy)
- Cross-check: utility account ↔ property address, ID ↔ payout account, lease validity period
- Reviewer notes
- AI document-extraction confidence score + flags

**Flows/actions:** approve authority / reject / request additional doc / require site inspection / escalate to legal. Each writes audit + sends user notification.

**Gates:** Authority status `verified` is a prerequisite for the user to initiate a DeploymentProject (installation §3 — owner authorization is a critical DRS gate). PII view restricted per CR-3.

**Components:**
- `DocReviewQueueTable` — Build status: stub
- `DocumentViewer` — Build status: stub
- `AuthorityDecisionForm` — Build status: stub

**Spec citations:** Scenario B §3 step 5 (ownership/authority verification), Scenario C §6 step 5 (homeowner authority verification), installation §3 (owner authorization gate).

---

### Counterparties Directory

**Purpose:** unified directory of all verified providers, electricians, financiers. Reference + risk surface.

**Layout/states:** tabbed list (Providers / Electricians / Financiers); per-row drawer with full profile.

**Columns (shared):** name, role-specific tier/class, jurisdiction/service-area, active project count, rating, risk flags, last-active, payout account status.

**Per-tab specifics:**
- Providers: business type (panels/infra/both), inventory size, warranty score, EaaS commitments
- Electricians: certification tier, crew membership, safety record, concurrency cap usage
- Financiers: eligibility tier, jurisdiction status, capital deployed, concentration

**Flows/actions:**
- View profile (read-only)
- Suspend / restrict / restore (with reason; CR-2)
- Export filtered list (CSV)
- Dispatch anomaly agent against a counterparty

**Gates:** Suspend writes audit + revokes active queue access. Restore requires second-admin co-sign for previously P0-suspended accounts.

**Components:**
- `CounterpartiesTabs` — Build status: stub
- `CounterpartyProfileDrawer` — Build status: stub

**Spec citations:** Scenario D §11, Scenario E §11, Scenario F §27 (data models).

---

## Per-Building Drill-Down (`cockpit/src/BuildingDetail.tsx`)

**Purpose:** single canonical view of one building/project across its lifecycle. All admin context (DRS, LBRS, energy, settlement, ops events, roof, pledges) reachable in one place.

**Header (persistent across tabs):** building name, address, jurisdiction, phase pill (initiated/DRS/funding/installation/LBRS/live/paused), DRS%, LBRS%, owner-on-call, last-event time, action menu (assign owner / page on-call / open in agent panel).

### Tab: Overview
- Hero: project status, owner, phase, key dates (initiated_at, installed_at, live_at)
- KPI strip: DRS%, LBRS%, active apartments, pledged kWh, capacity (kW), open alerts
- Recent ops events feed (last 20)
- Stakeholder commitments (provider / financier / electrician roster with status)
- **Components:** `BuildingOverviewHero`, `OpsEventsFeed` — Build status: stub
- **Spec citations:** Installation §11 (`DeploymentProject`); AI-native §3 (closed loop).

### Tab: Energy
- 24h / 7d / 30d toggle
- Stacked area: E_gen / E_sold / E_grid / E_waste
- Per-apartment heatmap
- Inverter / battery / Solar-DB telemetry strip
- Data-quality badge (per CR-5)
- **Components:** `EnergyTimeline`, `ApartmentHeatmap`, `TelemetryStrip` — Build status: stub
- **Spec citations:** Installation §2 (architecture), §11 (telemetry); AI-native §3.2 (inputs).

### Tab: Pledges
- Pledge ledger (resident, unit, KES, kWh, status, timestamp)
- Capacity-queue position grid (interested / pledged / capacity_review / capacity_cleared / queued / waitlisted / activated)
- Demand fit chart (pledged vs capacity plan)
- Conversion funnel
- **Components:** `PledgeLedger`, `CapacityQueueGrid` — Build status: stub
- **Spec citations:** Installation §3 (demand-proof gate); Scenario A §6 (capacity queue).

### Tab: DRS
- 9-gate component grid (owner-auth, stakeholders, site, capacity, demand, hardware, electrician-payment, contracts-compliance, regulatory; installation §3)
- Per-gate: status, evidence URI, reviewer, completed-at, blocker_type
- Score history sparkline
- "Open in DRS Queue" deep link
- **Components:** `DRSComponentGrid`, `DRSScoreSparkline` — Build status: stub
- **Spec citations:** Installation §3, §4, §11 (`DRSChecklistItem`).

### Tab: LBRS
- 10-test grid (as-built, safety, isolation, inverter/battery, ATS, meter-mapping, token-state, settlement-dry-run, activation-readiness, launch-packet)
- Per-apartment ATS test matrix
- Settlement dry-run output panel
- Evidence carousel
- "Open in LBRS Queue" deep link
- **Components:** `LBRSTestGrid`, `ATSTestMatrix`, `EvidenceCarousel` — Build status: stub
- **Spec citations:** Installation §8, §9, §11 (`LBRSChecklistItem`).

### Tab: Ops
- Open work orders (electrician dispatches, maintenance, incidents)
- Incident log with severity, owner, status, resolution
- Maintenance reserve balance + recent draws
- On-call rotation
- **Components:** `WorkOrderList`, `IncidentLog`, `MaintenanceReserveCard` — Build status: stub
- **Spec citations:** Scenario D §17 (maintenance), Scenario E §20 (live operations), AI-native §6.

### Tab: Settlement
- Per-billing-period waterfall (reserve / providers / financiers / owner royalty / e.mappa fee)
- Stakeholder payout register
- Solvency check strip (CR-5 invariants)
- Conservative-settle log
- Export statement
- **Components:** `WaterfallView` (shared), `PayoutRegister`, `ConservativeSettleLog` — Build status: stub
- **Spec citations:** AI-native §2.3, §5; installation §8 (settlement dry-run); Scenario B §6 (host royalty separation).

### Tab: Roof
- Polygon over satellite tile (Microsoft footprint base / owner-traced / manual-sqm fallback)
- Roof source + confidence badge
- Shading / obstruction notes
- Array layout overlay (post-DRS)
- As-built photos (post-installation)
- **Components:** `RoofPolygonViewer`, `ArrayLayoutOverlay`, `RoofEvidencePhotos` — Build status: stub
- **Spec citations:** Scenario B §3 (roof capture 3-tier), Scenario C §6 (homeowner roof), installation §3 (site inspection).

### Tab: Stakeholders (optional 9th)
- Owner profile, residents roster, electrician(s) of record, provider commitments, financier commitments — each linkable to Counterparties directory.
- **Spec citations:** Installation §11 (`StakeholderCommitment`).

---

## AI-Native Cockpit Surfaces

Per AI-native §4 (governance constitution) and §8 (system layers). All agent surfaces obey CR-2, CR-3, CR-4.

### Query Layer UI

**Purpose:** natural-language query interface against operational data — answers grounded in tool calls, returned with citations.

**Layout/states:** chat-style input (top); answer + evidence panel (centre); session history (right rail).

**Fields:**
- Query input
- Answer block: text answer + inline citations (link to source records, dashboards, audit entries)
- Tool-call trace (collapsible): which tools/queries were invoked, parameters, results
- Confidence score
- "Open in dashboard" deep link

**Flows/actions:**
- Submit query → agent runs → answer + citations + tool trace
- Drill into any citation
- "Save as report" / "Schedule recurring"
- "Convert to dashboard tile" → adds to Command

**Gates:** Read-only by default — cannot mutate state. Any "execute action" suggestion routes to the relevant Agent Panel for admin co-sign (CR-4). PII access respects CR-3.

**Components:**
- `QueryInput` — Build status: stub
- `AnswerWithCitations` — Build status: stub
- `ToolCallTrace` — Build status: stub

**Spec citations:** AI-native §3.3 (controller), §4 (reasoning style, output expectations), §8.2 (governance layer).

---

### Agent Panels

**Purpose:** dedicated surfaces for each named agent. Each panel: feed of agent-proposed actions + admin accept/reject queue + agent eval/health.

Five panels (per AI-native §4 + §8.2):

| Agent | Scope | Inputs | Outputs (admin-co-signed) |
| --- | --- | --- | --- |
| **DRS Agent** | Per-project DRS readiness | Evidence URIs, stakeholder commitments, BOM, capacity plan | Suggested gate status changes, blocker triage, recommended remediation owner |
| **Anomaly Agent** | Telemetry + settlement | Inverter data, meter readings, payout register | Flag unusual delivery, suspicious readings, conservative-settle trigger |
| **Reconciliation Agent** | Settlement integrity | E_gen, E_sold, payouts, prepaid inflows | Reconciliation reports, invariant-violation alerts, recommended holds |
| **Code-Review Agent** | Repo / deploys | PRs, changed files, test results | Risk-flagged diffs awaiting human review |
| **Security-Triage Agent** | Auth, RBAC, suspected exploit | Audit log, login patterns, permission changes | Suggested account suspensions, RBAC tightening, incident escalations |

**Per-panel layout/states:**
- Agent header: id, version, last-eval score, last-run, status (healthy / degraded / paused)
- Action queue: proposed actions with `confidence`, `evidence_uris[]`, `recommended_action`, `rationale`
- Accept / reject / modify form (reason required; writes audit)
- Recent autonomous actions (e.g., observability writes) with read-only audit

**Gates:** No agent can mutate without admin co-sign except the closed-loop economic engine writes governed by AI-native §3.4 (price / payout-ratio adjustment) — and those are surfaced read-only here with paused override available.

**Components:**
- `AgentPanelHeader` — Build status: stub
- `AgentActionQueue` — Build status: stub
- `AgentActionDecisionForm` — Build status: stub
- `AgentHealthCard` — Build status: stub

**Spec citations:** AI-native §3 (closed loop), §4 (governance), §6 (failure modes), §8.2 (governance layer).

---

### Audit Log Viewer

**Purpose:** every mutation + every agent action, queryable. AI-native §4 (audit), CR-2, CR-4.

**Layout/states:** filterable table (actor, action, target_entity, timestamp range, agent vs human, reason free-text search); detail drawer with `before` / `after` diff.

**Fields/columns:** timestamp, actor (admin_id or agent_id+version), action, target_entity (type + id), reason, jurisdiction, agent_attribution, evidence URIs.

**Flows/actions:**
- Filter / search
- Drill into entry → before/after diff
- Export filtered set (CSV / JSON) — itself audit-logged
- "Replay" (read-only re-render of decision context at time of action)

**Gates:** Append-only. No edit/delete of audit entries. Even admins cannot mutate the log. Read access scoped per RBAC.

**Components:**
- `AuditTable` — Build status: stub
- `AuditDiffDrawer` — Build status: stub

**Spec citations:** AI-native §4 (system constraints, output expectations), §8.2.

---

### Eval Harness UI

**Purpose:** per-agent eval results — drift, regression, calibration. AI-native §9 Phase 4 (AI integration / monitoring).

**Layout/states:** agent picker (left); eval suite results (centre): per-suite pass/fail, scorecards, regression deltas; trend charts (right).

**Fields:**
- Suite name, version, dataset, pass-rate, drift metric, false-positive / false-negative rates
- Latest run timestamp + diff vs previous
- Failing cases (drill into example + agent reasoning trace)

**Flows/actions:**
- Trigger eval run (writes audit)
- Promote agent version → production (gated on green eval + admin co-sign)
- Rollback agent version
- Pause agent

**Gates:** Promotion requires `agent:promote` claim + green eval + audit reason. Pause is immediate but writes audit + pages on-call.

**Components:**
- `AgentEvalPicker` — Build status: stub
- `EvalScorecardGrid` — Build status: stub
- `EvalRegressionChart` — Build status: stub

**Spec citations:** AI-native §3 (controller), §9 Phase 2 (simulation), Phase 4 (feedback loop).

---

### Permission / RBAC Console

**Purpose:** role-scoped + per-agent permissions. Enforce IA v2 §8.5 + CR-1/CR-7.

**Layout/states:** two views — Humans (admins) and Agents — each with role/scope assignments.

**Fields:**
- Humans: admin_id, email, roles[], queue scopes, jurisdiction scopes, severity ceiling, PII-view claim status, last login, MFA status, allowlist source (`EMAPPA_ADMIN_EMAILS`)
- Agents: agent_id, version, allowed tool surface, max-autonomous-action level, paused flag, eval status

**Flows/actions:**
- Grant / revoke role or claim (reason required; writes audit)
- Adjust agent scope (paused / shadow / co-sign / autonomous-bounded)
- Inspect effective permissions for any user/agent
- Bulk-rotate (e.g., revoke `pii:view` from all)

**Gates:**
- Admin grant requires email on `EMAPPA_ADMIN_EMAILS` allowlist (IA v2 §8.5 gate 3)
- Grant of `pii:view` / `settlement:hold` / `agent:promote` requires two-admin co-sign
- Cannot grant role "admin" via this console to an end-user account — the public role picker has no admin option (IA v2 §8.5 gate 1) and backend rejects role='admin' (gate 2)
- All RBAC changes audit-logged; nightly reconciliation against allowlist file

**Components:**
- `RBACUserTable` — Build status: stub
- `RBACAgentTable` — Build status: stub
- `PermissionGrantForm` — Build status: stub
- `EffectivePermissionInspector` — Build status: stub

**Spec citations:** IA v2 §8.5 (five gates); AI-native §4 (constraint enforcement), §8.2 (governance layer).

---

### Admin role visibility (security — preserved from IA v2 §8.5)

Admin must never appear as a selectable role to a member of the public. Five interlocking gates enforce this:

1. **Role-select UI** (mobile, website, onboarding) lists only the six public roles: Resident, Homeowner, Building Owner, Provider, Electrician, Financier. Admin is never an option.
2. **Backend rejection**: `POST /me/onboarding-complete` and `POST /me/select-role` return 403 if the body contains `role='admin'`.
3. **Seed allowlist**: `EMAPPA_ADMIN_EMAILS` env var; `backend/scripts/seed.py` and `grant_admin.py` refuse to promote outside the allowlist.
4. **JWT scope**: admin claim required for admin endpoints (`backend/app/middleware/jwt.py:require_admin`).
5. **Cockpit isolation**: cockpit App-level guard rejects non-admin sessions (`cockpit/src/App.tsx`).

---

## Cross-Cutting: Components Catalog

**Universal components (shared across roles):**

| Component | Used By | Status | Build Target |
|---|---|---|---|
| BuildingAvailabilityStatePill (A0–A6, 7 states) | Resident Home, Cockpit queue | Build | `mobile/components/resident/BuildingAvailabilityStatePill.tsx` + web mirror |
| CapacityQueueStatusPill (7 states) | Resident Home, Cockpit queue | Build | `mobile/components/resident/CapacityQueueStatusPill.tsx` + web mirror |
| PledgeBalanceCard | Resident Home/Wallet | Build | `mobile/components/resident/PledgeBalanceCard.tsx` |
| TokenBalanceHero (KES + kWh) | Resident Home, Homeowner Home (live) | Build | `mobile/components/shared/TokenBalanceHero.tsx` |
| ProjectHero (DRS + blockers + timeline) | Homeowner Home (pre-live), Building Owner Home | Build | `mobile/components/shared/ProjectHero.tsx` |
| DRSProgressCard | Building Owner Home, all projects | Build | `mobile/components/shared/DRSProgressCard.tsx` |
| LiveSupplyIndicator (ATS state, solar vs KPLC) | Resident Home (live), Building Owner Home (live) | Build | `mobile/components/shared/LiveSupplyIndicator.tsx` |
| LoadProfileConfidenceMeter (L1/L2/L3) | Resident Home, Resident Profile | Build | `mobile/components/resident/LoadProfileConfidenceMeter.tsx` |
| SystemHealthIndicator | Homeowner Home (live), Building Owner Home (live) | Build | `mobile/components/shared/SystemHealthIndicator.tsx` |
| EnergyTodayChart (24h stacked area, Tesla/Enphase style) | Resident Energy, Homeowner Energy, Building Owner Energy | Build | `mobile/components/shared/EnergyTodayChart.tsx` |
| GenerationPanel (share-gated) | Resident Energy, Homeowner Energy, Building Owner Energy, Provider Generation | Build | `mobile/components/shared/GenerationPanel.tsx` |
| OwnershipCard / OwnershipPositionCard | Resident Wallet, Homeowner Wallet, Building Owner Wallet | Build | `mobile/components/shared/OwnershipCard.tsx` |
| OwnershipRingChart (share split visual) | Homeowner Energy (if < 100%), Provider Energy | Build | `mobile/components/shared/OwnershipRingChart.tsx` |
| HostRoyaltyCard | Building Owner Wallet (pre-live education, live earned) | Build | `mobile/components/building-owner/HostRoyaltyCard.tsx` |
| DocumentUploadCard | Onboarding (all roles), Cockpit review queues | Build | `mobile/components/shared/DocumentUploadCard.tsx` |
| SyntheticBadge | Energy screens (pre-live) | Build | `mobile/components/shared/SyntheticBadge.tsx` |
| RoofMap (polygon on satellite) | Homeowner onboarding, Homeowner/Building Owner embedded routes | Build | `mobile/components/shared/RoofMap.tsx` |
| ProjectCard (Airbnb-style) | Discover screens (all), project listings | Build | `mobile/components/shared/ProjectCard.tsx` |
| PortfolioRow (Robinhood-style position) | Wallet screens (if applicable) | Build | `mobile/components/shared/PortfolioRow.tsx` |
| PilotBanner (non-binding pledge, no money charged, prepaid disclosure) | Resident Home, Homeowner Home, Building Owner Home | Build | `mobile/components/shared/PilotBanner.tsx` |
| TaskBoard (DRS / installation / LBRS) | Electrician Projects | Build | `mobile/components/electrician/TaskBoard.tsx` |
| SignoffGrid (task / workstream / safety / crew / ops signoff) | Electrician Projects, Cockpit LBRS review | Build | `mobile/components/electrician/SignoffGrid.tsx` |
| EvidenceGallery (photo thumbnails with metadata) | Electrician Projects, Cockpit evidence review | Build | `mobile/components/electrician/EvidenceGallery.tsx` |
| CameraCapture (offline-capable, checklist, serial scanning) | Electrician evidence upload | Build | `mobile/components/electrician/CameraCapture.tsx` |
| QuoteBuilder (line-item, delivery fee, VAT, validity) | Provider project detail, Supplier quote flow | Build | `mobile/components/provider/QuoteBuilder.tsx` |
| InventoryCatalog (SKU list, condition, price, warranty) | Provider Profile | Build | `mobile/components/provider/InventoryCatalog.tsx` |
| LaborCapitalClaimCard (labor value, pool %, expected payout, waterfall explanation) | Electrician Wallet, Financier Buyout | Build | `mobile/components/shared/LaborCapitalClaimCard.tsx` |
| PaybackTracker (principal recovered, remaining, projected period, velocity) | Financier Wallet | Build | `mobile/components/financier/PaybackTracker.tsx` |
| ProjectionScenarios (downside/base/upside, assumptions) | Financier Wallet, Financier Discover card | Build | `mobile/components/financier/ProjectionScenarios.tsx` |
| RiskAlertList | Financier Wallet, Financier Project Status | Build | `mobile/components/financier/RiskAlertList.tsx` |
| SettlementStatement (monthly breakdown, waterfall, claim share) | Financier Wallet, Building Owner Wallet | Build | `mobile/components/shared/SettlementStatement.tsx` |
| ComplianceStatusIndicator (verified / limited / restricted / documents needed) | Financier Profile, Cockpit admin profile | Build | `mobile/components/shared/ComplianceStatusIndicator.tsx` |
| EligibilityBadge (invest now / watch only / documents needed / limit reached / restricted) | Financier Discover card | Build | `mobile/components/financier/EligibilityBadge.tsx` |
| DataQualityBadge (verified / estimated / missing / disputed / conservative) | Energy screens (live), all settlement views | Build | `mobile/components/shared/DataQualityBadge.tsx` |

---

## Doctrine Enforcement at the IA Layer

Every universal rule from imported-specs README + scenario docs maps to UI enforcement:

- **Prepaid-only:** no UI surface ever shows "buy tokens" pre-activation (Scenario A §5, IA-U4). Tokens only purchasable post-ATS-verified.
- **Pay on monetized solar:** every payout view labels source as E_sold (not E_gen). Never show payout from generated-but-unsold solar (Scenario A §8.5, installation §5.1, Scenario F §15 doctrine).
- **No common-bus default:** UI never describes apartment supply as "shared bus" or "common injection"; always per-apartment ATS language (Scenario A §2, Scenario D §3, installation §2, Scenario E §4).
- **DRS gates deployment:** UI never offers an action to install before DRS = 100%. DRS blockers must be resolved first (Scenario A §3, Scenario D §15, Scenario F §9, installation §3).
- **LBRS gates go-live:** UI never offers go-live button before LBRS = 100%. LBRS failures must be remediated (Scenario D §18–19, installation §8–9, Scenario F §12).
- **Homeowner zeroing:** Wallet for homeowner never shows "host royalty" line item. Only consumption savings + external monetization (Scenario C §3, §7.3).
- **Electricians paid upfront default:** labor-as-capital flow requires explicit signed contract UI before it appears in payout math (Scenario D §22.1, installation §5, Scenario F §19).
- **Financier compliance-by-design:** Discover CTA disabled if KYC / eligibility / jurisdiction not satisfied (Scenario F §3, §5, §7, §26).
- **No guarantee language:** all projected returns use "ranges," never "you will earn" or guaranteed payback. Must show assumptions and downside cases (Scenario F §17, §25, Scenario E §17).
- **Share buy-down generation language:** when residents/owners buy provider shares, UI says "retained claim decreases," never "generation decreases" (Scenario E §15.1).
- **No hidden capacity shortage:** Resident Home always shows capacity status + queue position + blockers; never hides (Scenario A §6.2, §6.3).
- **No invisible waitlist:** if capacity full, UI explicitly says "Join capacity queue" with queue position and expansion eligibility (Scenario A §6.2).
- **No payout from unpaid usage:** settlement never credits any stakeholder from unpaid, uncollected, or unverified kWh (Scenario A §8.5, Scenario C §12, Scenario F §15, AI-native doctrine).
- **No ownership sale without valuation:** ownership marketplace always shows valuation basis + risk disclosure + no-guarantee copy (Scenario A §8.3, §8.6, Scenario C §11, Scenario E §21).
- **No energy trading promise before enabled:** "future trading" shown as roadmap only unless utility/regulatory rules and metering support it (Scenario A §9, §9.1).

---

## Onboarding Summary (All Roles)

| Role | Shared steps | Role-specific | Path | Gates |
|---|---|---|---|---|
| **Resident** | Welcome, email OTP, verify OTP, role select | Find building, load profile L1, capacity check, pledge/buy decision | `(onboard)/resident/` | Resident must enter building code or search by name + confirm unit number |
| **Homeowner** | Welcome, email OTP, verify OTP, role select | Address, authority verify, utility/meter context, load profile L1, site preview, readiness summary, deploy decision | `(onboard)/homeowner/` | Must verify property before initiating project; DRS starts on initiate click, not onboarding end |
| **Building Owner** | Welcome, email OTP, verify OTP, role select | Building location, ownership/authority verify, initial profile, roof capture (3-tier), terms preview | `(onboard)/building-owner/` | Must verify building before accessing DRS |
| **Provider** | Welcome, email OTP, verify OTP, role select | Role fork (panels / infra / both), account type, business or individual verify, inventory snapshot, compatibility pre-check, inventory earning model, training/standards, verification decision | `(onboard)/provider/` | Must pass compatibility pre-check; unknown/unsafe equipment flagged or rejected |
| **Electrician** | Welcome, email OTP, verify OTP, role select | Personal basics, identity, experience, credentials, background check, e.mappa certification training, practice test, certification decision | `(onboard)/electrician/` | Must complete all training + pass practice test (≥80%, 100% on safety/no-backfeed) to be certified |
| **Financier** | Welcome, email OTP, verify OTP, role select | Account type, identity/KYC/KYB, investor eligibility classification, risk profile/suitability, regulatory disclosures, jurisdiction gating, payment rail, investment limits, education, access decision | `(onboard)/financier/` | Must pass KYC/KYB + eligibility classification before investing; jurisdiction gated; risk profile enforces product access |

**Universal boundary:** Onboarding proves identity and role eligibility. DRS / LBRS / project-ops gates are separate, not inside onboarding.

---

## Reference Appendix

> Tables that operationalize the imported-specs. Cited from per-role sections above; built once here to avoid drift.

### A.1 Building Owner state machine (B0–B9) — Scenario B §4

| State | Name | Trigger | UI surface |
|---|---|---|---|
| B0 | Owner created | Owner account created; no verified building yet | BO Onboarding step 1 |
| B1 | Building submitted | Building info exists; ownership/authority review pending | BO Onboarding step 6 |
| B2 | Building verified, inactive | Owner is verified but has not initiated deployment | BO Home no-project empty |
| B3 | Project initiated / cooking | Owner clicked deploy; DRS is active | BO Home pre-live + DRS embedded |
| B4 | Deployment-ready | DRS = 100%; project may be scheduled for installation | BO Home pre-live + deployment-timeline |
| B5 | Installation in progress | Hardware installation and apartment connection work underway | BO Home pre-live + deployment-timeline |
| B6 | Installed, testing / LBRS | Installation is complete but building is not live yet | BO Home pre-live + LBRS embedded |
| B7 | Live building | LBRS = 100%; eligible apartments can use e.mappa via ATS | BO Home live + system health |
| B8 | Live with maintenance issue | Building live but one or more components are degraded | BO Home live + incident-detail |
| B9 | Suspended / paused | Critical safety, compliance, tamper, contract, or data issue | BO Home suspended banner — clear reason, remediation checklist, KPLC fallback remains available |

### A.2 Homeowner state machine (H0–H8) — Scenario C §5

| State | Name | Trigger | UI surface |
|---|---|---|---|
| H0 | Account created, property unknown | User has not yet tied account to a verified property | HO Onboarding step 1 |
| H1 | Property submitted, not verified | Homeowner claims site but ownership/authority is pending | HO Onboarding step 5 |
| H2 | Verified, no project initiated | Property is verified but no installation project is active | HO Home no-project empty |
| H3 | Project cooking / DRS | Project is being qualified for deployment | HO Home pre-live (ProjectHero) |
| H4 | Deployment-ready / installation scheduled | DRS is 100%; installation can proceed | HO Home pre-live + deployment-timeline |
| H5 | Installation in progress | Electricians are installing hardware | HO Home pre-live + deployment-timeline |
| H6 | Installed, not live / LBRS | Hardware is installed but tests are not complete | HO Home pre-live + LBRS embedded |
| H7 | Live and connected | Home is commissioned and can receive e.mappa supply | HO Home live (TokenBalanceHero) |
| H8 | Suspended / maintenance | System was live but is paused due to safety, data, payment, or maintenance issue | HO Home suspended banner |

### A.3 Provider state machine (E0–E10) — Scenario E §13

| State | Name | Trigger | UI surface |
|---|---|---|---|
| E0 | Not verified | Account registered, verification pending | Provider Onboarding |
| E1 | Verified no commitments | Verification decision = approved, no quotes yet | Provider Discover |
| E2 | Quote submitted | Quote submitted to a project | Provider Projects + quote-detail |
| E3 | Quote approved | Project accepted quote | Provider Projects + project-detail |
| E4 | Inventory reserved | SKUs allocated for the project | Provider Profile + InventoryCatalog |
| E5 | Committed to DRS | Provider locked into project's DRS gate | Provider Projects grouped by stage |
| E6 | Delivery / procurement | Goods en-route or being delivered | Provider Embedded delivery-tracker |
| E7 | Installed not live | Hardware on site, LBRS in progress | Provider Projects |
| E8 | Live asset | LBRS = 100, project generating monetized revenue | Provider Generation + Wallet |
| E9 | Maintenance / warranty | Warranty ticket open, or maintenance scheduled | Provider Embedded warranty-ticket |
| E10 | Completed / exited | Provider exited (sold all shares, contract end) | Provider Wallet history |

### A.4 DRS scoring weights — installation §3, §4

**8 components, weights sum to 100%.** Regulatory/compliance review is rolled into component 8 ("Contracts/compliance ready"), not a separate item. Critical-blocker rule: any critical component blocked → DRS cannot reach 100% regardless of other component scores (installation §4, §10).

| # | Component | Weight | Critical? | Spec |
|---|---|---|---|---|
| 1 | Owner authorization and access (title/lease/management agreement verified) | 10% | yes | installation §3, §4 |
| 2 | Stakeholder availability and vetting (provider + financier + electrician committed) | 15% | yes | installation §3, §4 |
| 3 | Site inspection complete (roof + DB + meter + cabling assessment) | 15% | yes | installation §3, §4 |
| 4 | Capacity plan approved (kW + BOM + apartment mapping) | 15% | yes | installation §3, §4 |
| 5 | Demand proof / pledges / load confidence (≥N residents pledged + capacity-fit) | 15% | yes (if demand below threshold) | installation §3, §4 |
| 6 | Hardware package and logistics ready (BOM finalized + provider quote accepted) | 15% | yes | installation §3, §4 |
| 7 | Electrician payment / labor-capital resolved (upfront / labor-as-capital / hybrid) | 10% | yes | installation §3, §4, §5 |
| 8 | Contracts/compliance ready (terms signed; regulatory review per jurisdiction) | 5% | yes | installation §3, §4 |

Display rule: cockpit DRS dashboard shows per-component score + critical-blocker count. UI never offers "install" until DRS = 100% AND zero critical-blocker count.

### A.5 LBRS scoring weights — installation §8, §9

**9 scoring categories** (Resident activation readiness + Owner launch packet are combined as one "Resident/owner launch readiness" 10% line in the spec scoring table §9, even though they appear as separate tests in §8). Weights sum to 100%. Critical-test rule: any critical test failed → LBRS cannot reach 100%. Solar-bus-isolation failure is non-overridable (installation §10).

| # | Test | Weight | Critical? | Spec |
|---|---|---|---|---|
| 1 | As-built / BOM verification (matches BOM + DRS plan) | 10% | yes | installation §8, §9 |
| 2 | Electrical safety (earthing, breaker sizing, insulation) | 20% | yes | installation §8, §9 |
| 3 | Solar bus isolation / no backfeed | 15% | yes (non-overridable) | installation §8, §9, §10 |
| 4 | Inverter + battery operation (commissioning + telemetry) | 10% | yes | installation §8, §9 |
| 5 | ATS switching per apartment (solar / KPLC fallback) | 15% | yes | installation §8, §9 |
| 6 | Per-apartment meter mapping + data reliability | 10% | yes | installation §8, §9 |
| 7 | Token-state switching simulation (pre-paid balance enforces supply) | 5% | yes | installation §8, §9 |
| 8 | Backend / settlement dry run (E_gen / E_sold / E_waste → correct waterfall) | 10% | yes | installation §8, §9 |
| 9 | Resident/owner launch readiness (per-apartment activation + owner sign-off + ops runbook) | 5% | operational gate | installation §8, §9 |

Display rule: cockpit LBRS dashboard shows per-test score + signoff + evidence URI. UI never offers "go-live" until LBRS = 100% AND zero critical-test failures.

### A.6 Hardware checklist — installation §7

Items grouped by subsystem, derived from the spec §7 lists. Provider BOM must enumerate each before DRS gate 6 (hardware package) can pass. Items not pre-defined here (e.g., panel brand specifics, conduit gauge) are filled in by provider per-project.

| # | Subsystem | Item | Spec source |
|---|---|---|---|
| 1 | Core system | Hybrid inverter (model, kW, MPPT count) | installation §7 |
| 2 | Core system | 48V battery (chemistry, kWh, BMS) | installation §7 |
| 3 | Core system | Provider panels (W, count, brand/model, warranty, MPPT-compatible strings) | installation §7 |
| 4 | Solar DB | IP65 enclosure | installation §7 |
| 5 | Solar DB | Main input breaker | installation §7 |
| 6 | Solar DB | Individual MCBs / breakers per circuit | installation §7 |
| 7 | Solar DB | Type 2 SPD (surge protection device, DC + AC sides) | installation §7 |
| 8 | Solar DB | Total solar output meter | installation §7 |
| 9 | Per-apartment switching | DIN rail ATS per apartment | installation §7 |
| 10 | Per-apartment switching | Per-apartment DIN rail energy meter (token-aware) OR CT-clamp metering | installation §7 |
| 11 | Per-apartment switching | Short Solar-DB-to-ATS cabling, per apartment | installation §7 |
| 12 | Cabling / mounting | PV DC cable (gauge, length) | installation §7 |
| 13 | Cabling / mounting | Inverter-to-Solar-DB AC cable | installation §7 |
| 14 | Cabling / mounting | PVC conduit + fittings | installation §7 |
| 15 | Cabling / mounting | Cable glands | installation §7 |
| 16 | Cabling / mounting | Earth bonding kit | installation §7 |
| 17 | Cabling / mounting | DC / AC connectors | installation §7 |
| 18 | Cabling / mounting | Panel mounting rails + brackets (roof-type appropriate) | installation §7 |
| 19 | Connectivity | 4G router (e.g. Safaricom MiFi) OR reliable WiFi / cellular gateway | installation §7 |
| 20 | Connectivity | Inverter monitoring dongle (WiFi / GPRS) | installation §7 |
| 21 | Documentation | Site photos | installation §7 |
| 22 | Documentation | Serial number registry (inverter, battery, panels, meters, ATS) | installation §7 |
| 23 | Documentation | Per-apartment meter mapping + apartment mapping | installation §7 |
| 24 | Documentation | Wiring diagram | installation §7 |
| 25 | Documentation | As-built drawings + electrician commissioning report | installation §7 |
| 26 | Documentation | Component labels (per-circuit, per-meter, per-ATS) | installation §7, §8 |

### A.7 Homeowner edge cases — Scenario C §15

7 cases drawn verbatim from spec §15. UI must surface a warning + recommended action for each. Cockpit anomaly agent (AI-native §6) generates the alert; HO sees it on Home or relevant embedded route.

| # | Case (spec §15) | Required behavior |
|---|---|---|
| 1 | Homeowner starts onboarding but does not own/control the property | Do not allow deployment; surface in onboarding step 5 (authority verification) and block initiate-project gate |
| 2 | Homeowner wants to buy tokens before system is live | Block token purchase pre-live; wallet shows "Tokens activate once your project goes live" |
| 3 | Homeowner wants system bigger than their load supports (oversizing) | Sizing explainer + warn about waste; require a credible external monetization path (net-metering / trading) before allowing oversize |
| 4 | Battery degrades | Increase maintenance/reserve visibility, update usable capacity, and adjust projected coverage; warranty-ticket prompt |
| 5 | Solar production drops unexpectedly | Flag component issue, weather/shading issue, monitoring issue, or degradation; system-health alert + diagnostic CTA |
| 6 | Grid fallback used heavily (KPLC dominant) | Explain whether cause is low solar, high demand, dead battery, token depletion, switching issue, or system fault |
| 7 | Net metering / export unavailable in jurisdiction | Do not project export earnings; wallet hides export line; onboarding flags it |
| 8 | Energy trading is not enabled in the area | Do not show trading income as available; ownership economics deferred copy in wallet |

### A.8 AI-native closed-loop economic engine — AI-native §3.1–3.4

Three-phase loop runs continuously per project; cockpit Query Layer + Agent Panels surface the state.

| Phase | What it does | Inputs | Outputs | Cockpit surface |
|---|---|---|---|---|
| **Measure** | Read telemetry + ledgers | Inverter, meters, payouts, prepaid inflows, queue position, load profiles | Snapshot facts (E_gen, E_sold, E_waste, balances, queue depth) | Settlement Monitor, BuildingDetail Energy tab |
| **Evaluate** | Compare against doctrine invariants + targets | Snapshot facts, AI-native §4 governance constitution, scenario doctrine | Variance flags (conservative-settle, anomaly, invariant violation), recommended actions | Alerts dashboard, Agent Panels (each agent flags own variance) |
| **Adjust** | Apply control variable changes (AI-native §3.4) | Recommended action + admin co-sign (CR-4) | Updated price, payout-ratio, energy-allocation priority, throttling rules | RBAC Console (claim scope), Audit Log Viewer (every change) |

**Control variables (§3.4):**
1. Energy price per kWh (per-project, can flex up/down within bounds)
2. Payout distribution ratios (provider α, financier β, owner royalty γ, e.mappa fee — sum = 100%, bounded)
3. Energy allocation priority (solar-first to pledged residents, fallback to grid, surplus to trading if enabled)
4. Consumption throttling (per-apartment cap if prepaid balance < threshold)

Each change requires admin co-sign except autonomous bounded adjustments per AI-native §3.4 (those are logged for review, never silent).

### A.9 Provider quote states — Scenario E §7.1

9 states per spec §7.1 Quote States.

| State | Meaning | Allowed transitions |
|---|---|---|
| draft | Provider building quote | → submitted, → discarded |
| submitted | Sent to project, awaiting initial check | → under review, → expired/cancelled |
| under review | Project reviewing quote (compliance / fit / negotiation) | → approved, → expired/cancelled |
| approved | Quote is approved for project consideration | → reserved |
| reserved | Stock is held for project until deadline | → committed, → expired/cancelled (if deposit timeout) |
| committed | Deposit received, asset commitment helps fill hardware/provider readiness | → delivered |
| delivered | Equipment shipped, delivered, or handed to electrician | → installed/activated |
| installed/activated | Asset installed (LBRS pending → live once §A.3 E8 reached) | terminal for quote (asset advances per E8/E9/E10) |
| expired/cancelled | Quote validity period passed, deposit timeout, or rejected | terminal |

UI: `cockpit/src/components/queues/QuoteStateColumn.tsx` renders the state pill in Provider Verification queue and on Provider's own quote-builder.

---

## Change Log

- **2026-05-16 (v3.2)** — Corrected Reference Appendix against verbatim re-read of imported-specs (cells were partly invented in v3.1): A.1 BO state machine triggers (B0/B5/B9), A.2 HO state machine triggers (H0/H5/H8), A.4 DRS now 8 components (regulatory rolled into #8 per spec, not separate 9th), A.5 LBRS test 2 weight 20% not 15% + tests 9/10 combined as single 10% line per spec scoring table, A.6 hardware checklist rewritten from 18 invented items to 26 spec-derived items (Type 2 SPD, total solar output meter, DIN rail spec, CT metering, glands, earth bonding, MCBs, labels added; combiner box + standalone charge controller removed), A.7 edge cases rewritten from 11 (4 invented, 1 wrong) to 8 verbatim from spec §15 rows, A.9 quote states added "Under review" + merged expired+rejected into single "Expired/cancelled" per spec §7.1. A.3, A.8, all 9 spec citations verified correct. TokenHero refs across spec body updated to canonical TokenBalanceHero. Cross-doc task-ID refs (428 BUILD_PLAN + 21 cross-doc) verified 100% resolvable.
- **2026-05-16 (v3.1)** — Added Reference Appendix per imported-specs coverage audit: A.1–A.9 (initial draft, corrected in v3.2).
- **2026-05-16 (v3.0)** — Full rewrite to definitive screen inventory, sourced entirely from imported-specs (scenarios A–F, installation/DRS/LBRS, AI-native). Every public-role screen, state, field, flow, gate, component cited. Admin/Cockpit section fully enumerated: 3 mobile tabs (read-only), 9 universal Cockpit rules (CR-1..CR-9), 4 operational dashboards (Command, Stress Test, Settlement Monitor, Alerts), 7 ops decision queues (DRS, LBRS, Provider Verification, Electrician Certification, Financier Eligibility, Doc Review, Counterparties), per-building drill-down (8+1 tabs), 5 AI-native cockpit surfaces (Query Layer, Agent Panels, Audit Log Viewer, Eval Harness, RBAC Console). §8.5 admin-role-visibility gates preserved. Replaces IA_SPEC.md v2 as single source of truth for build phase.
- **2026-04-XX (v2.0)** — Initial IA spec (frozen at sprint start).
- *Pre-history*

---

**END OF IA SPEC — DEFINITIVE SCREEN INVENTORY**

This document is now the authoritative reference for all frontend surfaces (mobile, web, cockpit). Each role, each screen, each state, each flow, and each gate is mapped to imported-spec sections. Build against this spec; any deviation requires spec amendment + team review.
