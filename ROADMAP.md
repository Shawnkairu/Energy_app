# e.mappa — Full-Stack Build Roadmap

> This document is the single source of truth for any coding agent (Cursor, Claude Code, Codex) working on e.mappa. Follow the steps in order. Do not skip ahead. Each step has acceptance benchmarks — do not mark a step complete until every benchmark passes. If you are unsure about a design decision, refer to the Core Rules section.

> **Canonical product model:** [docs/imported-specs/](docs/imported-specs/README.md) + [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). DRS/LBRS use **critical-gate completion** (not 80% score). Public role is **electrician** (not installer). Settlement is from **E_sold** only.

> **Pilot mode (READ THIS FIRST):** [docs/PILOT_SCOPE.md](docs/PILOT_SCOPE.md) is the authoritative scope for the current pilot release and overrides any conflicting guidance below. The pilot uses **email OTP** (no SMS), **pledge mode** (no real money / no M-Pesa), and **synthesized solar generation, load, and irradiance** plus **owner-traced roof polygons** (no on-site meters, no Google Solar API). Long-term doctrine in the Core Rules is preserved; pilot carve-outs are temporary with explicit exit criteria.

> **Deployment maturity (ship/ops vs spec/IA):** [docs/DEPLOYMENT_AND_READINESS.md](docs/DEPLOYMENT_AND_READINESS.md) defines tiers (local prototype → synthetic demo → staged pilot → production), a readiness matrix, and a gap log — complementary to [docs/SPEC_COMPLIANCE_CHECKLIST.md](docs/SPEC_COMPLIANCE_CHECKLIST.md).

## North Star

e.mappa must become the **No. 1 trusted energy app in the world**. Every product, engineering, data, AI, security, and operations decision must make the system more truthful, auditable, queryable, permissioned, financially reconciled, and worthy of stakeholder trust.

Trust is not a marketing claim. Trust means:
- Every kWh, shilling, DRS score, ownership percentage, prepaid commitment, settlement split, payout, blocker, and agent recommendation is traceable to source data.
- Every material decision can be explained to the correct stakeholder without exposing private counterparty finances.
- Every AI action is grounded in tools, permissioned data, evals, audit logs, and human approval where risk demands it.
- Every workflow preserves the product doctrine: prepaid only, DRS gates deployment, monetized solar only, ownership controls future cashflows, and settlement reconciles to 100%.

---

## Agent System Prompt

Paste this at the top of your agent session before starting work:

```
You are building e.mappa, a mobile-first operating system for building-level energy economies in Kenya. You are working inside a TypeScript/React Native monorepo.

CORE RULES — these are inviolable business constraints:
0. TRUST FIRST: e.mappa must become the No. 1 trusted energy app in the world. Never ship work that weakens truth, auditability, financial reconciliation, privacy, security, or stakeholder confidence.
1. PREPAID ONLY: No prepaid cash committed → no solar allocation → no payout. Every flow must enforce this.
2. DRS GATES EVERYTHING: Deployment Readiness Score must approve before funding release, hardware scheduling, or go-live.
3. MONETIZED SOLAR ONLY: Payouts come from energy that was actually sold to residents (E_sold), never from generated, wasted, curtailed, or free-exported energy.
4. OWNERSHIP = FUTURE CASHFLOWS: Selling shares reduces the seller's future payout proportionally. The ownership ledger must always total 100%.
5. SETTLEMENT WATERFALL: Revenue splits must total 100% (reserve + providers + financiers + owner + emappa). Zero unallocated.

ARCHITECTURE RULES:
- All business logic lives in packages/shared. Frontend never re-implements formulas.
- The api-client package abstracts backend vs mock. When baseUrl is set, it fetches from the real API. When null, it uses local mock data. This boundary must be preserved.
- The backend is FastAPI + PostgreSQL. It must serve the exact same data contract that the mock api-client produces.
- Mobile is Expo Router with role-based tab layouts. Each stakeholder role gets its own (role)/ directory.
- Dark-first UI. Design tokens live in packages/ui/src/tokens.ts. Never hardcode colors.

AI-NATIVE TRUST RULES:
- e.mappa must be queryable by humans and agents through permissioned APIs, event logs, and tool contracts, not ad hoc database access.
- Agents may recommend, explain, triage, draft, or route; high-risk actions require explicit policy gates and human approval.
- Every agent answer must cite the tool outputs or records it used. No hallucinated building, financial, ownership, or energy numbers.
- Every agent must have evals before it is treated as production-capable.
- Security, code review, ticket routing, DRS analysis, anomaly detection, stakeholder support, and incident triage are first-class agent workflows, not future afterthoughts.

ITERATION RULES:
- After each step, run the relevant benchmark commands listed in ROADMAP.md.
- If a benchmark fails, fix it before moving to the next step.
- Commit after each passing benchmark set with a message referencing the step number.
- When writing backend code, always write the corresponding test.
- When adding an API endpoint, always update the api-client to use it when baseUrl is configured.
```

---

## Codebase Map (Current State)

```
emappa/
├── mobile/                     # Expo 54 + Expo Router 6, React Native 0.81
│   ├── app/
│   │   ├── index.tsx           # Landing screen — "Sign in to choose your role"
│   │   ├── _layout.tsx         # Root Stack with role groups
│   │   ├── (auth)/
│   │   │   ├── login.tsx       # Pilot phone login (hardcoded, no real auth)
│   │   │   └── role-select.tsx # 7-role selection → routes to role home
│   │   ├── (resident)/        # Tabs: home, energy, ownership, profile
│   │   ├── (owner)/           # Tabs: home, drs, deployment, earnings
│   │   ├── (provider)/        # Tabs: home, assets, shares, earnings
│   │   ├── (financier)/       # Tabs: home, deals, deal-detail, portfolio
│   │   ├── (electrician)/      # Tabs: discover, jobs, wallet, profile
│   │   ├── (supplier)/        # Tabs: home, quote-requests, orders, profile
│   │   └── (admin)/           # Tabs: home, projects, alerts, profile
│   └── components/
│       ├── RoleScreen.tsx      # Generic role home renderer (all 7 roles)
│       ├── RoleTabs.tsx        # Shared tab bar with Ionicons
│       ├── DrsCard.tsx         # DRS score + decision pill + reasons
│       ├── EnergyFlowCard.tsx  # Solar/Battery/Grid flow visualization
│       ├── MetricCard.tsx      # Label + value metric card
│       ├── OwnershipCard.tsx   # Ownership ledger display
│       ├── PaybackCard.tsx     # Payback projection
│       └── session.ts          # Local session storage (AsyncStorage)
│
├── website/                    # Vite + React, port 5173
│   └── src/
│       ├── main.tsx            # Full marketing site + role dashboard previews
│       ├── MarketingPage.tsx   # Full public marketing page with sections
│       └── WaitlistForm.tsx    # Waitlist submission form
│
├── cockpit/                    # Vite + React, port 5174
│   └── src/
│       ├── App.tsx             # Ops command center (pipeline, alerts, settlement, gates)
│       └── stress-test/
│           └── StressTest.jsx  # Interactive settlement/payback stress tester (Recharts)
│
├── packages/
│   ├── shared/                 # ALL BUSINESS LOGIC
│   │   └── src/
│   │       ├── types.ts        # BuildingProject, EnergyInputs, DrsInputs, SettlementRates, etc.
│   │       ├── energy.ts       # calculateEnergy(), calculateSavings()
│   │       ├── settlement.ts   # calculateSettlement(), validateSettlementRates()
│   │       ├── ownership.ts    # calculateOwnershipPayouts(), transferOwnership()
│   │       ├── drs.ts          # calculateDrs(), getDrsLabel()
│   │       ├── payback.ts      # calculatePayback()
│   │       ├── projector.ts    # projectBuilding() — master projection function
│   │       ├── consistency.ts  # auditProjectConsistency(), auditAllDemoProjects()
│   │       ├── mockData.ts     # demoProjects[], roles[]
│   │       └── domain.test.ts  # Comprehensive domain logic tests
│   │
│   ├── ui/                     # Design tokens + shared React Native primitives
│   │   └── src/
│   │       ├── tokens.ts       # colors, spacing, radius, typography, shadows
│   │       └── components.tsx  # Surface, GlassCard, Label, Value, Pill
│   │
│   └── api-client/             # API abstraction layer
│       └── src/
│           └── index.ts        # getRoles, getProjects, getProject, getRoleHome, submitWaitlistLead
│
├── docs/
│   ├── PRODUCT_SPEC.md
│   ├── DRS_FORMULA.md
│   ├── USER_FLOWS.md
│   └── UI_REFERENCES.md
│
└── turbo.json, tsconfig.base.json, package.json
```

