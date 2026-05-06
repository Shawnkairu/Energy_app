# Cursor — Mobile sprint prompt (Day 1, branch: `sprint/mobile`)

You are Cursor working on the e.mappa monorepo. Your single mission: rebuild the mobile app to match [docs/IA_SPEC.md](../IA_SPEC.md) exactly — six roles, max 5 tabs each, zero redundancy, zero dead buttons, zero mock data, real onboarding flows, working email-OTP login, working pledge flow, working roof capture.

You work **in parallel** with two other agents (Claude Code on backend/shared, Codex on cockpit/website/infra). The contract is at [docs/SPRINT_CONTRACT.md](../SPRINT_CONTRACT.md). The IA is at [docs/IA_SPEC.md](../IA_SPEC.md). **Read both completely before writing anything.**

---

## Setup (do this first, exactly)

```bash
cd /Users/shawnkairu/emappa
git fetch origin
git checkout main
git pull
git checkout -b sprint/mobile
```

**Do not push.** Coordinator (Claude Code) merges all branches locally at sprint end. You commit liberally to `sprint/mobile`; you never run `git push`.

Required reading before any code:
- `docs/SPRINT_CONTRACT.md` — types, endpoints, schema. Frozen.
- `docs/IA_SPEC.md` — screen-by-screen IA. Frozen.
- `docs/PILOT_SCOPE.md` — pilot rules: email OTP, pledge mode, synthetic data
- Current state: `mobile/app/_layout.tsx`, `mobile/app/(auth)/*`, every `mobile/app/(*)/_layout.tsx`
- `packages/api-client/src/index.ts` — Claude Code is updating this in parallel; assume it will match the contract by merge time

---

## Boundary rules (HARD)

- You may write inside `mobile/**` only.
- Do **not** edit `packages/**`, `backend/**`, `cockpit/**`, `website/**`, or any doc.
- If you find a missing api-client export, **stop and message the coordinator** — do not edit api-client yourself.
- All API calls must go through the token-injecting wrapper at `mobile/lib/api.ts` (you create it).
- **No mock data anywhere** in your final commit. Loading state → `useApiData` skeleton. Empty state → real empty-state copy. Error state → real error message. If the API is down, fail visibly with a retry button.
- **No `console.log`-only handlers**, no `Alert.alert("Coming soon")` placeholders, no `null` `onPress`. Every interactive element does something real or doesn't render.
- Branch is `sprint/mobile`. Do not rebase from any other branch during the sprint.

---

## File-level cleanup (do this BEFORE the subagents start)

Per [IA_SPEC.md §10](../IA_SPEC.md), execute the following in this exact order:

