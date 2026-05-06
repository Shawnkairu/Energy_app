# Sprint Contract — Day 1 to 70%

**Frozen at sprint start. Do not modify during parallel work.** All three agents (Cursor, Claude Code, Codex) code against the types, endpoints, and schema below. Any change requires stopping all agents, updating this contract, and resuming.

> **IA companion:** [IA_SPEC.md](IA_SPEC.md) is the canonical screen layout for mobile and website portals. It is also frozen for the sprint. Cursor and Codex implement against it exactly; Claude Code's role enum + business_type field below come from IA_SPEC §1–6.

This contract supersedes anything in [ROADMAP.md](../ROADMAP.md) or [TEST.md](../TEST.md) for the duration of the sprint. After merge, ROADMAP and TEST get updated to match what shipped.

---

## 1. Branch + ownership map

```
main                           ← starting commit, frozen
├─ sprint/contract             ← Claude Code creates this first, lands the contract + shared types + initial migrations
├─ sprint/backend              ← Claude Code: backend/, packages/shared/, packages/api-client/
├─ sprint/mobile               ← Cursor: mobile/
└─ sprint/infra                ← Codex: cockpit/, website/, .github/, package.json scripts, root config
```

### File ownership (strict)

| Path | Owner | Others may | Notes |
|---|---|---|---|
| `backend/**` | Claude Code | read-only | |
| `packages/shared/src/types.ts` | Claude Code | **read-only after contract lands** | extended once at sprint start, then frozen |
| `packages/shared/src/**` (other) | Claude Code | read-only | |
| `packages/api-client/**` | Claude Code | read-only | |
| `mobile/**` | Cursor | read-only | folder `(owner)` is renamed to `(building-owner)` during cleanup |
| `cockpit/**` | Codex | read-only | |
| `website/**` | Codex | read-only | |
| `.github/**` | Codex | — | |
| `package.json` (root) | Codex | — | scripts only |
| `docker-compose.yml` | Codex | Claude Code may add backend env vars | |
| `docs/SPRINT_CONTRACT.md` | Claude Code | read-only | this file |
| `docs/PILOT_SCOPE.md` | Claude Code | read-only | |
| `ROADMAP.md`, `TEST.md`, `README.md` | nobody during sprint | — | updated post-merge |

### Conflict avoidance rules

- If you need to add a type, add it under your own namespace (e.g. `MobileSessionState` in `mobile/src/types/`), do NOT add to `packages/shared`.
- If you need a new shared utility, add it to your own package and we'll lift to `packages/shared` post-merge if it's reused.
- If you need an API endpoint that isn't in this contract, **stop and message coordinator** — do not invent endpoints; mobile must rebase against backend reality, not vice versa.
- Never run `git rebase` or `git merge` from another agent's branch into yours during the sprint. The coordinator runs all merges at the end.

---

## 2. Database schema (Postgres, via Alembic)

Migration `0001_pilot_baseline` creates everything below. Owned by Claude Code; reviewed at end of contract phase.

### users
- `id uuid pk default gen_random_uuid()`
- `email text not null unique`
- `phone text` (nullable, post-pilot)
- `role text not null check (role in ('resident','homeowner','building_owner','provider','financier','electrician','admin'))`
- `business_type text check (business_type in ('panels','infrastructure','both'))` — only meaningful when `role='provider'`; nullable otherwise
- `building_id uuid references buildings(id)` (nullable; admins/financiers/electricians/providers may not be tied to one). Required for `homeowner` (the building they own and live in).
- `onboarding_complete boolean not null default false`
- `display_name text`
- `profile jsonb not null default '{}'::jsonb` — role-specific onboarding bag. Schema by role: electrician `{ region, scope: ['install'|'inspection'|'maintenance'][] }`; financier `{ investor_kind: 'individual'|'institution', target_deal_size_kes, target_return_pct }`; resident/homeowner/building_owner/provider may use freely. Merged (not replaced) on `POST /me/onboarding-complete`.
- `created_at timestamptz not null default now()`
- `last_seen_at timestamptz`

> **Note:** `supplier` role removed and merged into `provider` per [IA_SPEC.md §3](IA_SPEC.md). `installer` renamed to `electrician`. `homeowner` added as the seventh role (six public + admin) per [IA_SPEC.md §2.5](IA_SPEC.md) — a homeowner is a single_family-building owner who is also the sole resident. Combines building_owner project lifecycle with resident token/consumption flow.