### What Exists vs What's Missing

| Layer | Exists | Missing |
|-------|--------|---------|
| Business logic | Energy, settlement, DRS, ownership, payback, projector, consistency audit | Prepaid transaction engine, time-series settlement history, event system |
| API client | Mock data path works, remote path scaffolded but no server exists | Real FastAPI backend, database, auth |
| Mobile | All 7 role home screens render, tab navigation works, DRS/Energy/Ownership cards | Real auth (OTP), prepaid commit flow, real-time data, push notifications, action buttons are cosmetic |
| Website | Full marketing page, role dashboards, waitlist form | Backend-connected waitlist, dynamic content |
| Cockpit | Command center, stress test with Recharts | Real data, CRUD operations, DRS queue, settlement monitor |
| Backend | Nothing | Everything: FastAPI, Postgres, auth, REST API, WebSockets, agent integration |
| AI/Agents | Nothing | DRS assessment agent, onboarding agent, anomaly detection, code-review agent, eval agent, ticket-routing agent, security-triage agent, query assistant |
| Infrastructure | Dev-only local setup | Deployment, CI/CD, monitoring, error tracking |

---

## Step 0: Pre-flight Checks

Before writing any code, verify the existing codebase works.

### Actions
1. Run `npm install` at the repo root
2. Run `npm run test:shared` — domain tests must pass
3. Run `npm run typecheck` — zero type errors across all workspaces
4. Run `npm run dev:website` — verify site loads at localhost:5173
5. Run `npm run dev:cockpit` — verify cockpit loads at localhost:5174
6. Run `npm run dev:mobile` — verify Expo starts and app renders

### Benchmarks
- [ ] `npm run test:shared` exits 0 with "Shared domain tests passed."
- [ ] `npm run typecheck` exits 0
- [ ] Website renders the marketing page with role tabs and dashboard grid
- [ ] Cockpit renders the command center with pipeline, alerts, settlement, and gates
- [ ] Mobile app shows landing screen, login navigates to role select, each role home renders data

---

## Step 1: Backend — FastAPI Server + PostgreSQL Schema

### Context
The api-client currently returns mock data from `demoProjects`. We need a real server that serves the same data shape. The api-client already has the remote path: when `baseUrl` is set, it calls `fetch(baseUrl + path)`. We just need a server at that URL.

### Actions

