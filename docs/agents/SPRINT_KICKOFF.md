# Sprint Kickoff — Multi-Agent Coordination Protocol

> Generated 2026-05-16. Drives the parallel build of [docs/BUILD_PLAN.md](../BUILD_PLAN.md) across three AI coding agents (Cursor mobile, Codex web, Claude backend) + one human coordinator. Read this before starting any phase.
>
> **Pace: weekend MVP.** 312 artifacts / 2 days / 3 agents = ~52 artifacts per agent per day = ~6–10 min per artifact end-to-end. **Mechanical pace only.** Ships spec-compliant structure with doctrine guards; no design pass, shallow tests, deferred hardening. Review must happen same-hour or agents stall. See [BUILD_PLAN.md §Phase map at a glance](../BUILD_PLAN.md#phase-map-at-a-glance) for the hour-by-hour calendar and the §What the weekend MVP delivers section for what ships vs what defers.

## The 4 docs

| Doc | Purpose | Update cadence |
|---|---|---|
| [IA_SPEC.md](../IA_SPEC.md) | Definitive screen inventory — *what* exists | Frozen unless spec changes |
| [MISSING.md](../MISSING.md) | Backlog — *what's missing* | Re-audit after every phase |
| [BUILD_PLAN.md](../BUILD_PLAN.md) | Sequence — *what to build next* | Mark tasks DONE inline |
| [DONE_DEFINITION.md](../DONE_DEFINITION.md) | Verification gate — *when is it done* | Frozen unless rubric changes |

Every PR cites: spec section (IA_SPEC) + backlog row (MISSING) + plan task ID (BUILD_PLAN) + done gates (DONE_DEFINITION).

## Agent roster

| Agent | Domain | Owns | Reads |
|---|---|---|---|
| **Cursor mobile** | `mobile/` | All `mobile/app/(role)/*`, `mobile/components/{shared,role}/*`, mobile tests | shared/, packages/, backend types |
| **Codex web** | `website/`, `cockpit/`, infra | All `website/src/*`, `cockpit/src/*`, deployment configs | shared/, packages/, backend types |
| **Claude backend** | `backend/`, `packages/shared/` | All `backend/app/*`, `backend/alembic/*`, `packages/shared/src/*`, backend tests + coordinator role | mobile/web for verification only |

**Coordinator role.** Claude backend doubles as the sprint coordinator:
- Owns the type contract in `packages/shared/src/types.ts` — never let it drift mid-sprint
- Runs `scripts/audit-missing.ts` at end of each phase to publish the new tally
- Holds merge authority on `main` (no agent self-merges)
- Resolves cross-agent conflicts (e.g., what's the API shape for `/residents/{id}/queue-position`)

## Phase kickoff (30 min)

Run this before any agent picks up a phase task:

1. **Read** the phase section of [BUILD_PLAN.md](../BUILD_PLAN.md) end-to-end (e.g., P1 = 6 sub-sections).
2. **Partition** tasks: each agent claims by Owner column. Conflicts (a task with no Owner or with multiple owners) — coordinator decides.
3. **Branch**: each agent creates a feature branch off `phase/P{N}-{theme}`:
   - `phase/P1-resident` (Cursor mobile)
   - `phase/P1-resident-web` (Codex web)
   - `phase/P1-resident-backend` (Claude backend)
4. **Type-contract lock** (only when a phase introduces new shared types):
   - Claude backend adds types to `packages/shared/src/types.ts` first, in a *separate* PR
   - Cursor / Codex rebase on that before starting
5. **Surface dependencies**: walk the [BUILD_PLAN appendix](../BUILD_PLAN.md#appendix-dependency-graph) and confirm every shared primitive (P0.2) used in this phase is already built. If not, that's a phase blocker — escalate to coordinator.
6. **Estimate**: each agent commits to a sub-set with a target end-of-week.

## Daily flow

Each agent independently:
1. Picks an unassigned task from their column in the phase
2. Creates `task/P{N}.{group}.{task}-short-name` branch off their phase branch
3. Implements per [DONE_DEFINITION.md](../DONE_DEFINITION.md)
4. PRs against their phase branch; coordinator + one peer review
5. Squash-merges; marks the row **DONE YYYY-MM-DD** inline in BUILD_PLAN.md

Aim for ≤300 LOC diff per PR (was 600 — tightened for 2-week pace). One PR per task in BUILD_PLAN. Larger work splits into multiple tasks so review stays fast.

## Conflict & contract drift handling

- **Two agents need the same shared component** → first builder ships, second imports.
- **API shape drift mid-phase** → STOP. Coordinator updates `packages/shared/src/types.ts` first, both agents rebase.
- **Spec ambiguity** → file an issue tagged `spec:ambiguous`, coordinator decides + amends IA_SPEC + commits the amendment.
- **Backend renames a field** → coordinator broadcasts the change; mobile/web rebase before continuing.
- **PR fails CI on someone else's code** → don't merge through it; coordinator triages.

## End-of-phase gate

Before merging `phase/P{N}-*` branches into `main`:

1. **Verification checklist** per [DONE_DEFINITION.md](../DONE_DEFINITION.md):
   - `pnpm -w typecheck` + `pnpm -w lint` + `pnpm -w build` green
   - `pytest backend/` green
   - All CI gates from MISSING.md §CI gates that apply to this phase pass
   - For role phases: runtime walk of the role's mobile + web surfaces (Cursor + Codex demo)
   - For cockpit phase: runtime walk of every queue + drill-down + agent panel
2. **MISSING.md re-audit**: `scripts/audit-missing.ts` writes a fresh tally. Phase passes if tally meets the expected trajectory in BUILD_PLAN §Re-auditing MISSING.md.
3. **Coordinator merges** in order: backend → mobile → web (mobile rebases on backend; web rebases on both).
4. **Tag**: `git tag phase-P{N}-done-YYYY-MM-DD`.

## Parallel phase execution (post-P0)

Once P0 lands, phases P1..P6 run in parallel because each touches a different role's `(role)/*` path. **Cross-role shared primitives are owned by P0** — if a P1..P6 task needs a shared primitive that wasn't built in P0.2, escalate; don't build a per-role copy.

The shared resources to watch:
- `packages/shared/src/types.ts` — only Claude backend writes here
- `mobile/components/shared/*` — only the phase that introduces it writes; others import
- `backend/app/models/*` — coordinator merges schema PRs serially to avoid Alembic conflicts
- Alembic version chain — Claude backend manages; no parallel migrations without coordination

## Failure modes & responses

| Failure | Response |
|---|---|
| Type-check fails post-merge | Coordinator reverts; original PR author re-PRs with fix |
| Phase verification gate fails | Phase stays open; failing artifacts go back to in-progress |
| Spec turns out to be wrong | Amend IA_SPEC.md (with change log entry); re-audit MISSING.md; affected tasks may move phases |
| Two agents shipped duplicate components | Coordinator picks the spec-aligned one, deletes the other, refactors importers |
| Agent missed a dependency from BUILD_PLAN appendix | Halt; build the dependency first; resume |
| Cross-package change touched all 3 agents | Coordinator orchestrates: backend ships first, then mobile, then web; no parallel work on the touched surface |

## Communication

- **All decisions** live in commit messages or PR descriptions — no out-of-band channels become source of truth.
- **Spec amendments** ship as PRs to `docs/IA_SPEC.md` with a change log entry; never edit silently.
- **Status updates** at end-of-day: agent posts a one-line "P{N}.{g}.{t} done | P{N}.{g}.{t} in-progress | blocked on X".

## When to update this doc

- Roster change (new agent, agent retires)
- Phase model change (e.g., we introduce a P10)
- Coordination process breaks down (e.g., type-contract drift happens twice → update the lock protocol)

**END SPRINT KICKOFF**
