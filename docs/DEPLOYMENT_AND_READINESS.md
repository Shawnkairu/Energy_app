# Deployment & readiness

This document is the **ship / ops readiness** track: what must be true to run e.mappa at a given **maturity tier**, and an honest snapshot of where this repository stands. It complements product traceability and IA checks elsewhere.

**Relationship to other docs**

| Document | Purpose |
|----------|---------|
| [SPEC_COMPLIANCE_CHECKLIST.md](./SPEC_COMPLIANCE_CHECKLIST.md) | Spec / IA / formula parity / stakeholder UX traceability — answers “does the product shape match what we documented?” |
| **This file** | Deployment maturity — answers “what is safe to run where, with what integrations, under what ops assumptions?” |
| [PILOT_SCOPE.md](./PILOT_SCOPE.md) | Authoritative **pilot carve-outs** (email OTP, pledges, synthetic energy, etc.) vs long-term doctrine |
| [COMPLIANCE_AND_RISK.md](./COMPLIANCE_AND_RISK.md) | Legal / regulatory **product requirements** (not legal advice), especially financier-heavy flows |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Surfaces, gates (DRS/LBRS), pilot vs production pointer |
| [.github/workflows/ci.yml](../.github/workflows/ci.yml) | Automated **quality gates** (typecheck, lint, build, shared audit/tests, backend migrations + pytest) — necessary but not sufficient for production |

Use the checklist for merges that touch UX, APIs, or formulas. Use **this** doc when planning environments, integrations, pilot vs demo labeling, and operational hardening.

---

## Maturity tiers

**Local prototype** —Developers run services on laptops (`npm run dev:*`, local Postgres, optional `docker compose`). Data may be seeded demo UUIDs; auth may use dev shortcuts (e.g. console OTP). No expectation of uptime, tenant isolation review, or external SLA. Goal: fast iteration and parity tests.

**Demo (synthetic)** —A replayable **demonstration** of stakeholder journeys using **synthetic** or seeded data. Labels (`Pilot`, `Synthetic`, `syntheticDemo`) must distinguish projection from measured truth. Suitable for investor or partner demos, not for billing or regulatory reliance. API-client mock mode and shared **simulator** paths fall here when backend workflow persistence is incomplete.

**Staged pilot** —A **controlled** deployment (limited buildings/users) with real operators, monitoring expectations, and documented carve-outs from [PILOT_SCOPE.md](./PILOT_SCOPE.md) (e.g. email OTP, pledges not charges, synthetic energy until meters exist). Requires hardened secrets, backups, incident contacts, and explicit “non-production financial” posture unless counsel clears otherwise.

**Production** —General-availability operation: real money movement where applicable, measured energy where claimed, full auth/session posture, observability, DR/backups, jurisdiction-aware compliance (KYC/KYB, disclosures, escrow as required), and runbooks. Pilot carve-outs are **off** unless behind flags with legal sign-off.

---

## Readiness matrix

Legend for tier columns: **—** = not required; **Min** = minimum bar; **Full** = production-grade expectation. **Current (repo)** uses: *stub*, *mock*, *partial*, *prod-ready*.