#### 1.1 Create the backend directory
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, CORS, lifespan
│   ├── config.py             # Settings via pydantic-settings (DATABASE_URL, etc.)
│   ├── database.py           # SQLAlchemy async engine + session
│   ├── models/               # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── building.py       # Building, EnergyConfig, SettlementConfig
│   │   ├── stakeholder.py    # User, StakeholderRole, OwnershipPosition
│   │   ├── prepaid.py        # PrepaidCommitment, PrepaidTransaction
│   │   ├── settlement.py     # SettlementRecord, PayoutRecord
│   │   └── waitlist.py       # WaitlistLead
│   ├── schemas/              # Pydantic response/request models
│   │   ├── __init__.py
│   │   ├── building.py
│   │   ├── role.py
│   │   ├── prepaid.py
│   │   ├── settlement.py
│   │   └── waitlist.py
│   ├── api/                  # Route modules
│   │   ├── __init__.py
│   │   ├── projects.py       # GET /projects, GET /projects/{id}
│   │   ├── roles.py          # GET /roles, GET /roles/{role}/home
│   │   ├── prepaid.py        # POST /prepaid/commit, GET /prepaid/{building_id}/balance
│   │   ├── settlement.py     # POST /settlement/run, GET /settlement/{building_id}/history
│   │   ├── drs.py            # GET /drs/{building_id}, POST /drs/{building_id}/assess
│   │   ├── waitlist.py       # POST /waitlist
│   │   └── health.py         # GET /health
│   ├── services/             # Business logic (mirrors packages/shared)
│   │   ├── __init__.py
│   │   ├── energy.py         # Port of calculateEnergy
│   │   ├── settlement.py     # Port of calculateSettlement
│   │   ├── drs.py            # Port of calculateDrs
│   │   ├── ownership.py      # Port of calculateOwnershipPayouts
│   │   ├── projector.py      # Port of projectBuilding
│   │   └── prepaid.py        # Prepaid commitment state machine
│   └── agents/               # AI agent integrations
│       ├── __init__.py
│       ├── drs_agent.py      # DRS assessment agent (Claude tool-use)
│       └── tools.py          # Agent tool definitions
├── migrations/               # Alembic migrations
├── tests/
│   ├── test_energy.py
│   ├── test_settlement.py
│   ├── test_drs.py
│   ├── test_api.py
│   └── conftest.py
├── seed.py                   # Seed DB with demoProjects data
├── requirements.txt
├── alembic.ini
└── Dockerfile
```

#### 1.2 Database schema design

Design these tables:

**buildings** — Core building entity
- `id` (UUID, PK)
- `name` (VARCHAR)
- `location_band` (VARCHAR)
- `units` (INTEGER) — number of apartments
- `stage` (ENUM: lead, inspection, pre_onboarding, review, funding, supplier, install, verification, live, blocked)
- `created_at`, `updated_at` (TIMESTAMPTZ)

**energy_configs** — One per building
- `building_id` (FK → buildings)
- `array_kw`, `peak_sun_hours`, `system_efficiency`
- `battery_kwh`, `battery_dod`, `battery_rte`
- `monthly_demand_kwh`, `daytime_demand_fraction`
- `solar_price_kes`, `grid_price_kes`

**settlement_configs** — One per building
- `building_id` (FK → buildings)
- `reserve_rate`, `provider_rate`, `financier_rate`, `owner_rate`, `emappa_rate`
- Constraint: all rates must sum to 1.0

**drs_configs** — One per building (the boolean/numeric gate inputs)
- `building_id` (FK → buildings)
- All fields from `DrsInputs` type

**ownership_positions** — Many per building
- `id` (UUID, PK)
- `building_id` (FK → buildings)
- `pool` (ENUM: provider, financier)
- `owner_id` (VARCHAR)
- `owner_role` (ENUM: StakeholderRole values)
- `percentage` (DECIMAL, 0-1)
- Constraint: sum of percentages per building+pool must equal 1.0

**prepaid_commitments** — Many per building
- `id` (UUID, PK)
- `building_id` (FK → buildings)
- `resident_id` (VARCHAR)
- `amount_kes` (DECIMAL)
- `status` (ENUM: pending, confirmed, allocated, refunded)
- `created_at` (TIMESTAMPTZ)

**settlement_records** — Monthly settlement snapshots
- `id` (UUID, PK)
- `building_id` (FK → buildings)
- `period_start`, `period_end` (DATE)
- `e_sold_kwh` (DECIMAL)
- `revenue_kes` (DECIMAL)
- `reserve_kes`, `provider_pool_kes`, `financier_pool_kes`, `owner_royalty_kes`, `emappa_fee_kes`
- `created_at` (TIMESTAMPTZ)

**waitlist_leads** — Waitlist submissions
- `id` (UUID, PK)
- `role` (VARCHAR)
- `phone` (VARCHAR)
- `neighborhood` (VARCHAR)
- `created_at` (TIMESTAMPTZ)

**users** — Minimal auth for pilot
- `id` (UUID, PK)
- `phone` (VARCHAR, unique)
- `role` (ENUM: StakeholderRole)
- `building_id` (FK → buildings, nullable)
- `created_at` (TIMESTAMPTZ)

#### 1.3 Port business logic to Python

The Python services must produce **identical outputs** to the TypeScript `packages/shared` functions. This is critical. The way to verify is:

1. Take the `demoProjects` data from `packages/shared/src/mockData.ts`
2. Feed the same inputs into both TypeScript and Python
3. Assert outputs match within floating-point tolerance (0.01)

Port these functions:
- `calculateEnergy(inputs)` → identical `EnergyOutputs`
- `calculateSettlement(eSold, price, rates)` → identical `SettlementOutputs`
- `calculateDrs(inputs)` → identical `DrsResult`
- `calculateOwnershipPayouts(pool, positions)` → identical `OwnershipPayout[]`
- `calculatePayback(inputs)` → identical `PaybackResult`
- `projectBuilding(project)` → identical `ProjectedBuilding`

#### 1.4 Implement API endpoints

These must match the exact contract the api-client expects:

| Method | Path | Response Shape | Notes |
|--------|------|---------------|-------|
| GET | `/roles` | `Array<{id, label, promise}>` | Static list of 7 roles |
| GET | `/projects` | `ProjectedBuilding[]` | Run projector on each building |
| GET | `/projects/{id}` | `ProjectedBuilding` | Single building projection |
| GET | `/roles/{role}/home` | `RoleHome` | Primary building + projects + activity feed |
| POST | `/waitlist` | `WaitlistSubmission` | Persist lead to DB |
| GET | `/health` | `{status: "ok", db: "connected"}` | Health check |

#### 1.5 Seed the database

Create `seed.py` that inserts the two demo projects (Nyeri Ridge A, Karatina Court) with all their associated data. After seeding:
- `GET /projects` must return the same projected data as the mock path
- `GET /roles/resident/home` must return data matching mock output

### Benchmarks
- [ ] `docker compose up` starts Postgres + FastAPI without errors
- [ ] `GET /health` returns `{"status": "ok", "db": "connected"}`
- [ ] `GET /projects` returns 2 buildings with all projected fields
- [ ] `GET /projects/nyeri-ridge-a` returns the full ProjectedBuilding shape
- [ ] `GET /roles/resident/home` returns RoleHome with primary building data
- [ ] `POST /waitlist` with `{role, phone, neighborhood}` persists and returns the lead
- [ ] Python test: `calculateEnergy` output matches TypeScript output for Nyeri Ridge A inputs (tolerance 0.01)
- [ ] Python test: `calculateDrs` output matches TypeScript output for both demo projects
- [ ] Python test: `calculateSettlement` waterfall sums to revenue (zero unallocated)
- [ ] Python test: `projectBuilding` roleViews match TypeScript output for all 7 roles
- [ ] All backend tests pass: `pytest tests/ -v` exits 0
- [ ] `npm run test:shared` still passes (no regressions in shared package)

---

## Step 2: Connect Frontend to Backend

### Context
The api-client already supports remote mode. When `configureApiClient({ baseUrl: "http://localhost:8000" })` is called, all functions make real HTTP requests. We need to wire this up.

### Actions

#### 2.1 Configure api-client base URL
- In `mobile/app/_layout.tsx`, add: `configureApiClient({ baseUrl: process.env.EXPO_PUBLIC_API_URL || null })`
- In `website/src/main.tsx`, add: `configureApiClient({ baseUrl: import.meta.env.VITE_API_URL || null })`
- In `cockpit/src/App.tsx`, add: `configureApiClient({ baseUrl: import.meta.env.VITE_API_URL || null })`
- Create `.env` files with `API_URL=http://localhost:8000`

#### 2.2 Add error handling to api-client
- Wrap remote calls in try/catch
- On network error, fall back to mock data with a console warning
- Add loading states and error states to all screens that call the API

#### 2.3 Verify data parity
- Start the backend with seeded data
- Start each frontend with `API_URL` set
- Visually confirm every screen renders identically to mock mode

### Benchmarks
- [ ] `getApiMode()` returns `"api"` when `VITE_API_URL` / `EXPO_PUBLIC_API_URL` is set
- [ ] `getApiMode()` returns `"mock"` when env vars are unset
- [ ] Website renders all role dashboards with real API data (visual match to mock)
- [ ] Cockpit command center shows real pipeline, settlement, and gate data
- [ ] Mobile app: all 7 role home screens render with real data
- [ ] When backend is stopped, frontends gracefully fall back to mock data
- [ ] No TypeScript errors: `npm run typecheck` exits 0
- [ ] Console shows no unhandled promise rejections

