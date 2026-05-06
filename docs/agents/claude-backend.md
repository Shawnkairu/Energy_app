# Claude Code — Backend + Shared sprint prompt (Day 1, branch: `sprint/backend`)

You are Claude Code working on the e.mappa monorepo. Your mission: take the backend from "in-memory DemoStore + fake auth + no migrations" to "Postgres-backed, JWT-auth-protected, email-OTP-fronted, with real pledge/DRS/settlement/energy/roof/auth endpoints all matching the contract."

You are also the **sprint coordinator**. Before parallel work starts, you lock the contract and shared types so Cursor and Codex can build against a stable foundation. After parallel work ends, you run all the merges.

You work in parallel with Cursor (mobile) and Codex (cockpit/website/infra). Contract: [docs/SPRINT_CONTRACT.md](../SPRINT_CONTRACT.md).

---

## Phase 0 — Contract lock (you do this alone, T+0:00 to T+0:30)

```bash
cd /Users/shawnkairu/emappa
git fetch origin
git checkout main
git pull
git checkout -b sprint/contract
```

1. The contract at `docs/SPRINT_CONTRACT.md` exists. Read it; do not modify.
2. Add the locked types from §4 to `packages/shared/src/types.ts`. Do **not** delete or rename existing exports — only add.
3. Add new shared utilities the other agents will need:
   - `packages/shared/src/loadProfiles.ts` — exports `RESIDENT_LOAD_ARCHETYPES` and `generateLoadProfile(archetype, residentId, dayIndex): number[24]`
   - `packages/shared/src/geo.ts` — `polygonAreaM2(coords: Array<{lat,lon}>): number` (shoelace + latitude correction). Cursor's mobile/lib/geo.ts may import from here.
4. Initialize Alembic in `backend/`:
   ```bash
   cd backend && uv pip install alembic asyncpg && alembic init alembic
   ```
5. Configure `alembic.ini` and `alembic/env.py` to read `DATABASE_URL` from env and target async SQLAlchemy.
6. Write migration `0001_pilot_baseline.py` matching schema in §2 of contract — every table, every column, every constraint, every index.
7. Write `backend/scripts/seed.py` per §2: 2 buildings, role users, 30 days of synthetic readings, one settlement period.
8. Update `.env.example` (root) with backend env vars from §5 of contract.
9. Commit, push `sprint/contract`, fast-forward `main` to it. **This is the launch shot — Cursor and Codex branch off main from this point.**

```bash
git add -A && git commit -m "sprint: lock contract, shared types, alembic, seed"
git push -u origin sprint/contract
git checkout main && git merge --ff-only sprint/contract && git push origin main
git checkout -b sprint/backend
```

Now message Cursor and Codex: "Contract locked. Branch from main."

---

## Phase 1 — Parallel work (T+0:30 to T+5:30)

Spawn **6 parallel subagents** off `sprint/backend`. They merge back into `sprint/backend` at T+5:00.

| Subagent | Branch | Owned paths | Task |
|---|---|---|---|
| `db` | `sprint/backend/db` | `backend/app/db/**`, `backend/app/models/**`, `backend/app/repos/**` | SQLAlchemy models, async session, repositories replacing DemoStore |
| `auth` | `sprint/backend/auth` | `backend/app/api/auth.py`, `backend/app/api/me.py`, `backend/app/services/email.py`, `backend/app/middleware/jwt.py`, `backend/app/services/ratelimit.py`, `backend/scripts/grant_admin.py` | Email OTP via Resend, JWT middleware, rate limiting, onboarding-complete endpoint, admin grant CLI |
| `pledge` | `sprint/backend/pledge` | `backend/app/api/prepaid.py`, `backend/app/api/drs.py`, `backend/app/api/settlement.py`, `backend/app/services/projector.py` | Pledge/DRS/settlement endpoints, projector wired to DB |
| `solar` | `sprint/backend/solar` | `backend/app/services/solar/**`, `backend/app/api/energy.py` | PVWatts + NASA POWER + Open-Meteo adapters with caching, energy endpoints |
| `roof` | `sprint/backend/roof` | `backend/app/services/roof/**`, `backend/app/api/buildings.py` | Microsoft footprints adapter, building creation + roof endpoints |
| `client` | `sprint/backend/client` | `packages/api-client/src/**` | Bring api-client to full contract parity, switch to bearer-token auth |

