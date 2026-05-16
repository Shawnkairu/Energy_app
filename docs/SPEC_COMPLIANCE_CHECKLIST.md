# Spec & IA compliance checklist

**Canonical navigation registry:** `packages/shared/src/stakeholderSections.ts`  
**IA reference:** [IA_SPEC.md](./IA_SPEC.md)  
**Pilot carve-outs:** [PILOT_SCOPE.md](./PILOT_SCOPE.md) (when pilot text relaxes a rule, note it in the **Notes** column)

**Raw audit artifacts:** [docs/compliance-partial/](./compliance-partial/) retains CI transcripts and FM/IA deep dives merged here; use that folder for evidence trails without duplicating this matrix.

## How to use this document (humans & agents)

1. **Before** merging work that touches stakeholder UX, formulas, APIs, or domain types: scan the sections below that match your diff.
2. **After** the change: update the **Status** cells you affected (`Pass` · `Partial` · `Gap` · `Open`).
3. **Do not claim `Pass`** without opening the listed primary files or running the repo checks in [§7](#7-ci--quality-gates).
4. This checklist tracks **documented product requirements and structural parity**. It does **not** assert byte-for-byte equality of the entire repository with prose docs—that would be millions of lines and is out of scope. Use this as the **traceability matrix** from spec → code.
5. For **deployment maturity** (local vs synthetic demo vs staged pilot vs production), **synthetic vs measured** posture, and **ops/integration gaps**, use **[DEPLOYMENT_AND_READINESS.md](./DEPLOYMENT_AND_READINESS.md)** — do not fold long ops matrices into this checklist.

### Status legend

| Status | Meaning |
|--------|---------|
| **Pass** | Implemented; spot-checked against listed files |
| **Partial** | Correct direction; missing edge cases, copy, or secondary surfaces |
| **Gap** | Known mismatch with cited spec section |
| **Open** | Not yet audited for this requirement |
| **N/A** | Requirement does not apply to that column |

---

## 1. Information architecture — universal rules ([IA_SPEC.md](./IA_SPEC.md) preamble)

| ID | Requirement | Mobile | Website | Shared / API | Notes |
|----|---------------|--------|---------|--------------|-------|
| **IA-U1** | Max 5 tab-bar screens per stakeholder; extras embedded | Pass | Pass | Pass | `getMobileSections` / `RoleTabs`; homeowner + building_owner custom `Tabs` verified at 4 visible tabs with embedded stacks hidden. |
| **IA-U2** | Profile always rightmost | Pass | Pass | Pass | Registry order; verify custom layouts keep `profile` last. |
| **IA-U3** | Wallet for every money-touching role except admin-mobile | Pass | Pass | Pass | Admin has no wallet tab per IA §6. |
| **IA-U4** | First tab intent (Discover vs Home) | Pass | Pass | Pass | Role home routes: provider / financier / electrician → `discover`; admin → `alerts`. See `RoleGuard`, `role-select`, `verify-phone`, `RoleDashboardScaffold`. |
| **IA-U5** | No non-working controls | Pass | Pass | N/A | Focused audit added to **`npm run audit:shared`** (`packages/shared/scripts/audit-ui-compliance.cjs`) scans shipped mobile, website, cockpit, and immersive sources for obvious inert controls (`href="#"`, button-without-handler, Pressable-without-handler). Fixes from the residual pass: marketing logo now links to `#pilot`; legacy owner action chips in **`OwnerShared`** are static text (`View`, `accessibilityRole="text"`). Design-handoff mocks under `mobile/claude design hov1/` and built `dist/` artifacts are intentionally excluded from shipped-control audit. |
| **IA-U6** | No silent fake metrics: real data or `—` + synthetic badge | Pass | Pass | Pass | Focused audit added to **`npm run audit:shared`** verifies baseline pilot/synthetic/pledge labels across **mobile `PilotBanner`**, **website `PortalWidgets.PilotBanner` / `SyntheticBadge`**, **cockpit `PilotBanner` / `SyntheticBadge`**, **`packages/web-immersive`** hero labels, and shared `source` / `dataSource` types. Residual pass tightened default mobile copy: “Pledges are non-binding, no money is charged…” and immersive project heroes now include explicit `Pilot · ...` labels. |
| **IA-U7** | Settings, support, electrician compliance embedded in Profile | Pass | Pass | N/A | Mobile: compliance is a **hidden route** with Profile entry only; shared `ProfileEssentials` now gives role profiles settings/support/logout. Web: electrician compliance embedded in profile. |
| **IA-U8** | Profile contains account, settings, support, logout | Pass | Pass | N/A | Mobile role profiles include shared account/settings/support/logout block (`ProfileEssentials`); homeowner/building-owner keep extra property/building profile sections. |
| **IA-U9** | Generation visibility gated by share ownership (resident, provider; owner rules differ) | Pass | Pass | Pass | Shared `generationVisibilityForRole()` codifies resident/provider share gating, owner/homeowner site-authority visibility, and financier named-capital visibility. Mobile resident/provider and web `GenerationPanel` use the shared helper. |
| **IA-U10** | Mobile & website same screens, order, data sources | Pass | Pass | Pass | **`auditStakeholderSectionParity()`** proves canonical order and 5-tab cap; **`audit-ui-compliance.cjs`** now also checks every public-role canonical route file exists in `mobile/app/(role)/{section}.tsx`, every web portal file exists in `website/src/screens/stakeholders/{role}/{section}.tsx`, and every web section key is wired in `screenLoaders`. Data-path proof: mobile tabs are driven by `getMobileSections(role)` and role screens load through shared `@emappa/api-client` / role helpers; web loads portal state centrally through `loadPortalData()` (`getRoleHome`, `getProjects`, energy, wallet, discover/inventory/jobs/portfolio). Provider inventory remains a data/profile surface, while the canonical second tab is Projects. Electrician compliance remains intentionally profile-embedded on web and hidden-from-tab on mobile per IA §7–8. |

---

## 2. Stakeholder navigation matrix (tabs)

Registry labels match [IA_SPEC.md](./IA_SPEC.md) §1 matrix (provider tab 2 **Projects**, financier tab 2 **Project status**); routing ids are `projects` / `portfolio`. Provider `inventory` is retained only as legacy alias/data/profile scope, not primary navigation.

| Role | Mobile route group | Website screens dir | Tab IDs (registry order) | Status |
|------|--------------------|---------------------|---------------------------|--------|
| Resident | `mobile/app/(resident)/` | `website/src/screens/stakeholders/resident/` | home, energy, wallet, profile | Pass |
| Homeowner | `mobile/app/(homeowner)/` | `website/src/screens/stakeholders/homeowner/` | home, energy, wallet, profile | Pass |
| Building owner | `mobile/app/(building-owner)/` | `website/src/screens/stakeholders/building-owner/` | home, energy, wallet, profile | Pass |
| Provider | `mobile/app/(provider)/` | `website/src/screens/stakeholders/provider/` | discover, projects, generation, wallet, profile | Pass |
| Electrician | `mobile/app/(electrician)/` | `website/src/screens/stakeholders/electrician/` | discover, jobs, wallet, profile | Pass |
| Financier | `mobile/app/(financier)/` | `website/src/screens/stakeholders/financier/` | discover, portfolio, generation, wallet, profile | Pass |
| Admin | `mobile/app/(admin)/` | N/A (cockpit for ops) | alerts, projects, profile | Pass |

### 2.1 Hidden / embedded mobile routes (not tab-bar)

| Role | Hidden / stack routes | Config / layout | Status |
|------|------------------------|-----------------|--------|
| Provider | inventory (legacy alias), qualified-projects, commit-capacity, accept-terms, deployment, maintenance, performance | `RoleTabs.tsx` `hiddenTabRoutes` | Pass |
| Financier | tranche-release | `RoleTabs.tsx` | Pass |
| Electrician | jobs-inbox, compliance | `RoleTabs.tsx` | Pass |
| Building owner | `_embedded/*`, owner-account | `BuildingOwnerScreens.tsx` | Pass |
| Homeowner | `_embedded/*` | `(homeowner)/_layout.tsx` | Pass |
| Admin | home | `RoleTabs.tsx`; initial **alerts** | Pass |

---

## 3. IA §7 Onboarding & API

| ID | Requirement | Mobile | Backend | Status | Notes |
|----|-------------|--------|---------|--------|-------|
| **ON-1** | Onboarding under `mobile/app/(onboard)/...` | Pass | Pass | Pass | Resident join/confirm/first pledge, homeowner address/roof/terms/pledge, building-owner basics/roof/terms, provider business/inventory, electrician basics/cert, and financier profile routes all live under `(onboard)` and post through `/me/*`, `/buildings`, `/prepaid`, or role APIs. Website mirrors the same IA §7 flows via `StakeholderOnboarding` (all public roles) and `POST /me/select-role` after OTP. |
| **ON-2** | `GET /geocode?q=` debounced | Pass | Pass | Pass | `useGeocodedAddress()` (mobile) calls `api.geocode()` on address blur for building-owner + homeowner onboarding; building-owner web onboarding uses `geocodeQuery` on address blur; backend `geocode.py` serves the endpoint. |
| **ON-3** | `POST /me/onboarding-complete` rejects `role=admin` in body | N/A | Pass | Pass | Optional `role` on body; **403** `admin_onboarding_forbidden` (`me.py` + `test_api.py`). |
| **ON-4** | Provider must supply business type | Pass | Pass | `me.py` enforces `business_type` for provider; mobile `/(onboard)/provider/*`. |

---

## 4. Security — admin visibility ([IA_SPEC.md](./IA_SPEC.md) §8.5)

| ID | Requirement | Mobile | Website | Backend | Cockpit | Status |
|----|-------------|--------|---------|---------|---------|--------|
| **SEC-1** | Public role pickers exclude admin | Pass | Pass | N/A | N/A | `role-select.tsx` roles array; `website/src/data/roles.ts` has no admin. |
| **SEC-2** | Website login copy must not imply admin is a public portal role | N/A | Pass | N/A | N/A | `LoginLayer` separates stakeholder demo emails from cockpit-only admin seeds. |
| **SEC-3** | Admin provisioned only via seed / grant script | Pass | Pass | Pass | N/A | Public UI has no admin picker; `grant_admin.py` enforces `EMAPPA_ADMIN_EMAILS`, and `seed.py` now refuses admin seed specs outside the same allowlist. |
| **SEC-4** | Cockpit rejects non-admin | Pass | N/A | N/A | Pass | `cockpit/src/App.tsx` guards. |

---

## 5. Product doctrine & pilot ([PRODUCT_SPEC.md](./PRODUCT_SPEC.md), [PILOT_SCOPE.md](./PILOT_SCOPE.md))

| ID | Requirement | Code / docs | Status | Notes |
|----|-------------|-------------|--------|-------|
| **PD-1** | Doctrine bullets (prepaid, DRS, monetized payout only, etc.) | `README`, `.cursor/rules`, backend settlement | Pass | Cross-checked: README core rules + workspace doctrine match shared/backend settlement revenue from `E_sold`, DRS/LBRS gates, ownership payout math, and named-building funding. |
| **PD-2** | Pilot: pledges, synthetic energy, email OTP | Pass | Pilot mode is represented in auth (`LoginLayer` email OTP copy), shared/api-client pledge semantics, mobile/website/cockpit banners, `SyntheticBadge` components, and shared `source` / `dataSource` types. Residual audit now runs under `npm run audit:shared`. |
| **PD-3** | Persistent pilot banner on wallet / pledge surfaces | Pass | Web portals inherit `PortalShell` / `PortalWidgets.PilotBanner`; cockpit has top-level `PilotBanner`; mobile has reusable `PilotBanner` with default pledge/no-charge/synthetic copy plus explicit banners on financier Discover and resident Energy. New audit verifies baseline banner/label presence across shipped surfaces. |

---

## 6. Formulas, types, and API parity

| ID | Doc | Shared | Backend | Tests | Status | Notes |
|----|-----|--------|---------|-------|--------|-------|
| **FM-1** | [DRS_FORMULA.md](./DRS_FORMULA.md) | `packages/shared/src/drs.ts` | `backend/app/services/drs.py` | `backend/tests/test_drs.py`, `test_api.py` | **Pass** | **`calculate_drs`** mirrors TS (including homeowner stakeholder readiness OR rule aligned with checklist). **`GET /drs/{building_id}`** resolves DB building → demo/synthetic `BuildingProject` inputs (`building_drs.py`) and returns **`project_building`…`drs`** (same pipeline as services). Integration **`test_get_drs_returns_canonical_payload_when_building_exists`** skips when DB is unseeded. |
| **FM-2** | [LBRS_FORMULA.md](./LBRS_FORMULA.md) | `packages/shared/src/lbrs.ts` | `backend/app/services/lbrs.py` | `backend/tests/test_lbrs.py` | **Pass** | **`calculate_lbrs`** aligned: weighted checklist **displayScore**, stable **codes** + **`responsibleRole`**, **`checklist` payload**, apartment vs homeowner ATS rules; **`_default_lbrs`** derives **`siteKind`** from `buildingKind` like TS. |
| **FM-3** | [SETTLEMENT_AND_PAYBACK.md](./SETTLEMENT_AND_PAYBACK.md) | `packages/shared/src/settlement.ts`, `payback.ts` | `backend/app/services/settlement.py`, `payback.py` | `backend/tests/test_settlement.py`, payback via `test_lbrs.py` | **Pass** | **`calculate_settlement`** echoes **`phase`** (`recovery` / `royalty`) like TS; **`project_building` / `settlement_runner`** pass `settlementPhase`. **`calculate_payback`** uses **2 dp** rounding (matches TS). |
| **FM-4** | [ENERGY_FORMULAS.md](./ENERGY_FORMULAS.md) | `packages/shared/src/energy.ts` | `backend/app/services/energy.py` | `backend/tests/test_energy.py` | **Pass** | **`calculate_energy` mirrors `energy.ts` field-for-field;** `test_energy.py` golden-vector parity vs shared outputs for demo project. |
| **FM-5** | Consistency / projector | `packages/shared/src/projector.ts`, `consistency.ts` | `backend/app/services/projector.py`, `consistency.py` | `backend/tests/test_lbrs.py`, `test_drs.py`, demo audit in `test_lbrs.py` | **Pass** | **`project_building`** matches **`projector.ts`**: gates from **`drs.checklist`**, homeowner **`monthlyRoyaltyKes` zeroed**, LBRS/DRS **`siteKind`** from `buildingKind`, DRS input **`hasResidentDemandSignal`** override matches TS (no prepaid-KES override of `hasPrepaidFunds`). **`audit_project_consistency`** mirrors **`consistency.ts`**; demo parity exercised in pytest. |

---

## 7. CI & quality gates

Run from repo root (adjust if pipelines differ):

**Last verified:** 2026-05-15 Provider Projects IA correction. **`npm run audit:shared`** includes UI compliance checks for IA-U5/U6/U10. Current validation exit 0: **`npm run audit:shared`**, **`npm run test:shared`**, mobile typecheck/lint, website typecheck/lint/build, and web-immersive typecheck/lint. Backend was not touched in this IA correction; earlier same-day backend pass remains recorded below and in `docs/compliance-partial/ci-run.md`.

| Check | Command / location | Status |
|--------|-------------------|--------|
| Typecheck (workspace) | Latest residual pass: mobile, website, cockpit, and `@emappa/web-immersive` typechecks | **Pass** |
| Lint | Latest residual pass: mobile, website, cockpit, and `@emappa/web-immersive` lint scripts | **Pass** |
| Build | Latest residual pass: `npm run build:website`; earlier same-day mobile export pass retained | **Pass** |
| Shared tests | `npm run test:shared` | **Pass** |
| Backend tests | `npm run test:backend` | **Pass** (28 pytest tests; Pydantic v2 deprecation warnings only) |
| Shared audit bundle (consistency + sections + UI residuals) | `npm run audit:shared` | **Pass** (includes `auditProjectConsistency()`, `auditStakeholderSectionParity()`, and IA-U5/U6/U10 UI compliance audit; 2026-05-15 residual pass) |

---

## 8. Imported scenario specs (`docs/imported-specs/`)

Treat each file as a **traceability backlog** until every user journey is mapped to routes and tests.

| Document | Scope | Status |
|----------|-------|--------|
| scenario-a-resident-… | Resident ATS, capacity, ownership | Pass — prototype traceable to resident mobile/web Home/Energy/Wallet/Profile, pledge APIs, DRS demand gates, share-gated generation, settlement/energy formulas, and shared `operationalWorkflows`. Resident Home now surfaces capacity queue + ATS activation status from shared mock/projected state. Future trading remains roadmap/deferred and is not represented as available. |
| scenario-b-apartment-building-owner-flow | Building owner | Pass — prototype traceable to building-owner mobile/web surfaces, embedded DRS/deployment/terms/roster/compare routes, roof APIs, DRS/LBRS formulas, owner royalty settlement, cockpit project detail, and shared owner verification / launch-signoff workflow rows. Real document review and launch-packet persistence remain out of pilot, but their statuses are visible. |
| scenario-c-homeowner-… | Homeowner net metering | Pass — prototype traceable to homeowner mobile/web surfaces, homeowner onboarding address/roof/terms/pledge, no-host-royalty docs/formulas, DRS homeowner stakeholder OR, LBRS homeowner checklist, wallet separation copy, and owner verification / launch-signoff workflow rows. Export/net-metering/trading income remains disabled unless legally enabled. |
| scenario-d-electrician-flow | Electrician | Pass — prototype traceable to electrician Discover/Projects/Wallet/Profile, hidden compliance route/profile embedding, onboarding cert APIs, electrician DRS/LBRS metadata with legacy compatibility aliases, cockpit LBRS visibility, and operational workflow rows for delivery/evidence capture, go-live signoff, and AI evidence ingestion. Real credential tiering, training tests, crew management, uploads, and payout release are not production integrations yet. |
| scenario-e-suppliers-providers-flow | Provider (merged) | Pass — prototype traceable to provider Discover/Projects/Generation/Wallet/Profile, `business_type` onboarding/API validation, Profile-scoped inventory APIs, retained-claim/generation views, `E_gen` vs `E_sold` formulas, share-gated visibility, and shared/provider/web quote-reservation + delivery-evidence status rows. Real reservation locks, substitution approvals, warranty tickets, and ownership-transfer workflows remain future work. |
| scenario-f-financier-flow | Financier | Pass — prototype traceable to financier Discover/Project status/Generation/Wallet/Profile, named-building capital views, payback ranges, `FinancierGenerationScreen`, portfolio APIs, settlement/payback formulas, DRS capital gates, and mobile/web KYC/escrow status surfaces. Real KYC/KYB, jurisdiction eligibility, custody/escrow, legal disclosures, and investment controls remain explicitly prototype-scoped. |
| installation-process-drs-lbrs-go-live | DRS/LBRS go-live | Pass — prototype traceable to shared/backend DRS/LBRS calculators, projector gates, settlement/payback/energy parity, backend tests, cockpit project detail tabs, `auditProjectConsistency()`, and shared/cockpit ops rows for field evidence, BOM/as-built proof, ATS activation, token-state/settlement signoff, and launch packet status. Real field-upload persistence remains future work. |
| ai-native-company-system-design.md | Org / ops design | Pass — prototype traceable to shared gate metadata/responsible roles, consistency audit, cockpit/admin surfaces, settlement pause semantics, data-quality types, and explicit AI evidence ingestion placeholder rows in shared, cockpit, and electrician surfaces. AI does not approve gates; real ingestion/routing automation remains future work. |
| original-docx/* | Source exports | N/A (manual compare) |

### 8.1 Next milestone — synthetic demo / simulator layer

Goal: ship replayable demo versions of the app for every stakeholder, selectable at login, populated by synthetic data and driven by a unified scenario engine rather than static cards.

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| **SIM-1** | Unified scenario engine advances a building from onboarding → DRS → funding → supplier/provider/electrician execution → go-live → settlement/payback | Partial | `packages/shared/src/simulator.ts` replays Scenario A through lifecycle phases using shared projector/formulas, DRS/LBRS, settlement, payback, operational workflows, and failure modes. First slice is deterministic/in-memory only and covers one imported apartment scenario. |
| **SIM-2** | Synthetic event timelines for each stakeholder, not just static status cards | Partial | Shared `roleTimelines` derive stakeholder-specific histories/upcoming events from one replay state; website portals show the role timeline. Mobile is populated by simulator-backed project data, but does not yet render a dedicated timeline component on every role surface. |
| **SIM-3** | Backend/API support for workflow state transitions, even when backed by demo data | Open | Not implemented in this pass. Scenario transitions are explicit shared deterministic behavior and cockpit UI state; real FastAPI transition endpoints/persistence remain the next backend slice. |
| **SIM-4** | Cockpit controls to run scenarios, inject failures, and compare outcomes | Partial | Cockpit has visible simulator controls for lifecycle phase, failure injection, and outcome comparison (DRS/LBRS/revenue deltas) backed by shared replay state. It is not yet persisted through admin APIs. |
| **SIM-5** | Tests prove a scenario doc can be replayed end-to-end from synthetic inputs | Pass | `packages/shared/src/domain.test.ts` replays all synthetic lifecycle phases, verifies live/LBRS settlement outcome, role timelines, source-spec traceability, failure comparison, and demo-session building attachment. |
| **SIM-6** | Login/demo mode option for each stakeholder, populated with synthetic data | Pass | Website login and mobile login expose one-click synthetic demo entries for all public stakeholder roles; sessions are marked `syntheticDemo` and load simulator-backed project data via shared/api-client mock mode. |

---

## 9. IA §10 file map (deletes / renames)

| Requirement | Status | Notes |
|-------------|--------|-------|
| No `mobile/app/(supplier)/` | Pass | Folder absent |
| No `mobile/app/(installer)/` | Pass | Use `(electrician)/` |
| Resident ownership/support tabs removed | Pass | No `ownership.tsx` / `support.tsx` in resident app |
| Building-owner embedded routes | Pass | Under `_embedded/` per IA |

---

## 10. Change log (compliance passes)

| Date | Scope | Author | Summary |
|------|-------|--------|---------|
| 2026-05-15 | IA §7 onboarding validity | Cursor agent | **§3 / SEC-1 adjacent:** Added `POST /me/select-role` so role pick persists to the backend without setting `onboarding_complete`; mobile `role-select` now routes into role-specific `(onboard)` stacks; website login uses `!onboardingComplete` for the role step, calls `select-role`, and runs `StakeholderOnboarding` for every public role (resident/building_owner/provider/electrician/financier + existing homeowner). Repaired checklist §3 ON-1/ON-2 column alignment. |
| 2026-05-15 | Synthetic demo simulator implementation | Cursor agent | **§8.1 first slice:** Added shared deterministic scenario replay (`simulator.ts`) for Scenario A lifecycle phases, stakeholder timelines, failure injection, outcome comparison, and synthetic demo sessions; wired simulator-backed mock projects/activity through `@emappa/api-client`; added website/mobile demo-login entries and website role timeline display; added cockpit simulator controls; added shared replay tests. Backend workflow transition APIs remain Open. |
| 2026-05-15 | Electrician role-label cleanup | Cursor agent | Replaced remaining user-facing/prototype **Installer/installer** role labels with **Electrician/electrician** across imported scenario specs, mobile/proposed-flow copy, web immersive KPI copy, and legacy design-reference surfaces while preserving technical compatibility identifiers and installation process wording. |
| 2026-05-15 | Synthetic demo simulator milestone | Cursor agent | Added **§8.1** as an Open future milestone for a unified scenario engine, stakeholder event timelines, demo-backed workflow APIs, cockpit scenario controls/failure injection, replay tests, and per-stakeholder login demo mode populated by synthetic data. |
| 2026-05-15 | Imported scenario traceability implementation | Cursor agent | **§8 Pass (prototype-scoped):** Added shared **`operationalWorkflows`** status snapshots for ATS activation, verification docs, quote reservation, delivery/evidence capture, go-live signoff, KYC/escrow, and AI evidence ingestion; surfaced them across resident/provider/electrician/financier mobile, provider/owner/electrician/financier web portals, and cockpit Ops. Real escrow/KYC/AI/upload systems remain explicitly out of pilot scope. |
| 2026-05-15 | Provider Projects residual cleanup | Cursor agent | **IA-U10 / Scenario E:** Removed stale mobile contributor helper semantics that still treated provider `inventory` as a section/tab-like primary screen. Provider contributor fallback now uses **Projects** for current project status; remaining `inventory` references are legacy aliases, API/data surfaces, onboarding capture, or Profile-scoped supply/catalog context. |
| 2026-05-15 | Provider Projects IA correction | Cursor agent | **§1–2 / IA-U10 / Scenario E:** Corrected provider tab 2 from **Inventory** to **Projects** across IA docs, shared `stakeholderSections`, route parity audit, mobile provider tabs, and website portal loaders. Inventory/catalog/warranty content is now Profile-scoped; `inventory` remains only as legacy alias/data/API surface. Validations rerun for shared, mobile, website, and web-immersive surfaces. |
| 2026-05-15 | Residual checklist closure | Cursor agent | **IA-U5/U6/U10 Pass; §8 truthful Partial:** Added **`packages/shared/scripts/audit-ui-compliance.cjs`** to `npm run audit:shared` for inert-control, pilot-label, route/file, and web loader/data-path checks; fixed marketing `href="#"`, converted legacy owner action chips to static text, tightened mobile pilot copy, and labeled immersive project heroes with `Pilot · ...`. Scenario imports now trace each spec to implemented routes/screens/APIs/formulas and keep explicit blockers where workflows remain unbuilt. Validations: audit/shared test, mobile + website + cockpit + web-immersive typecheck/lint, website build. |
| 2026-05-15 | Checklist completion pass | Cursor agent | **§1–5 / §8:** Closed mobile profile parity with shared **`ProfileEssentials`** (account/settings/support/logout), added shared **`generationVisibilityForRole()`** and wired resident/provider mobile + web `GenerationPanel`, enforced `EMAPPA_ADMIN_EMAILS` on **`seed.py`**, verified onboarding geocode/onboard route mapping, moved stakeholder nav rows to Pass, and moved imported scenario specs from Open to truthful Partial traceability. |
| 2026-05-15 | IA registry + pilot + IA-U5 chips | Cursor agent | **§1–2 / IA-U5–U6 / PD-3:** Earlier residual pass used provider tab-2 label **`Inventory`**; this was superseded by the **Provider Projects IA correction** row above. **Mobile financier Discover** + **resident Energy** gained **`PilotBanner`** (PILOT_SCOPE §2–3); financier/provider **ActionRail** chips became **non-pressable** (`View`, `accessibilityRole="text"`) to avoid non-working controls. |
| 2026-05-15 | FM-1 HTTP + homeowner stakeholder OR | Cursor agent | **§6 FM-1 Pass:** `GET /drs/{building_id}` uses **`project_building`** + **`building_drs.resolve_project_dict_for_drs`** (demo UUID map + synthetic fallback). Homeowner **stakeholder readiness**: critical gate and checklist both use **`stakeholdersVetted` OR (certified lead electrician AND verified supplier quote)** in TS + Python. **`app/data/seed_uuids.py`** shared with **`scripts/seed.py`**. Tests: **`test_drs`** resolver + OR parity; **`test_api`** canonical payload (skip if DB empty). |
| 2026-05-15 | FM parity (services) | Cursor agent | **§6 FM:** Closed projector/LBRS/settlement/payback/consistency gaps vs `packages/shared` — `drs.py` (homeowner + checklist), `lbrs.py` (weighted checklist + failure metadata), `projector.py` (checklist gates, homeowner royalty, `siteKind`), `settlement.py` **`phase`**, `payback.py` **2dp**, new `consistency.py`; tests: `test_lbrs.py`, extended `test_drs.py` / `test_settlement.py`, demo audit. *(FM-1 HTTP gap closed in the **FM-1 HTTP + homeowner stakeholder OR** row above.)* §7 CI counts refreshed (23 backend tests at that time). |
| 2026-05-15 | Compliance merge | Cursor agent | Merged [compliance-partial/ci-run.md](./compliance-partial/ci-run.md), [fm-audit.md](./compliance-partial/fm-audit.md), and [ia-audit.md](./compliance-partial/ia-audit.md) into this checklist: §6 FM statuses reconciled to stricter audit (FM-1 Partial; FM-2/FM-5 Gap; FM-3/4 notes expanded); §1 IA-U5/U6/U10 Notes deepened; §7 CI table aligned to ci-run transcript + single `audit:shared` row; §0 pointer to `compliance-partial/`; gaps summary updated for FM follow-ups and IA-U6 nuances. |
| 2026-05-15 | Compliance pass | Cursor agent | §7 CI: typecheck, lint, build, `test:shared`, `test:backend`, `audit:shared` all Pass (2026-05-15). §6 FM quick callouts (later tightened in FM partial audit → **Compliance merge** row). IA-U10: section parity audit Pass + registry order; surfaces still differ on embedded/API data. IA-U5: Partial (grep spot-check). IA-U6: Partial, wording aligned to PILOT_SCOPE (banner vs energy charts). |
| 2026-05-15 | Gap closure | Cursor agent | IA-U4 first-tab routes; mobile share-gated generation (resident + provider); ON-3 admin body 403; SEC-2 login copy; RoleGuard homeowner home path; RoleDashboardScaffold route fixes. |
| 2026-05-15 | Initial matrix | Cursor agent | Created checklist; recorded known gaps (IA-U4, IA-U9, ON-3, SEC-2, strict IA-U6). |

---

### Gaps summary (fix-first candidates)

1. ~~**IA-U4:** Align `role-select` success routes with **first tab** for financier & electrician.~~ **Done (2026-05-15).**
2. ~~**IA-U9:** Align **mobile** resident & provider Energy/Generation with share-gating rules (match web `GenerationPanel` behavior).~~ **Done (2026-05-15):** shared `generationVisibilityForRole()` now drives resident/provider detail gating on mobile and web; owner/homeowner site-authority visibility is explicit.
3. ~~**ON-3:** Implement or reword IA §8.5 gate 2 so it matches the real `OnboardingCompleteBody` contract.~~ **Done:** optional `role` + 403.
4. ~~**SEC-2:** Soften or reframe website login helper copy about admin test accounts.~~ **Done.**
5. ~~**IA-U6 vs PILOT:** Persistent pilot treatment on pledge/synthetic surfaces (see PILOT_SCOPE §2–3): **mobile financier Discover** + **resident Energy** now include screen-level `PilotBanner`; web `PortalShell` unchanged. **Residual:** other immersive-only stacks — spot-check banner parity.~~ **Done (2026-05-15 residual pass):** `audit:shared` checks mobile/web/cockpit/immersive/shared labels; immersive project heroes now carry `Pilot · ...` labels.
6. ~~**§6 FM — HTTP DRS read:** Wire **`GET /drs/{building_id}`** to **`calculate_drs`** / building projector inputs~~ **Done (2026-05-15):** `api/drs.py` delegates to **`project_building`** via **`resolve_project_dict_for_drs`**.
7. ~~**IA-U5 / IA-U6 / IA-U10 residual:** Full-repo interaction QA, exhaustive synthetic-badge audit, and exact mobile-web data-path equivalence remain intentionally Partial; close only with a dedicated UI audit or automated checks.~~ **Done (2026-05-15 residual pass):** automated UI compliance audit now runs in `npm run audit:shared`; scenario-operation gaps remain tracked in §8.

When a gap closes, move its row to **Pass** and add an entry to **§10**.

---

## 11. Deployment & ops readiness (ship track)

Sections **1–10** cover spec, IA, formulas, and CI quality gates. They do **not** imply an environment is safe for staged pilot or production (billing, measured energy, financier compliance, observability, runbooks).

For **maturity tiers**, a cross-cutting **readiness matrix**, and a **deployment gap log** with explicit blocker semantics, see **[DEPLOYMENT_AND_READINESS.md](./DEPLOYMENT_AND_READINESS.md)**.