---

## Step 3: Authentication (Pilot Email OTP Flow)

### Context
Currently login is hardcoded. For the pilot, we use **email-based OTP** — no SMS, no carrier dependencies. Backend generates a 6-digit code with a 10-minute TTL and sends it via a transactional email provider (Resend by default; AWS SES fallback). Phone/SMS OTP is deferred until carrier sender ID approval — see [docs/PILOT_SCOPE.md §1](docs/PILOT_SCOPE.md).

### Actions

#### 3.1 Backend auth endpoints
- `POST /auth/request-otp` — accepts `{email}`, generates 6-digit code, stores in Redis/DB with 10-min TTL, sends via Resend (or logs to console in dev)
- `POST /auth/verify-otp` — accepts `{email, code}`, validates, returns `{token, user}` with JWT
- `GET /auth/me` — returns current user from JWT
- Middleware: protect all endpoints except `/auth/*`, `/health`, `/waitlist`, `/roles` (public)

#### 3.2 Mobile auth flow
- Replace hardcoded login with real **email** input + OTP input screen
- Store JWT in SecureStore (expo-secure-store)
- Add auth context provider that wraps the app
- On app launch: check stored token → if valid, skip login → go to role select
- Role select should either use the user's stored role or let them pick

#### 3.3 Backend: user-building association
- When a user authenticates, their `building_id` and `role` determine what data they see
- `GET /roles/{role}/home` should filter projects to the user's building
- For the pilot, a user can be associated with a building via seed data

### Benchmarks
- [ ] `POST /auth/request-otp` with valid email returns 200 and sends code (or logs in dev)
- [ ] `POST /auth/verify-otp` with correct code returns JWT token
- [ ] `POST /auth/verify-otp` with wrong code returns 401
- [ ] `POST /auth/verify-otp` with expired code returns 401
- [ ] Rate limit: same email cannot request more than 3 codes within 10 minutes
- [ ] Protected endpoints return 401 without token
- [ ] Protected endpoints return 200 with valid token
- [ ] Mobile: user can enter email, receive code by email, enter code, reach role select
- [ ] Mobile: app remembers session across restarts (SecureStore)
- [ ] Mobile: logout clears token and returns to login screen

### Deferred (post-pilot)
- SMS OTP via Africa's Talking or Twilio (requires Safaricom sender ID approval)
- Phone-as-primary-identifier; phone moves to optional secondary contact

---

## Step 4: Pledge Flow (End-to-End, Pilot Mode)

### Context
This is the first real user flow. A resident opens the app, sees their building, and **pledges** a non-binding KES amount toward solar. The pledge affects the building's DRS score and settlement projections exactly as prepaid would, but no money moves. M-Pesa, payouts, and reconciliation are deferred until post-pilot — see [docs/PILOT_SCOPE.md §2](docs/PILOT_SCOPE.md).

### Actions

#### 4.1 Backend: pledge endpoints
- `POST /prepaid/commit` — accepts `{building_id, amount_kes}`, creates commitment with `payment_method='pledge'`, `status='confirmed'` immediately (no two-step confirm needed in pilot mode)
- `GET /prepaid/{building_id}/balance` — returns total confirmed pledges for the building
- `GET /prepaid/{building_id}/history` — returns list of all pledges with status

The `prepaid_commitments` table gains a `payment_method` column with values `'pledge'` (pilot) or `'mpesa'` (post-pilot). Settlement and DRS treat both identically; only the resident UI differs.

#### 4.2 Backend: pledges affect projections
- When pledged total changes, the building's DRS score must be recalculated
- The projector must use the updated pledged total in place of prepaid
- Settlement runs in **simulation mode** (`settlement_period.simulation=true`) and never produces a payout instruction

#### 4.3 Mobile: pledge screen
- Screen in `(resident)/` tab group: **"Pledge solar"** (renamed from "Top up")
- Input: amount in KES (preset chips: 500, 1000, 2000, 5000)
- Confirmation screen showing: amount, projected solar allocation, expected savings
- Persistent banner: *"Pilot: pledges are non-binding and no money is charged."*
- After submit: navigate back to home, home screen shows updated **pledged balance**
- The action button in the resident action rail must navigate here and read **"Pledge solar"**

#### 4.4 Mobile: pledged balance display
- Resident home screen shows real pledged balance from API, labeled *"pledged, not charged"*
- Show pledge history (list with status pills)
- Show projected solar allocation based on pledged amount

### Benchmarks
- [ ] `POST /prepaid/commit` creates a pledge with `payment_method='pledge'`, `status='confirmed'`
- [ ] `GET /prepaid/{building_id}/balance` returns correct sum of confirmed pledges
- [ ] After a new pledge, `GET /projects/{building_id}` shows updated total
- [ ] After a new pledge, DRS score recalculates
- [ ] Settlement runs against pledged building and tags `simulation=true`
- [ ] Mobile: resident can tap "Pledge solar" → see amount input → confirm → see updated balance
- [ ] Mobile: pilot banner appears on every pledge / wallet screen
- [ ] Mobile: no UI string says "charge", "pay", or "top up" in pilot mode
- [ ] Mobile: home screen hero metric updates after new pledge
- [ ] Domain test: pledge of 0 KES is rejected (400)
- [ ] Domain test: pledge for non-existent building returns 404

### Deferred (post-pilot)
- M-Pesa Daraja STK push, paybill, callback handling
- Two-step pending → confirmed flow gated on real cash receipt
- Refunds, partial commitments, dispute flows
- Payout instructions to provider/financier/owner wallets

---

## Step 4.5: Synthetic Energy Data (Pilot Mode)

### Context
The pilot ships with no on-site meters. Solar generation, load profiles, and irradiance are synthesized server-side from public APIs and treated as the canonical source. Every chart fed by synthetic data must be tagged so we never confuse pilot demos with measured truth. See [docs/PILOT_SCOPE.md §3](docs/PILOT_SCOPE.md).

### Actions

#### 4.5.1 Shared types
- Add `source: 'synthetic' | 'measured'` and `provenance: string` to the `EnergyReading` type in `packages/shared`
- Add a new `EnergyDataSource` enum to `Building`: `'synthetic' | 'measured' | 'mixed'`

#### 4.5.2 Backend: external integrations
- **NREL PVWatts v8** for hourly AC generation per array (free, no key needed). Cache TMY output per `(lat, lon, kw, tilt, azimuth)` for 90 days.
- **NASA POWER** for historical irradiance back-fill (free, no key). Hourly `ALLSKY_SFC_SW_DWN`.
- **Open-Meteo Solar Radiation** for live "today's sun" UI cards (free, no key, no signup). Cache per lat/lon for 30 minutes.
- Wrap each provider behind a `SolarDataAdapter` interface so a real meter feed can replace it post-pilot.