### otp_codes
- `id uuid pk default gen_random_uuid()`
- `email text not null`
- `code_hash text not null` (sha256 of code; never store plaintext)
- `expires_at timestamptz not null`
- `consumed_at timestamptz`
- `attempts int not null default 0`
- `created_at timestamptz not null default now()`
- index on `(email, expires_at desc)`

### buildings
- `id uuid pk default gen_random_uuid()`
- `name text not null`
- `address text not null`
- `lat numeric not null`
- `lon numeric not null`
- `unit_count int not null`
- `occupancy numeric` (0..1)
- `kind text not null default 'apartment' check (kind in ('apartment','single_family'))` — single_family enforces unit_count=1 via `(kind <> 'single_family' OR unit_count = 1)` constraint
- `stage text not null check (stage in ('listed','qualifying','funding','installing','live','retired'))`
- `invite_code text` — nullable; auto-generated 6-char base32 on insert (alphabet excludes 0/O/1/I); unique partial index. Owners share with residents/homeowners to join the building.
- `roof_area_m2 numeric`
- `roof_polygon_geojson jsonb`
- `roof_source text check (roof_source in ('microsoft_footprints','owner_traced','owner_typed'))`
- `roof_confidence numeric`
- `data_source text not null default 'synthetic' check (data_source in ('synthetic','measured','mixed'))`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### prepaid_commitments
- `id uuid pk default gen_random_uuid()`
- `building_id uuid not null references buildings(id)`
- `user_id uuid not null references users(id)`
- `amount_kes numeric not null check (amount_kes > 0)`
- `payment_method text not null default 'pledge' check (payment_method in ('pledge','mpesa'))`
- `status text not null default 'confirmed' check (status in ('pending','confirmed','failed'))`
- `created_at timestamptz not null default now()`
- `confirmed_at timestamptz`
- index on `(building_id, status)`

### energy_readings
- `id bigserial pk`
- `building_id uuid not null references buildings(id)`
- `timestamp timestamptz not null`
- `kind text not null check (kind in ('generation','load','irradiance'))`
- `value numeric not null`
- `unit text not null`
- `source text not null check (source in ('synthetic','measured'))`
- `provenance text not null`
- index on `(building_id, kind, timestamp desc)`

### settlement_periods
- `id uuid pk default gen_random_uuid()`
- `building_id uuid not null references buildings(id)`
- `period_start timestamptz not null`
- `period_end timestamptz not null`
- `e_gen numeric not null`
- `e_sold numeric not null`
- `e_waste numeric not null`
- `revenue_kes numeric not null`
- `payouts jsonb not null` — `{provider, financier, owner, emappa, reserve}`
- `simulation boolean not null default true`
- `data_source text not null check (data_source in ('synthetic','measured','mixed'))`
- `created_at timestamptz not null default now()`

### audit_log
- `id bigserial pk`
- `actor_user_id uuid references users(id)`
- `action text not null`
- `target_type text`
- `target_id text`
- `payload jsonb`
- `at timestamptz not null default now()`
- index on `(target_type, target_id, at desc)`

### waitlist_leads
- existing — keep as-is

### Seed data (script `backend/scripts/seed.py`)
- 3 buildings:
  - `nyeri-ridge-a` (apartment, 12 units, real Kenyan lat/lon)
  - `karatina-court` (apartment, 8 units, real Kenyan lat/lon)
  - `kahawa-sukari-1` (single_family, 1 unit — homeowner test fixture)
- 1 admin user: `admin@emappa.test`
- 4 residents (2 with ownership shares > 0, 2 with shares = 0 — to test gated Generation panels)
- 1 homeowner: `homeowner@emappa.test` — owns `kahawa-sukari-1`, sole occupant
- 1 building owner: `building-owner@emappa.test` (owns `nyeri-ridge-a`)
- 2 providers: `provider-panels@emappa.test` (business_type='panels'), `provider-both@emappa.test` (business_type='both')
- 1 financier: `financier@emappa.test`
- 1 electrician: `electrician@emappa.test`
- All with `*@emappa.test` emails for dev OTP
- All seed users have `onboarding_complete=true` so dev login lands directly in tab bar
- ~720 hourly synthetic energy readings per building (last 30 days, generation + load + irradiance)
- Settlement period for last 30 days, simulation=true
- Sample inventory: 3 SKUs for the providers (1 panel SKU, 2 infra SKUs)
- Sample electrician certification on the electrician seed user
- Sample financier portfolio: $5K committed across the 2 buildings

