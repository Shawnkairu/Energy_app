# Information Architecture Spec

Canonical screen layout and navigation for the e.mappa pilot. **Frozen at sprint start. Mobile and website portals must mirror this exactly.**

## Universal rules

1. **Max 5 tab-bar screens per stakeholder.** No exceptions. Anything beyond is embedded (push from a card or row).
2. **Profile is always the rightmost tab.** Across every role.
3. **Wallet exists for every role that touches money** (everyone except admin-mobile).
4. **First tab varies by role intent**:
   - **Ecosystem contributors** (Provider, Electrician, Financier) → first tab is **Discover Projects** (Airbnb-style)
   - **Building Owner** → first tab is **Home** (start/track project)
   - **Resident** → first tab is **Home** (token balance + pledge CTA)
5. **No non-working buttons.** Every interactive element has a real handler — push to a real route, open a real modal, or fire a real API call.
6. **No mock data anywhere.** Every metric is real or shows `—` with a synthetic-source badge.
7. **Settings, support, and (for electricians) compliance live embedded in Profile** — not as separate tabs.
8. **Profile screen always contains**: account info, settings section, support section, logout. Electrician profile additionally contains compliance section header that links to the Compliance tab.
9. **Generation visibility is gated by share ownership**, applied identically across resident, owner, and provider roles: a Generation panel only appears in their Energy/Generation screen if they hold shares ≥ 0% of any array tied to that role's scope. Empty state is shown when shares = 0, not the screen hidden.
10. **Mobile and website portals must show the same screens, the same data, in the same order.** Nothing is mobile-only or web-only.

---

## Stakeholder navigation matrix

| Role | 1st | 2nd | 3rd | 4th | 5th | Total |
|---|---|---|---|---|---|---|
| **Resident** | Home (Tokens) | Energy | Wallet | Profile | — | 4 |
| **Homeowner** | Home (Adaptive) | Energy | Wallet | Profile | — | 4 |
| **Building Owner** | Home (Project) | Energy | Wallet | Profile | — | 4 |
| **Provider** (panels + infra merged) | Discover | Inventory | Generation | Wallet | Profile | 5 |
| **Electrician** | Discover | Jobs | Wallet | Compliance | Profile | 5 |
| **Financier** | Discover | Portfolio | Wallet | Profile | — | 4 |
| **Admin (mobile)** | Alerts | Projects | Profile | — | — | 3 |

> **Homeowner = single-family-home owner who is also the sole resident.** Their building has `kind='single_family'` and `unit_count=1`. They combine the building_owner project lifecycle (list, capture roof, watch DRS, approve terms) with the resident token/consumption flow (pledge tokens, see usage, optionally buy shares). Their Home tab adapts: pre-live shows project readiness as the hero; post-live shows token balance as the hero. The other always appears as a secondary card.

Cockpit (web) is not bound by the 5-screen rule — it's an internal ops surface, not a stakeholder app.

---

## 1. Resident (4 screens)

### 1.1 Home — "Tokens"
**Purpose:** at-a-glance token balance + the most-used action (pledge more).

**Layout (top to bottom):**
- Pilot banner: *"Pledges are non-binding and no money is charged."*
- Big number: pledged token balance in KES
- Below: solar coverage forecast for today (kWh from synthetic data)
- Primary CTA: **[Pledge tokens]** → opens pledge modal/screen
- Recent pledge activity (3 most recent rows, with status pill)
- Footer link: "View all pledges →" → embedded pledge history view

**Embedded screens** (push, not tab):
- Pledge entry (amount + presets + projected coverage)
- Pledge history (full list)

### 1.2 Energy — Tesla/Enphase-inspired
**Purpose:** make the resident understand where their power came from today.

**Layout:**
- 24-hour stacked area chart: solar (in proportion to their share) / battery / grid fallback
- Synthetic-data badge top-right of chart
- Today summary: kWh consumed, kWh from solar, KES saved vs grid-only
- **Generation panel — only renders if resident owns ≥ 1 share of any array on their building**
  - Today's generation kWh (proportional to their share)
  - 30-day generation history sparkline
  - Empty state if zero shares: copy + CTA "Buy a share to see live generation"

