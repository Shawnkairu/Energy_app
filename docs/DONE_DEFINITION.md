# Definition of Done — per Artifact Type

> Generated 2026-05-16. The verification gate for every artifact in [docs/MISSING.md](MISSING.md) / [docs/BUILD_PLAN.md](BUILD_PLAN.md). An artifact is **not** done until every applicable box is checked. No exceptions, no "I'll come back to it."

## Universal gates (apply to every artifact)

| Gate | Check |
|---|---|
| **U1 Spec citation** | PR description lists the IA_SPEC §section AND the imported-specs source (e.g., "Scenario A §6.2") |
| **U2 Type-check** | `pnpm -w typecheck` green; no `@ts-ignore`, no `any` added |
| **U3 Lint** | `pnpm -w lint` green; no `eslint-disable` added |
| **U4 Build** | `pnpm -w build` green across all packages touched |
| **U5 No silent fallback (CR-8)** | Loading, empty, error states explicit. No fallback to mock or stale cache without a `SyntheticBadge` or equivalent affordance |
| **U6 No regressions** | Existing tests still pass; existing routes still render |
| **U7 No new imports of removed/renamed symbols** | Grep confirms no leftover refs (e.g., post-rename `DrsCard`) |
| **U8 PR < 300 LOC diff** | Larger work is split into multiple artifacts. Cockpit BuildingDetail tab split is one PR per tab, not one PR for all 8. Keeps 2-week pace viable. |

---

## Components (TSX, mobile/web/cockpit)

| Gate | Check |
|---|---|
| **C1 Lives at spec-mandated path** | File path matches IA_SPEC component-catalog target (`mobile/components/shared/...` or `cockpit/src/components/...`) |
| **C2 Named export matches spec** | Export name matches IA_SPEC exactly (case-sensitive). No alias-only exports |
| **C3 Props are typed in `packages/shared/src/types.ts`** | Cross-role components: props interface lives in shared. Role-only: local is OK. Never `props: any` |
| **C4 All spec-required states render** | E.g., `BuildingAvailabilityStatePill` renders all 7 states (A0..A6); `DataQualityBadge` all 5 (verified/estimated/missing/disputed/conservative) |
| **C5 No invented fields** | Component only renders fields the spec calls out. Don't add "creator's choice" extras |
| **C6 Snapshot or smoke test if non-trivial** | Components with branching state get a Jest test that mounts each state. Pure-display pills: smoke test only |
| **C7 Web parity (IA-U10)** | If component is used on both mobile and web, web mirror lives at `website/src/components/<name>.tsx` and renders the same fields |

---

## Screens / routes (TSX)

| Gate | Check |
|---|---|
| **S1 Route lives at spec path** | `mobile/app/(role)/<screen>.tsx` or `cockpit/src/pages/<Screen>.tsx` matches IA_SPEC |
| **S2 5-tab rule (mobile public roles)** | Per role, exactly the tabs IA_SPEC lists. No extras. (Admin = 3 tabs. Cockpit exempt.) |
| **S2a IA-U2 Profile is rightmost tab** | For every mobile public role, `Profile` is the last (rightmost) tab in the bottom tab bar. Verified by snapshot of `RoleTabs` order per role. |
| **S2b IA-U8 Profile structure** | Profile tab embeds (in this order): Account → role-specific embeds → Settings → Support → Logout. No role's Profile invents extra top-level tabs. |
| **S3 All four states present** | Loading, empty, error, populated. Verified by either a manual preview walk or a render test that drives each state |
| **S4 Spec-required hero / sections rendered** | E.g., Resident Home has BuildingAvailabilityStatePill + capacity pill + branched pre-live/live hero |
| **S5 No dead buttons** | Every button/link has a handler that does the spec-mandated action. No `onClick={() => {}}` stubs |
| **S6 Deep-linkable (cockpit CR-9)** | Cockpit pages addressable via URL. No "view state in App.tsx" |
| **S7 Runtime walked in preview** | For previewable surfaces (website/cockpit and any mobile-web export): preview_start → preview_click → preview_snapshot confirming the screen renders. Console logs free of warnings/errors. Screenshot attached to PR |
| **S8 Web parity (IA-U10)** | If role has mobile + web surface, both exist and render same data |

