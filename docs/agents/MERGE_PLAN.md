# Merge Plan — Day 1 Sprint

Coordinator: Claude Code. Run by Claude Code only. Cursor and Codex push, then wait.

## Pre-flight (T+0:00)

```bash
cd /Users/shawnkairu/emappa
git fetch origin
git checkout main && git pull
git status   # must be clean
```

If working tree is dirty, stash with a labeled name. Confirm contract files exist:
- `docs/SPRINT_CONTRACT.md`
- `docs/agents/cursor-mobile.md`
- `docs/agents/claude-backend.md`
- `docs/agents/codex-infra.md`

## Phase A — Contract lock (Claude Code, alone, T+0:00 to T+0:30)

```bash
git checkout -b sprint/contract
# add types, alembic, seed per claude-backend.md Phase 0
git add -A && git commit -m "sprint: contract, shared types, alembic baseline, seed"
git push -u origin sprint/contract
git checkout main && git merge --ff-only sprint/contract && git push origin main
```

**Notify**: Cursor and Codex may now branch from `main`.

## Phase B — Parallel work (T+0:30 to T+5:30)

Each agent works on its assigned branch with its subagents. **No cross-merges allowed during this phase.**

| Agent | Branch | Pushes to |
|---|---|---|
| Cursor | `sprint/mobile` | `origin/sprint/mobile` |
| Claude Code | `sprint/backend` | `origin/sprint/backend` |
| Codex | `sprint/infra` | `origin/sprint/infra` |

Each agent's subagents merge into their parent branch internally. No subagent ever touches another top-level agent's owned paths.

## Phase C — Cutoff (T+5:30)

All agents stop new work. Final commits get pushed. Each agent confirms in chat: "sprint/<X> ready, all subagents merged."

## Phase D — Sequential merge (Claude Code, T+6:00 to T+7:00)

### D.1 — Backend merges first

```bash
git checkout main && git pull
git merge --no-ff origin/sprint/backend -m "sprint: backend persistence, auth, pledge, solar, roof, client"
npm install                    # in case packages/api-client deps changed
npm run typecheck              # must pass
cd backend && pytest           # must pass
cd ..
git push origin main
```

If typecheck or pytest fails: STOP. Roll back the merge (`git reset --hard HEAD~1`), notify the responsible subagent, fix, retry.

**Notify Cursor**: "Backend on main. Rebase sprint/mobile and push."

### D.2 — Mobile rebases and merges

Cursor runs:

```bash
git checkout sprint/mobile
git fetch origin
git rebase origin/main
# Fix any compile errors from contract drift (most common: api-client signatures)
npm run typecheck
git push --force-with-lease origin sprint/mobile
```

Cursor notifies: "sprint/mobile rebased and pushed."

Claude Code runs:

```bash
git fetch origin
git merge --no-ff origin/sprint/mobile -m "sprint: mobile email OTP, pledge, roof, button wiring"
npm run typecheck
git push origin main
```

If conflicts: this should be near-zero by design (different paths). If they happen, resolve in favor of Cursor's mobile changes (backend boundaries don't overlap).

**Notify Codex**: "Mobile on main. Rebase sprint/infra and push."

### D.3 — Infra rebases and merges

Codex runs:

```bash
git checkout sprint/infra
git fetch origin
git rebase origin/main
npm run typecheck
git push --force-with-lease origin sprint/infra
```

Codex notifies: "sprint/infra rebased and pushed."

Claude Code runs:

```bash
git fetch origin
git merge --no-ff origin/sprint/infra -m "sprint: cockpit, website, CI, deploy"
npm run typecheck && npm run build
git push origin main
```

## Phase E — Smoke test (T+7:00 to T+7:30)

Run locally before tagging:

```bash
docker-compose up -d            # postgres + backend
sleep 10 && curl http://localhost:8010/health    # expect 200

# Backend smoke
curl -X POST http://localhost:8010/auth/request-otp \
  -H 'Content-Type: application/json' \
  -d '{"email":"resident@emappa.test"}'
# Look for OTP in `docker compose logs backend`
TOKEN=$(curl -X POST http://localhost:8010/auth/verify-otp \
  -H 'Content-Type: application/json' \
  -d '{"email":"resident@emappa.test","code":"<paste>"}' | jq -r .token)

curl http://localhost:8010/projects -H "Authorization: Bearer $TOKEN"

# Frontend smoke
npm run dev:cockpit  # in another terminal
npm run dev:website  # in another terminal
npm run dev:mobile   # if you have a simulator handy
```

Walk the resident flow end-to-end:
1. Email → code → home
2. Tap "Pledge solar" → 1000 → submit
3. Pledged balance updates
4. Cockpit (admin@emappa.test) → building shows new pledge

If any of these fail: hotfix on main, push, redo smoke. Do not proceed to deploy until smoke passes.

## Phase F — Tag and deploy (T+7:30 to T+8:00)

```bash
git tag v0.1-pilot
git push origin v0.1-pilot
```

Codex's `deploy-staging.yml` workflow takes over. Watch it run; if it fails, debug from the workflow logs.

Final URLs to share:
- Backend: `https://api-staging.emappa.app/health` (or whatever Codex configured)
- Cockpit: Vercel preview URL
- Website: Vercel preview URL
- Mobile: Expo Go QR code from `npm run start:mobile -- --tunnel`

## Conflict resolution playbook

By design, each top-level agent owns disjoint paths. If `git merge` reports conflicts, one of these happened:

1. **Subagent edited outside its slice.** Find the offending file, revert that subagent's change, re-merge.
2. **Cursor or Codex edited a frozen file** (`packages/shared/src/types.ts`, `packages/api-client/src/index.ts`, anything in `backend/`). Revert their edit; that change should have been requested via contract update.
3. **Contract drift** (e.g. backend changed an endpoint shape). Backend wins; mobile or infra must rebase and adapt.

Never resolve a conflict by averaging — pick one side based on ownership.

## Rollback plan

If end-of-day stack is broken:

```bash
git checkout main
git revert -m 1 <merge-commit-of-failing-slice>
git push origin main
```

You can revert sprint/infra without losing sprint/mobile or sprint/backend, etc. — the merges are non-fast-forward by design so each is a single revertable commit.