**Embedded screens:**
- 30-day usage detail
- Allocation breakdown explainer (solar-first → battery → grid)

### 1.3 Wallet
**Purpose:** track money and ownership in one place.

**Layout:**
- Three-card top row: Pledged total, Earnings (from shares — 0 if none), Net savings vs grid
- Cashflow tab: chronological list of pledge debits + share earnings credits
- Ownership tab: shares held per array, current value, transfer history
- Empty-state when no ownership: CTA to ownership marketplace (embedded screen)

**Embedded screens:**
- Ownership marketplace (browse buyable shares)
- Per-asset ownership detail
- Transfer history

### 1.4 Profile
**Purpose:** account + settings + support + logout.

**Sections:**
- Account: email, phone (optional), role, building membership
- **Settings** (embedded section): notifications, units (KES/USD), language
- **Support** (embedded section): help articles, "Contact support" → opens email or in-app chat
- Logout

---

## 1.5 Homeowner (4 screens)

A homeowner is a single-family-home owner who is also the sole resident of their own building. They combine building_owner project lifecycle with resident token/consumption flow. Backed by `users.role = 'homeowner'` AND `buildings.kind = 'single_family'` AND `buildings.unit_count = 1`. The seed user `homeowner@emappa.test` exercises this path.

**Why a separate role and not a building_owner with a flag:** UX clarity. A homeowner's day-1 mental model is "I'm getting solar on my house," not "I'm a landlord." Distinct role, but the implementation reuses screen components from resident and building_owner via shared lego pieces (`TokenHero`, `ProjectHero`, `EnergyScreen`, `WalletSegments`).

### 1.5.1 Home — Adaptive
**Purpose:** show what matters most given the project's lifecycle stage.

**Layout (adaptive by `building.stage`):**

- **Pre-live** (`stage in ('listed','qualifying','funding','installing')`):
  - PilotBanner
  - **Hero: ProjectHero** — DRS card, decision pill, deployment progress bar, top 3 blockers
  - **Secondary card: TokenHero** — disabled with copy *"Tokens activate once your project goes live."*
  - Action rail: View blockers / Approve terms / Compare bill / Deployment timeline / Roof detail

- **Live** (`stage='live'`):
  - PilotBanner
  - **Hero: TokenHero** — pledged token balance, big number, [Pledge tokens] CTA, today's solar coverage
  - **Secondary card: ProjectHero** — collapsed view of DRS + system uptime + deployment retrospective
  - Action rail: Pledge / View energy / Wallet detail / Roof detail

**Embedded screens** (push, not tab):
- Pledge entry / pledge history
- DRS detail
- Deployment timeline
- Terms approval
- Compare bill
- Roof polygon detail (renders the polygon over satellite tile)

### 1.5.2 Energy
**Purpose:** show usage and generation. Homeowner always sees generation since they own the rooftop unconditionally.