---

## 3. API endpoints (frozen contract)

Base URL is `${API_BASE_URL}` from env. All non-public endpoints require `Authorization: Bearer <jwt>`. JWT payload = `{ sub: user_id, email, role, building_id, exp }`.

### Public

```
GET  /health → { status: "ok", db: "ok" | "down" }
POST /auth/request-otp
     body: { email: string }
     → 200 { ok: true }  (rate-limited; max 3 per email per 10 min)
     → 429 { error: "rate_limited" }
POST /auth/verify-otp
     body: { email: string, code: string }
     → 200 { token: string, user: User }
     → 401 { error: "invalid_code" | "expired" | "too_many_attempts" }
POST /waitlist
     body: { name, email, phone?, role, neighborhood }
     → 200 { ok: true }
```

### Authenticated

```
GET  /auth/me → User

GET  /projects → ProjectedBuilding[]   (filtered by role+building_id of caller)
GET  /projects/{building_id} → ProjectedBuilding
GET  /roles/{role}/home → RoleHome    (matches existing api-client shape)

POST /prepaid/commit
     body: { building_id: string, amount_kes: number }
     → 200 { commitment: PrepaidCommitment }
     (pilot: payment_method='pledge', status='confirmed' immediately)
GET  /prepaid/{building_id}/balance → { confirmed_total_kes: number }
GET  /prepaid/{building_id}/history → PrepaidCommitment[]

GET  /drs/{building_id} → DrsResult
GET  /drs/{building_id}/history → DrsSnapshot[]
POST /drs/{building_id}/update            (admin/installer only)
     body: { gates: Partial<DrsGates> }
     → 200 { drs: DrsResult }

POST /settlement/run                       (admin only)
     body: { building_id: string, period_start: ISO, period_end: ISO }
     → 200 { period: SettlementPeriod }
     (pilot: always sets simulation=true)
GET  /settlement/{building_id}/latest → SettlementPeriod
GET  /settlement/{building_id}/history → SettlementPeriod[]

GET  /ownership/{building_id}/provider → OwnershipPosition[]
GET  /ownership/{building_id}/financier → OwnershipPosition[]
POST /ownership/transfer                   (owner of position only)
     body: { from_user, to_user, asset_id, percent_points }
     → 200 { ledger_entry: OwnershipLedgerEntry }

POST /buildings                             (building_owner OR homeowner)
     body: { name, address, lat, lon, unit_count, occupancy, kind }
     - homeowner: backend forces kind='single_family' and unit_count=1
     - building_owner: kind defaults to 'apartment'
     - On success links users.building_id to the new building
     body: { name, address, lat, lon, unit_count, occupancy }
     → 200 { building: Building }
POST /buildings/{id}/roof
     body: { polygon_geojson?, area_m2?, source: 'microsoft_footprints'|'owner_traced'|'owner_typed' }
     → 200 { building: Building }
GET  /buildings/{id}/roof/suggest?lat=&lon=
     → { polygon_geojson, area_m2, confidence } | { available: false }

GET  /energy/{building_id}/series?kind=&from=&to=
     → EnergyReading[]
GET  /energy/{building_id}/today
     → { generation_kwh: number[], load_kwh: number[], irradiance_w_m2: number[] }  (24 entries each)

# Discovery feed (for Provider, Electrician, Financier "Discover" tabs)
GET  /discover?role=provider|electrician|financier&filters=...
     → ProjectCard[]   (Airbnb-style cards: building photo url, name, location, drs pill, gap summary, capital ask, equipment ask, etc.)

# Onboarding
POST /me/onboarding-complete
     body: { displayName?, businessType?, profile? }
     - businessType required for provider role (or already set on user)
     - profile is a JSON bag; merged with existing user.profile (not replaced)
     - Suggested per-role profile shape:
       electrician: { region, scope: ('install'|'inspection'|'maintenance')[] }
       financier:   { investor_kind: 'individual'|'institution', target_deal_size_kes, target_return_pct }
     → 200 { user: User }
     → 403 if body contains role='admin' (defense-in-depth; role isn't in the schema)

POST /me/join-building                      (resident | homeowner | building_owner)
     body: { code: string }                 (4–12 chars, case-insensitive)
     - Looks up building by invite_code; sets users.building_id
     - Single-family buildings only joinable by homeowner role
     → 200 { building: { id, name, address, kind, unitCount } }
     → 404 { error: "invite_code_not_found" }
     → 403 { error: "single_family_homeowner_only" | "role_not_permitted" }

# Geocoding (proxies Nominatim/OpenStreetMap; biased to Kenya)
GET  /geocode?q=<address>
     → 200 { lat, lon, formattedAddress }
     → 400 { error: "query_too_short" }
     → 404 { error: "no_match" }

# Admin provisioning (NOT exposed via HTTP — operator-run scripts only)
# backend/scripts/grant_admin.py <email>
#   - validates email is in ADMIN_EMAILS env var allowlist
#   - upserts user with role='admin'
#   - intended for staging/production operator use
# backend/scripts/seed.py
#   - seeds admin@emappa.test with role='admin' for dev only

# Provider inventory
GET  /providers/{user_id}/inventory → InventoryItem[]
POST /providers/{user_id}/inventory  body: { sku, kind: 'panel'|'infra', stock, unit_price_kes }
     → { item: InventoryItem }
GET  /providers/{user_id}/orders     → ProviderOrder[]
GET  /providers/{user_id}/quote-requests → QuoteRequest[]

# Electrician compliance + jobs
GET  /electricians/{user_id}/jobs?status=active|completed|maintenance → Job[]
POST /electricians/{user_id}/jobs/{job_id}/checklist
     body: { item_id, status, photo_url?, reading? }
GET  /electricians/{user_id}/certifications → Certification[]
POST /electricians/{user_id}/certifications  body: { name, issuer, doc_url, expires_at }
     → { certification: Certification }

# Financier portfolio
GET  /financiers/{user_id}/portfolio → FinancierPosition[]
POST /financiers/{user_id}/pledge-capital
     body: { building_id, amount_kes }
     → { position: FinancierPosition }   (pilot: simulation=true on resulting milestone)

# Wallet (universal — interprets per role server-side)
GET  /wallet/{user_id}/balance       → { kes: number, breakdown: { ... role-specific ... } }
GET  /wallet/{user_id}/transactions  → WalletTransaction[]
```