Subagents stay strictly in their owned paths. They merge to `sprint/backend` independently; conflicts are impossible.

---

## Subagent: `db`

Replace [backend/app/store.py](../../backend/app/store.py) with real Postgres-backed repos.

1. **`backend/app/db/session.py`** — async SQLAlchemy engine + `get_session` dependency
2. **`backend/app/models/`** — SQLAlchemy ORM models matching every table in contract §2. Use `Mapped[...]` syntax.
3. **`backend/app/repos/`**:
   - `users.py` — `get_by_email`, `create`, `get_by_id`, `update_last_seen`
   - `otp.py` — `create_code`, `consume_code`, `recent_count`
   - `buildings.py` — `list`, `get`, `create`, `update_roof`, `for_role`
   - `prepaid.py` — `create_pledge`, `confirmed_total`, `history`
   - `energy.py` — `bulk_insert_readings`, `series`, `today_summary`
   - `drs.py` — `latest`, `history`, `update_gates`, `record_snapshot`
   - `settlement.py` — `create_period`, `latest`, `history`
   - `audit.py` — `log_event`
4. **Delete `backend/app/store.py` and remove all imports.** Every endpoint that used `store.demo` now depends on a repo via `Depends`.
5. **Wire startup**: on FastAPI startup, run `alembic upgrade head` (idempotent) and load seed if `EMAPPA_DEV_SEED=true`.

**Acceptance:**
- [ ] No reference to `DemoStore` or `store.demo` anywhere in `backend/`
- [ ] `pytest backend/tests/test_api.py` passes against a real Postgres (use docker-compose service in tests)
- [ ] All repo methods are async
- [ ] All writes are transactional

---

## Subagent: `auth`

1. **`backend/app/services/email.py`**
   - `send_otp_email(to: str, code: str) -> None` using Resend HTTP API
   - In dev (`ALLOW_DEV_OTP_CONSOLE=true`), also print to logs: `OTP for {email}: {code}`
   - On Resend failure in non-dev, raise to surface 500
2. **`backend/app/services/ratelimit.py`**
   - In-process token bucket keyed by email; 3 requests / 10 min for OTP request
   - Optional Redis backend gated by `REDIS_URL` (skip if not set)
3. **`backend/app/middleware/jwt.py`**
   - FastAPI dependency `get_current_user` that validates `Authorization: Bearer ...`
   - Decodes JWT with `JWT_SECRET`, checks `exp`, loads `User` from DB
   - Raises 401 with proper error codes
4. **Rewrite `backend/app/api/auth.py`**
   - `POST /auth/request-otp`:
     - Validate email format
     - Rate-limit check
     - Generate 6-digit code, hash with sha256, store with 10-min expiry
     - Send via `send_otp_email`
     - Return `{ ok: true }` (never disclose if email exists)
   - `POST /auth/verify-otp`:
     - Look up most recent unconsumed code for email
     - Verify hash, expiry, attempts (≤5)
     - Mark consumed, increment attempts on failure
     - Issue JWT; upsert user (auto-create if not in DB but in seed allowlist)
     - Return `{ token, user }`
   - `GET /auth/me`: return current user
5. Apply `Depends(get_current_user)` to every authenticated route in §3.

6. **`backend/app/api/me.py`** (new)
   - `POST /me/onboarding-complete` accepts `{ display_name?, business_type? }` and updates the current user
   - **Hard-rejects** any attempt to set `role='admin'` via this endpoint → returns 403 `{ error: "admin_not_publicly_assignable" }`
   - For provider role, `business_type` is required; missing → 400
   - Sets `onboarding_complete=true` on success
7. **`backend/scripts/grant_admin.py`** (new — operator-run CLI, never exposed via HTTP)
   - Reads `ADMIN_EMAILS` env var allowlist
   - Takes one positional arg: target email
   - Upserts user with `role='admin'`, `onboarding_complete=true`
   - Refuses if target email not in allowlist
   - Refuses if target email already exists with a non-admin role unless `--force` passed
   - Prints final user record to stdout

**Acceptance:**
- [ ] `pytest backend/tests/test_auth.py` covers: happy path, wrong code, expired, rate limited, valid bearer protects an endpoint, missing bearer rejected
- [ ] `pytest backend/tests/test_admin_visibility.py` covers: `POST /me/onboarding-complete` with `role='admin'` returns 403; grant_admin.py rejects emails not in allowlist; grant_admin.py succeeds for allowlisted email
- [ ] Resend send is mockable in tests
- [ ] OTP plaintext is never stored
- [ ] Admin role cannot be assigned through any HTTP path