---

## Embedded routes (TSX, mobile)

Same as Screens, plus:

| Gate | Check |
|---|---|
| **E1 Lives under `(role)/_embedded/`** | Per IA_SPEC convention |
| **E2 Reachable from at least one tab** | Verified by grep for the route name in the parent tab's source |
| **E3 Back behavior correct** | Returns to the spec-correct parent tab, not the app root |

---

## Onboarding steps (TSX)

| Gate | Check |
|---|---|
| **O1 Lives at spec step path** | E.g., Scenario C §6 step 5 (Authority verification) lives at `mobile/app/(onboard)/homeowner/authority.tsx` |
| **O2 Writes every spec-required field to backend** | Cross-check the spec field list against the POST body |
| **O3 Step gating preserved** | Cannot skip past gated steps. E.g., can't reach "initiate project" without authority `verified` |
| **O4 Web parity** | Equivalent step exists in `website/src/onboard/<role>/<step>.tsx`; no monolithic single-page onboarding |
| **O5 Back/exit safe** | Back preserves in-progress state; exit prompts confirm |
| **O6 Idempotent** | Re-submitting the same step does not double-write |

---

## Backend endpoints (FastAPI)

| Gate | Check |
|---|---|
| **B1 Route lives at spec path** | E.g., `POST /residents/{id}/load-profile` in `backend/app/api/residents.py` |
| **B2 Pydantic request/response models** | Inputs validated; response typed. Re-use shared types where they exist |
| **B3 Auth enforced** | Endpoint has the correct dependency (`require_user`, `require_role`, `require_admin`) |
| **B4 Mutation = audit-logged (CR-2)** | Every state-changing endpoint writes to `audit_log` via the audit middleware with `{actor_id, action, target_entity, before, after, reason}` |
| **B5 Pytest covers happy + 1 sad path** | Minimum: 200 happy path, 4xx for bad input. Mutation endpoints also assert audit entry written |
| **B6 Doctrine invariants enforced** | E.g., settlement endpoints assert `Σ payouts ≤ Σ inflows`; DRS endpoints reject mark-complete without evidence URI; homeowner wallet never emits host-royalty line |
| **B7 OpenAPI schema validates** | `pytest backend/tests/test_openapi.py` (or equivalent) passes |
| **B8 No N+1 queries** | If touching a relationship, use joined load. Verified by SQLAlchemy echo in tests if non-obvious |

---

## Database migrations (Alembic)

| Gate | Check |
|---|---|
| **D1 Migration file named correctly** | `backend/alembic/versions/<rev>_<descr>.py` with downgrade implemented |
| **D2 Upgrade + downgrade round-trip clean** | `alembic upgrade head && alembic downgrade -1 && alembic upgrade head` succeeds on a fresh DB |
| **D3 Model matches migration** | SQLAlchemy model field types match column types; no drift |
| **D4 Indexes on FK + lookup columns** | Any FK + any column used in WHERE / ORDER BY has an index |
| **D5 Data backfill if needed** | If migration adds a NOT NULL column, backfill is part of the migration (not a separate script) |
| **D6 Reversibility** | Downgrade restores data to pre-migration shape. If data must be dropped on downgrade (e.g., a new column), downgrade snapshots the column to a sidecar table before drop. No silent data loss. |
| **D7 No doctrine-violating raw SQL** | Migration body never runs SQL that would violate an invariant: no `UPDATE prepaid_balance` that introduces negative values, no `DELETE FROM audit_log`, no raw `INSERT INTO host_royalty_payout` for a homeowner-owned building, no schema change that drops the immutability constraint on `audit_log`. |

---

## Cockpit pages (TSX)