### WebSocket
```
WS /ws  (after JWT handshake)
events: prepaid.confirmed, drs.updated, settlement.completed, ownership.transferred
```

---

## 4. TypeScript types (locked)

These get added to `packages/shared/src/types.ts` exactly once by Claude Code at sprint start. After that, **read-only**.

```ts
export type Role = 'resident'|'homeowner'|'building_owner'|'provider'|'financier'|'electrician'|'admin';
export type PublicRole = Exclude<Role, 'admin'>;   // role-select UI only ever offers PublicRole
export type BuildingKind = 'apartment'|'single_family';
export type BusinessType = 'panels'|'infrastructure'|'both';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  role: Role;
  businessType: BusinessType | null;   // only meaningful when role === 'provider'
  buildingId: string | null;
  onboardingComplete: boolean;
  displayName: string | null;
  createdAt: string;
  lastSeenAt: string | null;
}

export interface PrepaidCommitment {
  id: string;
  buildingId: string;
  userId: string;
  amountKes: number;
  paymentMethod: 'pledge' | 'mpesa';
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
  confirmedAt: string | null;
}

export interface EnergyReading {
  buildingId: string;
  timestamp: string;
  kind: 'generation' | 'load' | 'irradiance';
  value: number;
  unit: string;
  source: 'synthetic' | 'measured';
  provenance: string;
}

export interface RoofPolygon {
  geojson: GeoJSON.Polygon;
  areaM2: number;
  source: 'microsoft_footprints' | 'owner_traced' | 'owner_typed';
  confidence: number;
}

export interface Building {
  // existing fields preserved...
  roofAreaM2?: number;
  roofPolygonGeojson?: GeoJSON.Polygon;
  roofSource?: 'microsoft_footprints' | 'owner_traced' | 'owner_typed';
  roofConfidence?: number;
  dataSource: 'synthetic' | 'measured' | 'mixed';
}

export interface SettlementPeriod {
  id: string;
  buildingId: string;
  periodStart: string;
  periodEnd: string;
  eGen: number;
  eSold: number;
  eWaste: number;
  revenueKes: number;
  payouts: {
    provider: number;
    financier: number;
    owner: number;
    emappa: number;
    reserve: number;
  };
  simulation: boolean;
  dataSource: 'synthetic' | 'measured' | 'mixed';
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface ProjectCard {
  buildingId: string;
  name: string;
  address: string;
  photoUrl: string | null;
  drsScore: number;
  drsDecision: 'approve'|'review'|'block';
  stage: 'listed'|'qualifying'|'funding'|'installing'|'live'|'retired';
  gapSummary: string;            // e.g. "Needs 12 panels + inverter"
  capitalAskKes?: number;        // for financier feed
  equipmentAsk?: { panels?: number; infrastructure?: string[] };  // for provider feed
  electricianAsk?: { scope: 'install'|'inspection'|'maintenance'; payEstimateKes: number };  // for electrician feed
}

export interface InventoryItem {
  id: string;
  providerUserId: string;
  sku: string;
  kind: 'panel'|'infra';
  stock: number;
  unitPriceKes: number;
  reliabilityScore: number;
}

export interface Certification {
  id: string;
  electricianUserId: string;
  name: string;
  issuer: string;
  docUrl: string;
  issuedAt: string;
  expiresAt: string;
  status: 'valid'|'expiring'|'expired';
}

export interface Job {
  id: string;
  electricianUserId: string;
  buildingId: string;
  scope: 'install'|'inspection'|'maintenance';
  status: 'active'|'completed';
  checklist: Array<{ id: string; label: string; status: 'pending'|'done'|'failed'; photoUrl?: string; reading?: string }>;
  payEstimateKes: number;
  startedAt: string | null;
  completedAt: string | null;
}

export interface FinancierPosition {
  buildingId: string;
  committedKes: number;
  deployedKes: number;
  returnsToDateKes: number;
  irrPct: number;
  milestonesHit: string[];
}

export interface WalletTransaction {
  id: string;
  userId: string;
  at: string;
  kind: 'pledge'|'royalty'|'equipment_sale'|'job_payment'|'capital_deploy'|'capital_return';
  amountKes: number;       // signed: negative = out, positive = in
  reference: string;       // e.g. "Pledge to nyeri-ridge-a"
}
```

