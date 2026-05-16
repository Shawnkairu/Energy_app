# Build Plan — emappa MVP

> Generated 2026-05-16. Drives the build sequence to take MISSING.md from 207 MISSING → 0. Each phase: artifacts, dependencies, owner-agent, verification gate, sprint sizing. Source of truth for backlog: [docs/MISSING.md](MISSING.md). Source of truth for screens: [docs/IA_SPEC.md](IA_SPEC.md) v3.0.

## How to read this

Phases are sequential gates (P0 must finish before P1..P6 can run, P1..P6 can run in parallel, P7..P9 layer on top). Each phase contains numbered tasks (`P{phase}.{group}.{task}`) that act as assignment units — an agent picks up `P0.2.7` as a discrete deliverable. Every task names a file target so a developer can grep this document for "where do I create this file." Verification per artifact lives in [docs/DONE_DEFINITION.md](DONE_DEFINITION.md). Agent assignment lives in [docs/agents/SPRINT_KICKOFF.md](agents/SPRINT_KICKOFF.md). Sprint durations are *suggested* — actual velocity depends on agent throughput and review latency.

## Phase map at a glance

Target: **ship MVP this weekend (Sat + Sun, ~10 hours per agent per day) with 3 AI agents in parallel.** 312 artifacts ÷ 2 days ÷ 3 agents = **~52 artifacts per agent per day = ~6-10 min per artifact end-to-end**. This is mechanical pace. You get spec-compliant structure with doctrine invariants enforced; you do **not** get a design pass, deep tests, or polished copy. See [§What the weekend MVP delivers](#what-the-weekend-mvp-delivers) below.

| Phase | Theme | Artifacts | Owner | Window |
|---|---|---|---|---|
| **P0.0** | **Pre-foundation** (ADRs + agent stubs + router + type lock) | **5** | **all 3 agents** | **Sat 09:00–10:00** |
| P0 | Foundation & cleanup | ~60 | all 3 agents | **Sat 10:00–12:30** |
| P1 | Resident e2e | ~35 | all 3 agents | **Sat 13:00–15:00** ‖ |
| P2 | Homeowner e2e | ~40 | all 3 agents | **Sat 13:00–16:00** ‖ |
| P3 | Building Owner e2e | ~32 | all 3 agents | **Sat 13:00–16:00** ‖ |
| P4 | Provider e2e | ~45 | all 3 agents | **Sat 16:00–20:00** ‖ |
| P5 | Electrician e2e | ~38 | all 3 agents | **Sat 16:00–20:00** ‖ |
| P6 | Financier e2e | ~50 | all 3 agents | **Sat 16:00–21:00** ‖ |
| P7 | Cockpit (web) | ~70 | Codex web + Claude backend | **Sun 09:00–16:00** |
| **P8.0** | **Agent skeleton verification** | **2** | **Claude backend** | **Sun 16:00–16:30** |
| P8 | AI-native integration (stubs) | ~15 | Claude backend + Codex web | **Sun 16:30–18:30** |
| P9 | Hardening (subset, top 5 of 24 CI gates) | ~5 | Claude backend + Cursor mobile | **Sun 18:30–21:00** |

### Saturday (pre-foundation → foundation → per-role e2e)

```
09:00–10:00  ██ P0.0 ─ 5 pre-foundation tasks (router, PII ADR, 4 agent stubs, type lock, pledge/token ADR)
10:00–12:30  ████████ P0 ─ shared primitives, backend schemas, structural cleanup
12:30–13:00  ─────── lunch ───────
13:00–16:00  ████ P1  ████ P2  ████ P3   (3 agents, 3 roles in parallel — role-isolated by directory)
16:00–21:00  ████ P4  ████ P5  ████ P6   (3 agents, 3 roles in parallel)
21:00        Day-1 cut: all 6 public roles e2e-shaped, all backend endpoints exist
```

### Sunday (cockpit + AI-native + minimal hardening)

```
09:00–13:00  ████████████ P7   ─ Cockpit shell, 4 dashboards, 7 ops queues (skeleton)
13:00–14:00  ─────── lunch ───────
14:00–16:00  ████████ P7   ─ BuildingDetail tabs, agent backend wires, CR-* enforcement primitives
16:00–16:30  █ P8.0         ─ Verify 5 agent skeletons importable + return AgentProposal shape
16:30–18:30  ████ P8        ─ Query layer, audit viewer, RBAC console (stubs)
18:30–21:00  █████ P9 subset ─ Top 5 CI gates (of 24 total in DONE_DEFINITION) + Resident e2e walk only
21:00        Sprint end: tag v0.1-mvp, deploy staging
```

**Top-5 weekend CI gate cut:** P9.1.6 (no buy-tokens pre-activation), P9.1.7 (DRS<100% blocks install), P9.1.8 (LBRS<100% blocks go-live), P9.1.11 (no admin in public roleset), P9.1.14 (homeowner zeroes host-royalty). Other 19 gates ship in the follow-up week.

### What the weekend MVP delivers

✅ **Ships:**
- Every screen at the spec'd file path with correct tabs, fields, states (loading/empty/error)
- Every backend endpoint returning correctly-shaped data
- Audit middleware on every mutation (CR-2)
- Admin role isolation (CR-1) hard-rejected at App boundary
- Doctrine guards: prepaid-only, DRS-gates-deploy, LBRS-gates-go-live, monetized-only, homeowner-no-royalty, labor-as-capital-opt-in
- All 6 onboarding flows end-to-end
- Cockpit landing + settlement monitor + 7 ops queues + BuildingDetail split + audit viewer
- 5 CI gates green, Resident e2e walkthrough green

⚠️ **Ships as skeleton (needs follow-up week):**
- UX polish (typography, spacing, micro-interactions, charts beyond basic)
- Copy (placeholder labels, no marketing review)
- Animations beyond CSS transitions
- AI agent panels render contract but only `drs_agent.py` backend is real; other 4 are stubs
- Eval harness UI exists but no real eval suites yet
- Web parity — mirror screens exist but lighter than mobile in places

❌ **Deferred to follow-up:**
- 19 of 24 CI gates (only top 5 ship — see P9.1 task list for the cut)
- 6 of 7 e2e walkthroughs (only Resident ships)
- Security audit
- Performance baseline
- Visual design pass
- Error message copy review

### Why this is possible (with caveats)

- File targets pre-defined in [MISSING.md](MISSING.md) — no design discovery
- [DONE_DEFINITION.md](DONE_DEFINITION.md) gates pre-baked — no debate
- Role-isolated directories (`mobile/app/(role)/`, `backend/app/api/{role}.py`) — no merge conflicts
- Shared primitives front-loaded in P0 — per-role work is `import + wire`, not `design + build`
- Backend schemas front-loaded in P0.3 — per-role endpoints are `CRUD over existing model`

### What breaks (be ready)

- **Review bottleneck.** You will see ~100 PRs. If you can't review same-hour, agents stall. Consider auto-merge on green CI for trivial primitives.
- **P0 slip.** If foundation isn't done by Sat noon, Saturday collapses. P0 must be timeboxed: at noon, ship what's done and move on.
- **Type-contract drift.** If `packages/shared/src/types.ts` changes mid-Saturday, all 3 agents rebase. Lock it after P0.
- **CI flake.** A 5-minute CI run becomes 30 minutes if flaky. Skip non-blocking checks during the sprint; restore Monday.
- **Spec ambiguity.** No time to re-read scenarios mid-sprint. If a question comes up, agent makes a call + flags it in PR; resolve Monday.
- **Cockpit drag.** 70 artifacts on Sunday is the longest single stretch. If it slips past 17:00, P8/P9 get cut further.

### Realistic alternative if the weekend is too tight

If full MVP feels infeasible, the **honest minimum lockable in a weekend** is:
- **P0 + P1 (Resident only) + P9.1.* CI gates**.
- Skip P2-P8 entirely; pick them up next week.
- Ships ~95 artifacts. Same pace (~16/agent/day) but realistic.

You'd have one role fully demoable end-to-end, doctrine enforced, foundation for everything else laid. The rest of the roles fall out in a follow-up week with the structure already proven.

**Parallelism note.** Once P0 lands, P1..P6 run in true parallel — each touches a different role's code path. Shared primitives (P0.2) and shared types (`packages/shared/src/types.ts`) are owned by P0; per-role consumers only import. Backend tables overlap (e.g., `pledge`, `token` used by Resident + Financier) — those land in P0.3.

---

## P0.0 — Pre-foundation (must land before P0.1–P0.4)

*Goal: invasive infrastructure refactors that would block every other agent if done mid-sprint. ~30 min each, single owner per task.*

| Task | Artifact | Target | Spec | Owner |
|---|---|---|---|---|
| P0.0.1 | Cockpit router — replace `App.tsx` local view state with React Router (no-op router; pages still in current shape) | `cockpit/src/router.tsx`, `cockpit/src/App.tsx` | CR-9 | Codex web |
| P0.0.2 | PII view-claim JWT format ADR — decide claim string (`pii:view:full` vs `pii:view:resident-id`), granularity (per-field vs per-resource), enforcement points | `docs/adr/0001-pii-claims.md` | CR-3 | Claude backend |
| P0.0.3 | Stub 4 missing agent backends — `lbrs_agent.py`, `settlement_agent.py`, `alert_triage_agent.py`, `eligibility_agent.py` skeletons (same signature as existing `drs_agent.py`, return `confidence=0.0` proposed_action=`'no-op'`) so P8 UI can call them | `backend/app/agents/{lbrs,settlement,alert_triage,eligibility}_agent.py` | AI-native §4 | Claude backend |
| P0.0.4 | Type contract lock — Claude backend reviews `packages/shared/src/types.ts` against IA_SPEC + Reference Appendix; freezes for sprint duration | `packages/shared/src/types.ts` | IA-U10 | Claude backend |
| P0.0.5 | Pledge vs token API split decision ADR — dual-write during transition or hard-cut `/prepaid/commit`? | `docs/adr/0002-pledge-token-split.md` | Scenario A §5 | Claude backend |

**P0.0 verification gate:** all 5 ADRs/stubs landed; rebase signal sent to all 3 agents before P0.1 starts.

---

## P0 — Foundation & cleanup

*Goal: every later phase builds on a clean naming surface, a shared component library, and the persistence/permission schemas it needs.*

### P0.1 Structural cleanup (STALE rows from MISSING.md §Naming/structural drift)

| Task | File(s) | Action | Spec | Owner |
|---|---|---|---|---|
| P0.1.1 | `mobile/app/(electrician)/jobs.tsx`, `mobile/app/(electrician)/jobs-inbox.tsx` | Consolidate into `mobile/app/(electrician)/projects.tsx`; delete originals | IA §Electrician Tab structure | Cursor mobile |
| P0.1.2 | `mobile/app/(electrician)/compliance.tsx` | Remove tab; embed compliance card in `mobile/app/(electrician)/profile.tsx` per IA-U7 | IA §Electrician Profile | Cursor mobile |
| P0.1.3 | `mobile/app/(financier)/tranche-release.tsx` | Remove tab; move into `mobile/app/(financier)/_embedded/payback-scenarios.tsx` (P6) | IA §Financier Portfolio | Cursor mobile |
| P0.1.4 | `mobile/app/(admin)/home.tsx` | **DONE 2026-05-16** — deleted; spec mandates exactly 3 admin tabs (Alerts/Projects/Profile) | IA §Admin Tab structure | — |
| P0.1.5 | `mobile/components/installer/*` | Rename folder → `mobile/components/electrician/`; update all imports | IA §Role Naming | Cursor mobile |
| P0.1.6 | `mobile/components/owner/*` | Rename folder → `mobile/components/building-owner/`; update all imports | IA §Role Naming | Cursor mobile |
| P0.1.7 | `mobile/components/proposed-flow/*` | Audit each file; either promote into shared/role folder or delete | MISSING.md §STALE | Cursor mobile |
| P0.1.8 | `mobile/components/DrsCard.tsx` | **DONE 2026-05-16** — renamed → `mobile/components/shared/DRSProgressCard.tsx` (was unused; ready for adoption) | IA §Components Catalog | — |
| P0.1.9 | `mobile/components/TokenHero.tsx` | **DONE 2026-05-16** — renamed → `mobile/components/shared/TokenBalanceHero.tsx`; web mirror in `PortalWidgets.tsx` also renamed | IA §Components Catalog | — |
| P0.1.10 | `mobile/app/(auth)/verify-phone.tsx` | **DONE 2026-05-16** — renamed → `mobile/app/(auth)/verify-otp.tsx`; all 3 importers updated | Scenario A §4 step 3 | — |
| P0.1.11 | `website/src/onboard/homeowner/HomeownerOnboarding.tsx` (monolithic) | Split into 10 per-step screens at `website/src/onboard/homeowner/step{N}.tsx` matching Scenario C §6 | IA §Homeowner Onboarding | Codex web |
| P0.1.12 | `website/src/onboard/building-owner/BuildingOwnerWebOnboarding.tsx` (monolithic) | Split into 8 per-step screens at `website/src/onboard/building-owner/step{N}.tsx` matching Scenario B §3 | IA §BO Onboarding | Codex web |
| P0.1.13 | `website/src/onboard/contributor/ContributorWebOnboarding.tsx` | Split into 3 role onboardings: `website/src/onboard/{provider,electrician,financier}/index.tsx` shells | IA §Role Naming | Codex web |
| P0.1.14 | `cockpit/src/App.tsx` | Hard-reject render when `user.role !== 'admin'`; redirect to logout. CR-1 enforcement. | CR-1, IA §8.5 gate 5 | Codex web |
| P0.1.15 | `cockpit/src/pages/BuildingDetail.tsx` | Split monolith into tab router shell; tab content created in P7 | IA §Per-Building Drill-Down | Codex web |

### P0.2 Shared primitives (Components Catalog)

*Goal: every per-role phase can `import { ... } from '@emappa/ui'` without re-implementing pills, badges, or layout cards.*

| Task | Component | Target | Used by | Spec | Owner |
|---|---|---|---|---|---|
| P0.2.1 | BuildingAvailabilityStatePill (A0–A6) | `mobile/components/shared/BuildingAvailabilityStatePill.tsx` | Resident Home, Cockpit DRS Queue | Scenario A §3, IA §Components Catalog | Cursor mobile |
| P0.2.2 | CapacityQueueStatusPill (7 states) | `mobile/components/shared/CapacityQueueStatusPill.tsx` | Resident Home, Cockpit Building drill-down Pledges tab | Scenario A §6.2 | Cursor mobile |
| P0.2.3 | DataQualityBadge (verified/estimated/missing/disputed/conservative) | `mobile/components/shared/DataQualityBadge.tsx` | All Energy screens, Financier Generation, Cockpit Energy tab | AI-native §3 | Cursor mobile |
| P0.2.4 | EligibilityBadge | `mobile/components/shared/EligibilityBadge.tsx` | Financier Discover, Cockpit Eligibility Queue | Scenario F §7 | Cursor mobile |
| P0.2.5 | KYCStatusBadge | `mobile/components/shared/KYCStatusBadge.tsx` | Financier Profile, Cockpit Counterparties | Scenario F §27 | Cursor mobile |
| P0.2.6 | SyntheticBadge (verify/extend existing) | `mobile/components/shared/SyntheticBadge.tsx` | Pre-live Energy screens for all roles | IA §Components Catalog | Cursor mobile |
| P0.2.7 | TokenBalanceHero (KES + kWh) | `mobile/components/shared/TokenBalanceHero.tsx` | Resident Home (live), Homeowner Home (live), BO Home (live) | IA §Components Catalog | **Done in P0.1.9** — needs KES+kWh dual display extension |
| P0.2.8 | DRSProgressCard | `mobile/components/shared/DRSProgressCard.tsx` | Resident Home, BO Home, Homeowner Home, Financier Project detail | Scenario C §8 | **Done in P0.1.8** — needs adoption in role homes |
| P0.2.9 | SystemHealthIndicator | `mobile/components/shared/SystemHealthIndicator.tsx` | All live-state Home screens, Cockpit Ops tab | AI-native §6 | Cursor mobile |
| P0.2.10 | LiveSupplyIndicator (ATS solar vs KPLC) | `mobile/components/shared/LiveSupplyIndicator.tsx` | Resident/BO Home (live), Building drill-down Energy tab | Scenario A §2.1 | Cursor mobile |
| P0.2.11 | OwnershipPositionCard | `mobile/components/shared/OwnershipPositionCard.tsx` | Resident/Homeowner/BO Wallet, Financier Wallet | IA §Components Catalog | Cursor mobile |
| P0.2.12 | OwnershipRingChart (share-split) | `mobile/components/shared/OwnershipRingChart.tsx` | Homeowner Energy (<100%), BO Wallet, Provider Wallet | Scenario C §15 | Cursor mobile |
| P0.2.13 | OwnershipBreakdown (ring) | `mobile/components/shared/OwnershipBreakdown.tsx` | Provider Wallet, Financier Wallet | IA §Components Catalog | Cursor mobile |
| P0.2.14 | DeploymentProgressBar | `mobile/components/shared/DeploymentProgressBar.tsx` | Homeowner/BO Home pre-live, project-detail embeds | Scenario C §7.1 | Cursor mobile |
| P0.2.15 | BlockerPill | `mobile/components/shared/BlockerPill.tsx` | ProjectHero blocker list, DRS embeds | Scenario C §7.1 | Cursor mobile |
| P0.2.16 | CashflowLedger | `mobile/components/shared/CashflowLedger.tsx` | Homeowner Wallet, Provider Wallet, Financier Wallet | IA §Components Catalog | Cursor mobile |
| P0.2.17 | FilterBar (stage/region/equipment/deal-size/business-type) | `mobile/components/shared/FilterBar.tsx` | Provider Discover, Electrician Discover, Financier Discover | IA §Components Catalog | Cursor mobile |
| P0.2.18 | ProjectStatusCard | `mobile/components/shared/ProjectStatusCard.tsx` | Provider Projects, Electrician Projects | IA §Components Catalog | Cursor mobile |
| P0.2.19 | ProjectTimeline | `mobile/components/shared/ProjectTimeline.tsx` | All role project-detail embeds | IA §Components Catalog | Cursor mobile |
| P0.2.20 | GenerationChart | `mobile/components/shared/GenerationChart.tsx` | Provider Generation, Financier Generation | IA §Components Catalog | Cursor mobile |
| P0.2.21 | EnergyFlowChart | `mobile/components/shared/EnergyFlowChart.tsx` | Financier Generation, Cockpit Energy tab | Scenario F §11 | Cursor mobile |
| P0.2.22 | SettlementStatement | `mobile/components/shared/SettlementStatement.tsx` | All role Wallets settlement embed | IA §Components Catalog | Cursor mobile |
| P0.2.23 | PayoutAccountCard | `mobile/components/shared/PayoutAccountCard.tsx` | All role Profile screens | IA §Components Catalog | Cursor mobile |
| P0.2.24 | ComplianceStatusIndicator | `mobile/components/shared/ComplianceStatusIndicator.tsx` | Electrician Profile, Financier Profile, Provider Profile | IA §Components Catalog | Cursor mobile |
| P0.2.25 | RatingsSummary | `mobile/components/shared/RatingsSummary.tsx` | Provider Profile, Electrician Profile | Scenario E §13, Scenario D §11 | Cursor mobile |
| P0.2.26 | DocumentUploadCard | `mobile/components/shared/DocumentUploadCard.tsx` | All authority/identity onboarding steps | Scenarios B/C/D/E/F | Cursor mobile |
| P0.2.27 | LaborCapitalClaimCard | `mobile/components/shared/LaborCapitalClaimCard.tsx` | Electrician Wallet, Financier Wallet (claims) | Scenario D §22.1 | Cursor mobile |
| P0.2.28 | RoofPolygonViewer | `mobile/components/shared/RoofPolygonViewer.tsx` | Homeowner roof-detail, BO roof-detail, Cockpit Roof tab | Scenarios B/C §6 | Cursor mobile |
| P0.2.29 | PilotBanner (verify exists, audit copy) | `mobile/components/shared/PilotBanner.tsx` | All home screens | IA §Universal Rules | Cursor mobile |
| P0.2.30 | RoofMap (verify polygon-over-satellite) | `mobile/components/shared/RoofMap.tsx` | Onboarding roof-capture + roof-detail embeds | Scenarios B/C §6 | Cursor mobile |

### P0.3 Backend foundation (persistence + middleware)

*Goal: schema/middleware/permission primitives exist before per-role endpoints depend on them.*

| Task | Artifact | Target | Spec | Owner |
|---|---|---|---|---|
| P0.3.1 | `audit_log` table — add columns: actor, action, before, after, reason, agent_attribution, surface, ts | Alembic + `backend/app/models/audit.py` | AI-native §4, CR-2 | Claude backend |
| P0.3.2 | Mutation audit middleware (every POST/PATCH/DELETE writes audit row, rejects if no reason) | `backend/app/middleware/audit.py` | CR-2 | Claude backend |
| P0.3.3 | `rbac_claim` table (subject, scope, resource, granted_by, granted_at, expires_at) | Alembic + `backend/app/models/rbac.py` | IA v2 §8.5 | Claude backend |
| P0.3.4 | `admin_allowlist` table (replaces env var seed) | Alembic + `backend/app/models/admin.py` | IA v2 §8.5 | Claude backend |
| P0.3.5 | PII masking helper + view-claim check | `backend/app/services/pii.py` + `backend/app/middleware/pii.py` | CR-3 | Claude backend |
| P0.3.6 | RBAC-scoped queue filter middleware (every queue endpoint runs through claim check) | `backend/app/middleware/rbac_scope.py` | CR-7 | Claude backend |
| P0.3.7 | Conservative-by-default service flag + UI banner contract | `backend/app/services/consistency.py` (extend) + response header `X-Emappa-Conservative` | CR-5 | Claude backend |
| P0.3.8 | `alert` table (severity, owner, status, source, building_id, ts) | Alembic + `backend/app/models/alert.py` | AI-native §6 | Claude backend |
| P0.3.9 | `incident` table (severity, status, root_cause, postmortem, alerts[]) | Alembic + `backend/app/models/incident.py` | AI-native §6 | Claude backend |
| P0.3.10 | `apartment_ats_state` (8 states) | Alembic + `backend/app/models/ats.py` | Scenario A §2.1 | Claude backend |
| P0.3.11 | `capacity_queue` (interested→activated, position, priority_factors[]) | Alembic + `backend/app/models/capacity_queue.py` | Scenario A §6.2 | Claude backend |
| P0.3.12 | `load_profile` (L1/L2/L3 + confidence + appliances + receipt_url) | Alembic + `backend/app/models/load_profile.py` | Scenario A §7 | Claude backend |
| P0.3.13 | `agent_action` (proposed, accepted/rejected, audit_log_id) | Alembic + `backend/app/models/agent_action.py` | AI-native §4 | Claude backend |
| P0.3.14 | `agent_eval_run` (agent, version, scorecard, regression_delta) | Alembic + `backend/app/models/agent_eval.py` | AI-native §9 Phase 4 | Claude backend |
| P0.3.15 | Split `pledge` (non-binding) from `token_purchase` (real money) tables | Alembic + `backend/app/models/{pledge,token}.py` | Scenario A §5 | Claude backend |
| P0.3.16 | UI primitive contract: every screen must implement loading/empty/error states (no silent mock fallback) — adopt `<ScreenState>` wrapper in `mobile/components/shared/ScreenState.tsx` | — | CR-8 | Cursor mobile |
| P0.3.17 | React Router setup for Cockpit (replace local view state with route segments) | `cockpit/src/router.tsx`, refactor `App.tsx` | CR-9 | Codex web |
| P0.3.18 | UI primitive: `<RequiresReason>` form wrapper (mutation forms must collect reason → audit) | `cockpit/src/components/RequiresReason.tsx` | CR-2 | Codex web |
| P0.3.19 | UI primitive: `<AgentAttribution>` badge | `cockpit/src/components/AgentAttribution.tsx` | CR-4 | Codex web |
| P0.3.20 | UI primitive: `<ConservativeBanner>` reading response header | `cockpit/src/components/ConservativeBanner.tsx` | CR-5 | Codex web |

### P0.4 Tooling

| Task | Artifact | Target | Owner |
|---|---|---|---|
| P0.4.1 | Shared UI package barrel export | `mobile/components/shared/index.ts` re-exports all P0.2 primitives | Cursor mobile |
| P0.4.2 | Re-run MISSING.md generator script + commit baseline | `scripts/audit-missing.ts` | Claude backend |
| P0.4.3 | **DONE 2026-05-16** — `docs/DONE_DEFINITION.md` (verification rubric referenced from every task) | `docs/DONE_DEFINITION.md` | — |
| P0.4.4 | `docs/agents/SPRINT_KICKOFF.md` (multi-agent coordination protocol) | `docs/agents/SPRINT_KICKOFF.md` | Claude backend |

### P0 Verification gate

- All P0.1 STALE rows resolved (no `installer/` folder, no `DrsCard`, no `jobs-inbox.tsx`, no admin `home.tsx`).
- All P0.2 shared primitives importable from `mobile/components/shared/index.ts` with type-safe props.
- All P0.3 migrations applied to dev DB; `audit.py` middleware rejects mutations without a reason.
- `pnpm ci` and `pytest backend/` green.
- Re-running `scripts/audit-missing.ts` drops MISSING count by ~50 (cleanup + primitives create their target files).
- See [docs/DONE_DEFINITION.md](DONE_DEFINITION.md) for per-artifact criteria.

---

## P1 — Resident e2e (mobile + web parity)

*Goal: a resident can sign up, capture load profile, join capacity queue, view 7-state availability, pledge pre-activation, purchase tokens post-activation, view energy + share-gated generation, view wallet (pledges/tokens/ownership), and navigate all 7 embedded routes — across mobile and web identically.*

### P1.1 Routes & screens (mobile)

| Task | Artifact | Target | Spec | Owner |
|---|---|---|---|---|
| P1.1.1 | Home — wire 7-state `BuildingAvailabilityStatePill`, `CapacityQueueStatusPill`, branched pre-live vs live hero, A5 mutex (no "buy tokens" pre-activation) | `mobile/app/(resident)/home.tsx` | IA §Resident Home, Scenario A §3,§5 | Cursor mobile |
| P1.1.2 | Energy — `EnergyTodayChart` (stacked area), share-gated `GenerationPanel`, `SyntheticBadge`, `AllocationExplainer` modal | `mobile/app/(resident)/energy.tsx` | IA §Resident Energy | Cursor mobile |
| P1.1.3 | Wallet — Pledges/Tokens/Ownership segmented control, pre-activation edit/cancel gating, ownership empty-state | `mobile/app/(resident)/wallet.tsx` | IA §Resident Wallet, Scenario A §10 | Cursor mobile |
| P1.1.4 | Profile — embed Building & Unit Profile, Load Profile L1/L2/L3 editor, notification toggles | `mobile/app/(resident)/profile.tsx` | IA §Resident Profile | Cursor mobile |

### P1.2 Embedded routes (mobile)

| Task | Artifact | Target | Spec | Owner |
|---|---|---|---|---|
| P1.2.1 | pledge-detail | `mobile/app/(resident)/_embedded/pledge-detail.tsx` | IA §Resident Embedded | Cursor mobile |
| P1.2.2 | queue-detail (priority factors) | `mobile/app/(resident)/_embedded/queue-detail.tsx` | Scenario A §6.3 | Cursor mobile |
| P1.2.3 | ats-detail (8-state ATS machine) | `mobile/app/(resident)/_embedded/ats-detail.tsx` | Scenario A §2.1 | Cursor mobile |
| P1.2.4 | marketplace (ownership) | `mobile/app/(resident)/_embedded/marketplace.tsx` | Scenario A §8.6 | Cursor mobile |
| P1.2.5 | load-profile-edit (L2/L3) | `mobile/app/(resident)/_embedded/load-profile-edit.tsx` | Scenario A §7 | Cursor mobile |
| P1.2.6 | drs-detail (resident view) | `mobile/app/(resident)/_embedded/drs-detail.tsx` | IA §Resident Embedded | Cursor mobile |
| P1.2.7 | token-purchase (real money, post-activation only) | `mobile/app/(resident)/_embedded/token-purchase.tsx` | Scenario A §5 | Cursor mobile |
| P1.2.8 | alert-detail (incident/fallback) | `mobile/app/(resident)/_embedded/alert-detail.tsx` | IA §Resident Embedded | Cursor mobile |

### P1.3 Components (resident-specific)

| Task | Component | Target | Spec | Owner |
|---|---|---|---|---|
| P1.3.1 | PledgeBalanceCard | `mobile/components/resident/PledgeBalanceCard.tsx` | IA §Components Catalog | Cursor mobile |
| P1.3.2 | LoadProfileConfidenceMeter (L1/L2/L3) | `mobile/components/resident/LoadProfileConfidenceMeter.tsx` | Scenario A §7 | Cursor mobile |
| P1.3.3 | AllocationExplainer modal | `mobile/components/resident/AllocationExplainer.tsx` | IA §Resident Energy | Cursor mobile |
| P1.3.4 | PledgeHistoryList | `mobile/components/resident/PledgeHistoryList.tsx` | IA §Resident Wallet | Cursor mobile |
| P1.3.5 | OwnershipMarketplaceCard | `mobile/components/resident/OwnershipMarketplaceCard.tsx` | Scenario A §8.6 | Cursor mobile |

### P1.4 Onboarding (mobile + web)

| Task | Step | Target | Spec | Owner |
|---|---|---|---|---|
| P1.4.1 | Find building — add unit number, owner invite code, manual address fallback | `mobile/app/(onboard)/resident/index.tsx` | Scenario A §4 step 5 | Cursor mobile |
| P1.4.2 | Confirm building (verify) | `mobile/app/(onboard)/resident/confirm.tsx` | Scenario A §4 step 6 | Cursor mobile |
| P1.4.3 | Load profile L1 (appliance checklist, daytime/evening split, receipt photo) | `mobile/app/(onboard)/resident/load-profile.tsx` | Scenario A §4 step 7, §7 | Cursor mobile |
| P1.4.4 | Capacity check (surface queue position projection) | `mobile/app/(onboard)/resident/capacity-check.tsx` | Scenario A §4 step 8, §6.2 | Cursor mobile |
| P1.4.5 | Pledge/buy decision branching by activation state | `mobile/app/(onboard)/resident/first-pledge.tsx` | Scenario A §4 step 9, §5 | Cursor mobile |
| P1.4.6 | Web parity for all of the above | `website/src/onboard/resident/step{N}.tsx` | IA-U10 | Codex web |

### P1.5 Web parity

| Task | Target | Spec | Owner |
|---|---|---|---|
| P1.5.1 | Home web mirror of P1.1.1 | `website/src/screens/stakeholders/resident/home.tsx` | IA-U10 | Codex web |
| P1.5.2 | Energy web mirror | `website/src/screens/stakeholders/resident/energy.tsx` | IA-U10 | Codex web |
| P1.5.3 | Wallet web mirror | `website/src/screens/stakeholders/resident/wallet.tsx` | IA-U10 | Codex web |
| P1.5.4 | Profile web mirror | `website/src/screens/stakeholders/resident/profile.tsx` | IA-U10 | Codex web |

### P1.6 Backend endpoints

| Task | Endpoint | Target | Spec | Owner |
|---|---|---|---|---|
| P1.6.1 | Verify `/me/onboarding-complete`, `/me/select-role`, `/me/join-building` return resident-shaped data | `backend/app/api/me.py` | Scenario A §4 | Claude backend |
| P1.6.2 | Split `POST /prepaid/commit` into `POST /pledges` (non-binding) and `POST /tokens/purchase` (real money) | `backend/app/api/{pledges,tokens}.py` | Scenario A §5 | Claude backend |
| P1.6.3 | `POST /residents/{id}/load-profile` (L1/L2/L3 capture) | `backend/app/api/residents.py` | Scenario A §7 | Claude backend |
| P1.6.4 | `GET /residents/{id}/queue-position` (capacity queue + priority factors) | `backend/app/api/residents.py` | Scenario A §6 | Claude backend |
| P1.6.5 | `POST /residents/{id}/queue-request` (join capacity queue) | `backend/app/api/residents.py` | Scenario A §6 | Claude backend |
| P1.6.6 | `GET /residents/{id}/ats-state` (8-state machine) | `backend/app/api/residents.py` | Scenario A §2.1 | Claude backend |

### P1 Verification gate

- Walk Scenario A end-to-end on mobile and web; every numbered step renders the spec'd screen.
- "Buy tokens" CTA is impossible to render pre-activation (mutex enforced at component level).
- Pre-activation pledges are editable/cancellable; post-activation token purchases are immutable.
- All 8 embedded routes deep-linkable.
- Re-running audit drops Resident section to 0 MISSING.
- See [docs/DONE_DEFINITION.md](DONE_DEFINITION.md).

---

## P2 — Homeowner e2e (mobile + web parity)

*Goal: a homeowner can complete the 10-step onboarding (incl. authority verification, utility context, site preview), see ProjectHero/TokenBalanceHero adaptively per `project.stage`, view ownership-ring energy + system sizing + consumption timeline, view 3-stream wallet enforcing self-payment rule, and navigate all 10 embedded routes.*

### P2.1 Routes & screens (mobile)

| Task | Artifact | Target | Spec | Owner |
|---|---|---|---|---|
| P2.1.1 | Home — `project.stage`-driven hero swap (ProjectHero pre-live / TokenBalanceHero live), secondary card, action rail | `mobile/app/(homeowner)/home.tsx` | IA §Homeowner Home §7.1 | Cursor mobile |
| P2.1.2 | Energy — always-on `GenerationPanel`, `OwnershipRingChart` (<100%), `SystemSizingExplainer`, `ConsumptionTimeline`, oversize/under-battery warnings | `mobile/app/(homeowner)/energy.tsx` | IA §Homeowner Energy §15 | Cursor mobile |
| P2.1.3 | Wallet — 3 streams, enforce zero host-royalty (homeowner is host) per §3, §11.1 self-payment rule | `mobile/app/(homeowner)/wallet.tsx` | IA §Homeowner Wallet | Cursor mobile |
| P2.1.4 | Profile — roof-source/confidence badge, retrace CTA, DB/meter photo grid | `mobile/app/(homeowner)/profile.tsx` | IA §Homeowner Profile | Cursor mobile |

### P2.2 Embedded routes (mobile)

| Task | Artifact | Target | Spec | Owner |
|---|---|---|---|---|
| P2.2.1 | pledge-detail | `mobile/app/(homeowner)/_embedded/pledge-detail.tsx` | IA §Homeowner Embedded | Cursor mobile |
| P2.2.2 | drs-detail — verify Scenario C §8 coverage (property authority, site, load+sizing, capital, hardware, legal) | `mobile/app/(homeowner)/_embedded/drs.tsx` | Scenario C §8 | Cursor mobile |
| P2.2.3 | lbrs-detail | `mobile/app/(homeowner)/_embedded/lbrs-detail.tsx` | IA §Homeowner Embedded | Cursor mobile |
| P2.2.4 | deployment-timeline (verify exists) | `mobile/app/(homeowner)/_embedded/deployment.tsx` | IA §Homeowner Embedded | Cursor mobile |
| P2.2.5 | terms-approval (verify exists) | `mobile/app/(homeowner)/_embedded/approve-terms.tsx` | IA §Homeowner Embedded | Cursor mobile |
| P2.2.6 | compare-bill (rename `compare-today.tsx` → `compare-bill.tsx` if needed; verify grid vs e.mappa projection) | `mobile/app/(homeowner)/_embedded/compare-bill.tsx` | IA §Homeowner Embedded | Cursor mobile |
| P2.2.7 | roof-detail (verify, wire P0.2.28 RoofPolygonViewer) | `mobile/app/(homeowner)/_embedded/roof-detail.tsx` | IA §Homeowner Embedded | Cursor mobile |
| P2.2.8 | system-health (live dashboard) | `mobile/app/(homeowner)/_embedded/system-health.tsx` | IA §Homeowner Embedded §7.3 | Cursor mobile |
| P2.2.9 | ownership-detail | `mobile/app/(homeowner)/_embedded/ownership-detail.tsx` | IA §Homeowner Embedded | Cursor mobile |
| P2.2.10 | energy-detail (daily/weekly/monthly + CSV) | `mobile/app/(homeowner)/_embedded/energy-detail.tsx` | IA §Homeowner Embedded | Cursor mobile |
| P2.2.11 | alert-detail | `mobile/app/(homeowner)/_embedded/alert-detail.tsx` | IA §Homeowner Embedded | Cursor mobile |
| P2.2.12 | marketplace-buyback (verify buy-back per §15) | `mobile/app/(homeowner)/_embedded/marketplace.tsx` | Scenario C §15 | Cursor mobile |

### P2.3 Components (homeowner-specific)

| Task | Component | Target | Spec | Owner |
|---|---|---|---|---|
| P2.3.1 | ProjectHero — verify includes blocker pills + timeline phases | `mobile/components/ProjectHero.tsx` | Scenario C §7.1 | Cursor mobile |
| P2.3.2 | TokenBalanceHero — verify "disabled pre-live" copy gate (uses P0.2.7) | `mobile/components/shared/TokenBalanceHero.tsx` | Scenario C §7.1 | Cursor mobile |
| P2.3.3 | SystemSizingExplainer modal | `mobile/components/homeowner/SystemSizingExplainer.tsx` | Scenario C §15 | Cursor mobile |
| P2.3.4 | ConsumptionTimeline | `mobile/components/homeowner/ConsumptionTimeline.tsx` | Scenario C §15 | Cursor mobile |

### P2.4 Onboarding (Scenario C §6, 10 steps)

| Task | Step | Target | Spec | Owner |
|---|---|---|---|---|
| P2.4.1 | Property location with type picker (single-family/maisonette/etc.) | `mobile/app/(onboard)/homeowner/address.tsx` | Scenario C §6 step 4 | Cursor mobile |
| P2.4.2 | Authority verification (title/lease/ID/consent upload) | `mobile/app/(onboard)/homeowner/authority.tsx` | Scenario C §6 step 5 | Cursor mobile |
| P2.4.3 | Utility & meter context (KPLC type, meter#, DB photos) | `mobile/app/(onboard)/homeowner/utility.tsx` | Scenario C §6 step 6 | Cursor mobile |
| P2.4.4 | Fast load profile L1 (rename `first-pledge.tsx` → `load-profile.tsx`) | `mobile/app/(onboard)/homeowner/load-profile.tsx` | Scenario C §6 step 7 | Cursor mobile |
| P2.4.5 | Site preview (roof photos, shading, WiFi, access) | `mobile/app/(onboard)/homeowner/site-preview.tsx` | Scenario C §6 step 8 | Cursor mobile |
| P2.4.6 | Readiness summary | `mobile/app/(onboard)/homeowner/readiness.tsx` | Scenario C §6 step 9 | Cursor mobile |
| P2.4.7 | Deployment decision (explicit "Initiate project" gate) | `mobile/app/(onboard)/homeowner/initiate.tsx` | Scenario C §6 step 10 | Cursor mobile |
| P2.4.8 | Roof capture — verify 3-tier waterfall (Microsoft footprint → owner-traced → manual sqm) | `mobile/app/(onboard)/homeowner/roof-capture.tsx` | Scenarios B/C §6 | Cursor mobile |
| P2.4.9 | Terms preview (verify) | `mobile/app/(onboard)/homeowner/terms.tsx` | Scenario C §6 | Cursor mobile |
| P2.4.10 | Web parity for all 10 steps (uses split scaffolding from P0.1.11) | `website/src/onboard/homeowner/step{N}.tsx` | IA-U10 | Codex web |

### P2.5 Web parity (4 screens)

| Task | Target | Owner |
|---|---|---|
| P2.5.1 | `website/src/screens/stakeholders/homeowner/home.tsx` | Codex web |
| P2.5.2 | `website/src/screens/stakeholders/homeowner/energy.tsx` | Codex web |
| P2.5.3 | `website/src/screens/stakeholders/homeowner/wallet.tsx` | Codex web |
| P2.5.4 | `website/src/screens/stakeholders/homeowner/profile.tsx` | Codex web |

### P2.6 Backend endpoints

| Task | Endpoint | Target | Spec | Owner |
|---|---|---|---|---|
| P2.6.1 | `POST /homeowner/{id}/authority-docs` (title/lease upload) | `backend/app/api/homeowner.py` | Scenario C §6 step 5 | Claude backend |
| P2.6.2 | `POST /homeowner/{id}/utility-context` (KPLC meter/photos) | `backend/app/api/homeowner.py` | Scenario C §6 step 6 | Claude backend |
| P2.6.3 | `POST /homeowner/{id}/site-preview` (photos, access notes) | `backend/app/api/homeowner.py` | Scenario C §6 step 8 | Claude backend |
| P2.6.4 | `POST /homeowner/{id}/initiate-project` (DRS start gate) | `backend/app/api/homeowner.py` | Scenario C §6 step 10 | Claude backend |
| P2.6.5 | `GET /homeowner/{id}/lbrs` (LBRS view per §10) | `backend/app/api/homeowner.py` | Scenario C §10 | Claude backend |
| P2.6.6 | Tables: `homeowner_authority` (title/lease/ID + status) | Alembic + `backend/app/models/homeowner_authority.py` | Scenario C §6 | Claude backend |

### P2 Verification gate

- Walk Scenario C end-to-end on mobile and web; all 10 onboarding steps land.
- Wallet never shows host-royalty line (CI gate).
- Energy renders ownership ring with <100% sliver when applicable.
- Roof-capture 3-tier waterfall demonstrably falls through.
- See [docs/DONE_DEFINITION.md](DONE_DEFINITION.md).

---

## P3 — Building Owner e2e (mobile + web parity)

*Goal: building owner can onboard a multi-tenant building, capture roof, view pre-live DRS/demand/capacity and live system-health/host-royalty earned, view embedded settlement/asset/incident details, and enforce host-royalty pool computation server-side.*

### P3.1 Routes & screens (mobile)

| Task | Artifact | Target | Spec | Owner |
|---|---|---|---|---|
| P3.1.1 | Home — no-building empty + pre-live (DRS, demand summary, capacity estimate, host royalty education) + live (system health, animated building diagram, royalty earned) | `mobile/app/(building-owner)/home.tsx` | IA §BO Home | Cursor mobile |
| P3.1.2 | Energy — share-gated GenerationPanel; "you own the rooftop not the panels" empty copy | `mobile/app/(building-owner)/energy.tsx` | IA §BO Energy | Cursor mobile |
| P3.1.3 | Wallet — pre-live edu vs live host-royalty separation per §5; ownership separation per §6 | `mobile/app/(building-owner)/wallet.tsx` | IA §BO Wallet | Cursor mobile |
| P3.1.4 | Profile — building docs upload, payout account, KYC verification | `mobile/app/(building-owner)/profile.tsx` | IA §BO Profile | Cursor mobile |

### P3.2 Embedded routes (mobile)

| Task | Artifact | Target | Spec | Owner |
|---|---|---|---|---|
| P3.2.1 | drs-detail — verify 6 components + history chart | `mobile/app/(building-owner)/_embedded/drs.tsx` | Scenario B §3 | Cursor mobile |
| P3.2.2 | bill-comparison (verify/rename) | `mobile/app/(building-owner)/_embedded/compare-bill.tsx` | IA §BO Embedded | Cursor mobile |
| P3.2.3 | resident-roster (verify exists) | `mobile/app/(building-owner)/_embedded/resident-roster.tsx` | IA §BO Embedded | Cursor mobile |
| P3.2.4 | terms-approval (verify) | `mobile/app/(building-owner)/_embedded/approve-terms.tsx` | IA §BO Embedded | Cursor mobile |
| P3.2.5 | roof-detail (wires P0.2.28 RoofPolygonViewer) | `mobile/app/(building-owner)/_embedded/roof-detail.tsx` | IA §BO Embedded | Cursor mobile |
| P3.2.6 | deployment-timeline (verify) | `mobile/app/(building-owner)/_embedded/deployment.tsx` | IA §BO Embedded | Cursor mobile |
| P3.2.7 | settlement-detail | `mobile/app/(building-owner)/_embedded/settlement-detail.tsx` | IA §BO Embedded | Cursor mobile |
| P3.2.8 | asset-detail | `mobile/app/(building-owner)/_embedded/asset-detail.tsx` | IA §BO Embedded | Cursor mobile |
| P3.2.9 | energy-detail | `mobile/app/(building-owner)/_embedded/energy-detail.tsx` | IA §BO Embedded | Cursor mobile |
| P3.2.10 | incident-detail | `mobile/app/(building-owner)/_embedded/incident-detail.tsx` | IA §BO Embedded | Cursor mobile |

### P3.3 Components (BO-specific)

| Task | Component | Target | Spec | Owner |
|---|---|---|---|---|
| P3.3.1 | HostRoyaltyCard (pre-live edu / live earned) | `mobile/components/building-owner/HostRoyaltyCard.tsx` | Scenario B §5 | Cursor mobile |
| P3.3.2 | EnergyTodayCard (live KPI strip) | `mobile/components/building-owner/EnergyTodayCard.tsx` | IA §BO Home | Cursor mobile |
| P3.3.3 | AnimatedBuildingDiagram (roof→inverter→batt→ATS→apts) | `mobile/components/building-owner/AnimatedBuildingDiagram.tsx` | IA §BO Home | Cursor mobile |

### P3.4 Onboarding (Scenario B §3, 8 steps)

| Task | Step | Target | Spec | Owner |
|---|---|---|---|---|
| P3.4.1 | Building location — verify auto-geocode + occupancy estimate | `mobile/app/(onboard)/building-owner/index.tsx` | Scenario B §3 | Cursor mobile |
| P3.4.2 | Ownership/authority verification (doc upload) | `mobile/app/(onboard)/building-owner/authority.tsx` | Scenario B §3 step 5 | Cursor mobile |
| P3.4.3 | Initial building profile (apts, roof access, DB location) | `mobile/app/(onboard)/building-owner/profile.tsx` | Scenario B §3 step 6 | Cursor mobile |
| P3.4.4 | Roof capture — verify 3-tier waterfall | `mobile/app/(onboard)/building-owner/roof.tsx` | Scenario B §3 step 7 | Cursor mobile |
| P3.4.5 | Terms preview (verify) | `mobile/app/(onboard)/building-owner/terms.tsx` | Scenario B §3 step 8 | Cursor mobile |
| P3.4.6 | Web parity — uses split scaffolding from P0.1.12 | `website/src/onboard/building-owner/step{N}.tsx` | IA-U10 | Codex web |

### P3.5 Web parity (4 screens)

| Task | Target | Owner |
|---|---|---|
| P3.5.1 | `website/src/screens/stakeholders/building-owner/home.tsx` | Codex web |
| P3.5.2 | `website/src/screens/stakeholders/building-owner/energy.tsx` | Codex web |
| P3.5.3 | `website/src/screens/stakeholders/building-owner/wallet.tsx` | Codex web |
| P3.5.4 | `website/src/screens/stakeholders/building-owner/profile.tsx` | Codex web |

### P3.6 Backend endpoints

| Task | Endpoint | Target | Spec | Owner |
|---|---|---|---|---|
| P3.6.1 | `POST /building-owner/{id}/authority-docs` | `backend/app/api/building_owner.py` | Scenario B §3 | Claude backend |
| P3.6.2 | `POST /building-owner/{id}/payout-account` | `backend/app/api/building_owner.py` | Scenario B §5 | Claude backend |
| P3.6.3 | `GET /building-owner/{id}/host-royalty` (host royalty pool computation) | `backend/app/api/building_owner.py` | Scenario B §5/§6 | Claude backend |
| P3.6.4 | `GET /settlement/{building}/owner-statement` | `backend/app/api/settlement.py` | Scenario B §6 | Claude backend |
| P3.6.5 | Table: `host_royalty_payout` | Alembic + `backend/app/models/host_royalty.py` | Scenario B §5 | Claude backend |
| P3.6.6 | Enforce zero-from-own-roof rule: a BO who is also a resident in their own building receives no host royalty for their own apt | `backend/app/services/host_royalty.py` | Scenario B §6 | Claude backend |

### P3 Verification gate

- Walk Scenario B end-to-end. All 8 onboarding steps land.
- Pre-live wallet shows education + projected royalty; live wallet shows actuals.
- Host-royalty endpoint returns zero for "BO renting their own apt" test fixture.
- See [docs/DONE_DEFINITION.md](DONE_DEFINITION.md).

---

## P4 — Provider e2e (mobile + web parity)

*Goal: provider can complete dual business/individual verification (8-decision), maintain inventory catalog, browse Airbnb-style discover, submit quotes via builder, manage 7-section wallet (cash/usage/buy-down/predicted/pipeline/disputes/scaling), and surface retained-claim language on generation.*

### P4.1 Routes & screens (mobile)

| Task | Artifact | Target | Spec | Owner |
|---|---|---|---|---|
| P4.1.1 | Discover — high-fidelity Airbnb card (BOM gap, inventory match %, projected income range) | `mobile/app/(provider)/discover.tsx` | IA §Provider Discover | Cursor mobile |
| P4.1.2 | Projects — grouping by stage + per-stage `ProjectStatusCard` (P0.2.18) + action buttons | `mobile/app/(provider)/projects.tsx` | IA §Provider Projects §13 | Cursor mobile |
| P4.1.3 | Generation — share-gated, retained-claim language (never "generation decreases") | `mobile/app/(provider)/generation.tsx` | IA §Provider Generation §15.1 | Cursor mobile |
| P4.1.4 | Wallet — 7 sections (cash sales / usage-linked / buy-downs / predicted / pipeline / disputes / scaling) | `mobile/app/(provider)/wallet.tsx` | IA §Provider Wallet | Cursor mobile |
| P4.1.5 | Profile — inventory catalog, quote templates, warranties, ratings | `mobile/app/(provider)/profile.tsx` | IA §Provider Profile §13 | Cursor mobile |

### P4.2 Embedded routes (mobile)

| Task | Artifact | Target | Owner |
|---|---|---|---|
| P4.2.1 | project-detail | `mobile/app/(provider)/project-detail.tsx` | Cursor mobile |
| P4.2.2 | quote-builder | `mobile/app/(provider)/quote-builder.tsx` | Cursor mobile |
| P4.2.3 | quote-request-detail | `mobile/app/(provider)/quote-request-detail.tsx` | Cursor mobile |
| P4.2.4 | delivery-tracker | `mobile/app/(provider)/delivery-tracker.tsx` | Cursor mobile |
| P4.2.5 | warranty-ticket | `mobile/app/(provider)/warranty-ticket.tsx` | Cursor mobile |
| P4.2.6 | settlement-detail | `mobile/app/(provider)/settlement-detail.tsx` | Cursor mobile |
| P4.2.7 | buydown-detail | `mobile/app/(provider)/buydown-detail.tsx` | Cursor mobile |
| P4.2.8 | asset-detail | `mobile/app/(provider)/asset-detail.tsx` | Cursor mobile |
| P4.2.9 | inventory (verify exists) | `mobile/app/(provider)/inventory.tsx` | Cursor mobile |

### P4.3 Components (provider-specific)

| Task | Component | Target | Owner |
|---|---|---|---|
| P4.3.1 | ProjectCard — verify role-variant props for provider | `mobile/components/ProjectCard.tsx` | Cursor mobile |
| P4.3.2 | DeliveryTracker | `mobile/components/provider/DeliveryTracker.tsx` | Cursor mobile |
| P4.3.3 | BOMMatchCard | `mobile/components/provider/BOMMatchCard.tsx` | Cursor mobile |
| P4.3.4 | RetainedClaimCard | `mobile/components/provider/RetainedClaimCard.tsx` | Cursor mobile |
| P4.3.5 | PerformanceMetrics | `mobile/components/provider/PerformanceMetrics.tsx` | Cursor mobile |
| P4.3.6 | CashSalesLedger | `mobile/components/provider/CashSalesLedger.tsx` | Cursor mobile |
| P4.3.7 | UsageLedgerBreakdown | `mobile/components/provider/UsageLedgerBreakdown.tsx` | Cursor mobile |
| P4.3.8 | ShareBuydownTracker | `mobile/components/provider/ShareBuydownTracker.tsx` | Cursor mobile |
| P4.3.9 | PredictedIncomeScenarios | `mobile/components/provider/PredictedIncomeScenarios.tsx` | Cursor mobile |
| P4.3.10 | QuoteBuilder | `mobile/components/provider/QuoteBuilder.tsx` | Cursor mobile |
| P4.3.11 | InventoryCatalog | `mobile/components/provider/InventoryCatalog.tsx` | Cursor mobile |

### P4.4 Onboarding (Scenario E §5, 11 steps)

| Task | Step | Target | Owner |
|---|---|---|---|
| P4.4.1 | Welcome/role fork (panels/infra/both) — verify `businessType` fork copy | `mobile/app/(onboard)/provider/index.tsx` | Cursor mobile |
| P4.4.2 | Business verification path | `mobile/app/(onboard)/provider/business-verification.tsx` | Cursor mobile |
| P4.4.3 | Individual verification path | `mobile/app/(onboard)/provider/individual-verification.tsx` | Cursor mobile |
| P4.4.4 | Inventory snapshot (verify) | `mobile/app/(onboard)/provider/inventory.tsx` | Cursor mobile |
| P4.4.5 | Compatibility pre-check | `mobile/app/(onboard)/provider/compatibility.tsx` | Cursor mobile |
| P4.4.6 | Inventory earning model scenarios | `mobile/app/(onboard)/provider/earning-models.tsx` | Cursor mobile |
| P4.4.7 | Training/standards module | `mobile/app/(onboard)/provider/training.tsx` | Cursor mobile |
| P4.4.8 | Verification decision (8 outcomes per §5) | `mobile/app/(onboard)/provider/decision.tsx` | Cursor mobile |
| P4.4.9 | Web parity for all steps | `website/src/onboard/provider/step{N}.tsx` | Codex web |

### P4.5 Web parity (5 screens)

| Task | Target | Owner |
|---|---|---|
| P4.5.1 | `website/src/screens/stakeholders/provider/discover.tsx` | Codex web |
| P4.5.2 | `website/src/screens/stakeholders/provider/projects.tsx` | Codex web |
| P4.5.3 | `website/src/screens/stakeholders/provider/generation.tsx` | Codex web |
| P4.5.4 | `website/src/screens/stakeholders/provider/wallet.tsx` | Codex web |
| P4.5.5 | `website/src/screens/stakeholders/provider/profile.tsx` | Codex web |

### P4.6 Backend endpoints

| Task | Endpoint | Target | Owner |
|---|---|---|---|
| P4.6.1 | `POST /providers/{id}/quote` (submit quote) | `backend/app/api/providers.py` | Claude backend |
| P4.6.2 | `POST /providers/{id}/verification` (8-decision flow) | `backend/app/api/providers.py` | Claude backend |
| P4.6.3 | `POST /providers/{id}/eaas-offer` | `backend/app/api/providers.py` | Claude backend |
| P4.6.4 | `POST /providers/{id}/buydown-offer` | `backend/app/api/providers.py` | Claude backend |
| P4.6.5 | `POST /providers/{id}/warranty-ticket` | `backend/app/api/providers.py` | Claude backend |
| P4.6.6 | `GET /providers/{id}/settlement` | `backend/app/api/providers.py` | Claude backend |
| P4.6.7 | Tables: `provider_verification`, `provider_quote`, `eaas_contract`, `share_buydown` | Alembic + `backend/app/models/{provider_verification,provider_quote,eaas,share_buydown}.py` | Claude backend |

### P4 Verification gate

- Walk Scenario E end-to-end (business + individual paths).
- Quote builder produces a quote that satisfies BOM constraints (validity, VAT, deposit, line items per §11).
- Generation screen never displays "generation decreased"; uses retained-claim language.
- 8-decision verification state machine has explicit handler per outcome.
- See [docs/DONE_DEFINITION.md](DONE_DEFINITION.md).

---

## P5 — Electrician e2e (mobile + web parity)

*Goal: electrician can complete identity/credentials/training/practice-test onboarding, work projects via task board + signoff grid + camera-first evidence capture, earn through 8-section wallet incl. labor-as-capital and household requests.*

### P5.1 Routes & screens (mobile)

| Task | Artifact | Target | Spec | Owner |
|---|---|---|---|---|
| P5.1.1 | Discover — job-style card with scope/crew/urgency fields | `mobile/app/(electrician)/discover.tsx` | IA §Electrician Discover §9 | Cursor mobile |
| P5.1.2 | Projects (post P0.1.1 consolidation) — task board, LBRS test checklist, signoff grid | `mobile/app/(electrician)/projects.tsx` | IA §Electrician Projects | Cursor mobile |
| P5.1.3 | Wallet — 8 sections (DRS / milestone / LBRS / labor-as-capital / household requests / maintenance reserve / disputes / history) | `mobile/app/(electrician)/wallet.tsx` | IA §Electrician Wallet | Cursor mobile |
| P5.1.4 | Profile — certification tier, crew, ratings, compliance (embedded post P0.1.2) | `mobile/app/(electrician)/profile.tsx` | IA §Electrician Profile §4 | Cursor mobile |

### P5.2 Embedded routes (mobile)

| Task | Artifact | Target | Owner |
|---|---|---|---|
| P5.2.1 | project-detail | `mobile/app/(electrician)/_embedded/project-detail.tsx` | Cursor mobile |
| P5.2.2 | task-detail | `mobile/app/(electrician)/_embedded/task-detail.tsx` | Cursor mobile |
| P5.2.3 | test-detail (LBRS) | `mobile/app/(electrician)/_embedded/test-detail.tsx` | Cursor mobile |
| P5.2.4 | evidence-upload (camera-first) | `mobile/app/(electrician)/_embedded/evidence-upload.tsx` | Cursor mobile |
| P5.2.5 | signoff-request | `mobile/app/(electrician)/_embedded/signoff-request.tsx` | Cursor mobile |
| P5.2.6 | signoff-refuse | `mobile/app/(electrician)/_embedded/signoff-refuse.tsx` | Cursor mobile |
| P5.2.7 | household-request-detail | `mobile/app/(electrician)/_embedded/household-request-detail.tsx` | Cursor mobile |
| P5.2.8 | milestone-detail | `mobile/app/(electrician)/_embedded/milestone-detail.tsx` | Cursor mobile |
| P5.2.9 | claim-detail (labor-as-capital) | `mobile/app/(electrician)/_embedded/claim-detail.tsx` | Cursor mobile |

### P5.3 Components (electrician-specific)

| Task | Component | Target | Owner |
|---|---|---|---|
| P5.3.1 | TaskBoard (DRS/installation/LBRS) | `mobile/components/electrician/TaskBoard.tsx` | Cursor mobile |
| P5.3.2 | SignoffGrid (5 signoff types) | `mobile/components/electrician/SignoffGrid.tsx` | Cursor mobile |
| P5.3.3 | EvidenceGallery | `mobile/components/electrician/EvidenceGallery.tsx` | Cursor mobile |
| P5.3.4 | CameraCapture (offline + serial scan) | `mobile/components/electrician/CameraCapture.tsx` | Cursor mobile |
| P5.3.5 | MilestonePayoutCard | `mobile/components/electrician/MilestonePayoutCard.tsx` | Cursor mobile |
| P5.3.6 | HouseholdRequestCard | `mobile/components/electrician/HouseholdRequestCard.tsx` | Cursor mobile |
| P5.3.7 | CertificationCard | `mobile/components/electrician/CertificationCard.tsx` | Cursor mobile |
| P5.3.8 | CrewCard | `mobile/components/electrician/CrewCard.tsx` | Cursor mobile |

### P5.4 Onboarding (Scenario D §4, 11 steps)

| Task | Step | Target | Owner |
|---|---|---|---|
| P5.4.1 | Identity (ID/liveness/emergency) | `mobile/app/(onboard)/electrician/identity.tsx` | Cursor mobile |
| P5.4.2 | Experience profile (history/photos/tags) | `mobile/app/(onboard)/electrician/experience.tsx` | Cursor mobile |
| P5.4.3 | Credentials/documents | `mobile/app/(onboard)/electrician/credentials.tsx` | Cursor mobile |
| P5.4.4 | Background & references | `mobile/app/(onboard)/electrician/background.tsx` | Cursor mobile |
| P5.4.5 | e.mappa Certification Training (8 modules; expand current `cert.tsx` stub) | `mobile/app/(onboard)/electrician/cert.tsx` | Cursor mobile |
| P5.4.6 | Practice test (7 scenarios, 80% pass / 100% safety) | `mobile/app/(onboard)/electrician/practice-test.tsx` | Cursor mobile |
| P5.4.7 | Certification decision (8 outcomes) | `mobile/app/(onboard)/electrician/decision.tsx` | Cursor mobile |
| P5.4.8 | Web parity | `website/src/onboard/electrician/step{N}.tsx` | Codex web |

### P5.5 Web parity (4 screens)

| Task | Target | Owner |
|---|---|---|
| P5.5.1 | `website/src/screens/stakeholders/electrician/discover.tsx` | Codex web |
| P5.5.2 | `website/src/screens/stakeholders/electrician/projects.tsx` | Codex web |
| P5.5.3 | `website/src/screens/stakeholders/electrician/wallet.tsx` | Codex web |
| P5.5.4 | `website/src/screens/stakeholders/electrician/profile.tsx` | Codex web |

### P5.6 Backend endpoints

| Task | Endpoint | Target | Owner |
|---|---|---|---|
| P5.6.1 | `POST /electricians/{id}/training-progress` | `backend/app/api/electricians.py` | Claude backend |
| P5.6.2 | `POST /electricians/{id}/practice-test` (auto-grade) | `backend/app/api/electricians.py` | Claude backend |
| P5.6.3 | `POST /electricians/{id}/task-signoff` | `backend/app/api/electricians.py` | Claude backend |
| P5.6.4 | `POST /electricians/{id}/lbrs-test` (per-test pass/fail + evidence) | `backend/app/api/electricians.py` | Claude backend |
| P5.6.5 | `POST /electricians/{id}/evidence` (photo + meta) | `backend/app/api/electricians.py` | Claude backend |
| P5.6.6 | `POST /electricians/{id}/household-request` | `backend/app/api/electricians.py` | Claude backend |
| P5.6.7 | `POST /electricians/{id}/labor-as-capital-claim` (opt-in, not default — CI gate) | `backend/app/api/electricians.py` | Claude backend |
| P5.6.8 | Verify `GET /electricians/{id}/wallet` returns all 8 sections | `backend/app/api/electricians.py` | Claude backend |
| P5.6.9 | Tables: `training_progress`, `lbrs_test_result` (extend), `signoff`, `labor_as_capital_claim`, `household_request`, `electrician_profile` (extend tier/crew/ratings) | Alembic + `backend/app/models/*` | Claude backend |

### P5 Verification gate

- Walk Scenario D end-to-end including 8-module training + practice test + 8-decision outcome.
- Camera capture works offline; uploads queued and replayed.
- Labor-as-capital claim is opt-in (toggle defaults off; CI gate).
- All 5 signoff types render in SignoffGrid.
- See [docs/DONE_DEFINITION.md](DONE_DEFINITION.md).

---

## P6 — Financier e2e (mobile + web parity)

*Goal: financier can complete 15-step onboarding (account type, identity, eligibility, suitability, disclosures, jurisdiction, rails, limits, education), browse jurisdiction-filtered discover, manage 10-state portfolio, view 10-section wallet incl. escrow/buyout/payback, and surface deal-room embedded routes.*

### P6.1 Routes & screens (mobile)

| Task | Artifact | Target | Spec | Owner |
|---|---|---|---|---|
| P6.1.1 | Discover — deal-oriented card (capital raised/gap, instrument, eligibility) | `mobile/app/(financier)/discover.tsx` | IA §Financier Discover §7 | Cursor mobile |
| P6.1.2 | Portfolio (route `portfolio`) — 10-state grouping (Watchlisted→Exited) | `mobile/app/(financier)/portfolio.tsx` | IA §Financier Project Status §12 | Cursor mobile |
| P6.1.3 | Generation — E_gen/E_sold/E_grid/E_waste/utilization, data-quality badge, claim card | `mobile/app/(financier)/generation.tsx` | IA §Financier Energy Generation | Cursor mobile |
| P6.1.4 | Wallet — 10 sections (Available/Pending/Escrowed/Deployed/Cashflow/Projected/Payback/Fees/Risk/Statements) | `mobile/app/(financier)/wallet.tsx` | IA §Financier Wallet | Cursor mobile |
| P6.1.5 | Profile — KYC/KYB, eligibility tier, jurisdiction, risk profile, compliance, payout, tax | `mobile/app/(financier)/profile.tsx` | IA §Financier Profile | Cursor mobile |

### P6.2 Embedded routes (mobile)

| Task | Artifact | Target | Owner |
|---|---|---|---|
| P6.2.1 | project-detail (deal room) | `mobile/app/(financier)/_embedded/project-detail.tsx` | Cursor mobile |
| P6.2.2 | drs-detail | `mobile/app/(financier)/_embedded/drs-detail.tsx` | Cursor mobile |
| P6.2.3 | lbrs-detail | `mobile/app/(financier)/_embedded/lbrs-detail.tsx` | Cursor mobile |
| P6.2.4 | statement-detail | `mobile/app/(financier)/_embedded/statement-detail.tsx` | Cursor mobile |
| P6.2.5 | claim-detail | `mobile/app/(financier)/_embedded/claim-detail.tsx` | Cursor mobile |
| P6.2.6 | payback-scenarios (absorbs ex-`tranche-release.tsx` content) | `mobile/app/(financier)/_embedded/payback-scenarios.tsx` | Cursor mobile |
| P6.2.7 | buyout-flow | `mobile/app/(financier)/_embedded/buyout-flow.tsx` | Cursor mobile |
| P6.2.8 | incident-detail | `mobile/app/(financier)/_embedded/incident-detail.tsx` | Cursor mobile |
| P6.2.9 | dispute-flow | `mobile/app/(financier)/_embedded/dispute-flow.tsx` | Cursor mobile |

### P6.3 Components (financier-specific)

| Task | Component | Target | Owner |
|---|---|---|---|
| P6.3.1 | EscrowStatusCard | `mobile/components/financier/EscrowStatusCard.tsx` | Cursor mobile |
| P6.3.2 | ReleaseSchedule | `mobile/components/financier/ReleaseSchedule.tsx` | Cursor mobile |
| P6.3.3 | UtilizationTrend | `mobile/components/financier/UtilizationTrend.tsx` | Cursor mobile |
| P6.3.4 | ClaimPerformanceCard | `mobile/components/financier/ClaimPerformanceCard.tsx` | Cursor mobile |
| P6.3.5 | BalanceSummary | `mobile/components/financier/BalanceSummary.tsx` | Cursor mobile |
| P6.3.6 | CashflowTimeline | `mobile/components/financier/CashflowTimeline.tsx` | Cursor mobile |
| P6.3.7 | PaybackTracker (verify rename PaybackCard → PaybackTracker) | `mobile/components/financier/PaybackTracker.tsx` | Cursor mobile |
| P6.3.8 | ProjectionScenarios | `mobile/components/financier/ProjectionScenarios.tsx` | Cursor mobile |
| P6.3.9 | RiskAlertList | `mobile/components/financier/RiskAlertList.tsx` | Cursor mobile |
| P6.3.10 | IdentityCard (extend partial) | `mobile/components/financier/IdentityCard.tsx` | Cursor mobile |
| P6.3.11 | RiskProfileSummary | `mobile/components/financier/RiskProfileSummary.tsx` | Cursor mobile |
| P6.3.12 | EligibilityTierBadge | `mobile/components/financier/EligibilityTierBadge.tsx` | Cursor mobile |

### P6.4 Onboarding (Scenario F §5, 15 steps)

| Task | Step | Target | Owner |
|---|---|---|---|
| P6.4.1 | Account type (7 options) | `mobile/app/(onboard)/financier/account-type.tsx` | Cursor mobile |
| P6.4.2 | Identity verification (individual + entity paths) | `mobile/app/(onboard)/financier/identity.tsx` | Cursor mobile |
| P6.4.3 | Investor eligibility classification | `mobile/app/(onboard)/financier/eligibility.tsx` | Cursor mobile |
| P6.4.4 | Risk profile & suitability | `mobile/app/(onboard)/financier/risk-profile.tsx` | Cursor mobile |
| P6.4.5 | Regulatory disclosures (acceptance gate) | `mobile/app/(onboard)/financier/disclosures.tsx` | Cursor mobile |
| P6.4.6 | Jurisdiction gating | `mobile/app/(onboard)/financier/jurisdiction.tsx` | Cursor mobile |
| P6.4.7 | Payment rail setup | `mobile/app/(onboard)/financier/payment-rail.tsx` | Cursor mobile |
| P6.4.8 | Investment limits | `mobile/app/(onboard)/financier/limits.tsx` | Cursor mobile |
| P6.4.9 | Education module | `mobile/app/(onboard)/financier/education.tsx` | Cursor mobile |
| P6.4.10 | Access decision (8 outcomes) | `mobile/app/(onboard)/financier/decision.tsx` | Cursor mobile |
| P6.4.11 | Web parity | `website/src/onboard/financier/step{N}.tsx` | Codex web |

### P6.5 Web parity (5 screens)

| Task | Target | Owner |
|---|---|---|
| P6.5.1 | `website/src/screens/stakeholders/financier/discover.tsx` | Codex web |
| P6.5.2 | `website/src/screens/stakeholders/financier/portfolio.tsx` | Codex web |
| P6.5.3 | `website/src/screens/stakeholders/financier/generation.tsx` | Codex web |
| P6.5.4 | `website/src/screens/stakeholders/financier/wallet.tsx` | Codex web |
| P6.5.5 | `website/src/screens/stakeholders/financier/profile.tsx` | Codex web |

### P6.6 Backend endpoints

| Task | Endpoint | Target | Owner |
|---|---|---|---|
| P6.6.1 | `POST /financiers/{id}/kyc-submit` | `backend/app/api/financiers.py` | Claude backend |
| P6.6.2 | `POST /financiers/{id}/eligibility-questionnaire` | `backend/app/api/financiers.py` | Claude backend |
| P6.6.3 | `POST /financiers/{id}/risk-profile` | `backend/app/api/financiers.py` | Claude backend |
| P6.6.4 | `GET /financiers/{id}/eligible-offerings` (jurisdiction-filtered) | `backend/app/api/financiers.py` | Claude backend |
| P6.6.5 | `POST /financiers/{id}/escrow` | `backend/app/api/financiers.py` | Claude backend |
| P6.6.6 | `POST /financiers/{id}/buyout` | `backend/app/api/financiers.py` | Claude backend |
| P6.6.7 | `POST /financiers/{id}/withdraw` (pre-DRS refund) | `backend/app/api/financiers.py` | Claude backend |
| P6.6.8 | `GET /financiers/{id}/payback` | `backend/app/api/financiers.py` | Claude backend |
| P6.6.9 | `GET /financiers/{id}/statements` | `backend/app/api/financiers.py` | Claude backend |
| P6.6.10 | Tables: `eligibility_evidence`, `escrow`, `buyout_offer`, extend `financier_profile` (tier/jurisdiction/limits) | Alembic + `backend/app/models/*` | Claude backend |

### P6 Verification gate

- Walk Scenario F end-to-end including all 15 onboarding steps and the 8-decision access matrix.
- Discover hides ineligible offerings (CI gate); jurisdiction filter is server-enforced.
- Escrow funds released only on DRS/LBRS gate conditions; withdraw flow refunds pre-DRS.
- See [docs/DONE_DEFINITION.md](DONE_DEFINITION.md).

---

## P7 — Cockpit (web)

*Goal: admin operators have the full Cockpit — command landing, settlement monitor, alerts, 7 ops queues, per-building drill-down split into 8+1 tabs, RBAC console, audit viewer, query layer, 5 agent panels, eval harness. CR-1..CR-9 enforced.*

### P7.1 Admin mobile (read-only triage)

| Task | Artifact | Target | Spec | Owner |
|---|---|---|---|---|
| P7.1.1 | Alerts — severity grouping, owner-on-call, "Open in Cockpit" deep-link | `mobile/app/(admin)/alerts.tsx` | IA §Admin Alerts | Cursor mobile |
| P7.1.2 | Projects — phase grouping, enforce read-only | `mobile/app/(admin)/projects.tsx` | IA §Admin Projects | Cursor mobile |
| P7.1.3 | Profile — add JWT scope summary | `mobile/app/(admin)/profile.tsx` | IA §Admin Profile | Cursor mobile |
| P7.1.4 | AlertRow | `mobile/components/admin/AlertRow.tsx` | IA §Admin | Cursor mobile |
| P7.1.5 | AlertDetailReadOnly | `mobile/components/admin/AlertDetailReadOnly.tsx` | IA §Admin | Cursor mobile |
| P7.1.6 | ProjectRowAdmin | `mobile/components/admin/ProjectRowAdmin.tsx` | IA §Admin | Cursor mobile |
| P7.1.7 | ProjectDetailReadOnly | `mobile/components/admin/ProjectDetailReadOnly.tsx` | IA §Admin | Cursor mobile |

### P7.2 Operational dashboards

| Task | Surface | Target | Spec | Owner |
|---|---|---|---|---|
| P7.2.1 | Cockpit · Command (default landing) | `cockpit/src/pages/Command.tsx` | IA §Cockpit Command | Codex web |
| P7.2.2 | Cockpit · Stress Test — align with AI-native §6, add "Promote to production proposal" | `cockpit/src/stress-test/StressTest.jsx` | IA §Cockpit Stress Test | Codex web |
| P7.2.3 | Cockpit · Settlement Monitor | `cockpit/src/pages/SettlementMonitor.tsx` | IA §Cockpit Settlement | Codex web |
| P7.2.4 | Cockpit · Alerts | `cockpit/src/pages/Alerts.tsx` | IA §Cockpit Alerts | Codex web |

### P7.3 Dashboard components

| Task | Component | Target | Owner |
|---|---|---|---|
| P7.3.1 | CommandKPITile | `cockpit/src/components/CommandKPITile.tsx` | Codex web |
| P7.3.2 | AlertsPanel | `cockpit/src/components/AlertsPanel.tsx` | Codex web |
| P7.3.3 | QueueBacklogPanel | `cockpit/src/components/QueueBacklogPanel.tsx` | Codex web |
| P7.3.4 | SettlementSummaryStrip | `cockpit/src/components/SettlementSummaryStrip.tsx` | Codex web |
| P7.3.5 | AgentActivityRibbon | `cockpit/src/components/AgentActivityRibbon.tsx` | Codex web |
| P7.3.6 | WaterfallView | `cockpit/src/components/WaterfallView.tsx` | Codex web |
| P7.3.7 | SolvencyInvariantStrip | `cockpit/src/components/SolvencyInvariantStrip.tsx` | Codex web |
| P7.3.8 | SettlementProjectPicker | `cockpit/src/components/SettlementProjectPicker.tsx` | Codex web |
| P7.3.9 | AlertsTable | `cockpit/src/components/AlertsTable.tsx` | Codex web |
| P7.3.10 | AlertDetailDrawer | `cockpit/src/components/AlertDetailDrawer.tsx` | Codex web |
| P7.3.11 | RemediationStatusPill | `cockpit/src/components/RemediationStatusPill.tsx` | Codex web |

### P7.4 Ops decision queues (7 queues)

| Task | Queue | Page target | Component targets | Owner |
|---|---|---|---|---|
| P7.4.1 | DRS Queue | `cockpit/src/pages/DRSQueue.tsx` | `cockpit/src/components/queues/{DRSQueueTable,DRSGateCard,DRSBlockerList}.tsx` | Codex web |
| P7.4.2 | LBRS Queue | `cockpit/src/pages/LBRSQueue.tsx` | `cockpit/src/components/queues/{LBRSQueueTable,LBRSTestRow,ATSApartmentGrid,SettlementDryRunPanel}.tsx` | Codex web |
| P7.4.3 | Provider Verification Queue | `cockpit/src/pages/ProviderVerification.tsx` | `cockpit/src/components/queues/{ProviderVerificationTable,ProviderVerificationDecisionForm,DocumentReviewerPane}.tsx` | Codex web |
| P7.4.4 | Electrician Certification Queue | `cockpit/src/pages/ElectricianCertification.tsx` | `cockpit/src/components/queues/{ElectricianCertificationTable,CertificationTierAssignmentForm,TrainingModuleScoreGrid}.tsx` | Codex web |
| P7.4.5 | Financier Eligibility Queue | `cockpit/src/pages/FinancierEligibility.tsx` | `cockpit/src/components/queues/{FinancierEligibilityTable,EligibilityDecisionForm,JurisdictionGateBadge,InvestorLimitsEditor}.tsx` | Codex web |
| P7.4.6 | Authority/Identity Doc Review | `cockpit/src/pages/DocReview.tsx` | `cockpit/src/components/queues/{DocReviewQueueTable,DocumentViewer,AuthorityDecisionForm}.tsx` | Codex web |
| P7.4.7 | Counterparties Directory | `cockpit/src/pages/Counterparties.tsx` | `cockpit/src/components/queues/{CounterpartiesTabs,CounterpartyProfileDrawer}.tsx` | Codex web |

### P7.5 Per-building drill-down (BuildingDetail tabs)

*Built on the tab router shell from P0.1.15.*

| Task | Tab | Components | Owner |
|---|---|---|---|
| P7.5.1 | Overview | `cockpit/src/components/building/{BuildingOverviewHero,OpsEventsFeed}.tsx` | Codex web |
| P7.5.2 | Energy | `cockpit/src/components/building/{EnergyTimeline,ApartmentHeatmap,TelemetryStrip}.tsx` | Codex web |
| P7.5.3 | Pledges | `cockpit/src/components/building/{PledgeLedger,CapacityQueueGrid}.tsx` | Codex web |
| P7.5.4 | DRS | `cockpit/src/components/building/{DRSComponentGrid,DRSScoreSparkline}.tsx` | Codex web |
| P7.5.5 | LBRS | `cockpit/src/components/building/{LBRSTestGrid,ATSTestMatrix,EvidenceCarousel}.tsx` | Codex web |
| P7.5.6 | Ops | `cockpit/src/components/building/{WorkOrderList,IncidentLog,MaintenanceReserveCard}.tsx` | Codex web |
| P7.5.7 | Settlement | `cockpit/src/components/building/{PayoutRegister,ConservativeSettleLog}.tsx` (WaterfallView reused from P7.3.6) | Codex web |
| P7.5.8 | Roof | `cockpit/src/components/building/{ArrayLayoutOverlay,RoofEvidencePhotos}.tsx` (RoofPolygonViewer reused from P0.2.28) | Codex web |
| P7.5.9 | Stakeholders (optional links to Counterparties) | route-level link, no new component | Codex web |

### P7.6 Universal Cockpit Rules enforcement (CR-1..CR-9)

| Task | Rule | Action | Owner |
|---|---|---|---|
| P7.6.1 | CR-1 admin role isolation | Verify hard reject from P0.1.14; add render test `cockpit/__tests__/admin-isolation.test.tsx` | Codex web |
| P7.6.2 | CR-2 every mutation audited (reason required) | Wire `<RequiresReason>` (P0.3.18) into all mutation forms in queues and drill-down; backend `audit_log` table has no UPDATE permission (test in `test_audit_immutability.py`) | Codex web + Claude backend |
| P7.6.3 | CR-3 PII masking + view claim | Wire `MaskedField` UI primitive checking JWT claim from P0.0.2; denied unmask attempt writes audit row | Codex web + Claude backend |
| P7.6.4 | CR-4 agent-action attribution | Wire `<AgentAttribution>` (P0.3.19) wherever an `agent_action` is rendered; agent actions stay in `pending_admin_approval` state until accept/reject | Codex web |
| P7.6.5 | CR-5 conservative-by-default banner | Wire `<ConservativeBanner>` (P0.3.20) at App shell, reads response header `X-Emappa-Conservative` | Codex web |
| P7.6.6 | CR-6 critical-gate override discipline | DRS/LBRS queue detail forms render NO "Force complete" button at all (not just disabled). Implementation: omit the JSX. Verification: `cockpit/__tests__/{drs,lbrs}-no-force-complete.test.tsx` scans DOM for `/force.*complete/i` and asserts not found. Solar-bus-isolation non-overridable in backend regardless of UI. | Codex web + Claude backend |
| P7.6.7 | CR-7 RBAC-scoped queues | Verify P0.3.6 middleware drives queue filter; UI respects "no access" empty state | Codex web |
| P7.6.8 | CR-8 no silent fallback | Audit every surface; replace mock fallback with loading/empty/error per P0.3.16 contract; add eslint rule rejecting `mockData` imports outside test files | Codex web |
| P7.6.9 | CR-9 deep-linkable everywhere | Verify P0.0.1 router covers all queue + drill-down + agent + audit URLs; `cockpit/__tests__/deep-link.test.tsx` navigates to a stored URL set and asserts correct render | Codex web |

### P7.7 Backend endpoints (Cockpit-only)

| Task | Endpoint | Target | Owner |
|---|---|---|---|
| P7.7.1 | `GET /alerts` (severity-grouped, RBAC-scoped) | `backend/app/api/alerts.py` | Claude backend |
| P7.7.2 | `POST /alerts/{id}/acknowledge` | `backend/app/api/alerts.py` | Claude backend |
| P7.7.3 | `GET /incidents` + `POST /incidents/{id}/postmortem` | `backend/app/api/incidents.py` | Claude backend |
| P7.7.4 | `GET /queues/{kind}` for kind∈{drs,lbrs,provider,electrician,financier,doc,counterparties} | `backend/app/api/queues.py` | Claude backend |
| P7.7.5 | `POST /queues/{kind}/decisions` (decision write + audit attribution) | `backend/app/api/queues.py` | Claude backend |
| P7.7.6 | `GET /audit-log` (filterable, RBAC-scoped) | `backend/app/api/audit_log.py` | Claude backend |
| P7.7.7 | `GET /rbac/users`, `POST /rbac/grants`, `GET /rbac/effective/{user}` | `backend/app/api/rbac.py` | Claude backend |
| P7.7.8 | `GET /settlement/overview` (Settlement Monitor backing) | `backend/app/api/settlement.py` | Claude backend |
| P7.7.9 | `POST /settlement/hold` (Settlement Monitor action) | `backend/app/api/settlement.py` | Claude backend |
| P7.7.10 | `POST /stress-test/promote` (Stress Test → production proposal) | `backend/app/api/stress.py` | Claude backend |

### P7 Verification gate

- Cockpit at `/` lands on Command and renders all KPI tiles + alerts + queue backlog + settlement strip + agent ribbon.
- All 7 ops queues open, decisions write to audit log with reason.
- BuildingDetail renders 8+1 tabs, no monolith remains.
- CR-1..CR-9 enforced (verified by P9 CI gates).
- Non-admin session hard-rejected at App boundary.
- See [docs/DONE_DEFINITION.md](DONE_DEFINITION.md).

---

## P8.0 — Agent backend skeletons in place (verify P0.0.3)

Sanity check before P8 UI work: confirm the 4 stub agents from P0.0.3 are callable + returning the documented shape. P8 UI panels assume this.

| Task | Check | Owner |
|---|---|---|
| P8.0.1 | `pytest backend/tests/test_agents_skeleton.py` green — each of 5 agents importable, returns `AgentProposal` shape | Claude backend |
| P8.0.2 | `GET /agents` enumerates all 5 with `version`, `status='stub'|'live'` | Claude backend |

---

## P8 — AI-native integration

*Goal: 5 agent panels are wired to real agent backends; query layer answers with citations + tool-call trace; audit log viewer renders agent attribution; eval harness runs scorecards + regression chart.*

### P8.1 Query layer + audit + eval

| Task | Surface | Target | Spec | Owner |
|---|---|---|---|---|
| P8.1.1 | Query Layer UI | `cockpit/src/pages/QueryLayer.tsx` + `cockpit/src/components/{QueryInput,AnswerWithCitations,ToolCallTrace}.tsx` | AI-native §3 | Codex web |
| P8.1.2 | Audit Log Viewer | `cockpit/src/pages/AuditLog.tsx` + `cockpit/src/components/{AuditTable,AuditDiffDrawer}.tsx` | AI-native §4 | Codex web |
| P8.1.3 | Eval Harness UI | `cockpit/src/pages/EvalHarness.tsx` + `cockpit/src/components/{AgentEvalPicker,EvalScorecardGrid,EvalRegressionChart}.tsx` | AI-native §9 Phase 4 | Codex web |

### P8.2 Permission/RBAC console

| Task | Surface | Target | Owner |
|---|---|---|---|
| P8.2.1 | RBAC Console | `cockpit/src/pages/RBAC.tsx` + `cockpit/src/components/{RBACUserTable,RBACAgentTable,PermissionGrantForm,EffectivePermissionInspector}.tsx` | Codex web |

### P8.3 Agent panels (5 agents)

| Task | Agent | Target | Backend | Owner |
|---|---|---|---|---|
| P8.3.1 | DRS Agent | `cockpit/src/pages/agents/DRSAgent.tsx` | `backend/app/agents/drs_agent.py` (exists; verify wire) | Codex web + Claude backend |
| P8.3.2 | LBRS Agent | `cockpit/src/pages/agents/LBRSAgent.tsx` | `backend/app/agents/lbrs_agent.py` | Codex web + Claude backend |
| P8.3.3 | Settlement Agent | `cockpit/src/pages/agents/SettlementAgent.tsx` | `backend/app/agents/settlement_agent.py` | Codex web + Claude backend |
| P8.3.4 | Alert Triage Agent | `cockpit/src/pages/agents/AlertTriageAgent.tsx` | `backend/app/agents/alert_triage_agent.py` | Codex web + Claude backend |
| P8.3.5 | Eligibility Agent | `cockpit/src/pages/agents/EligibilityAgent.tsx` | `backend/app/agents/eligibility_agent.py` | Codex web + Claude backend |
| P8.3.6 | Shared agent components | `cockpit/src/components/agents/{AgentPanelHeader,AgentActionQueue,AgentActionDecisionForm,AgentHealthCard}.tsx` | — | Codex web |

### P8.4 Agent-action backend

| Task | Endpoint | Target | Owner |
|---|---|---|---|
| P8.4.1 | `GET /agent-actions?agent=X&status=proposed` | `backend/app/api/agent_actions.py` | Claude backend |
| P8.4.2 | `POST /agent-actions/{id}/accept` (with reason + audit) | `backend/app/api/agent_actions.py` | Claude backend |
| P8.4.3 | `POST /agent-actions/{id}/reject` (with reason + audit) | `backend/app/api/agent_actions.py` | Claude backend |
| P8.4.4 | `POST /eval/runs` (trigger eval; persist to `agent_eval_run`) | `backend/app/api/eval.py` | Claude backend |
| P8.4.5 | `GET /eval/runs?agent=X` (scorecards + regression deltas) | `backend/app/api/eval.py` | Claude backend |

### P8 Verification gate

- Query layer answers a stock question ("what's the DRS for building 42?") with citations + tool trace.
- Audit log viewer shows agent attribution badge on every agent-driven row.
- Eval harness runs a stored prompt set against a chosen agent version and renders a scorecard.
- See [docs/DONE_DEFINITION.md](DONE_DEFINITION.md).

---

## P9 — Hardening

*Goal: CI gates enforced, end-to-end test coverage of the Scenarios A–F walks, security audit, performance baseline.*

### P9.1 CI gates (full set per [DONE_DEFINITION §CI gates](DONE_DEFINITION.md))

All gates land in P9; backend gates run in `pytest backend/`, UI/lint gates in `pnpm -w test`.

#### Doctrine: prepaid + monetized + capacity

| Task | Gate | Test path | Owner |
|---|---|---|---|
| P9.1.1 | Prepaid-only (no postpaid, no arrears) | `backend/tests/test_prepaid_only.py` | Claude backend |
| P9.1.2 | No payout from unpaid usage | `backend/tests/test_no_unpaid_payout.py` | Claude backend |
| P9.1.3 | Monetized-only (no E_waste payout) | `backend/tests/test_settlement.py::test_no_waste_payout` | Claude backend |
| P9.1.4 | Settlement solvency invariant Σpayout ≤ Σinflow | `backend/tests/test_settlement.py::test_solvency` | Claude backend |
| P9.1.5 | Capacity-cleared prereq for token purchase | `mobile/__tests__/resident-token-purchase.test.tsx` + `backend/tests/test_token_purchase.py` | Cursor mobile + Claude backend |
| P9.1.6 | "Buy tokens" CTA hidden pre-activation | `mobile/__tests__/resident-home.test.tsx` | Cursor mobile |

#### Doctrine: DRS / LBRS gates

| Task | Gate | Test path | Owner |
|---|---|---|---|
| P9.1.7 | DRS<100% blocks installation | `backend/tests/test_drs_gate.py` | Claude backend |
| P9.1.8 | LBRS<100% blocks go-live | `backend/tests/test_lbrs_gate.py` | Claude backend |
| P9.1.9 | Solar-bus-isolation non-overridable | `backend/tests/test_lbrs_gate.py::test_solar_bus_isolation_blocks` | Claude backend |
| P9.1.10 | No "Force complete" UI affordance | `cockpit/__tests__/{drs,lbrs}-no-force-complete.test.tsx` | Codex web |

#### Doctrine: role isolation + role economics

| Task | Gate | Test path | Owner |
|---|---|---|---|
| P9.1.11 | `role='admin'` blocked in public roleset | `packages/shared/src/roles.test.ts` | Claude backend |
| P9.1.12 | `role='admin'` rejected by `/me/select-role` | `backend/tests/test_me_role.py` | Claude backend |
| P9.1.13 | Cockpit hard-rejects non-admin (CR-1) | `cockpit/__tests__/admin-isolation.test.tsx` | Codex web |
| P9.1.14 | Homeowner wallet zeroes host-royalty | `backend/tests/test_wallet.py::test_homeowner_no_host_royalty` | Claude backend |
| P9.1.15 | Labor-as-capital is opt-in | `backend/tests/test_labor_as_capital.py` | Claude backend |

#### Doctrine: financier compliance + language

| Task | Gate | Test path | Owner |
|---|---|---|---|
| P9.1.16 | Discover hides ineligible projects (Financier) | `backend/tests/test_offerings.py` + `mobile/__tests__/financier-discover.test.tsx` | Claude backend + Cursor mobile |
| P9.1.17 | No-guarantee language on projections | `website/__tests__/financier-projection.test.tsx` + lint custom rule | Codex web |
| P9.1.18 | Ownership sale requires valuation | `backend/tests/test_ownership_sale.py` | Claude backend |
| P9.1.19 | Share buy-down retained-claim language | `mobile/__tests__/provider-generation.test.tsx` + lint custom rule | Cursor mobile |

#### Doctrine: AI-native governance

| Task | Gate | Test path | Owner |
|---|---|---|---|
| P9.1.20 | Audit log immutability | `backend/tests/test_audit_immutability.py` | Claude backend |
| P9.1.21 | Agent action requires admin co-sign | `backend/tests/test_agent_action_workflow.py` | Claude backend |
| P9.1.22 | PII view claim enforced | `backend/tests/test_pii_claim.py` | Claude backend |
| P9.1.23 | Conservative-by-default banner (CR-5) | `backend/tests/test_conservative_settle.py` | Claude backend |
| P9.1.24 | Agent eval pass threshold ≥80% | `backend/tests/test_agent_eval.py` | Claude backend |

**Weekend MVP cut:** ship at least P9.1.6, P9.1.7, P9.1.8, P9.1.11, P9.1.14 (top 5). Full 24-gate suite is realistic for a 2-week sprint, not a weekend.

### P9.2 E2E test suites

| Task | Suite | Target | Owner |
|---|---|---|---|
| P9.2.1 | Scenario A (Resident) walkthrough | `tests/e2e/resident.spec.ts` | Cursor mobile |
| P9.2.2 | Scenario B (BO) walkthrough | `tests/e2e/building-owner.spec.ts` | Cursor mobile |
| P9.2.3 | Scenario C (Homeowner) walkthrough | `tests/e2e/homeowner.spec.ts` | Cursor mobile |
| P9.2.4 | Scenario D (Electrician) walkthrough | `tests/e2e/electrician.spec.ts` | Cursor mobile |
| P9.2.5 | Scenario E (Provider) walkthrough | `tests/e2e/provider.spec.ts` | Cursor mobile |
| P9.2.6 | Scenario F (Financier) walkthrough | `tests/e2e/financier.spec.ts` | Cursor mobile |
| P9.2.7 | Cockpit ops queue + audit + drill-down walkthrough | `tests/e2e/cockpit.spec.ts` | Codex web |

### P9.3 Security & performance

| Task | Item | Target | Owner |
|---|---|---|---|
| P9.3.1 | Security audit (JWT, PII masking, RBAC, audit middleware) | `docs/SECURITY_AUDIT.md` | Claude backend |
| P9.3.2 | Performance baseline (TTFB, p95 latency, Cockpit hydration) | `docs/PERF_BASELINE.md` | Claude backend |
| P9.3.3 | Re-run MISSING.md audit; MISSING must equal 0 | `scripts/audit-missing.ts` | Claude backend |

### P9 Verification gate

- All CI gates green; merges blocked on regression.
- All 7 e2e suites pass against a seeded dev DB.
- Security audit signed off; perf baseline within target.
- Final MISSING.md tally: 0 MISSING, 0 PARTIAL, 0 STALE.
- See [docs/DONE_DEFINITION.md](DONE_DEFINITION.md).

---

## Cross-cutting concerns

### Verification per artifact

Every task references [docs/DONE_DEFINITION.md](DONE_DEFINITION.md) for its done criteria. Standard pattern:
1. File exists at target path.
2. Type-check + lint green.
3. Renders in dev runtime with no console errors.
4. Loading/empty/error states implemented (CR-8).
5. Backend mutations write audit row (CR-2).
6. For role screens: walks the matching Scenario step without dead-ends.
7. MISSING.md re-audit reduces the artifact's status to EXISTS.

### Multi-agent coordination

See [docs/agents/SPRINT_KICKOFF.md](agents/SPRINT_KICKOFF.md). Suggested model:
- One agent per phase column (mobile / web / backend) inside a phase.
- Phase kickoffs include a 30-minute task partition meeting.
- All agents commit to short-lived branches off `phase/P{N}-{theme}`.
- A human reviewer merges phase branches into `main` only after the phase verification gate passes.

### Re-auditing MISSING.md (burndown)

After each phase, re-run `scripts/audit-missing.ts` (P0.4.2). Tally must monotonically decrease. CI gate: phase merge blocked if MISSING count exceeds the budget below.

| After phase | MISSING ≤ | PARTIAL ≤ | STALE ≤ | EXISTS ≥ | Net change vs prior |
|---|---|---|---|---|---|
| Baseline (today) | 207 | 73 | 14 | 18 | — |
| P0.0 | 207 | 73 | 14 | 18 | unchanged (ADRs + stubs, no artifacts) |
| P0 | 155 | 60 | 0 | 97 | −52 MISSING, −13 PARTIAL, −14 STALE (cleanup + 30 primitives + 20 backend foundations + structural fixes) |
| P1 | 130 | 50 | 0 | 132 | −25 MISSING (Resident screens + embeds + components + endpoints) |
| P2 | 100 | 38 | 0 | 174 | −30 MISSING (Homeowner) |
| P3 | 75 | 28 | 0 | 209 | −25 MISSING (Building Owner) |
| P4 | 45 | 18 | 0 | 249 | −30 MISSING (Provider) |
| P5 | 22 | 10 | 0 | 280 | −23 MISSING (Electrician) |
| P6 | 5 | 3 | 0 | 304 | −17 MISSING (Financier) |
| P7 | 0 | 2 | 0 | 310 | −5 MISSING (Cockpit) |
| P8.0+P8 | 0 | 0 | 0 | 312 | −2 PARTIAL (agent skeletons + UI panels) |
| P9 | 0 | 0 | 0 | 312 | all CI gates green, e2e suites green |

### Phase dependencies (explicit, machine-checkable)

| Phase | Cannot start until |
|---|---|
| P0.0 | — (kickoff) |
| P0.1–P0.4 | P0.0 verification gate green |
| P1, P2, P3, P4, P5, P6 | P0 verification gate green (especially P0.2 shared primitives + P0.3 backend foundation) |
| P7 | P0 done AND P1.6, P2.6, P3.6, P4.6, P5.6, P6.6 backend endpoint columns green (Cockpit queues call role endpoints) |
| P8.0 | P0.0.3 stub agents merged |
| P8 | P7 done AND P8.0 green |
| P9 | P1..P8 complete (e2e tests + CI gates need all surfaces to exist) |

---

## Risks & open questions

1. **Pledge vs token split (P1.6.2)** — current `/prepaid/commit` conflates non-binding pledge and real-money token purchase. Splitting them is a backward-incompatible API change; clients on `prepaid.py` need migration. *Open: do we dual-write during transition or hard-cut?*
2. **`apartment_ats_state` 8 states vs ATS hardware** — Scenario A §2.1 enumerates 8 states; the underlying ATS hardware may surface fewer. *Open: derived-state vs hardware-state separation.*
3. **Host-royalty zero-from-own-roof rule (P3.6.6)** — applies when a BO is also a resident in their own building. Edge case: BO who owns multiple buildings and resides in one. *Open: scope rule to (apt,owner) pair, not (building,owner).*
4. **Labor-as-capital opt-in default (P5.6.7, P9.1.8)** — spec says opt-in; need confirmation that the wallet UI defaults the toggle OFF and the backend rejects a claim without explicit opt-in metadata.
5. **Financier jurisdiction filter (P6.6.4, P9.1.9)** — `eligible-offerings` must filter server-side. *Open: do we expose a "you would qualify if..." hint client-side, or hard-hide?* IA spec is silent.
6. **Cockpit deep-linkable everywhere (CR-9, P0.3.17)** — current `App.tsx` uses local view state. Migrating to React Router is invasive. *Open: do all P7.* tasks share a router refactor PR, or does P0.3.17 land first as a no-op router?*
7. **PII masking + view claim (CR-3)** — JWT claim model not yet defined. *Open: claim string format, granularity (per-field vs per-resource).*
8. **Agent panels backend reality (P8.3.*)** — only `drs_agent.py` exists today. The other 4 agents are placeholders. *Open: P8 may need a P8.0 sub-phase to stand up agent skeletons before the UI panels can call them.*
9. **Stress Test "Promote to production proposal" (P7.2.2)** — spec mentions this but workflow is undefined. *Open: does promotion bypass DRS gate? Almost certainly not, but the path needs an ADR.*
10. **Web parity granularity (IA-U10)** — spec mandates web parity for all 4–5 role screens. *Open: are web onboarding splits (P0.1.11-13) strictly required for pilot or can mobile-first ship while web onboarding stays monolithic for a sprint?*

---

## Appendix: dependency graph

### Shared primitives (P0.2) consumed by

| Primitive | P1 | P2 | P3 | P4 | P5 | P6 | P7 |
|---|---|---|---|---|---|---|---|
| BuildingAvailabilityStatePill | yes | — | — | — | — | — | yes |
| CapacityQueueStatusPill | yes | — | — | — | — | — | yes |
| DataQualityBadge | yes | yes | yes | yes | — | yes | yes |
| EligibilityBadge | — | — | — | — | — | yes | yes |
| KYCStatusBadge | — | — | — | — | — | yes | yes |
| SyntheticBadge | yes | yes | yes | yes | — | yes | — |
| TokenBalanceHero | yes | yes | yes | — | — | — | — |
| DRSProgressCard | yes | yes | yes | — | — | yes | yes |
| SystemHealthIndicator | yes | yes | yes | — | — | — | yes |
| LiveSupplyIndicator | yes | — | yes | — | — | — | yes |
| OwnershipPositionCard | yes | yes | yes | — | — | yes | — |
| OwnershipRingChart | — | yes | yes | yes | — | — | — |
| OwnershipBreakdown | — | — | — | yes | — | yes | — |
| DeploymentProgressBar | — | yes | yes | — | — | — | yes |
| BlockerPill | — | yes | yes | — | — | — | yes |
| CashflowLedger | — | yes | — | yes | — | yes | — |
| FilterBar | — | — | — | yes | yes | yes | — |
| ProjectStatusCard | — | — | — | yes | yes | — | — |
| ProjectTimeline | — | yes | yes | yes | yes | yes | — |
| GenerationChart | — | — | — | yes | — | yes | yes |
| EnergyFlowChart | — | — | — | — | — | yes | yes |
| SettlementStatement | — | yes | yes | yes | — | yes | yes |
| PayoutAccountCard | — | yes | yes | yes | yes | yes | — |
| ComplianceStatusIndicator | — | — | — | yes | yes | yes | yes |
| RatingsSummary | — | — | — | yes | yes | — | — |
| DocumentUploadCard | — | yes | yes | yes | yes | yes | yes |
| LaborCapitalClaimCard | — | — | — | — | yes | yes | — |
| RoofPolygonViewer | — | yes | yes | — | — | — | yes |
| RoofMap | — | yes | yes | — | — | — | — |
| ScreenState wrapper (P0.3.16) | yes | yes | yes | yes | yes | yes | yes |

### Backend foundation (P0.3) consumed by

| Foundation | Consumers |
|---|---|
| `audit_log` + mutation middleware | every POST/PATCH/DELETE in P1–P8 |
| `rbac_claim` + scope middleware | every queue/drill-down endpoint in P7 |
| `apartment_ats_state` | P1.6.6, P7.4.2, P7.5.2 |
| `capacity_queue` | P1.6.4–5, P7.5.3 |
| `load_profile` | P1.6.3, P2.4.4, P7.5.3 |
| split pledge/token | P1.6.2, P7.5.3 |
| `alert` / `incident` | P7.7.1–3, P7.2.4 |
| `agent_action` | P8.4.1–3 |
| `agent_eval_run` | P8.4.4–5 |

### Phase dependency chain

```
P0 ──┬── P1 ── (independent)
     ├── P2 ── (independent)
     ├── P3 ── shares P2 roof/authority primitives
     ├── P4 ── shares P1 pledge/token tables
     ├── P5 ── shares P4 BOM
     ├── P6 ── shares P1 pledge tables
     └── P7 ── needs P6 queue endpoints
                  │
                  └── P8 ── needs P7 cockpit shell
                              │
                              └── P9 ── hardens everything
```

**END BUILD PLAN.**
