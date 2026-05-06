# Codex — Cockpit + Website + Infra sprint prompt (Day 1, branch: `sprint/infra`)

You are OpenAI Codex working on the e.mappa monorepo. Your mission: make the cockpit and website operate against the real backend, set up CI/CD, deployment configs, and observability so the pilot can be put in front of a stakeholder by end of day.

You work in parallel with Cursor (mobile) and Claude Code (backend). The contract you all agreed on is at [docs/SPRINT_CONTRACT.md](../SPRINT_CONTRACT.md). Read it first.

---

## Setup

```bash
cd /Users/shawnkairu/emappa
git fetch origin
git checkout main
git pull
git checkout -b sprint/infra
```

Read these:
- `docs/SPRINT_CONTRACT.md` — endpoints, types, env vars
- `docs/PILOT_SCOPE.md` — what's pilot, what's deferred
- `cockpit/src/App.tsx` and `cockpit/src/stress-test/StressTest.jsx`
- `website/src/App.tsx` and `website/src/MarketingPage.tsx`
- `package.json` (root), `turbo.json`, `vercel.json`, `docker-compose.yml`

---

## Boundary rules (HARD)

You may write inside:
- `cockpit/**`
- `website/**`
- `.github/**` (you create this)
- root `package.json` scripts only (not `dependencies` of other workspaces)
- `vercel.json`, `docker-compose.yml` (additive only — don't remove backend env vars Claude Code adds)
- `.env.example` (additive — frontend env vars only)

You may **not** edit `mobile/**`, `backend/**`, `packages/**`, or any other doc.

You may import from `@emappa/api-client`, `@emappa/shared`, `@emappa/ui`. Do not re-implement formulas locally.

Branch is `sprint/infra`. Do not rebase mid-sprint. Coordinator (Claude Code) merges at T+7:00.

---

## Subagent plan

Spawn **4 parallel subagents**:

| Subagent | Branch | Owned paths | Task |
|---|---|---|---|
| `cockpit` | `sprint/infra/cockpit` | `cockpit/**` | Real auth + real data + synthetic badge + DRS queue + settlement monitor |
| `website` | `sprint/infra/website` | `website/**` | Real waitlist hookup + pilot copy update + role portal data wiring |
| `ci` | `sprint/infra/ci` | `.github/**`, root `package.json` scripts | GitHub Actions: typecheck + tests + lint + build |
| `deploy` | `sprint/infra/deploy` | `vercel.json`, `docker-compose.yml`, `.env.example`, new `infra/` folder | Staging deploy: backend on Fly.io or Railway, frontends on Vercel, env wiring |

---

## Subagent: `cockpit`

Goal: cockpit is a real ops console — admin logs in, sees the portfolio, can run settlement, can toggle DRS gates.

1. **Auth**
   - Add same login flow as mobile (email OTP) but as a web form. Use `@emappa/api-client` `requestOtp` + `verifyOtp`.
   - Store JWT in `localStorage` under key `emappa_cockpit_session`. Wrap all API calls with bearer.
   - Gate the entire app on session; redirect to `/login` if absent.
   - Only allow `role === 'admin'` past login. Other roles get an "admins only" message.

2. **Portfolio view (`cockpit/src/App.tsx`)**
   - Replace mock data with `getProjects()` (admin returns all)
   - Each row: name, stage, DRS score + decision pill, pledged total, last settlement date
   - Filters: stage, decision, date range
   - Click row → drawer/sub-route with detail

3. **Building detail (`cockpit/src/pages/BuildingDetail.tsx`)** (new)
   - Tabs: Overview / Energy / Pledges / DRS / Settlement / Roof
   - **Overview**: KPIs (pledged total, projected revenue, DRS score, last settlement), source toggle (synthetic | measured | both)
   - **Energy**: 24h chart from `getEnergyToday`, 30d series from `getEnergySeries`, all with a synthetic badge
   - **Pledges**: history table from `getPrepaidHistory`
   - **DRS**: current score, blockers list, gate toggles (admin can flip), history chart
   - **Settlement**: latest period, payout waterfall, "Run new settlement" button (calls `runSettlement`, simulation banner shows)
   - **Roof**: render `roof_polygon_geojson` over satellite tile (Mapbox or Google Static), area in m²

4. **Synthetic badge** (`cockpit/src/components/SyntheticBadge.tsx`)
   - Same UX as mobile: small pill on every chart fed by synthetic data
   - Global toggle in top bar: "Show synthetic | Hide synthetic | Mixed"

5. **Stress test page** ([cockpit/src/stress-test/StressTest.jsx](../../cockpit/src/stress-test/StressTest.jsx))
   - Keep it. Wire its inputs to real building data via `getProjects()`. Default loaded building should be the first admin building.

6. **Pilot banner**
   - Persistent yellow banner at top: *"Pilot mode — synthesized energy data, non-binding pledges, simulated settlements."*

**Acceptance:**
- [ ] Admin logs in, sees portfolio, can drill into a building
- [ ] DRS gate toggle persists to backend and refreshes score
- [ ] "Run new settlement" produces a row tagged simulation=true
- [ ] Roof tab renders the polygon for buildings that have one
- [ ] Synthetic badge visible on every chart fed by synthetic data
- [ ] No mock data left

---

## Subagent: `website`

Goal: marketing site reflects pilot reality, waitlist actually persists, **and stakeholder portals mirror mobile IA exactly** per [docs/IA_SPEC.md §9](../IA_SPEC.md). Required reading before code: `docs/IA_SPEC.md` (the entire document), `docs/SPRINT_CONTRACT.md`.

### Hard mirror rule
Every screen the mobile app has, the website portal must have. **Same names, same order, same data sources.** A user who logs in as `resident@emappa.test` on the website sees Home, Energy, Wallet, Profile in that order — same content as mobile.

The website may add **clearly-marked web-only depth** (wider charts, side-by-side comparisons), but no screen may exist on mobile and not on web, or vice versa.

### Step 1 — Marketing copy update ([website/src/MarketingPage.tsx](../../website/src/MarketingPage.tsx))
- Update hero / how-it-works to reference "pledge" instead of "preload"
- Add a "Pilot" section explaining pilot scope (email signup, non-binding pledges, synthesized data) with non-technical exit criteria
- Remove all mentions of M-Pesa or SMS

### Step 2 — Waitlist ([website/src/WaitlistForm.tsx](../../website/src/WaitlistForm.tsx))
- Submit through `submitWaitlistLead()` → real backend `POST /waitlist`
- Success toast; localStorage fallback on error

### Step 3 — Login ([website/src/LoginLayer.tsx](../../website/src/LoginLayer.tsx))
- Real email OTP form (same pattern as cockpit; copy the auth client logic)
- After verify, route based on `user.onboardingComplete` and `user.role`:
  - role `'admin'` → `https://cockpit.emappa.{env}/` (admins use cockpit, not website portal)
  - `onboardingComplete=false` → `/onboard/{role}` (use kebab-case URL: `building-owner` not `building_owner`)
  - `onboardingComplete=true` → `/portal/{role}` (lands on first tab)
- **Role-select UI** (only shown if user.role is null): list `PublicRole[]` only — never include admin. Display strings: "Resident", "Building Owner", "Provider", "Financier", "Electrician". Per [IA_SPEC §8.5](../IA_SPEC.md), admin is never publicly selectable.

### Step 4 — Portal layout
Build a shared portal shell at `website/src/portal/PortalShell.tsx`:
- Left rail (desktop) / bottom bar (mobile-web) with the same tabs as mobile per [IA_SPEC.md](../IA_SPEC.md)
- Top bar: pilot banner (variant configurable), user avatar dropdown (Profile, Logout)
- Outlet for tab content

### Step 5 — Stakeholder portal screens
Mirror mobile screen-for-screen:

```
website/src/screens/stakeholders/
├── resident/
│   ├── home.tsx              ← mirrors mobile/(resident)/home.tsx
│   ├── energy.tsx            ← mirrors mobile/(resident)/energy.tsx
│   ├── wallet.tsx            ← mirrors mobile/(resident)/wallet.tsx
│   └── profile.tsx           ← mirrors mobile/(resident)/profile.tsx
├── homeowner/                                              ← single-family-home owner who is also sole resident
│   ├── home.tsx              ← adaptive (project hero pre-live, token hero post-live)
│   ├── energy.tsx            ← always-on generation
│   ├── wallet.tsx            ← three-stream wallet (pledges + royalties + share earnings)
│   ├── profile.tsx           ← building/roof + account
│   └── _embedded/{drs,deployment,approve-terms,compare-today,roof-detail,marketplace}.tsx
├── building-owner/                                         ← folder uses kebab-case; role string is 'building_owner'
│   ├── home.tsx, energy.tsx, wallet.tsx, profile.tsx
│   └── _embedded/{drs,deployment,resident-roster,approve-terms,compare-today}.tsx
├── provider/
│   ├── discover.tsx, inventory.tsx, generation.tsx, wallet.tsx, profile.tsx
├── electrician/
│   ├── discover.tsx, jobs.tsx, wallet.tsx, compliance.tsx, profile.tsx
└── financier/
    ├── discover.tsx, portfolio.tsx, wallet.tsx, profile.tsx
```

**Admin is intentionally absent from this tree.** Per [IA_SPEC.md §8.5](../IA_SPEC.md), admin is not a public role. There is no `/portal/admin` route. Cockpit is the admin surface (separate Vite app); admin users post-login on the website are redirected to cockpit URL via 302.

For each screen:
- Use the **same data sources** (api-client functions) as the mobile equivalent
- Use the **same component contracts** for shared widgets — pull `ProjectCard`, `PortfolioRow`, `EnergyTodayChart`, `SyntheticBadge`, `PilotBanner` into web equivalents (reuse via `packages/ui` once Cursor commits them; if not yet, build web-side versions with identical props)
- Empty/loading/error states real — no mocks
- Profile screen contains Settings + Support sections embedded (same as mobile)
- For each role, the layout matches the mobile tab order

### Step 6 — Onboarding mirrors
For each public role, build `website/src/onboard/{role}/*.tsx` mirroring `mobile/app/(onboard)/{role}/*.tsx` step-for-step. URL uses kebab-case: `/onboard/building-owner/...` (the role string in API calls remains `building_owner`). Building Owner roof capture on web uses Mapbox GL JS or Google Maps JS API for the satellite tile (Cursor's mobile RoofMap uses react-native-maps; the components diverge but the API + flow is identical). No `/onboard/admin/...` route exists.

### Step 7 — Pilot banner & synthetic badge
Same components as cockpit, deployed on every authenticated portal page where money or data is displayed.

**Acceptance:**
- [ ] Logging in as each seed user (`resident@emappa.test`, `homeowner@emappa.test`, `building-owner@emappa.test`, `provider-panels@emappa.test`, `electrician@emappa.test`, `financier@emappa.test`, `admin@emappa.test`) shows the **exact same screens, in the same order, with the same data** as the mobile app
- [ ] Homeowner home is adaptive: pre-live shows ProjectHero as primary; post-live shows TokenHero as primary
- [ ] Onboarding flows on web complete and post `POST /me/onboarding-complete`
- [ ] Roof capture on web works for owner onboarding (auto-suggest + manual trace + manual sqm)
- [ ] Waitlist signup persists; visible from cockpit
- [ ] No copy mentions M-Pesa, SMS, or "preload solar tokens"
- [ ] Pilot banner + synthetic badge present per IA spec

---

## Subagent: `ci`

Goal: every PR runs typecheck + tests + lint. Failure blocks merge.

1. **`.github/workflows/ci.yml`**
   - Triggers: pull_request, push to main
   - Jobs (parallel where possible):
     - `typecheck` — `npm ci && npm run typecheck` across the workspace
     - `test-shared` — `npm run test --workspace=packages/shared`
     - `test-backend` — spin up Postgres service, install Python deps, `pytest backend/`
     - `lint` — `npm run lint` if a script exists; otherwise eslint over mobile/cockpit/website
     - `build` — `npm run build` to ensure all workspaces build
   - Use Node 20, Python 3.12, Postgres 16

2. **`.github/workflows/deploy-staging.yml`**
   - Trigger: push of tag `v*-pilot`
   - Steps: build all workspaces, deploy backend to Fly.io / Railway via API, deploy cockpit + website to Vercel via Vercel CLI

3. **Root `package.json` scripts** — additive only:
   ```json
   "typecheck": "turbo run typecheck",
   "lint": "turbo run lint",
   "test": "turbo run test",
   "build": "turbo run build"
   ```
   Add corresponding workspace scripts where missing.

4. **`.github/CODEOWNERS`** — basic ownership map matching the agent boundaries (Claude Code = backend/shared, Cursor = mobile, Codex = cockpit/website/infra).

**Acceptance:**
- [ ] Open a draft PR — CI runs and passes against the post-merge main
- [ ] CI catches at least one intentional type error (test it)
- [ ] Backend tests run against real Postgres in CI

---

## Subagent: `deploy`

Goal: stack runs in a real environment that a stakeholder can hit from a browser.

1. **`docker-compose.yml`** — additive
   - `postgres` service with volume + healthcheck
   - `backend` service that runs `alembic upgrade head` on start, then `uvicorn`
   - Env from `.env`
   - Coordinate with Claude Code's auth subagent so Resend key flows through

2. **`vercel.json`** at repo root + per-frontend
   - Configure two separate Vercel projects (cockpit, website) using `cwd` and root-level monorepo handoff
   - Set `VITE_API_BASE_URL` env per environment

3. **`infra/fly.toml`** (or `infra/railway.json`) — backend deployment config
   - Postgres add-on
   - Env var allowlist
   - Health check on `/health`
   - Auto-restart, single region (Frankfurt or Johannesburg for Kenya latency)

4. **Sentry**
   - Backend: `sentry-sdk[fastapi]` integration in `backend/app/main.py` gated on `SENTRY_DSN`
   - Frontends: `@sentry/react` initialized in `cockpit/src/main.tsx` and `website/src/main.tsx`
   - Add `SENTRY_DSN` to `.env.example` (optional)

5. **`.env.example`** — additive frontend vars only (Claude Code already added backend ones during contract phase)

6. **README addendum** — `infra/README.md` listing local-dev, staging-deploy, and rollback steps

**Acceptance:**
- [ ] `docker-compose up` starts a working backend + postgres locally
- [ ] Cockpit + website build cleanly via Vercel CLI
- [ ] Backend deploys to staging; `/health` returns 200
- [ ] Tag `v0.1-pilot` triggers staging deploy via CI
- [ ] Sentry captures a thrown error in staging

---

## Definition of done

- Cockpit functions as a real admin console against the live backend
- Website marketing reflects pilot scope; waitlist persists
- Role portals show real data for logged-in seed users
- CI runs on every PR and blocks broken merges
- Backend deployed to staging; cockpit + website deployed to Vercel staging
- Sentry wired for backend + frontends
- Stakeholder can open the staging URL, log in as `admin@emappa.test`, see the pilot