#### 4.5.3 Backend: load profile generator
- Lift the four resident archetypes (`basic_lighting`, `lighting_tv`, `emerging_appliance`, `microbiz_kiosk`) from `Simulation/files/customers.py` into `packages/shared`
- Each archetype has a 24-hour shape vector with daily total randomized at σ=15%
- Building load = sum of resident loads
- Seed deterministically per resident_id so simulations are reproducible

#### 4.5.4 Cockpit + mobile: source tagging
- Every chart fed by synthetic data renders a small **"synthetic"** badge
- Cockpit gains a global toggle: hide synthetic / show synthetic / show both
- Admin home shows `data_source` distribution across the portfolio

### Benchmarks
- [ ] PVWatts integration returns 8,760 hourly kWh values for a sample Nairobi building within 2 seconds (cold) and ms (cached)
- [ ] NASA POWER returns daily irradiance for any Kenyan lat/lon for the last 365 days
- [ ] Open-Meteo returns today's hourly shortwave radiation for any building on demand
- [ ] Resident load profile generator produces deterministic 24h vectors per resident_id
- [ ] All synthetic readings are tagged `source='synthetic'` and carry a non-empty `provenance` string
- [ ] Cockpit "synthetic" badge renders on every chart fed by synthetic streams
- [ ] Settlement run on synthetic data tags `data_source='synthetic'` on the resulting `SettlementPeriod`
- [ ] Domain test: replacing the `SolarDataAdapter` with a stub returns identical projector output (interface integrity)

### Deferred (post-pilot)
- On-site IoT meter ingestion (Modbus / MQTT / Helium)
- Solcast or commercial irradiance APIs for higher-resolution forecasts
- Reconciliation between synthetic projection and measured truth (requires hardware first)

---

## Step 5.5: Roof Footprint Capture (Pilot Mode)

### Context
Building owners list a building by drawing or confirming the roof polygon. Roof area in m² constrains maximum array kWp at design time, feeds DRS scoring, and renders a credible roof outline on the building card. **Google Solar API does not cover Kenya** — we use a three-tier waterfall instead. See [docs/PILOT_SCOPE.md §4](docs/PILOT_SCOPE.md).

### Actions

#### 5.5.1 Schema
Add to `buildings` table:
- `roof_area_m2 numeric`
- `roof_polygon_geojson jsonb`
- `roof_source text` — `'microsoft_footprints' | 'owner_traced' | 'owner_typed'`
- `roof_confidence numeric` — 0..1, used in DRS

#### 5.5.2 Backend: footprint suggester
- Geocode the address → query **Microsoft GlobalMLBuildingFootprints** (open dataset, CC BY 4.0, includes Africa) → return suggested polygon with confidence
- Cache by `(lat, lon)` rounded to 5 decimal places

#### 5.5.3 Mobile: owner roof capture flow (in `list-building` screen)
1. Owner enters address → app shows suggested polygon over satellite tile (Google Maps Static API or Mapbox Static)
2. Owner taps **"Looks right"** → `roof_source='microsoft_footprints'`
3. Or taps **"Let me redraw"** → owner taps roof corners → `roof_source='owner_traced'`
4. If imagery fails / no connectivity → manual sqm entry → `roof_source='owner_typed'`
5. App computes area client-side via shoelace formula on Web Mercator coordinates corrected for latitude

#### 5.5.4 DRS integration
- DRS score uses `roof_area_m2` to validate that proposed array kWp fits within the rooftop budget (5.5 m²/kWp default for residential modules)
- `roof_confidence < 0.6` adds a soft blocker until electrician site visit verifies

### Benchmarks
- [ ] Microsoft footprints fetch returns a polygon for a known Nairobi address within 3 seconds
- [ ] Owner can tap roof corners on a satellite tile and the polygon closes correctly
- [ ] Shoelace area calculation matches a known reference polygon within ±2%
- [ ] All three `roof_source` values are accepted by the API
- [ ] DRS surfaces a blocker if proposed array kWp exceeds rooftop budget
- [ ] Cockpit building card renders the roof polygon overlay