```bash
# 1. Delete obsolete role folder
git rm -r mobile/app/\(supplier\)/

# 2. Rename installer → electrician (folder + files)
git mv mobile/app/\(installer\) mobile/app/\(electrician\)
git mv mobile/app/\(electrician\)/home.tsx mobile/app/\(electrician\)/discover.tsx
git mv mobile/app/\(electrician\)/checklist.tsx mobile/app/\(electrician\)/jobs.tsx
git mv mobile/app/\(electrician\)/certification.tsx mobile/app/\(electrician\)/compliance.tsx
git rm mobile/app/\(electrician\)/maintenance.tsx          # contents merge into jobs.tsx
git rm mobile/app/\(electrician\)/job-detail.tsx           # becomes embedded inside jobs.tsx

# 3. Rename provider files
git mv mobile/app/\(provider\)/home.tsx mobile/app/\(provider\)/discover.tsx
git mv mobile/app/\(provider\)/catalog.tsx mobile/app/\(provider\)/inventory.tsx
git mv mobile/app/\(provider\)/earnings.tsx mobile/app/\(provider\)/wallet.tsx
git rm mobile/app/\(provider\)/shares.tsx                  # contents merge into generation.tsx (new)
git rm mobile/app/\(provider\)/assets.tsx                  # contents merge into generation.tsx (new)
git rm mobile/app/\(provider\)/quote-requests.tsx          # contents merge into inventory.tsx
git rm mobile/app/\(provider\)/orders.tsx                  # contents merge into inventory.tsx
git rm mobile/app/\(provider\)/reliability.tsx             # contents merge into inventory.tsx

# 4. Rename financier files
git mv mobile/app/\(financier\)/home.tsx mobile/app/\(financier\)/discover.tsx
git rm mobile/app/\(financier\)/deals.tsx                  # contents merge into discover.tsx
git rm mobile/app/\(financier\)/deal-detail.tsx            # becomes embedded

# 5. Rename owner → building-owner (folder + files), and move obsolete tabs into _embedded
git mv mobile/app/\(owner\) mobile/app/\(building-owner\)
git mv mobile/app/\(building-owner\)/earnings.tsx mobile/app/\(building-owner\)/wallet.tsx
mkdir -p mobile/app/\(building-owner\)/_embedded
git mv mobile/app/\(building-owner\)/drs.tsx mobile/app/\(building-owner\)/_embedded/drs.tsx
git mv mobile/app/\(building-owner\)/deployment.tsx mobile/app/\(building-owner\)/_embedded/deployment.tsx
git mv mobile/app/\(building-owner\)/resident-roster.tsx mobile/app/\(building-owner\)/_embedded/resident-roster.tsx
git mv mobile/app/\(building-owner\)/approve-terms.tsx mobile/app/\(building-owner\)/_embedded/approve-terms.tsx
git mv mobile/app/\(building-owner\)/compare-today.tsx mobile/app/\(building-owner\)/_embedded/compare-today.tsx
git rm mobile/app/\(building-owner\)/list-building.tsx     # moves to onboarding

# 6. Resident cleanup
git rm mobile/app/\(resident\)/ownership.tsx               # folds into wallet.tsx
git rm mobile/app/\(resident\)/support.tsx                 # folds into profile.tsx

# 7. Create onboarding folder
mkdir -p mobile/app/\(onboard\)/{resident,building-owner,provider,electrician,financier}
```

Commit this as one diff:
```bash
git add -A && git commit -m "ia: delete supplier role, rename installer→electrician, restructure folders to IA_SPEC"
```

You should now have:
- `mobile/app/(resident)/` with: `_layout.tsx`, `home.tsx`, `profile.tsx` only (energy + wallet to be created)
- `mobile/app/(building-owner)/` with: `_layout.tsx`, `home.tsx`, `wallet.tsx`, `_embedded/*` (energy + profile to be created)
- `mobile/app/(provider)/` with: `_layout.tsx`, `discover.tsx`, `inventory.tsx`, `wallet.tsx`, `profile.tsx` (generation to be created)
- `mobile/app/(electrician)/` with: `_layout.tsx`, `discover.tsx`, `jobs.tsx`, `compliance.tsx` (wallet + profile to be created)
- `mobile/app/(financier)/` with: `_layout.tsx`, `discover.tsx`, `portfolio.tsx`, `profile.tsx` (wallet to be created)
- `mobile/app/(admin)/` with: `_layout.tsx`, `home.tsx` (renames to `alerts.tsx`), `projects.tsx`, `profile.tsx` (to be created)

---

## Subagent plan

Spawn **6 parallel subagents** off `sprint/mobile`. Each works on a feature branch and merges back into `sprint/mobile` at T+5:00.