---

## 5. Environment variables (frozen)

`.env.example` lists these. Codex owns the file; Claude Code adds backend ones during contract phase.

```
# backend
DATABASE_URL=postgresql+asyncpg://emappa:emappa@localhost:5432/emappa
JWT_SECRET=<32-byte hex>
JWT_TTL_HOURS=24
RESEND_API_KEY=<from resend.com>
RESEND_FROM=auth@emappa.test
ADMIN_EMAILS=admin@emappa.test                # comma-separated allowlist; only these emails may be granted admin via grant_admin.py
NREL_PVWATTS_BASE=https://developer.nrel.gov/api/pvwatts/v8.json
NREL_API_KEY=DEMO_KEY                       # works for low volume; replace later
NASA_POWER_BASE=https://power.larc.nasa.gov/api/temporal/hourly/point
OPEN_METEO_BASE=https://api.open-meteo.com/v1/forecast
MS_FOOTPRINTS_BASE=https://minedbuildings.z5.web.core.windows.net
GOOGLE_MAPS_STATIC_KEY=<optional, for satellite tiles>
ALLOW_DEV_OTP_CONSOLE=true                  # dev only — also prints OTP to logs

# frontend (mobile, cockpit, website)
EXPO_PUBLIC_API_BASE_URL=http://localhost:8010
VITE_API_BASE_URL=http://localhost:8010
```

---

## 6. Sprint sequence

```
T+0:00   Claude Code: lock contract, add shared types, write 0001 migration, push sprint/contract → main
T+0:30   All three agents start in parallel against frozen main
T+5:30   Cutoff for new code. Agents wrap up, push final commits.
T+6:00   Claude Code merges sprint/backend → main
T+6:30   Cursor rebases sprint/mobile, fixes any contract drift, pushes; Claude Code merges → main
T+7:00   Codex rebases sprint/infra, pushes; Claude Code merges → main
T+7:30   Smoke-test full stack locally (docker-compose up + expo + cockpit + website)
T+8:00   Tag v0.1-pilot, deploy backend + cockpit + website to staging
```

---

## 7. Subagent rules (per top-level agent)

Each top-level agent may spawn parallel subagents to attack independent slices of its assigned scope. Subagents must:
1. Stay within their parent agent's owned paths (per §1).
2. Each work on a separately-named feature branch under their parent's branch (e.g. `sprint/backend/auth`, `sprint/backend/pvwatts`).
3. Re-merge into the parent's branch before the parent pushes for the global merge.
4. Never edit files outside their slice, even if it would "fix something."

The recommended subagent split is in each agent's individual prompt.