### Deferred (post-pilot)
- **Google Solar API** for automatic roof segmentation, tilt, azimuth, shade analysis (integrate when Kenya appears on Google's coverage list)
- LiDAR / drone surveys for premium buildings
- Automated roof condition / age detection

---

## Step 5: DRS Qualification Flow

### Context
DRS gates every deployment decision. Building owners and admins need to see the live DRS score, understand what's blocking deployment, and take action on blockers.

### Actions

#### 5.1 Backend: DRS endpoints
- `GET /drs/{building_id}` — returns current DRS result (score, decision, reasons, components)
- `GET /drs/{building_id}/history` — returns DRS snapshots over time
- `POST /drs/{building_id}/update` — admin can update boolean gates (e.g., mark electrician certified)

#### 5.2 Backend: DRS recalculation triggers
- DRS must recalculate when: prepaid changes, ownership changes, gate booleans change, energy config changes
- Store DRS snapshots with timestamps for audit trail

#### 5.3 Mobile: DRS views per role
- **Owner**: DRS card (already exists) + gate list (already exists) + ability to see what's blocking and share with stakeholders
- **Admin**: DRS card + ability to toggle boolean gates (mark electrician certified, verify supplier quote, etc.)
- **Electrician**: sees their specific gates (certified lead electrician, installation readiness)
- The action buttons "View DRS", "Review DRS" must navigate to a detail screen

#### 5.4 Mobile: DRS detail screen
- Full breakdown of all 6 weighted components with bar visualization
- List of all kill switches with status (resolved/unresolved)
- History chart showing DRS score over time (if history exists)

### Benchmarks
- [ ] `GET /drs/{building_id}` returns DRS result matching shared logic output
- [ ] `POST /drs/{building_id}/update` with `{hasCertifiedLeadElectrician: true}` updates the gate and recalculates DRS
- [ ] DRS recalculates automatically when prepaid commitment changes
- [ ] DRS history endpoint returns snapshots sorted by date
- [ ] Mobile owner: DRS card shows correct score, decision, and reasons
- [ ] Mobile admin: can toggle gates and see DRS update
- [ ] Mobile: DRS detail screen shows all 6 components with correct weights
- [ ] Domain test: toggling all critical gates from false to true yields `deployment_ready` (display score is informational only)

---

## Step 6: Settlement Engine

### Context
Settlement is emappa's financial core. It takes energy allocation records for a period and produces the waterfall payout. Only monetized solar (E_sold) generates revenue.

### Actions

#### 6.1 Backend: settlement service
- `run_settlement(building_id, period_start, period_end)`:
  1. Calculate energy for the period using building's energy config
  2. Calculate settlement from E_sold × solar_price
  3. Apply waterfall: reserve → providers → financiers → owner → emappa
  4. Calculate individual payouts via ownership positions
  5. Store the settlement record
  6. Return the full breakdown

#### 6.2 Backend: settlement endpoints
- `POST /settlement/run` — trigger settlement for a building and period
- `GET /settlement/{building_id}/history` — list of settlement records
- `GET /settlement/{building_id}/latest` — most recent settlement
- `GET /settlement/{building_id}/waterfall` — current waterfall configuration + projected monthly

#### 6.3 Backend: settlement validation
- Settlement must fail if: prepaid balance is zero, settlement rates don't sum to 1.0, building stage is not "live"
- Settlement records must be immutable once created (audit requirement)
- Waterfall must reconcile: sum of all pools = revenue (within 0.01 KES tolerance)

#### 6.4 Mobile: settlement views
- **Resident**: monthly savings card, solar usage vs grid fallback
- **Owner**: monthly royalty, comparable building benchmark
- **Provider**: monetized vs generated kWh, provider pool payout
- **Financier**: monthly recovery, remaining capital, payback timeline
- All settlement data must come from the real API, not mock projections

#### 6.5 Cockpit: settlement monitor
- Real settlement health status per building
- Waterfall integrity check (visual indicator if rates don't balance)
- Historical settlement chart (revenue over time)

### Benchmarks
- [ ] `POST /settlement/run` for a "live" building produces a valid settlement record
- [ ] `POST /settlement/run` for a non-live building returns 400 with clear error
- [ ] `POST /settlement/run` for a building with 0 prepaid returns 400
- [ ] Settlement waterfall reconciles: `reserve + provider + financier + owner + emappa = revenue` (tolerance 0.01)
- [ ] Individual provider payouts sum to provider pool (tolerance 0.01)
- [ ] Individual financier payouts sum to financier pool (tolerance 0.01)
- [ ] Settlement records are immutable (PUT/DELETE returns 405)
- [ ] `GET /settlement/{id}/history` returns records sorted by period descending
- [ ] Mobile: each role sees their correct settlement-derived metrics
- [ ] Cockpit: settlement monitor shows real data for all buildings
- [ ] Python test: settlement output matches TypeScript `calculateSettlement` for same inputs

---

## Step 7: Ownership & Share Transfer

### Context
Providers can sell ownership shares to residents. This affects future payout distribution. The ledger must always total 100%.

### Actions

#### 7.1 Backend: ownership endpoints
- `GET /ownership/{building_id}/{pool}` — returns current ownership positions for provider or financier pool
- `POST /ownership/{building_id}/transfer` — transfer shares between parties
  - Input: `{pool, from_owner_id, to_owner_id, to_owner_role, percentage}`
  - Validates: sender has enough shares, percentage > 0, resulting ledger sums to 1.0

#### 7.2 Mobile: ownership screens
- **Resident**: "Buy shares" action → screen showing available provider shares, purchase flow
- **Provider**: "Sell shares" action → screen showing current ownership, transfer flow
- Both roles: ownership ledger card showing all positions and payouts

#### 7.3 Ownership change triggers
- After ownership transfer, recalculate projected payouts
- Update the relevant role views in the projector output

### Benchmarks
- [ ] `POST /ownership/transfer` succeeds and produces correct ledger (sums to 1.0)
- [ ] Transfer of more shares than owned returns 400
- [ ] Transfer of 0% returns 400
- [ ] After transfer, `GET /projects/{id}` shows updated ownership positions
- [ ] After transfer, provider's monthly payout decreases proportionally
- [ ] After transfer, resident's ownership card shows new position
- [ ] Mobile: "Buy shares" flow works end-to-end
- [ ] Mobile: "Sell shares" flow works end-to-end

---

## Step 8: AI Agent — DRS Assessment

### Context
This is the harness engineering piece. Build a Claude-powered agent that assesses building deployment readiness using structured tool calls.

This step is the first agent, not the whole AI-native architecture. e.mappa must eventually support production-grade agents for DRS analysis, stakeholder onboarding, anomaly detection, code review, eval generation, ticket routing, security triage, incident response, and trusted data querying. Each agent must operate through typed tools, role permissions, audit logs, and eval gates.

### Actions

#### 8.1 Agent architecture
- Use the Anthropic Python SDK with tool-use
- Define tools that the agent can call:
  - `get_building_data(building_id)` — fetches building + energy config + DRS config
  - `get_prepaid_status(building_id)` — fetches prepaid commitment totals
  - `get_ownership_summary(building_id)` — fetches ownership positions
  - `get_settlement_projection(building_id)` — runs a projected settlement
  - `calculate_drs(building_id)` — runs the DRS formula and returns result
  - `get_comparable_buildings(location_band)` — finds similar buildings for benchmarking
- Agent system prompt should explain: emappa's model, what DRS means, the kill switch system, and that it should assess with reasoning

#### 8.2 Agent endpoint
- `POST /drs/{building_id}/assess` — triggers the agent assessment
  - Returns: `{score, decision, analysis, recommendations, tool_calls_made}`
  - The agent should explain WHY the score is what it is, referencing specific data
  - The agent should recommend actions to improve the score

#### 8.3 Agent evaluation harness
- Create `backend/evals/drs_agent_eval.py`
- Test cases:
  - Building with all gates passing → agent should recommend approval
  - Building with low utilization → agent should flag demand risk
  - Building with no prepaid → agent should flag prepaid requirement
  - Building with missing electrician → agent should flag electrician gate
- Each eval checks: did the agent call the right tools? Did it reach the right conclusion? Did it provide actionable recommendations?
- Add hallucination checks: every numeric claim in the response must match tool output or persisted data.
- Add permission checks: the agent must not reveal private counterparty finances or unauthorized building data.
- Add regression checks: previously fixed blocker cases must stay fixed across model, prompt, and tool changes.

#### 8.4 Mobile: AI assessment card
- On the DRS detail screen, add "Get AI Assessment" button
- Shows loading state while agent runs
- Displays agent's analysis and recommendations in a card
- Must clearly label as "AI assessment" (not authoritative)

### Benchmarks
- [ ] Agent correctly calls `get_building_data` and `calculate_drs` tools for every assessment
- [ ] Agent correctly identifies "approve" buildings and explains why
- [ ] Agent correctly identifies blocked buildings and lists the specific blockers
- [ ] Agent provides at least 2 actionable recommendations per assessment
- [ ] Agent response is structured: `{score, decision, analysis, recommendations}`
- [ ] Eval harness: all 4 test cases pass
- [ ] API: `POST /drs/{building_id}/assess` returns within 15 seconds
- [ ] Mobile: "Get AI Assessment" button triggers agent and displays result
- [ ] Agent never hallucinates data — all numbers match backend data

---

## Step 9: Real-Time Data & Event System

### Actions

#### 9.1 WebSocket support
- Backend: add WebSocket endpoint `/ws/{building_id}`
- Push events when: prepaid commitment confirmed, DRS recalculated, settlement completed, ownership transferred
- Event shape: `{type, building_id, data, timestamp}`

#### 9.2 Mobile: real-time updates
- When on a building's home screen, connect to WebSocket
- Update UI in real-time when events arrive (e.g., new prepaid commitment shows immediately)
- Show activity feed with real events instead of hardcoded strings

#### 9.3 Cockpit: live updates
- Connect to WebSockets for all buildings
- Update command center in real-time
- Live alert feed

### Benchmarks
- [ ] WebSocket connects and receives events
- [ ] Prepaid commitment triggers event on WebSocket
- [ ] Mobile UI updates without manual refresh after WebSocket event
- [ ] Cockpit shows live events in alert feed
- [ ] WebSocket reconnects gracefully after disconnect

---

## Step 10: Action Buttons — Wire Every Button to Real Functionality

### Context
Currently all action buttons in the mobile app (Top up, View usage, Buy shares, Start deployment, Invite residents, etc.) are cosmetic. Every button must navigate to a real screen or trigger a real action.

### Actions

#### 10.1 Resident actions
- "Top up solar" → prepaid commit screen (Step 4)
- "View usage" → energy usage detail screen (solar vs grid breakdown, monthly chart)
- "Buy shares" → ownership purchase screen (Step 7)

#### 10.2 Owner actions
- "Start deployment" → deployment request flow (submit building for DRS review)
- "Invite residents" → shareable invite link/code for residents to join the building
- "View building metrics" → detailed building analytics screen

#### 10.3 Provider actions
- "Add panels" → panel commitment flow (specify kW capacity to deploy)
- "Sell shares" → ownership transfer screen (Step 7)
- "Track payout" → payout history screen with monthly breakdown

#### 10.4 Financier actions
- "Invest in deal" → capital commitment flow (specify amount, see terms)
- "Stress test" → navigate to cockpit stress test (or embedded version)
- "Track recovery" → payback timeline with actual vs projected

#### 10.5 Electrician actions
- "Upload photos" → camera capture + photo upload for verification
- "Complete checklist" → interactive gate checklist with completion marking
- "Request parts" → BOM request form sent to suppliers

#### 10.6 Supplier actions
- "Submit quote" → quote submission form with BOM line items
- "Confirm delivery" → delivery confirmation with tracking info
- "Upload warranty" → document upload for warranty records

#### 10.7 Admin actions
- "Review DRS" → DRS detail screen with gate management
- "Pause settlement" → settlement pause action with reason
- "Resolve alert" → alert detail screen with resolution flow

### Benchmarks
- [ ] Every action button in every role's action rail navigates to a real screen or triggers a real action
- [ ] No action button shows a "coming soon" placeholder
- [ ] Each action screen has proper back navigation
- [ ] Each action that modifies data shows a confirmation step
- [ ] Each action that modifies data shows success/error feedback

---

## Step 11: Deployment & Hosting

See **[docs/DEPLOYMENT_AND_READINESS.md](docs/DEPLOYMENT_AND_READINESS.md)** for what “deployable” means per tier (demo vs pilot vs production) before treating any step below as complete.

### Actions

#### 11.1 Backend deployment
- Dockerize the FastAPI backend
- Deploy to Railway, Fly.io, or Render
- Set up managed PostgreSQL
- Configure environment variables (DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY)
- Set up health check monitoring

#### 11.2 Frontend deployment
- Website: deploy to Vercel or Netlify with VITE_API_URL pointing to production backend
- Cockpit: deploy similarly (can be same host, different route)
- Mobile: configure EAS Build for iOS and Android
- Set EXPO_PUBLIC_API_URL in EAS build profile

#### 11.3 CI/CD
- GitHub Actions workflow:
  - On PR: typecheck, test:shared, pytest, lint
  - On merge to main: deploy backend, deploy website, deploy cockpit

### Benchmarks
- [ ] Backend is accessible at a public URL
- [ ] `GET /health` returns 200 from production URL
- [ ] Website loads from production URL with real data
- [ ] Cockpit loads from production URL with real data
- [ ] Mobile can be built with EAS and connects to production API
- [ ] CI pipeline passes on a clean checkout

---

## Step 12: Polish & Demo Readiness

### Actions

#### 12.1 Error states
- All screens: show proper error UI when API fails
- All screens: show skeleton loading states instead of "Loading e.mappa..."
- All forms: show validation errors inline

#### 12.2 Empty states
- Handle: no buildings, no commitments, no settlements, no ownership
- Each empty state should guide the user to the next action

#### 12.3 Accessibility
- All interactive elements have accessible labels
- Color is not the only indicator of state (icons/text accompany color)
- Minimum touch target size of 44x44 on mobile

#### 12.4 Performance
- API responses under 200ms for read endpoints
- Mobile app starts to interactive in under 3 seconds
- No unnecessary re-renders in React components

### Benchmarks
- [ ] Every screen has a loading state, error state, and empty state
- [ ] No screen shows raw error messages to users
- [ ] All forms validate inputs before submission
- [ ] API average response time < 200ms (measure with `pytest-benchmark` or similar)
- [ ] Mobile Lighthouse audit: Performance > 80, Accessibility > 90
- [ ] Full demo walkthrough (login → commit prepaid → view DRS → see settlement → transfer shares) completes without errors

---

## Step 13: AI-Native Trust, Queryability & Operations

### Context

This step turns e.mappa from a conventional app with AI features into an AI-native, trusted energy operating system. The system must be durable in Postgres, queryable by humans and agents, defensible under audit, and safe enough for financial, energy, ownership, and deployment decisions.

### Actions

#### 13.1 Durable Postgres system of record
- Replace in-memory backend store with PostgreSQL-backed repositories for buildings, energy configs, settlement configs, DRS configs, ownership positions, prepaid commitments, settlement records, waitlist leads, users, OTPs, agent runs, tickets, audit events, and security findings.
- Add Alembic migrations for every persisted table.
- Add test database setup with isolated fixtures and rollback/cleanup between tests.
- Ensure all persisted data uses canonical IDs, timestamps, actor IDs, source IDs, and correlation IDs where applicable.
- Add database constraints for ownership ledger totals, settlement rate totals, non-negative prepaid amounts, immutable settlement records, and valid project stages.

#### 13.2 Queryable e.mappa layer
- Build a permissioned query layer that lets the app, cockpit, and agents ask structured questions without raw database access.
- Add endpoints/tools for:
  - `query_building_state(building_id)`
  - `query_drs_status(building_id)`
  - `query_prepaid_ledger(building_id)`
  - `query_settlement_history(building_id)`
  - `query_ownership_ledger(building_id, pool)`
  - `query_agent_audit_trail(building_id)`
  - `query_security_findings(scope)`
  - `query_open_tickets(scope, role)`
- Every query response must include provenance: record IDs, timestamps, source system, and permission scope.
- Add an "Ask e.mappa" interface for trusted explanations, with role-aware answers and no private counterparty leakage.
- Website must expose only public-safe query/onboarding surfaces: product education, waitlist, high-level role guidance, and non-private explainers.
- Cockpit must expose internal query surfaces for operations: building state, DRS blockers, settlement integrity, agent run history, ticket queues, security findings, and incident timelines.

#### 13.3 Website trust and onboarding surface
- The website is not just marketing. It is the public trust surface for explaining e.mappa's doctrine, role boundaries, financial logic, and why the system is auditable.
- Public pages must never expose private building data, private counterparty finances, internal tickets, raw security findings, or agent logs.
- Website waitlist and onboarding forms must persist through the backend in API mode and degrade safely in mock/offline mode.
- Website role previews must stay contract-aligned with mobile/cockpit data language: projected, estimated, benchmarked, mock, and actual values must be labeled correctly.
- If "Ask e.mappa" appears publicly, it must be constrained to public product education and general onboarding. It must refuse building-specific private questions unless the user is authenticated and authorized through a proper portal.

#### 13.4 Cockpit trust and operations command center
- The cockpit is the internal trust command center. It must show the real operational state of DRS, settlement, prepaid, ownership, tickets, security findings, agent runs, and reconciliation health.
- Cockpit must include DRS queues, settlement monitors, ticket queues, security triage, agent audit trails, and incident timelines.
- Cockpit must distinguish actual data from projected/demo data at all times.
- Cockpit actions that mutate financial, ownership, security, deployment, or settlement state must require confirmation, audit logging, and role permission checks.
- Cockpit must be the primary human-approval surface for high-risk agent recommendations.

#### 13.5 Agent platform and tool registry
- Create an agent runtime module under `backend/app/agents/` with typed tool definitions, permission checks, run logging, retries, timeouts, and structured outputs.
- Create an agent registry for:
  - DRS assessment agent
  - onboarding/support agent
  - anomaly detection agent
  - settlement reconciliation agent
  - code-review agent
  - eval-generation agent
  - ticket-routing agent
  - security-triage agent
  - query assistant agent
- Every agent run must persist: prompt version, model, tools available, tools called, inputs, outputs, citations/provenance, latency, actor, building scope, and approval state.
- High-risk tool actions must require explicit policy gates and human approval before mutation.

#### 13.6 Eval harness for product and engineering agents
- Add `backend/evals/` with repeatable eval cases for DRS, prepaid, settlement, ownership, security triage, ticket routing, query accuracy, and privacy leakage.
- Add code-review evals that check whether the agent catches formula drift, missing tests, auth bypasses, insecure secrets, and unauthorized data exposure.
- Add ticket-routing evals that check correct queue assignment, severity, required evidence, and escalation rules.
- Add security-triage evals that check authentication, authorization, tenant isolation, input validation, secrets, auditability, and rate-limit risks.
- Add CI command for evals and fail the pipeline on critical eval regressions.

#### 13.7 Ticket routing and operations cockpit
- Add a typed ticket model: `id`, `building_id`, `role_scope`, `severity`, `category`, `status`, `owner`, `evidence`, `agent_summary`, `created_at`, `updated_at`, `resolved_at`.
- Create routing queues for DRS blockers, prepaid/payment issues, supplier quote gaps, electrician readiness, monitoring outages, settlement anomalies, ownership disputes, security findings, and support requests.
- Agents can draft ticket summaries and recommended actions; humans approve resolution for financial, security, deployment, or ownership-impacting tickets.
- Cockpit must show queue health, SLA status, blocked buildings, unresolved evidence, and agent confidence.

#### 13.8 Security and trust controls
- Enforce JWT verification, role-based access control, building-level tenancy, and least-privilege tool access.
- Add audit logs for every mutation: actor, role, endpoint/tool, before/after state, reason, timestamp, request ID.
- Add rate limiting, input validation, secrets handling, CORS hardening, and production-safe config.
- Add security triage workflow for suspicious access, failed auth spikes, settlement anomalies, data export attempts, and permission-denied clusters.
- Add privacy tests proving that users cannot access another building's data or private counterparty financials.

#### 13.9 Product truth and formula drift prevention
- Decide whether formulas remain dual-runtime or move to a single canonical runtime. Until then, parity tests are mandatory.
- Add Python vs TypeScript parity tests for energy, DRS, settlement, ownership, payback, projector role views, and edge cases.
- Add reconciliation jobs that verify:
  - prepaid cash committed equals allocation eligibility
  - sold solar only drives revenue
  - settlement waterfall totals 100%
  - ownership ledgers total 100%
  - payouts sum to their pools
  - DRS blockers match current source data
- Add dashboards for formula drift, reconciliation failures, and data freshness.

### Benchmarks
- [ ] Backend no longer depends on in-memory store for production endpoints.
- [ ] Alembic migrations create all required tables from a clean database.
- [ ] Test database suite passes with isolated fixtures.
- [ ] Every query endpoint/tool returns provenance and permission scope.
- [ ] "Ask e.mappa" answers DRS, prepaid, settlement, ownership, and ticket questions with cited source data.
- [ ] Website public trust/onboarding surfaces expose no private building, financial, ticket, security, or agent-run data.
- [ ] Website role previews label mock, projected, estimated, benchmarked, and actual values correctly.
- [ ] Cockpit shows DRS queues, settlement monitors, ticket queues, security findings, agent audit trails, and reconciliation health.
- [ ] Cockpit is the human-approval surface for high-risk agent recommendations.
- [ ] Agent run logs persist prompt version, model, tools, inputs, outputs, citations, actor, scope, and approval state.
- [ ] DRS, onboarding/support, anomaly, settlement reconciliation, code-review, eval-generation, ticket-routing, security-triage, and query assistant agents exist with typed tools.
- [ ] High-risk mutations require human approval.
- [ ] Eval suite covers DRS, prepaid, settlement, ownership, query accuracy, privacy leakage, ticket routing, code review, and security triage.
- [ ] Security tests prove building-level tenant isolation and role-based access control.
- [ ] Audit logs exist for every mutating endpoint and agent action.
- [ ] Ticket routing queues work for DRS blockers, prepaid issues, supplier gaps, electrician readiness, monitoring outages, settlement anomalies, ownership disputes, security findings, and support requests.
- [ ] Formula parity tests pass between TypeScript shared logic and Python backend services.
- [ ] Reconciliation checks prove prepaid, sold solar, settlement, ownership, payout, and DRS invariants.
- [ ] CI runs typecheck, shared tests, backend tests, and evals.

---

## Benchmark Summary

Total benchmarks across all steps: **~110+ individual checks**

A step is DONE when:
1. All benchmarks for that step pass
2. All benchmarks for ALL previous steps still pass (no regressions)
3. `npm run typecheck` passes
4. `npm run test:shared` passes
5. `pytest tests/ -v` passes (once backend exists)
6. Agent evals pass once `backend/evals/` exists

The app is SHIP-READY when all 13 steps pass all benchmarks simultaneously.