---

## Subagent: `pledge`

1. **Rewrite `backend/app/api/prepaid.py`**
   - `POST /prepaid/commit`: insert with `payment_method='pledge'`, `status='confirmed'` immediately, return commitment, emit `audit_log` row, recompute DRS for the building
   - `GET /prepaid/{building_id}/balance`: return `{ confirmed_total_kes }` from `repos.prepaid.confirmed_total`
   - `GET /prepaid/{building_id}/history`: return list ordered by created_at desc
   - All routes guard with `get_current_user` + scope check (resident sees own building only; admin sees all)
2. **`backend/app/services/projector.py`**
   - Pure-Python port of `packages/shared/src/projector.ts` `projectBuilding()`. Imports the energy formulas. Returns DRS result, settlement projection, ownership snapshot for a `building_id`.
   - Used by drs.py, settlement.py, prepaid.py to recompute on writes.
3. **Rewrite `backend/app/api/drs.py`**
   - `GET /drs/{building_id}` calls projector, returns DrsResult
   - `GET /drs/{building_id}/history` from `repos.drs.history`
   - `POST /drs/{building_id}/update` admin-only, updates gates, snapshots result
4. **Rewrite `backend/app/api/settlement.py`**
   - `POST /settlement/run` admin-only, period_start/period_end → reads energy_readings → projector waterfall → inserts settlement_periods row with `simulation=true` (pilot)
   - `GET /settlement/{building_id}/latest` and `/history`

**Acceptance:**
- [ ] `pytest backend/tests/test_pledge.py` covers: pledge insert succeeds, DRS recomputes, settlement run on pledged building tags simulation=true
- [ ] No endpoint allows a resident to pledge for a different building than their own
- [ ] Settlement parity test: backend projector and shared TS projector agree on a fixture within ±0.01 KES

---

## Subagent: `solar`

1. **`backend/app/services/solar/pvwatts.py`**
   - `class PVWattsAdapter`: `get_hourly_kwh(lat, lon, kw, tilt_deg, azimuth_deg) -> list[float]` (8760)
   - HTTP GET to NREL PVWatts v8 with `DEMO_KEY` or `NREL_API_KEY`
   - Cache result in Postgres or local disk for 90 days keyed by params hash
   - On API failure, fall back to a deterministic synthetic curve using sun-zenith approximation
2. **`backend/app/services/solar/nasa_power.py`**
   - `get_hourly_irradiance(lat, lon, start_date, end_date) -> list[Reading]`
   - Param: `ALLSKY_SFC_SW_DWN` hourly
3. **`backend/app/services/solar/open_meteo.py`**
   - `get_today_irradiance(lat, lon) -> list[float]` (24)
   - 30-min cache
4. **`backend/app/services/solar/load_profiles.py`**
   - Wraps the shared archetype generator; deterministic per `resident_id`
5. **`backend/app/api/energy.py`**
   - `GET /energy/{building_id}/series?kind=&from=&to=`
   - `GET /energy/{building_id}/today`
   - Backed by `repos.energy.series` and `repos.energy.today_summary`. If gaps in DB, lazy-fill from PVWatts/Open-Meteo and persist.
6. **Seed integration**: `backend/scripts/seed.py` (already exists from contract phase) calls these adapters to populate 30 days of readings for each seed building.

**Acceptance:**
- [ ] PVWatts call for a Kenyan lat/lon returns 8760 hourly kWh
- [ ] Each reading row has `source='synthetic'` and a non-empty `provenance`
- [ ] `GET /energy/{id}/today` returns 24 generation + 24 load + 24 irradiance values
- [ ] Cache keys are deterministic (same params → same cache hit)

---

## Subagent: `roof`

1. **`backend/app/services/roof/microsoft_footprints.py`**
   - `suggest(lat, lon) -> RoofSuggestion | None`
   - Approach: Microsoft GlobalMLBuildingFootprints quadkeys. Use `https://minedbuildings.z5.web.core.windows.net/Africa/Kenya.geojsonl` (or per-quadkey index) to find the polygon containing the point.
   - Cache per (lat,lon) rounded to 5 decimals.
   - Compute area via shoelace (re-use shared geo helper).