Same as Screens, plus the Universal Cockpit Rules CR-1..CR-9 from [IA_SPEC §Universal Cockpit Rules](IA_SPEC.md):

| Rule | Check | Test target |
|---|---|---|
| **CR-1 Admin role isolation** | Page is unreachable for non-admin sessions (App-level guard hard-rejects, not just hides data). Render test asserts `<Redirect>` when session role ≠ admin. | `cockpit/__tests__/admin-isolation.test.tsx` |
| **CR-2 Every mutation audited** | Every form submit goes through an audit-wrapped action with a non-empty `reason` field. Audit table is append-only — assert no `UPDATE` permission on `audit_log` in schema. | `backend/tests/test_audit_immutability.py` |
| **CR-3 PII masking** | Any field rendering phone / national ID / payout account uses the `<MaskedField>` primitive with a `pii:view` claim check. Unmask attempt without claim returns 403 AND writes a denied-attempt audit row. | `backend/tests/test_pii_claim.py` |
| **CR-4 Agent-action attribution** | Any agent-proposed action surfaces `agent_id`, `agent_version`, `confidence`, `evidence_uris[]`. Agent actions sit in `pending_admin_approval` state until explicit accept/reject; no silent auto-approval. | `backend/tests/test_agent_action_workflow.py` |
| **CR-5 Conservative-by-default** | When data quality is missing/disputed, the page shows the `<ConservativeSettleBanner>` (reads response header `X-Emappa-Conservative`) and disables mutation CTAs. | `cockpit/__tests__/conservative-banner.test.tsx` |
| **CR-6 Critical-gate override discipline** | DRS/LBRS critical-gate forms render no "Force complete" button at all (not just disabled). Render test scans the DOM for the string. | `cockpit/__tests__/drs-no-force-complete.test.tsx`, `cockpit/__tests__/lbrs-no-force-complete.test.tsx` |
| **CR-7 RBAC-scoped queues** | Queue page filters by JWT scope (jurisdiction, severity ceiling). Out-of-scope items hidden, not greyed. Backend test asserts `GET /queues/{kind}` returns 0 items when scope excludes all. | `backend/tests/test_rbac_scope.py` |
| **CR-8 No silent fallback** | Loading/empty/error/partial states explicit; no mock data fallback. Lint rule rejects imports of `mockData` outside test files. | `eslint` custom rule + per-component state tests |
| **CR-9 Deep-linkable** | Every queue item, building drill-down tab, agent panel, audit entry is a permalink. Test navigates to a deep URL and asserts the correct surface renders. | `cockpit/__tests__/deep-link.test.tsx` |

---

## Shared types (packages/shared)

| Gate | Check |
|---|---|
| **T1 Type lives in `packages/shared/src/types.ts`** | Cross-package types live here. Domain logic stays out — that goes in `packages/shared/src/domain.ts` |
| **T2 Type matches backend Pydantic model** | If backend model has 12 fields, shared type has 12 fields, same nullability |
| **T3 Type test exists** | `packages/shared/src/types.test.ts` has at least one `expectType` for the type |

---

## AI agent backend skeleton (Python/FastAPI)

Per [IA_SPEC §AI-Native Cockpit Surfaces](IA_SPEC.md) and [AI-native §4 governance](imported-specs/ai-native-company-system-design.md). Even a stub agent must satisfy these:

| Gate | Check |
|---|---|
| **A1 Lives at spec path** | `backend/app/agents/<agent_name>.py` matches IA_SPEC §Agent Panels table |
| **A2 Signature** | Takes `(project_id: str, evidence: dict)` and returns `AgentProposal {agent_id, agent_version, proposed_action, confidence: float, evidence_uris: list[str], rationale: str}` |
| **A3 No autonomous mutation** | Agent never writes to mutable tables. Proposed actions land in `agent_action` table with `status='pending_admin_approval'`. Closed-loop economic engine writes (AI-native §3.4) are the only exception and must log to `audit_log` with `actor=agent_id`. |
| **A4 Eval suite exists** | `backend/eval/<agent_name>/cases.yaml` defines ≥3 cases (happy, edge, regression). Pass threshold ≥80%. |
| **A5 Pytest** | `backend/tests/test_<agent_name>.py` mocks evidence input, asserts proposal shape + confidence range + audit row on accept/reject |