| Subagent | Branch | Owned paths | Task |
|---|---|---|---|
| `infra` | `sprint/mobile/infra` | `mobile/app/_layout.tsx`, `mobile/app/(auth)/**`, `mobile/components/AuthContext.tsx`, `mobile/components/PilotBanner.tsx`, `mobile/components/SyntheticBadge.tsx`, `mobile/components/ProjectCard.tsx`, `mobile/components/PortfolioRow.tsx`, `mobile/components/EnergyTodayChart.tsx`, `mobile/components/RoofMap.tsx`, `mobile/lib/**` | Auth flow + shared components + utility libs that every other subagent imports |
| `onboard` | `sprint/mobile/onboard` | `mobile/app/(onboard)/**` | Per-role onboarding flows, all five |
| `resident` | `sprint/mobile/resident` | `mobile/app/(resident)/**` | Home / Energy / Wallet / Profile |
| `building-owner` | `sprint/mobile/building-owner` | `mobile/app/(building-owner)/**` | Home / Energy / Wallet / Profile + embedded views |
| `contributors` | `sprint/mobile/contributors` | `mobile/app/(provider)/**`, `mobile/app/(electrician)/**`, `mobile/app/(financier)/**` | All three "Discover-first" roles |
| `admin` | `sprint/mobile/admin` | `mobile/app/(admin)/**` | Minimal mobile admin (3 screens) |

**Critical:** the `infra` subagent must finish first (or at least its components must exist as importable stubs) before the other subagents can render screens — they all import `PilotBanner`, `useApiData`, `api`, `ProjectCard`, etc. Have `infra` push a commit with stub exports of every shared component within the first hour, then refine the implementations.

---

## Subagent: `infra` (BLOCKING — others depend on it)

### Hour 1: stub exports (so other subagents can compile)

Push these as no-op-but-typed stubs first thing:

- `mobile/lib/api.ts` — exports `useApi()` returning a typed api-client wrapper bound to current session
- `mobile/lib/useApiData.ts` — `useApiData<T>(fetcher): { data, loading, error, refetch }`
- `mobile/lib/geo.ts` — `polygonAreaM2(coords)` (can stub-return 0; finalize later)
- `mobile/components/AuthContext.tsx` — Context with `{ session, login, requestOtp, logout, loading }`
- `mobile/components/PilotBanner.tsx` — yellow banner component with copy from PILOT_SCOPE.md
- `mobile/components/SyntheticBadge.tsx` — pill `<SyntheticBadge source={'synthetic'|'measured'} />`
- `mobile/components/ProjectCard.tsx` — Airbnb-style card; props: `ProjectCard` from shared types + `onPress`
- `mobile/components/PortfolioRow.tsx` — Robinhood-style row; props: `FinancierPosition` + `onPress`
- `mobile/components/EnergyTodayChart.tsx` — 24h stacked area chart wrapping `react-native-chart-kit`; props: `{ generation: number[], load: number[], irradiance?: number[], showGeneration: boolean, source: 'synthetic'|'measured' }`
- `mobile/components/RoofMap.tsx` — wraps `react-native-maps` satellite tile; props: `{ polygon?, editable, onPolygonChange? }`

### Hour 2-5: real implementations

1. **`AuthContext`**:
   - On mount, hydrate from `expo-secure-store` key `emappa_session`
   - `requestOtp(email)` → calls `/auth/request-otp`
   - `login(email, code)` → calls `/auth/verify-otp`, persists `{token, user}` to SecureStore
   - `logout()` → clears SecureStore + redirects `/(auth)/login`
   - Exposes loading + error state
   - Auto-redirect logic: on session change, if `!user.onboardingComplete` → push `/(onboard)/[role]/index`; else push `/(role)/(first-tab)`

2. **`mobile/app/_layout.tsx`** — wrap app in `<AuthProvider>`. On mount, check session, route accordingly.

3. **`mobile/app/(auth)/_layout.tsx`** — Stack with `headerShown: false`.

4. **`mobile/app/(auth)/login.tsx`** — two-step (email → OTP) per IA §7.0, with rate-limit error handling and 60s resend countdown.