| Area | Local prototype | Demo (synthetic) | Staged pilot | Production | Current (repo) |
|------|-----------------|------------------|--------------|------------|----------------|
| **Auth & identity** | Dev login acceptable | Demo accounts OK; synthetic session flags | Email OTP or better; JWT storage; rate limits reviewed | SMS/identity as designed; MFA/policy as required | **partial** — Backend JWT + email OTP path; CI uses dev OTP console; mobile/session flows vary by env |
| **Data & persistence** | SQLite/memory optional | Seeded DB + reproducible demos | Postgres + migrations; backup plan | HA / PITR / retention policy | **partial** — Postgres + Alembic in CI; demo/synthetic resolution in services |
| **APIs & contracts** | Best-effort | Match documented shapes for demos | Versioned/error contracts; deprecation policy | SLA-backed read paths; breaking-change process | **partial** — Core endpoints + tests; workflow transition APIs for simulator **not** fully persisted ([SPEC_COMPLIANCE_CHECKLIST §8.1 SIM-3](./SPEC_COMPLIANCE_CHECKLIST.md)) |
| **Security & secrets** | `.env.local`, no prod secrets | No real PII/finance | Secret manager; least privilege; cockpit isolation | Pentest cadence; audit logs on mutations | **partial** — `.env.example`; admin allowlists in seed; no documented secret-management runbook |
| **Observability** | Console logs | Enough to debug demos | Metrics + alerts on auth/API errors | SLOs, tracing, log retention | **stub** — Not enforced in CI; product relies on app logs |
| **Ops / runbooks** | README commands | Demo reset procedure | On-call, rollback, DB restore drill | DR exercised | **stub** — README + pilot docs; no ops playbook index |
| **Legal / compliance hooks** | N/A | Disclaimers in UX | Pilot disclosures; no retail capital without counsel | KYC/KYB, escrow, jurisdiction gates | **partial** — UX/status placeholders; [COMPLIANCE_AND_RISK.md](./COMPLIANCE_AND_RISK.md) lists non-negotiables not fully implemented |
| **Mobile release** | Expo dev client | Internal distribution | TestFlight / Play internal track | Store release + signing pipeline | **partial** — EAS/build wiring described in ROADMAP; not asserted prod-ready here |
| **Web hosting** | Vite dev server | Static demo deploy | Staging URL + env separation | WAF, CSP hardening as policy | **partial** — Vercel configs exist (`README`); production checklist not centralized |
| **Backend hosting** | `uvicorn --reload` | Single small VM/containers | Managed DB + health checks + autoscale profile | Multi-AZ / governed change windows | **partial** — Docker/README paths; no single source deploy manifest in-repo |
| **Migrations** | Optional | Repeatable from empty DB | Automated on deploy; rollback tested | Zero-downtime strategy | **partial** — `alembic upgrade head` in CI |
| **Cost / limits** | Unbounded OK | Cache external APIs (PVWatts, etc.) | Quotas documented | FinOps review | **partial** — PILOT_SCOPE notes free tiers; no centralized quota dashboard |

---

## Gap log

Use this table to track **deployment blockers** explicitly (open a GitHub issue and link it in **Link**).

| ID | Severity | Blocker? | Area | Summary | Owner | Link |
|----|----------|----------|------|---------|-------|------|
| DR-GAP-001 | High | Pilot→prod | Legal / compliance | Financier flows surface **KYC/escrow/investment** UX as prototype; real KYC/KYB, custody, and disclosures are **not** implemented ([COMPLIANCE_AND_RISK.md](./COMPLIANCE_AND_RISK.md), scenario F traceability). | TBD | `docs/imported-specs/scenario-f-financier-flow.md` |
| DR-GAP-002 | Medium | No (pilot OK) | Data truth | **Synthetic** generation/load/irradiance per [PILOT_SCOPE.md](./PILOT_SCOPE.md); measured-meter path is post-pilot. Risk: demos mistaken for ground truth without badges/copy. | Eng | `mobile/components/PilotBanner.tsx`, shared `source` / `dataSource` types |
| DR-GAP-003 | Medium | For “real” ops | APIs & persistence | Unified **scenario / workflow transitions** are replayable in shared/cockpit but **backend/API persistence** for workflow state is **Open** (SIM-3). | Eng | [SPEC_COMPLIANCE_CHECKLIST §8.1](./SPEC_COMPLIANCE_CHECKLIST.md) |
| DR-GAP-004 | Medium | Prod auth | Auth | **Email OTP** and dev/console OTP paths are pilot-aligned; **SMS** and carrier governance are deferred. | Eng | [PILOT_SCOPE.md §1](./PILOT_SCOPE.md) |
| DR-GAP-005 | High | Production | Observability | No mandated **metrics/alerts/tracing** contract in repo; CI proves tests, not runtime operations. | Ops | `.github/workflows/ci.yml` |

Add rows as discoveries land; close gaps by linking PRs or issues, not by deleting history without a changelog note.

---

## CI vs deployment

Passing CI means: workspace **typecheck**, **lint**, **build**, **shared tests + audit**, backend **migrations + pytest** against Postgres. That validates **engineering correctness** on a clean checkout — not production readiness, tenant penetration testing, or legal sign-off. Treat CI as a **subset** of the Staged pilot / Production columns above.

---

## Related commands (quick pointer)

See [README.md](../README.md) § **CI & deployment** for local backend, Docker, and frontend deploy notes.
