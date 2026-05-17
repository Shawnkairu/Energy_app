# Multi-agent sprints

> **ACTIVE:** [SPRINT_KICKOFF.md](SPRINT_KICKOFF.md) — multi-agent coordination protocol for executing [docs/BUILD_PLAN.md](../BUILD_PLAN.md). Read this before starting any phase.
>
> **The 4 docs that drive every build PR:**
> 1. [IA_SPEC.md](../IA_SPEC.md) — definitive screen inventory (*what* exists)
> 2. [MISSING.md](../MISSING.md) — backlog (*what's missing*, file targets)
> 3. [BUILD_PLAN.md](../BUILD_PLAN.md) — phased sequence P0..P9 (*what to build next*)
> 4. [DONE_DEFINITION.md](../DONE_DEFINITION.md) — verification gate (*when is it done*)
>
> **Phase 0 mechanical renames landed 2026-05-16** (DrsCard → DRSProgressCard, TokenHero → TokenBalanceHero, verify-phone → verify-otp, admin home.tsx deleted). Remaining P0 work is in [BUILD_PLAN.md §P0](../BUILD_PLAN.md#p0--foundation--cleanup).

> **Superseded:** [COVERAGE_SPRINT.md](COVERAGE_SPRINT.md), [RUNTIME_REALITY_SPRINT.md](RUNTIME_REALITY_SPRINT.md) — their outputs are folded into MISSING.md + BUILD_PLAN.md.

> **Historical:** Day 1 Sprint below — the original build sprint that landed the contract + IA + initial role surfaces.

---

# Day 1 Sprint — 32% to 70% in one day

Three AI coding agents running in parallel, no path collisions, one merge sequence.

## Read in this order

1. [SPRINT_CONTRACT.md](../SPRINT_CONTRACT.md) — frozen types, endpoints, schema, env vars, branch + ownership map. **All three agents start here.**
2. [SPEC_COMPLIANCE_CHECKLIST.md](SPEC_COMPLIANCE_CHECKLIST.md) — what's pilot vs deferred (email OTP, pledge mode, synthetic data, roof capture)
3. Your assigned prompt:
   - **Cursor** → [cursor-mobile.md](cursor-mobile.md) — mobile/, 5 subagents
   - **Claude Code** → [claude-backend.md](claude-backend.md) — backend/, packages/, 6 subagents, **also coordinator**
   - **Codex** → [codex-infra.md](codex-infra.md) — cockpit/, website/, infra, 4 subagents
4. [MERGE_PLAN.md](MERGE_PLAN.md) — coordinator (Claude Code) runs this at end-of-day

## Timeline

```
T+0:00   Claude Code locks contract on sprint/contract → main (alone, ~30 min)
T+0:30   All 3 agents start in parallel
T+5:30   Cutoff — agents wrap up final commits
T+6:00   Claude Code merges sprint/backend → main
T+6:30   Cursor rebases sprint/mobile, Claude Code merges → main
T+7:00   Codex rebases sprint/infra, Claude Code merges → main
T+7:30   End-to-end smoke test
T+8:00   Tag v0.1-pilot, deploy staging
```

## Why this won't collide

- Agents own disjoint top-level directories (mobile / backend / cockpit+website+infra).
- The shared boundary — `packages/shared/src/types.ts` — is frozen by Claude Code in Phase A and read-only after that.
- Each agent's subagents work on separately-named feature branches and merge internally before the global merge.
- Merge order is fixed: backend → mobile → infra. Mobile rebases against the real backend; infra rebases against everything.

## What "70%" looks like at end-of-day

| Layer | Today's start | End-of-day target |
|---|---|---|
| Backend completeness | 35% | **70%** (Postgres, real auth, real pledge, real settlement, energy adapters, roof adapter) |
| Mobile completeness | 35% | **70%** (email OTP, pledge flow, roof capture, all dead buttons wired) |
| Frontend↔backend wiring | 20% | **75%** (mobile + cockpit + website all on the real API contract) |
| Auth | 10% | **75%** (email OTP, JWT-protected endpoints, rate-limit, role scope) |
| Persistence | 5% | **70%** (Alembic, ORM repos, transactional writes, audit log) |
| Production readiness | 5% | **45%** (CI on every PR, staging deployed, Sentry on backend + frontends) |
| Shared business logic | 70% | **80%** (load profiles, geo helpers, parity with backend projector) |
| **Weighted total** | **32%** | **~70%** |

If we land 5 of 6 main subagents per top-level agent cleanly, we hit 65–70%. If we land all of them, we exceed 70%.

## Failure modes to watch

- **Contract drift mid-sprint.** Don't. If something's wrong with the contract, stop all agents, fix it, restart Phase B.
- **Subagent crosses its boundary.** Revert that subagent's out-of-bounds change before merging.
- **Backend merge breaks mobile typecheck.** Mobile rebases and adapts; never the reverse.
- **CI not yet alive when final merge happens.** Acceptable — manual smoke test gates the tag instead.