---

## Eval harness config (YAML/JSON)

Per [IA_SPEC §Eval Harness UI](IA_SPEC.md):

| Gate | Check |
|---|---|
| **E1 Lives at spec path** | `backend/eval/<agent_name>/cases.yaml` |
| **E2 Schema** | Each case: `{id, description, input, expected_proposed_action, expected_confidence_min, expected_evidence_kinds[]}` |
| **E3 Loadable by harness** | `cockpit/src/pages/EvalHarness.tsx` can GET `/eval/runs?agent=X` and render |
| **E4 No secrets in config** | No API keys, no hardcoded prod URIs, no PII |

---

## Background jobs / task queue

| Gate | Check |
|---|---|
| **J1 Lives at spec path** | `backend/app/workers/<job_name>.py` |
| **J2 Read-only by default** | Reads `audit_log` / `event_log` / model state; only mutates when its action is part of a documented closed-loop control variable (AI-native §3.4) |
| **J3 No silent failure** | Failures write to `alert` table (severity = job-specific) and page on-call per `alert.severity_threshold` |
| **J4 Idempotent / retry-safe** | Retry preserves invariants (Σ payouts ≤ Σ inflows). Pytest fixture replays the same job twice and asserts identical state |

---

## WebSocket / SSE endpoints

| Gate | Check |
|---|---|
| **W1 Auth same as REST** | JWT validated on connect; reconnect re-validates |
| **W2 No mutation over socket** | Sockets are read-only push; mutations stay on REST |
| **W3 RBAC scope respected** | Subscription filtered by claim scope (CR-7) |
| **W4 Pytest covers connect / message / disconnect** | `backend/tests/test_<endpoint>_ws.py` async test |

---

## CI gates (per [MISSING.md §CI gates](MISSING.md))

These are *cross-cutting* tests — not tied to a single artifact, but every artifact must avoid breaking them. Grouped by doctrine source.

### Doctrine: prepaid + monetized + capacity (Scenarios A, F, installation, AI-native)

| Gate | Test file | Asserts |
|---|---|---|
| Prepaid-only (no postpaid, no arrears) | `backend/tests/test_prepaid_only.py` | Token consumption is never allowed when `prepaid_balance == 0`; no "credit" / "deferred-settlement" state on user account; no DB column allows negative balance |
| No payout from unpaid usage | `backend/tests/test_no_unpaid_payout.py` | Settlement endpoint with `E_consumed_but_unpaid > 0` does NOT include that kWh in any waterfall pool |
| Monetized-only (no E_waste payout) | `backend/tests/test_settlement.py::test_no_waste_payout` | Settlement run with `E_gen > E_sold` only pays out for `E_sold`; `E_waste` produces 0 payout |
| Settlement solvency invariant | `backend/tests/test_settlement.py::test_solvency` | `Σ payouts ≤ Σ inflows` for every settlement run |
| Capacity-cleared prereq for token purchase | `mobile/__tests__/resident-token-purchase.test.tsx` + `backend/tests/test_token_purchase.py` | Token purchase button disabled when `capacity_status != 'cleared'`; backend `POST /tokens/purchase` returns 409 if not cleared |
| "Buy tokens" CTA hidden pre-activation | `mobile/__tests__/resident-home.test.tsx` | Pre-activation home does not render `<TokenPurchaseCTA>` (mutex with pledge UI) |

### Doctrine: DRS / LBRS gates (installation)