2. **`backend/app/api/buildings.py`**
   - `POST /buildings` (`building_owner` role only) → create, return building
   - `POST /buildings/{id}/roof` → store polygon + area + source + confidence
   - `GET /buildings/{id}/roof/suggest?lat=&lon=` → call microsoft_footprints.suggest
3. **DRS integration**: when roof_area_m2 is set, projector validates that proposed array kWp ≤ roof_area_m2 / 5.5. Add a soft blocker if violated.

**Acceptance:**
- [ ] `GET /buildings/{id}/roof/suggest` returns a polygon for a known Nairobi lat/lon within 3 seconds (or a graceful `available: false`)
- [ ] All three `roof_source` values are accepted by `POST /buildings/{id}/roof`
- [ ] DRS shows blocker when array kWp exceeds rooftop budget

---

## Subagent: `client`

Bring `packages/api-client/src/index.ts` to contract parity.

1. Add functions for every endpoint in contract §3 not already present:
   - `getMe(token)`, `getEnergyToday(buildingId)`, `getEnergySeries(buildingId, kind, from, to)`
   - `createBuilding(input)`, `setRoof(buildingId, roof)`, `suggestRoof(lat, lon)`
   - `runSettlement(buildingId, periodStart, periodEnd)`, `getLatestSettlement(buildingId)`, `getSettlementHistory(buildingId)`
   - `getDrsHistory(buildingId)`, `updateDrsGates(buildingId, gates)`
   - `getOwnership(buildingId, side)`, `transferOwnership(input)`
   - `getPrepaidBalance(buildingId)`, `getPrepaidHistory(buildingId)`, `commitPrepaid({buildingId, amountKes})`
2. Add a token-aware client factory:
   ```ts
   export function createApiClient({ baseUrl, token }: { baseUrl: string|null, token?: string }) { ... }
   ```
   Returns an object with all functions bound to the configured baseUrl + token. Mobile uses this; cockpit/website also.
3. Keep mock fallback when `baseUrl === null`. Preserve graceful degradation.
4. Every error throws a typed `ApiError { status, code, message }`.

**Acceptance:**
- [ ] No endpoint in contract §3 is missing from api-client
- [ ] `npm run typecheck` exits 0 in `packages/api-client`
- [ ] Mock-mode fallback still works when baseUrl is null

---

## Phase 2 — Coordinator merge (T+6:00 to T+7:30)

After all agents push:

```bash
git checkout main
git pull
git merge --no-ff sprint/backend -m "sprint: backend persistence, auth, pledge, solar, roof, client"
git push origin main

# Tell Cursor: "Backend merged. Rebase sprint/mobile, push, I'll merge."
# Cursor rebases sprint/mobile against main, fixes any drift, pushes.
git fetch origin
git merge --no-ff origin/sprint/mobile -m "sprint: mobile email OTP, pledge, roof, button wiring"
git push origin main

# Tell Codex: "Mobile merged. Rebase sprint/infra, push, I'll merge."
git fetch origin
git merge --no-ff origin/sprint/infra -m "sprint: cockpit, website, CI, deploy"
git push origin main
```

Then run end-to-end smoke test:
1. `docker-compose up -d` → backend + postgres running
2. `npm run dev:mobile`, `npm run dev:cockpit`, `npm run dev:website`
3. Email OTP login on mobile (read code from backend logs in dev)
4. Pledge 1000 → verify cockpit shows it
5. Run a settlement → verify it appears in cockpit
6. Tag `git tag v0.1-pilot && git push --tags`
7. Codex deploys staging (separate task list).

---

## Definition of done

- [ ] Postgres-backed, no DemoStore anywhere
- [ ] Alembic migrations checked in and applied on startup
- [ ] Email OTP via Resend (or dev console fallback) works
- [ ] JWT-protected endpoints enforce role/building scope
- [ ] Pledge endpoint inserts confirmed pledges and recomputes DRS
- [ ] Energy endpoints return synthetic data tagged with provenance
- [ ] Roof endpoints accept all three sources and integrate with DRS
- [ ] Settlement endpoint runs in simulation mode for pilot
- [ ] api-client matches contract exactly
- [ ] `pytest backend/` passes
- [ ] Coordinator has merged backend → mobile → infra into main without conflicts
- [ ] Local stack survives a smoke-test from login → pledge → DRS → settlement