**Layout:**
- 24h stacked area chart: solar / battery / grid (homeowner is sole consumer, so this is just their household consumption)
- Synthetic-data badge top-right
- Today summary: kWh consumed, kWh from solar, KES saved vs grid
- **Generation panel — always visible for homeowner.** Today's array generation, 30-day history sparkline, share % they retain (often 100% for fresh deployments)
- If shares < 100% (i.e., they've sold some to financiers/providers): show the share split as a small ring chart

### 1.5.3 Wallet
**Purpose:** consolidate the homeowner's three cashflow streams.

**Layout:**
- Three cards top: Pledged total / Royalties earned (as building owner) / Share earnings (if they retain shares of monetized solar)
- Segmented control: Cashflow / Ownership / Pledges
  - Cashflow: chronological transactions (pledges out, royalties in, share earnings in)
  - Ownership: shares of own-array, optional marketplace to buy back any sold shares
  - Pledges: history of pledges with status pills

**Embedded screens:**
- Buy-back marketplace (if shares < 100%)
- Asset detail
- Transfer history

### 1.5.4 Profile
- Account: email, phone (optional), role pill ("Homeowner")
- **Building & roof profile** (embedded section): address, polygon thumbnail, roof source/confidence, [Edit roof] CTA
- **Settings** (embedded section): notifications, units, language
- **Support** (embedded section): help articles, contact support
- Logout

---

## 2. Building Owner (4 screens)

### 2.1 Home — "Project"
**Purpose:** see the building's current state of play.

**Layout:**
- If no building yet: **[Start project]** giant CTA → onboarding flow
- If building exists:
  - Building name + address + roof polygon thumbnail
  - DRS score card with decision pill (approve/review/block)
  - Top 3 blockers (list)
  - Deployment progress bar (qualifying → funding → installing → live)
  - Pledged demand (sum of resident pledges)
  - Action rail: [View blockers] [Compare to today's bill] [Resident roster] [Approve terms]

**Embedded screens** (push from action rail):
- DRS detail with all 6 components + history chart
- Comparison: current grid bill vs projected with e.mappa
- Resident roster (list of pledgers)
- Terms approval flow
- Deployment timeline detail

### 2.2 Energy
**Purpose:** how much was generated, how much was used.

**Layout:**
- 24-hour generation curve (sum across arrays on this building)
- Synthetic badge
- Daily/30-day toggle
- Aggregate building usage curve
- KPI cards: today's generation, today's usage, today's revenue (from sold-solar)
- **Note:** owner always sees generation since they own the rooftop. Even if they didn't fund the panels, the rooftop produces — they have read access.

### 2.3 Wallet
**Purpose:** royalties earned + cashflow.

**Layout:**
- Royalties balance card
- Payout history list
- Projected next-month royalty (from projector against pledged demand)
- (No pledge debits for owner — they don't pledge as residents.)

### 2.4 Profile
- Account, **Settings (embedded)**, **Support (embedded)**, logout
- Building profile section: name, address, units, roof source/confidence

---

## 3. Provider (panels + infra merged into one role) (5 screens)

User chose the merge. Inside the provider app, segments differentiate panels vs infrastructure vs both. Stored as `business_type` on the user's provider profile.

### 3.1 Discover
**Purpose:** find projects to supply equipment / panels to.

**Layout (Airbnb-inspired):**
- Filter bar: stage, region, equipment type needed, deal size
- Vertical scroll feed of project cards
- Project card: building photo (rooftop hero), name, location, DRS pill, "Needs: 12 panels + inverter + DB", potential equipment value KES
- Tap card → embedded project detail
- Empty state if no matching projects

**Embedded screens:**
- Project detail: full DRS breakdown, BOM ask, pledge trajectory, "Submit quote" CTA
- Quote submission flow

### 3.2 Inventory
**Purpose:** track stock, fulfillment, reliability.

**Layout (segmented control inside):**
- Top toggle: **All / Panels / Infrastructure**
- SKU list with stock count, reliability score, recent orders
- Add SKU FAB
- Bottom strip: open quote requests count, pending orders count

**Embedded screens:**
- SKU detail
- Order detail (PO, fulfillment, tracking)
- Quote request detail
- Reliability history with proof gaps

### 3.3 Generation — share-gated
**Purpose:** see live performance of arrays they retain shares of.

**Layout:**
- If shares ≥ 1 across any array: list of arrays with current shares % and today's kWh
- Tap array → detail with hourly generation, monetized vs wasted, payout share
- If shares = 0: empty state + "When residents buy your shares, you receive payouts but lose live generation visibility."

### 3.4 Wallet
- Earnings split into two streams: equipment sales (one-shot) and share royalties (recurring)
- Cashflow list
- Projected next-month royalty

### 3.5 Profile
- Account, business profile (panels / infra / both), **Settings**, **Support**, logout

---

## 4. Electrician (5 screens)

User chose the rename from "installer". Role enum becomes `electrician`. Folder: `mobile/app/(electrician)/`.

### 4.1 Discover
**Purpose:** find projects to take on.

**Layout:**
- Filter: region, scope (install / inspection / maintenance), pay band
- Project cards: building photo, location, scope, pay estimate, deadline
- Tap → embedded project detail with checklist preview
- Accept job → moves to Jobs tab

### 4.2 Jobs
**Purpose:** active and historical jobs.

**Layout:**
- Tabs (segmented): Active / Completed / Maintenance
- Job cards with status pill, next checklist item, deadline
- Tap → embedded job detail with full checklist, photo upload, readings entry, sign-off

**Embedded screens:**
- Job detail with checklist
- Checklist item with photo capture
- Maintenance ticket detail
- Sign-off flow

### 4.3 Wallet
- Job earnings, payout history, projected pipeline

### 4.4 Compliance
**Purpose:** certifications + training. (Given its own tab because electricians spend real time here.)

**Layout:**
- Active certifications: name, issuer, expiry, status pill (valid / expiring / expired)
- Training courses: enrolled, completed, available
- Upload new doc CTA
- Expiry alerts at top

**Embedded screens:**
- Certification upload
- Course detail / enrolment

### 4.5 Profile
- Account, **Settings**, **Support**, link to Compliance tab, logout

---

## 5. Financier (4 screens)

### 5.1 Discover — Airbnb-inspired
- Filter bar: deal size, projected return, region, stage
- Vertical scroll feed of project cards (building photo hero)
- Card shows DRS pill, capital ask, current capital pledged, projected IRR
- Tap → embedded deal-room

**Embedded screens:**
- Deal room: full DRS breakdown, deal terms, milestone gates, "Pledge capital" CTA
- Pledge capital flow

### 5.2 Portfolio — Robinhood-inspired
- Top: total deployed, total returns, compounding curve
- Position list: per-deal investment, current value, payout YTD, IRR
- Tap position → deal detail (same component as deal room, "your view")

### 5.3 Wallet
- Cash available, cash deployed, returns received
- Cashflow list (deployments out, returns in)

### 5.4 Profile
- Account, investor profile (institution / individual, target deal size, target return), **Settings**, **Support**, logout

---

## 6. Admin (mobile) (3 screens)

Mobile admin is intentionally minimal — full admin runs in cockpit.

### 6.1 Alerts
- High-priority operational alerts feed
- Tap → embedded alert detail

### 6.2 Projects
- Read-only portfolio scan
- Tap project → embedded project detail (mobile read-only equivalent of cockpit drilldown)

### 6.3 Profile
- Account, **Settings**, **Support**, logout

---

## 7. Onboarding flows (per role)

After email-OTP verification, if a user has no role-specific profile complete, they enter their role's onboarding flow before reaching the tab bar.

### 7.0 Shared steps (all roles)
1. **Welcome** — brand splash, "Get started" CTA
2. **Email** — input email, request OTP
3. **Verify** — 6-digit OTP
4. **Role pick** — only shown if account has no role yet (most pilot users will be pre-assigned)

### 7.1 Resident
5. **Building code / QR** — enter or scan invite code
6. **Confirm building** — show building name + address + photo, "This is my building"
7. **First pledge (optional)** — "Pledge tokens now or later" — can skip
8. → Home

### 7.1.5 Homeowner
5. **Address** — single input; geocode on blur. unit_count=1 and kind='single_family' are auto-set.
6. **Roof capture** — same three-tier waterfall as building owner:
   1. Auto-suggest from Microsoft footprints
   2. Owner-traced polygon on satellite tile
   3. Manual sqm entry
7. **Terms preview** — homeowner-specific royalty + ownership terms (read-only)
8. **First pledge (optional)** — same component as resident first-pledge; can skip
9. → Home (adaptive, will show project hero pre-live)

### 7.2 Building Owner
5. **Building basics** — name, address (auto-geocode), unit count, occupancy estimate
6. **Roof capture** — three-tier waterfall:
   - Auto-suggest from Microsoft footprints; "Looks right" / "Let me redraw" / "Type sqm"
   - Owner-traced polygon on satellite tile
   - Manual sqm entry fallback
7. **Confirm terms preview** — read summary of owner royalty model
8. → Home

### 7.3 Provider
5. **Business basics** — business name, contact, business type (panels / infrastructure / both)
6. **Initial inventory snapshot (optional)** — add a few SKUs or skip
7. → Discover

### 7.4 Electrician
5. **Personal basics** — name, region of operation, scope (install / inspection / maintenance)
6. **Certification upload (optional)** — upload current certs or "Add later"
7. → Discover

### 7.5 Financier
5. **Investor profile** — institution or individual, target deal size, target return profile
8. → Discover

Onboarding lives in `mobile/app/(onboard)/[role]/...` as a separate Expo Router stack. After completion, replace the navigation stack with the role's tab layout.

---

## 8. Embedded vs tab decision rules

A screen goes in the tab bar if:
- The user returns to it ≥ once per session, OR
- It's the canonical entry point for a primary user goal

A screen is embedded (push from a tab) if:
- It's a detail of something visible in a tab
- It's a one-time or rare flow (terms approval, transfer)
- It's a setting or support page

If two screens have nearly-identical purposes, **merge them**. Examples we are merging:
- Resident `ownership.tsx` → folded into Wallet tab
- Resident `support.tsx` → folded into Profile tab
- Owner `drs.tsx`, `deployment.tsx`, `resident-roster.tsx`, `approve-terms.tsx`, `compare-today.tsx` → all push from Home action rail
- Provider `assets.tsx` + `shares.tsx` → both become Generation tab
- Provider/Supplier roles → merged into single Provider role with `business_type` field
- Electrician (formerly Installer) `checklist.tsx` + `maintenance.tsx` + `job-detail.tsx` → merged into Jobs tab
- Financier `home.tsx` + `deals.tsx` → merged into Discover tab; `deal-detail.tsx` becomes embedded

---

## 8.5 Admin role visibility (security)

Admin must never appear as a selectable role to a member of the public. Five interlocking gates enforce this:

1. **Role-select UI** (mobile, website, onboarding) lists only the five public roles: Resident, Building Owner, Provider, Electrician, Financier. Admin is never an option.
2. **Backend rejection**: `POST /me/onboarding-complete` returns 403 if the body contains `role='admin'`. The role field on the request is ignored if not in the public allowlist.
3. **Provisioning**: admin role can only be assigned via `backend/scripts/seed.py` (dev) or `backend/scripts/grant_admin.py <email>` (operator-run CLI). Both validate the target email against `ADMIN_EMAILS` env var before granting.
4. **Mobile admin tabs** (`mobile/app/(admin)/_layout.tsx`) render only when the authenticated user already has `role='admin'`. There is no UI path that creates an admin.
5. **Cockpit login** (`cockpit/src/...`) rejects non-admin users post-OTP with an "admins only" message. Cockpit is the primary admin surface; mobile admin is read-only.

Marketing site copy never mentions admin. The result: a member of the public who downloads the app, signs up, and walks through onboarding sees only the five contributor/consumer roles.

## 9. Website portal mirroring

Every stakeholder portal on the website MUST present the same screens as mobile in the same order, using the same data sources via `@emappa/api-client`. The website is responsive, so the tab bar becomes a left rail on desktop and a bottom bar on mobile-web. Portals live in `website/src/screens/stakeholders/{role}/{tab}.tsx` with a layout that matches mobile's `_layout.tsx`.

A user logging in as `resident@emappa.test` on the website sees: Home, Energy, Wallet, Profile — same content, same order, same data.

The website may add **clearly-marked web-only depth** (e.g., a wider analytics view in the financier portfolio, a side-by-side comparison in the owner home), but every screen the mobile app has must exist on the website.

---

## 10. File-level deletion + rename map (for Cursor)

### Delete (folders/files no longer in use)
```
mobile/app/(supplier)/                    — entire folder (role merged into provider)
mobile/app/(resident)/ownership.tsx       — folded into wallet.tsx
mobile/app/(resident)/support.tsx         — folded into profile.tsx
mobile/app/(owner)/drs.tsx                — embedded; remove tab; keep route as embedded screen at (building-owner)/_embedded/drs.tsx
mobile/app/(owner)/deployment.tsx         — embedded; same treatment
mobile/app/(owner)/resident-roster.tsx    — embedded; same treatment
mobile/app/(owner)/approve-terms.tsx      — embedded; same treatment
mobile/app/(owner)/compare-today.tsx      — embedded; same treatment
mobile/app/(owner)/list-building.tsx      — moved to (onboard)/building-owner/list-building.tsx
mobile/app/(owner)/                       — entire folder renamed to (building-owner)/
mobile/app/(provider)/shares.tsx          — folded into generation.tsx
mobile/app/(provider)/assets.tsx          — folded into generation.tsx
mobile/app/(financier)/deal-detail.tsx    — embedded; same treatment
mobile/app/(financier)/deals.tsx          — folded into discover.tsx (renamed from home.tsx)
```

### Rename
```
mobile/app/(installer)/  →  mobile/app/(electrician)/
mobile/app/(installer)/home.tsx           →  (electrician)/discover.tsx
mobile/app/(installer)/checklist.tsx      →  (electrician)/jobs.tsx (also absorbs maintenance + job-detail)
mobile/app/(installer)/certification.tsx  →  (electrician)/compliance.tsx
mobile/app/(installer)/maintenance.tsx    →  embedded inside (electrician)/jobs.tsx
mobile/app/(installer)/job-detail.tsx     →  embedded
mobile/app/(provider)/home.tsx            →  (provider)/discover.tsx
mobile/app/(provider)/earnings.tsx        →  (provider)/wallet.tsx
mobile/app/(provider)/catalog.tsx         →  (provider)/inventory.tsx (with quote-requests + orders + reliability merged in)
mobile/app/(financier)/home.tsx           →  (financier)/discover.tsx
mobile/app/(financier)/portfolio.tsx      →  unchanged (portfolio.tsx)
mobile/app/(financier)/profile.tsx        →  unchanged
mobile/app/(owner)/                       →  mobile/app/(building-owner)/    (folder rename)
mobile/app/(building-owner)/earnings.tsx  →  (building-owner)/wallet.tsx
```

### New (must be created)
```
mobile/app/(resident)/wallet.tsx          — new (replacing ownership)
mobile/app/(resident)/energy.tsx          — was deleted; rebuild
mobile/app/(homeowner)/                   — entire folder is new
mobile/app/(homeowner)/_layout.tsx        — 4-tab layout
mobile/app/(homeowner)/home.tsx           — adaptive (TokenHero + ProjectHero composition)
mobile/app/(homeowner)/energy.tsx         — usage + always-on generation
mobile/app/(homeowner)/wallet.tsx         — three-stream wallet
mobile/app/(homeowner)/profile.tsx        — building/roof profile + account
mobile/app/(homeowner)/_embedded/         — DRS detail, deployment, roof, marketplace, etc.
mobile/app/(provider)/inventory.tsx       — new merged file
mobile/app/(provider)/generation.tsx      — new merged file
mobile/app/(provider)/wallet.tsx          — new
mobile/app/(electrician)/wallet.tsx       — new
mobile/app/(electrician)/profile.tsx      — new
mobile/app/(financier)/wallet.tsx         — new
mobile/app/(building-owner)/profile.tsx   — new
mobile/app/(onboard)/_layout.tsx
mobile/app/(onboard)/welcome.tsx
mobile/app/(onboard)/role-select.tsx      — moved from (auth)
mobile/app/(onboard)/resident/join.tsx
mobile/app/(onboard)/homeowner/address.tsx
mobile/app/(onboard)/homeowner/roof-capture.tsx
mobile/app/(onboard)/homeowner/terms.tsx
mobile/app/(onboard)/homeowner/first-pledge.tsx
mobile/app/(onboard)/building-owner/list-building.tsx
mobile/app/(onboard)/building-owner/roof-capture.tsx
mobile/app/(onboard)/provider/business.tsx
mobile/app/(onboard)/electrician/basics.tsx
mobile/app/(onboard)/financier/profile.tsx
mobile/components/PilotBanner.tsx
mobile/components/SyntheticBadge.tsx
mobile/components/RoofMap.tsx
mobile/components/ProjectCard.tsx         — Airbnb-style card used by Discover screens
mobile/components/PortfolioRow.tsx        — Robinhood-style position row
mobile/components/EnergyTodayChart.tsx    — Tesla/Enphase style 24h chart
mobile/components/TokenHero.tsx           — pledged token balance hero (used by resident + homeowner)
mobile/components/ProjectHero.tsx         — DRS + blockers + deployment hero (used by building_owner + homeowner)
mobile/lib/geo.ts
mobile/lib/useApiData.ts
mobile/lib/api.ts                         — token-injecting api wrapper
mobile/components/AuthContext.tsx
```