| Gate | Test file | Asserts |
|---|---|---|
| DRS < 100% blocks installation | `backend/tests/test_drs_gate.py` | `POST /projects/{id}/install` returns 409 if `drs_score < 100` OR any `critical_blocker == 'failed'` |
| LBRS < 100% blocks go-live | `backend/tests/test_lbrs_gate.py` | `POST /projects/{id}/go-live` returns 409 if `lbrs_score < 100` OR any critical test failed |
| Solar-bus-isolation non-overridable (installation §10) | `backend/tests/test_lbrs_gate.py::test_solar_bus_isolation_blocks` | Even with admin override claim, LBRS go-live rejects if solar-bus-isolation test is `failed` |
| Critical-gate override has no UI affordance | `cockpit/__tests__/drs-no-force-complete.test.tsx`, `cockpit/__tests__/lbrs-no-force-complete.test.tsx` | Render scan of DRS/LBRS queue detail finds no button with text matching `/force.*complete/i` |

### Doctrine: role isolation + role economics (README, Scenarios B, C, D)

| Gate | Test file | Asserts |
|---|---|---|
| `role='admin'` blocked in public roleset | `packages/shared/src/roles.test.ts` | `PUBLIC_ROLES` enum does not include `admin`; type-level assertion |
| `role='admin'` rejected by `/me/select-role` | `backend/tests/test_me_role.py` | `POST /me/select-role` with `role='admin'` returns 403 |
| Cockpit hard-rejects non-admin (CR-1) | `cockpit/__tests__/admin-isolation.test.tsx` | Render with `useUser().role = 'resident'` redirects to logout, does not render Cockpit shell |
| Homeowner wallet zeroes host-royalty | `backend/tests/test_wallet.py::test_homeowner_no_host_royalty` | Homeowner wallet response never contains `host_royalty` line item, even when HO is also BO of their own building |
| Labor-as-capital is opt-in (Scenario D §22.1) | `backend/tests/test_labor_as_capital.py` | `POST /electricians/{id}/labor-as-capital-claim` requires `opt_in=true` AND `signed_contract_uri`; default payout path is `cash_upfront` |

### Doctrine: financier compliance + language (Scenario F)

| Gate | Test file | Asserts |
|---|---|---|
| Discover hides ineligible projects (Financier) | `backend/tests/test_offerings.py` + `mobile/__tests__/financier-discover.test.tsx` | `GET /financiers/{id}/eligible-offerings` filters by jurisdiction, investor tier, restricted list. UI never renders ineligible card. |
| No-guarantee language on projections | `website/__tests__/financier-projection.test.tsx`, `mobile/__tests__/financier-projection.test.tsx`, lint custom rule | Projection panels render "range" / "scenario" copy; lint rejects strings matching `/guarantee[d]?|you will earn|fixed payout|risk-free/i` outside test fixtures |
| Ownership sale requires valuation | `backend/tests/test_ownership_sale.py` | `POST /ownership/sale` requires `valuation_method`, `valuation_uri`, `valuation_signoff_by`; rejects without |
| Share buy-down uses retained-claim language (Scenario E §15.1) | `mobile/__tests__/provider-generation.test.tsx`, lint custom rule | Generation screen renders "retained claim" / "remaining share"; never "generation decreased" / "your generation falls" |

### Doctrine: AI-native governance (AI-native §4)

| Gate | Test file | Asserts |
|---|---|---|
| Audit log immutability | `backend/tests/test_audit_immutability.py` | `audit_log` table has no UPDATE permission for application role; attempted UPDATE raises; no foreign-key cascade deletes |
| Agent action requires admin co-sign | `backend/tests/test_agent_action_workflow.py` | Agent-proposed action lands as `status='pending_admin_approval'`; only accept/reject endpoint (with reason) advances state; rejected attempt writes audit row |
| PII view claim enforced | `backend/tests/test_pii_claim.py` | Unmask requires `pii:view` JWT claim; without claim returns 403 AND writes denied-attempt audit |
| Conservative-by-default banner (CR-5) | `backend/tests/test_conservative_settle.py` | Response sets `X-Emappa-Conservative: true` when any input data-quality flag is missing/disputed |
| Agent eval pass threshold | `backend/tests/test_agent_eval.py` | Each agent's eval suite (per A4) passes ≥80% threshold; CI fails on regression |

