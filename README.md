# e.mappa

e.mappa is a mobile-first operating system for **apartment-level** energy economies on a dedicated solar supply path. It qualifies buildings before deployment, pre-onboards prepaid demand from participating apartments, coordinates deal-level capital, verifies installation quality (including per-unit ATS and switching), and settles cashflows only from monetized solar energy.

## Stack

- `mobile`: Expo + Expo Router, primary mobile app
- `website`: Vite + React + TypeScript, public site plus isolated stakeholder web portals
- `cockpit`: Vite + React + TypeScript, internal e.mappa ops cockpit with integrated stress testing
- `packages/shared`: formulas, domain types, mock data, and business rules
- `packages/ui`: light-first design tokens and shared UI primitives
- `packages/api-client`: mock API/state layer that exposes computed product data

## Core Rules

- Prepaid only: no prepaid cash, no solar allocation, no payout.
- DRS gates deployment before funding release, hardware scheduling, and go-live.
- Payouts are based on monetized solar, not generated or wasted energy.
- Ownership controls future cashflows. Selling shares reduces the seller's future payout.
- Business logic lives in `packages/shared` and is imported everywhere.
- Stakeholder portals stay role-isolated; cockpit/admin remains internal-only.
- Stakeholder sections are registered in `packages/shared`; every phone-visible non-admin section must have a matching website portal section, while web may add clearly marked web-only depth.

## Canonical docs

> **Source of truth:** [docs/imported-specs/](docs/imported-specs/README.md) — scenarios A–F, the DRS/LBRS/go-live installation spec, and the AI-native system design are the only authoritative product docs. Every other doc in the repo must align with them; gaps in code are tracked in [docs/SPEC_COMPLIANCE_CHECKLIST.md](docs/SPEC_COMPLIANCE_CHECKLIST.md), not deferred.

- [docs/imported-specs/](docs/imported-specs/README.md) — anchor product specs (scenarios A–F, DRS/LBRS installation)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — monorepo surfaces and physical/economic model
- [docs/DRS_FORMULA.md](docs/DRS_FORMULA.md) · [docs/LBRS_FORMULA.md](docs/LBRS_FORMULA.md)
- [docs/ENERGY_FORMULAS.md](docs/ENERGY_FORMULAS.md) · [docs/SETTLEMENT_AND_PAYBACK.md](docs/SETTLEMENT_AND_PAYBACK.md)
- [docs/USER_FLOWS.md](docs/USER_FLOWS.md) · [docs/ROLE_MATRIX.md](docs/ROLE_MATRIX.md) · [docs/COMPLIANCE_AND_RISK.md](docs/COMPLIANCE_AND_RISK.md)
- [docs/DEPLOYMENT_AND_READINESS.md](docs/DEPLOYMENT_AND_READINESS.md) — maturity tiers (local → demo → staged launch → production), ops/readiness matrix, deployment gap log (distinct from spec/IA checklist)

## Commands

```bash
npm install
npm run dev:website
npm run dev:cockpit
npm run dev:mobile
npm run audit:shared
npm run build
```

## CI & deployment

**Ship/ops readiness** (synthetic vs pilot vs production, integrations, gap log): [docs/DEPLOYMENT_AND_READINESS.md](docs/DEPLOYMENT_AND_READINESS.md).

**Required checks** (mirrors `.github/workflows/ci.yml`): `npm run typecheck`, `npm run lint`, `npm run audit:shared`, `npm run test:shared`, `npm run build`, backend `alembic upgrade head` + `pytest tests`.

**Frontend-only gate (local):** `npm run ci` runs audit + shared tests + typecheck + lint + build in one command.

**Local backend:** copy `backend/.env.example` → `backend/.env`, start Postgres, then:

```bash
cd backend && python -m pip install -r requirements.txt
alembic upgrade head
.venv/bin/python -m pytest tests -q   # or: npm run test:backend
.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Docker:** `docker compose up --build`. Then apply schema: `docker compose exec backend alembic upgrade head` (first run only).

**Frontends:** `website` uses root `vercel.json` (`npm run build:website` → `website/dist`). `cockpit/` has its own `vercel.json` (install/build from repo root for workspace packages). Staging workflow: `.github/workflows/deploy-staging.yml` (tags `v*-pilot`, optional Fly + Vercel secrets).