5. **`mobile/app/(auth)/role-select.tsx`** — only shown if `user.role` is null (rare; pilot users are pre-assigned). Otherwise auto-skip.
   - **Admin must NEVER appear as an option here.** Filter the role list to `PublicRole` only — `['resident', 'building_owner', 'provider', 'financier', 'electrician']`. Per [IA_SPEC §8.5](../IA_SPEC.md), there is no UI path that creates an admin.
   - Display strings: "Resident", "Building Owner", "Provider", "Financier", "Electrician"

6. **`useApiData<T>`** — wraps async fetch with loading/error/refetch. Caches per stable-string key. Re-fetches on focus.

7. **`api.ts`** — `useApi()` hook returns api-client functions auto-bound to `session.token`. Throws ApiError on non-200.

8. **`PilotBanner`** — exported component with `<PilotBanner variant="pledge"|"settlement"|"data" />` so different surfaces show specific copy.

9. **`SyntheticBadge`** — small pill with `source` prop. Renders `synthetic` only when source is synthetic.

10. **`ProjectCard`** — Airbnb-inspired:
    - 16:9 building photo (fallback gradient if no `photoUrl`)
    - DRS pill (color-coded), stage pill
    - Title, location
    - Gap summary (e.g. "Needs 12 panels + inverter")
    - Right-side capital/equipment/electrician ask
    - `onPress` → navigates to embedded project detail (each role's discover screen handles routing)

11. **`PortfolioRow`** — Robinhood-inspired:
    - Building name, position size
    - Sparkline of returns YTD
    - IRR pill, returns-to-date

12. **`EnergyTodayChart`** — 24h stacked area:
    - X-axis: hours 0..23 today
    - Stacked: solar (peach), battery (graphite), grid (sky)
    - Optional generation overlay when `showGeneration=true`
    - Synthetic badge in top-right

13. **`RoofMap`**:
    - Wrap `react-native-maps` `MapView` with `mapType="satellite"`
    - Render `<Polygon>` from passed coords
    - Tap-to-add-corner mode when `editable=true`
    - Compute area client-side via `polygonAreaM2` from `mobile/lib/geo.ts`
    - Helper: `mobile/lib/geo.ts` implements shoelace + latitude correction

14. **`mobile/lib/geo.test.ts`** — unit test against a known reference polygon (target ±2%).

**Acceptance:**
- [ ] Session hydration works; force-quit + reopen still logged in
- [ ] Email OTP rate-limit (429) renders friendly error
- [ ] All shared components export and type-check
- [ ] geo.test.ts passes

---

## Subagent: `onboard`

Build per-role onboarding flows per [IA_SPEC.md §7](../IA_SPEC.md).

**Structure:**
- `mobile/app/(onboard)/_layout.tsx` — Stack, no tabs, no back-to-auth allowed mid-flow
- `mobile/app/(onboard)/welcome.tsx` — splash → CTA "Get started" → `/(auth)/login`
- After OTP verify, AuthContext routes to `/(onboard)/[role]/index` if `!user.onboardingComplete`
- Each role has its own folder with sequential screens
- Final step in every role calls `POST /me/onboarding-complete` and replaces nav stack with `/(role)/(first-tab)`

**Per-role implementation:**

### Resident (`(onboard)/resident/`)
- `index.tsx` → "Enter your building's invite code"
- `confirm.tsx` → show building card from API, "This is my building" / "Wrong building"
- `first-pledge.tsx` → optional first pledge using same pledge entry component as the resident Home tab (lift to `mobile/components/PledgeEntry.tsx`)
- Final → `/(resident)/home`

### Building Owner (`(onboard)/building-owner/`)
- `index.tsx` → building basics form (name, address with on-blur geocode, unit count, occupancy slider)
- `roof.tsx` → uses `RoofMap` + `useApiData(suggestRoof)` waterfall:
  1. If suggest returns polygon → "Looks right" / "Let me redraw" / "Type sqm"
  2. Owner-traced polygon → tap corners on satellite tile
  3. Manual sqm entry fallback
- `terms.tsx` → building owner royalty preview (read-only summary)
- Final → `/(building-owner)/home`

### Provider (`(onboard)/provider/`)
- `index.tsx` → business basics: name, contact, business type radio (Panels / Infrastructure / Both) → posted to `POST /me/onboarding-complete` with `business_type`
- `inventory.tsx` → optional initial inventory; "Skip" allowed
- Final → `/(provider)/discover`

### Electrician (`(onboard)/electrician/`)
- `index.tsx` → name, region, scope multi-select (install / inspection / maintenance)
- `cert.tsx` → optional certification upload; "Add later" allowed
- Final → `/(electrician)/discover`

### Financier (`(onboard)/financier/`)
- `index.tsx` → investor profile: institution / individual radio, target deal size, target return profile
- Final → `/(financier)/discover`

**Acceptance:**
- [ ] Each role's onboarding completes end-to-end and lands on the correct first tab
- [ ] `POST /me/onboarding-complete` is called and `user.onboardingComplete` flips
- [ ] Skipping optional steps doesn't break the flow
- [ ] Owner roof-capture round-trips polygon → backend → re-render
- [ ] No mock data; all forms POST to real endpoints

---

## Subagent: `resident`

Implement Resident's 4 tabs per [IA_SPEC.md §1](../IA_SPEC.md).

### `_layout.tsx`
Tabs: Home (icon: home/wallet), Energy (icon: flash), Wallet (icon: pie-chart), Profile (icon: person). Profile is rightmost.

### `home.tsx` — Tokens
- `<PilotBanner variant="pledge" />`
- Big number: pledged total in KES (from `getPrepaidBalance(user.buildingId)`)
- Today's projected solar coverage card (from `getEnergyToday(user.buildingId)`)
- Primary CTA: `[Pledge tokens]` opens `PledgeEntry` modal
- Recent pledges (3 rows) + footer "View all →" pushes embedded `pledge-history`
- All data via `useApiData`. Loading skeleton. Error retry.

### `energy.tsx`
- `<EnergyTodayChart generation=... load=... showGeneration={ownsAnyShare} source="synthetic" />`
- Today summary cards: kWh consumed, kWh from solar, KES saved
- Generation panel (only renders if `ownsAnyShare===true`):
  - Today's generation share (kWh = total × user.shareFraction)
  - 30-day sparkline
- Empty state with CTA "Buy a share to see live generation"
- Computes `ownsAnyShare` via `getOwnership(user.buildingId, 'resident')` → user has any position > 0

### `wallet.tsx`
- Three-card top: Pledged total / Earnings / Net savings
- Tabs (segmented control internal): Cashflow / Ownership
- Cashflow: list from `getWalletTransactions(user.id)`
- Ownership: positions from `getOwnership(...)`. Empty state with CTA to embedded "marketplace" screen
- Embedded screens (push, not tabs):
  - `_embedded/marketplace.tsx`
  - `_embedded/asset-detail.tsx`

### `profile.tsx`
- Top: avatar (initials), email, role pill, building name
- Section: Settings (notifications toggles, units, language)
- Section: Support (help articles list, "Contact support" → email mailto)
- Logout button (destructive style)

**Acceptance:**
- [ ] Resident logs in → lands on Home → sees real pledged balance
- [ ] Tap Pledge → enter 1000 → submits → balance refreshes within 1s
- [ ] Energy tab generation panel hidden for resident with 0 shares; visible for resident with shares
- [ ] No mock numbers; loading skeletons; error toasts
- [ ] Logout works

---

## Subagent: `building-owner`

Implement Building Owner's 4 tabs per [IA_SPEC.md §2](../IA_SPEC.md). Folder is `mobile/app/(building-owner)/`. Role string is `'building_owner'`.

### `_layout.tsx`
Tabs: Home (icon: business), Energy (icon: flash), Wallet (icon: cash), Profile (icon: person).

### `home.tsx` — Project
- If user has no `building_id`: giant `[Start project]` CTA → routes to `/(onboard)/owner/index` re-entry
- If has building:
  - Roof polygon thumbnail header (from `RoofMap`, `editable=false`)
  - DRS card (`<DrsCard data=... />` — use existing component, wired to real API)
  - Top 3 blockers list
  - Deployment progress bar (qualifying → funding → installing → live)
  - Pledged demand KPI
  - Action rail (single row of pills): View blockers / Compare bill / Resident roster / Approve terms / Deployment
  - Each rail item pushes to `_embedded/{name}.tsx`

### `energy.tsx`
- `<EnergyTodayChart>` always shows generation (owner always sees rooftop generation)
- 30-day toggle
- KPIs: today gen / today usage / today revenue

### `wallet.tsx` (renamed from earnings.tsx)
- Royalties balance card
- Payout history list
- Projected next-month royalty

### `profile.tsx` (NEW)
- Account, Building profile section, Settings, Support, Logout

### Embedded `_embedded/*`
For each of `drs.tsx`, `deployment.tsx`, `resident-roster.tsx`, `approve-terms.tsx`, `compare-today.tsx`: rebuild with real API data, no mocks. These are pushed from Home action rail; they are not in the tab bar.

**Acceptance:**
- [ ] Owner without building → giant Start CTA works through onboarding
- [ ] Owner with building sees DRS, blockers, deployment progress, pledged demand
- [ ] All 5 embedded screens render real data
- [ ] No dead buttons

---

## Subagent: `contributors`

Three roles, all "Discover-first." Implement per [IA_SPEC.md §3, §4, §5](../IA_SPEC.md). Use the shared `ProjectCard` for all Discover screens; pass `role={user.role}` so cards render the right "ask" copy.

### Provider (`(provider)/`)
- `_layout.tsx`: Discover, Inventory, Generation, Wallet, Profile
- `discover.tsx`: filter bar + `FlatList<ProjectCard>` from `getDiscover('provider', filters)`. Tap → `_embedded/project/[id].tsx` (BOM ask, quote submission)
- `inventory.tsx`: top segmented control (All / Panels / Infrastructure), SKU list from `getInventory(user.id)`, FAB to add SKU. Tabs internal: SKUs / Quote requests / Orders / Reliability
- `generation.tsx`: list arrays where user holds shares > 0. Empty state when shares=0 ("When residents buy your shares, you receive payouts but lose live generation visibility."). For each array: `<EnergyTodayChart>` + share fraction + payout share.
- `wallet.tsx`: equipment-sale + share-royalty streams; cashflow list
- `profile.tsx`: account + business profile (panels/infra/both — editable) + Settings + Support + Logout

### Electrician (`(electrician)/`)
- `_layout.tsx`: Discover, Jobs, Wallet, Compliance, Profile
- `discover.tsx`: project cards from `getDiscover('electrician', filters)`. Tap → embedded job preview with checklist preview + "Accept job" CTA
- `jobs.tsx`: segmented control Active / Completed / Maintenance. Job rows from `getJobs(user.id)`. Tap → embedded job detail with checklist, photo capture (use Expo `expo-camera`), readings entry, sign-off
- `wallet.tsx`: job earnings, payouts, projected pipeline
- `compliance.tsx`: certifications list with status pills, expiry alerts at top, training courses, upload-doc CTA
- `profile.tsx`: account + Settings + Support + link to Compliance + Logout

### Financier (`(financier)/`)
- `_layout.tsx`: Discover, Portfolio, Wallet, Profile (4 tabs)
- `discover.tsx`: project cards from `getDiscover('financier', filters)`. Tap → `_embedded/deal-room/[id].tsx`
- `portfolio.tsx`: top KPI strip (deployed / returns / IRR) + compounding curve sparkline + `<PortfolioRow>` list
- `wallet.tsx`: cash available / deployed / returns; cashflow list
- `profile.tsx`: account + investor profile + Settings + Support + Logout

**Acceptance:**
- [ ] Each role lands on Discover after login
- [ ] Discover feeds are real (3 cards minimum from seed data)
- [ ] Provider Generation tab: hidden generation if shares=0 (empty state); visible if shares>0
- [ ] Electrician can accept a job from Discover → it appears in Jobs Active
- [ ] Financier can pledge capital → appears in Portfolio
- [ ] No dead buttons in any of the three roles

---

## Subagent: `admin`

Minimal mobile admin per [IA_SPEC.md §6](../IA_SPEC.md). 3 tabs. **The admin tab bar is gated on `user.role === 'admin'`** — non-admins never reach this stack. Per [IA_SPEC §8.5](../IA_SPEC.md), admin role is never selectable from any UI; admins exist only because an operator ran `backend/scripts/grant_admin.py` or seed.py.

- `_layout.tsx`: Alerts, Projects, Profile. Add a hard guard at the top: if `session.user.role !== 'admin'`, redirect to login. (Belt + suspenders — the AuthContext routing should already prevent reaching this stack.)
- `alerts.tsx`: high-priority alerts list (from cockpit's audit feed scoped to admin)
- `projects.tsx`: portfolio scan (read-only). Tap → embedded read-only project detail
- `profile.tsx`: account + Settings + Support + Logout

**Acceptance:**
- [ ] Admin lands on Alerts after login
- [ ] No write operations on mobile (admin writes happen in cockpit)
- [ ] Non-admin user manually navigating to `/(admin)/...` gets redirected away
- [ ] Role-select UI never shows "Admin" as an option

---

## Cross-cutting requirements

1. **Pilot banner** appears on every screen that involves money or data:
   - `variant="pledge"` on resident Home, Wallet, and pledge entry
   - `variant="settlement"` on owner/provider/financier Wallet
   - `variant="data"` on every Energy chart container

2. **Synthetic badge** appears on every chart fed by synthetic data. Hidden when source is measured.

3. **Profile screens** all share the same skeleton component `mobile/components/ProfileScaffold.tsx`:
   - Header (avatar + name + role pill)
   - Sections (passed in as children: Account, Settings, Support, role-specific extras)
   - Footer logout button

4. **Empty states** are real — no `View>Text>"Coming soon"`. Use `mobile/components/EmptyState.tsx` (build it) with: icon, headline, body, optional CTA.

5. **Loading states** are real skeletons or activity indicators — no flashing white.

6. **Error states** are friendly — never raw stack traces. Use `mobile/components/ErrorState.tsx` (build it) with retry.

7. **Every screen** uses `<SafeAreaView>` and respects the system status bar.

---

## Final per-agent steps before push

1. Run `npm run typecheck` from repo root — must pass with zero errors
2. Run any tests you wrote (`mobile/lib/geo.test.ts`)
3. Smoke test on iOS simulator: log in as each seed user, walk through each role's tabs
4. Squash commits per subagent: each subagent produces 1–2 commits on `sprint/mobile`
5. **Do not push.** Coordinator will merge `sprint/mobile` into `main` locally.

---

## Definition of done

- Six roles with the exact tab layout in [IA_SPEC.md §1–6](../IA_SPEC.md)
- Five complete onboarding flows
- Email OTP login + session persistence
- Resident pledge end-to-end against real backend
- Owner roof capture end-to-end against real backend
- Provider/electrician/financier discover feeds populated with real seed data
- Generation visibility correctly gated by share ownership across resident, owner, provider
- Zero dead buttons across all roles
- Zero mock numbers anywhere
- Pilot banner on every money/data screen
- Synthetic badge on every synthetic chart
- All Profile screens contain Settings + Support embedded
- Logout returns to login
- `npm run typecheck` exits 0