Every PR must run `pnpm -w test` AND `pytest backend/` AND pass every gate above.

---

## Reviewer checklist (use this in PR template)

```
## Spec
- IA_SPEC § ___________
- Imported-spec source: ___________ (e.g., "Scenario F §17", "AI-native §4", "installation §3 gate 7")
- Doctrine rule (if touches settlement / wallet / DRS/LBRS gates / agent actions / copy): ___________
- BUILD_PLAN task ID: P_._._._  (e.g. `P0.2.7`, `P9.1.24` — 3- or 4-level dotted)

## Done gates (check all that apply)
- [ ] Types green
- [ ] Lint green
- [ ] Build green
- [ ] Unit tests + relevant CI gates from DONE_DEFINITION §CI gates green
- [ ] Runtime walk in preview (for screens/pages) — screenshot attached
- [ ] All spec-required states render (loading / empty / error / populated)
- [ ] No silent fallback / no dead buttons
- [ ] Web parity (if applicable, IA-U10)
- [ ] Audit middleware engaged (if mutation endpoint) + test added to `test_audit.py` verifying `reason` populated
- [ ] Cockpit Universal Rules CR-1..CR-9 satisfied (if cockpit) — list which ones touched: ___
- [ ] Anti-pattern scan: no `host_royalty` in homeowner wallet, no "guaranteed" copy, no common-bus default, no `role='admin'` at data-layer-only check
- [ ] PR < 300 LOC diff
- [ ] [MISSING.md](docs/MISSING.md) row updated to EXISTS (and stale name refs cleaned)

## Rollback plan
- [ ] Migration has downgrade (D1)
- [ ] Downgrade tested round-trip on fresh DB (D2)
- [ ] No data deleted irreversibly (D5)
- [ ] No raw SQL that violates doctrine — no `UPDATE prepaid_balance WHERE unpaid_usage > 0`, no `DELETE FROM audit_log`, etc. (D7)
```

---

## Anti-patterns (auto-reject)

- `// TODO: …` left in shipped code
- `@ts-ignore` / `@ts-expect-error` without a linked issue
- `eslint-disable` without justification
- Mock data not behind a `SyntheticBadge`
- `console.log` in production paths
- Hardcoded UUIDs except seed fixtures
- Inline styles where a theme token exists
- **Copy: "guaranteed return", "you will earn", "fixed payout", "risk-free", "you will receive"** — violates Scenario F §17. Use "projected range", "scenario", "under assumptions".
- **Copy: "generation decreased", "your generation falls"** when describing share buy-down — violates Scenario E §15.1. Use "retained claim decreased", "remaining share".
- **Copy: "common bus", "shared injection", "single inverter for the building"** — violates Scenario D §3 + installation §2 architecture. Use "per-apartment ATS", "Solar DB + ATS chain".
- **Copy: "you earned by paying yourself"** on homeowner wallet — violates Scenario C §11.1. Self-consumption is savings, not cash.
- `role === 'admin'` check at the data-fetch layer only (must be App-level reject — CR-1)
- New routes added without updating IA_SPEC.md if not already listed
- `host_royalty_*` fields on homeowner wallet endpoint or response
- `role` value `'admin'` in any public schema (admin is JWT scope, not a public role value)
- Agent panel that mutates state without admin co-sign (CR-4)
- Force-complete button on DRS/LBRS critical-gate forms (CR-6 — even disabled is wrong; must not render)
- Settlement code paths that pay out from `E_waste`, `E_unpaid`, or `E_disputed` kWh
- Backend endpoint that returns ineligible offerings to a financier whose `eligibility_status != 'approved'` for that jurisdiction

---

**END DONE_DEFINITION** — Pair with [BUILD_PLAN.md](BUILD_PLAN.md) (sequencing) and [MISSING.md](MISSING.md) (backlog). The triple is the entire build contract.
