# Runtime-Reality Sprint — ground the codebase

> ⚠️ **SUPERSEDED.** This sprint assumed the UI surfaces existed and only their runtime behavior needed verification. Decision (2026-05-16): completeness first, correctness later. Runtime audits are deferred until the missing surfaces identified by [COVERAGE_SPRINT.md](COVERAGE_SPRINT.md) are built. This doc is kept as a reference for the eventual runtime pass after the build sprint lands.

> **Mission.** Walk every screen of every role in the **real, running app** — backend up, dev servers up, real browser. Capture evidence (screenshots, console errors, network failures, UX gaps). Update [SPEC_COMPLIANCE_CHECKLIST.md](../SPEC_COMPLIANCE_CHECKLIST.md) to reflect what users actually experience. File concrete fixes.
>
> **Why this sprint exists.** The current checklist has 40 ✅ Pass rows verified at the **source-code level** ("the component file exists and references the spec items"). An informal estimate is that **only 5–10 of those would survive a real user touching them.** Source-walking misses: silent fallback to fake sessions, duplicate-key React errors, blank renders from data-shape mismatches, "all tabs look identical" shell drowning, components that render but with stub data. This sprint closes that gap.
>
> **Source of truth:** [imported-specs/](../imported-specs/README.md). Any drift between what the app does and what the imported specs describe is a bug to file, not a Pass to claim.

---

## Three-agent split

Single-agent runtime walks blow context budgets (~50–80 screens × screenshots × console logs). Parallelizing by surface keeps each agent inside a focused mandate.

| Agent | Surface | Branch | Scope |
|---|---|---|---|
| **Cursor** | **Mobile** (Expo web preview + iOS simulator if available) | `audit/mobile-runtime` | Every `mobile/app/(role)/<tab>.tsx` for all 6 public roles + admin, plus all `mobile/app/(onboard)/<role>/*.tsx` flows |
| **Codex** | **Website + Cockpit** (Vite dev servers) | `audit/web-runtime` | Every `website/src/screens/stakeholders/<role>/<tab>.tsx` for all 6 public roles + `website/src/onboard/*` flows + every cockpit dashboard tab |
| **Claude Code** | **Backend + shared + integration** | `audit/backend-runtime` (+ merge into `audit/runtime-reality`) | Verify backend serves what frontends consume; run all `npm run ci` + `pytest`; drive the merge of all three audits into [SPEC_COMPLIANCE_CHECKLIST.md](../SPEC_COMPLIANCE_CHECKLIST.md); file the consolidated fix backlog |

**Why this split:** mobile vs web are different runtimes (React Native via Expo vs Vite React DOM) with different bug classes. Backend correctness is its own dimension. No agent's findings depend on another's during the walk phase; integration happens at merge.

---

## Setup (each agent runs this first)

All three agents work in the **same worktree** but on **separate branches**. No agent pushes during the walk phase.

```bash
cd /Users/shawnkairu/emappa
git fetch origin
git checkout main && git pull
git status                                   # must be clean
git checkout -b audit/<mobile|web|backend>-runtime
```

### Shared backend (only Claude Code starts this — once)

```bash
# Backend on :8765 (separate port so it doesn't collide with anyone's local dev)
cd backend
source /Users/shawnkairu/emappa/backend/.env   # EMAPPA_DATABASE_URL, EMAPPA_JWT_SECRET, EMAPPA_ALLOW_DEV_OTP_CONSOLE=true
/Users/shawnkairu/emappa/.venv-backend312/bin/uvicorn app.main:app --host 127.0.0.1 --port 8765 --log-level warning &

# Reset DB to known state
psql -h localhost -U emappa -d emappa -c "DELETE FROM users WHERE email LIKE 'audit-%';"
.venv-backend312/bin/python -m alembic downgrade base
.venv-backend312/bin/python -m alembic upgrade head
EMAPPA_DEV_SEED=true .venv-backend312/bin/python -m scripts.seed
```

The seed provides:
- 3 buildings (`Nyeri Ridge A` = `NYERI1`, `Karatina Court` = `KARAT1`, `Kahawa Sukari Home` = `KAHAW1`)
- 11 users covering every role
- 6480 synthetic energy readings

Notify in shared channel when backend is live. Other agents may begin once backend health-checks 200 at `http://127.0.0.1:8765/health`.

### Frontend env (Cursor + Codex)

Each frontend needs an env file pointing at the audit backend:

```bash
# website + cockpit (Vite)
echo "VITE_API_BASE_URL=http://127.0.0.1:8765" > website/.env.local
echo "VITE_API_BASE_URL=http://127.0.0.1:8765" > cockpit/.env.local

# mobile (Expo)
echo "EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8765" > mobile/.env
```

---

## The walk protocol

Every screen gets the same treatment. For each screen, the agent:

1. **Boots a fresh session** for the role's audit user (e.g. `audit-mobile-resident@emappa.test`) via real OTP `000000` against `/auth/request-otp` + `/auth/verify-otp`.
2. **Navigates** to the target tab/screen.
3. **Captures evidence** (see schema below).
4. **Compares rendered content to the scenario doc** for that role × tab. The scenario doc is the *only* truth; the existing component description in SPEC_COMPLIANCE_CHECKLIST.md is **not** acceptable as a fallback.
5. **Records a runtime verdict** in the screen-audit file.

Per screen, target ≤ 5 tool calls (navigate → snapshot → console_logs → network failed → screenshot). Anything more is a sign the screen is broken — file it and move on.

### Evidence schema

Each screen produces one file at:

```
docs/audits/runtime-reality/{surface}/{role}/{tab}.md
```

For example: `docs/audits/runtime-reality/mobile/homeowner/energy.md`.

File contents (template):

```markdown
# {Surface} · {Role} · {Tab}

- **URL:** http://127.0.0.1:8088/...
- **Spec:** [scenario-X §N](../../../imported-specs/scenario-X-...md#N)
- **Session:** audit-{surface}-{role}@emappa.test (logged in via real OTP)
- **Walked:** 2026-05-16 14:32 UTC by {Cursor|Codex|Claude}

## Runtime verdict

**Status:** ✅ Works / 🟨 Renders but broken / ❌ Crashes or empty

## Items rendered (vs scenario doc)

| Spec item | Status | Evidence |
|---|---|---|
| Building name + status | ✅ Visible | "Nyeri Ridge A · FUNDED" in screenshot |
| Pledge balance KES | ✅ Visible | "KSh 83" |
| Queue position | ❌ Missing | Not rendered anywhere on screen |
| ATS state | 🟨 Broken | Element present but data is `undefined` — see screenshot |
| ... | ... | ... |

## Console errors

- **0** errors / **N** errors with samples:
  ```
  [error] Encountered two children with the same key, `5/15/2026`. ...
  ```

## Network failures

- **0** failed requests / **N** failed:
  - `GET http://127.0.0.1:8765/energy/{id}/today` → 400 Bad Request
  - ...

## Screenshots

- `screenshots/{surface}/{role}-{tab}-full.png` (full screen)
- `screenshots/{surface}/{role}-{tab}-interaction-{N}.png` (key states)

## Concrete fixes filed

- [ ] **{role}-{tab}-bug-1** — Queue position never rendered. Source: `mobile/components/resident/ResidentHomeScreen.tsx:87`. Fix: pull `queue.position` from `api.getCapacityQueue(buildingId)` (endpoint does not yet exist — also file backend ticket).
- [ ] **{role}-{tab}-bug-2** — ...

## Status delta for SPEC_COMPLIANCE_CHECKLIST

Row(s) to update:
- §4.X "{Tab}" row: **source-verified Pass** → **runtime: 🟨 Renders but broken (2 of 7 visible items render with real data; 4 items missing, 1 displays `undefined`)**
```

### Screenshot conventions

- Save to `docs/audits/runtime-reality/screenshots/{surface}/` as PNG.
- Filename: `{role}-{tab}.png` (full screen), `{role}-{tab}-{state}.png` for interaction states.
- Mobile (Expo web): screenshot at viewport `390 × 844` (iPhone 13 size — closest to real handset).
- Website: viewport `1440 × 900`.
- Cockpit: viewport `1440 × 900`.

---

## Cursor scope — Mobile runtime walk

Branch `audit/mobile-runtime`. Surface: `mobile/` via Expo web preview on `:8088`.

### Boot Expo web

```bash
cd mobile
npx expo start --web --port 8088
```

Wait for `Logs for your project will appear below.` and `Web is waiting on http://localhost:8088`.

Use the Preview MCP tool (`preview_start` with `mobile-web` entry in `.claude/launch.json`) to drive the browser. The harness was set up earlier in `.claude/launch.json`:

```json
{
  "name": "mobile-web",
  "runtimeExecutable": "npx",
  "runtimeArgs": ["expo", "start", "--web", "--port", "8088"],
  "cwd": "mobile",
  "port": 8088
}
```

### Skip onboarding — log in directly as seeded users

The §3 audit already documented the onboarding gaps (Resident 25% → Financier 5% spec coverage). Re-walking onboarding flows in runtime would re-discover the same gaps. **Use the dev OTP shortcut** to log in directly as each seeded user and jump straight to their workspace:

```
audit-mobile-resident      → use seeded resident-a@emappa.test
audit-mobile-homeowner     → use seeded homeowner@emappa.test
audit-mobile-building      → use seeded building-owner@emappa.test
audit-mobile-provider      → use seeded provider-panels@emappa.test
audit-mobile-electrician   → use seeded electrician@emappa.test
audit-mobile-financier     → use seeded financier@emappa.test
```

All seeded users accept OTP `000000` (dev console mode is on per `EMAPPA_ALLOW_DEV_OTP_CONSOLE=true`). They land with `onboarding_complete=true`, the right role, and a populated workspace.

**The single onboarding fact to capture per role at runtime:** does the screen at `/(onboard)/{role}/...` even render without crashing? If yes, mark "renders" in a single line of the role's workspace audit (e.g. "onboarding entry renders; field-level gaps tracked in §3.X — not re-walked"). If no, file a crash bug. That's the entire onboarding budget — 1 line per role, not a full flow walk.

### Workspace tabs to walk (per role)

After logging in as the seeded user, walk every tab:

| Role | Tabs | Notes |
|---|---|---|
| Resident | home, energy, wallet, profile | Walk in registry order |
| Homeowner | home, energy, wallet, profile | |
| Building owner | home, energy, wallet, profile | |
| Provider | discover, projects, generation, wallet, profile | 5 tabs |
| Electrician | discover, jobs, wallet, profile | Note legacy `Installer*` naming |
| Financier | discover, portfolio, generation, wallet, profile | 5 tabs |
| Admin (read-only on mobile) | alerts, projects, profile | 3 tabs |

For each tab: real navigation (click the tab — don't bypass with `location.href`), then evidence capture.

**Total mobile walk:** 6 onboarding flows + 28 workspace tabs = **34 screen audit files.**

### Cursor's deliverables

- `docs/audits/runtime-reality/mobile/{role}/{tab}.md` (28 files — 7 roles × ~4 tabs)
- `docs/audits/runtime-reality/screenshots/mobile/*.png` (~28 full-screen, more for interaction states)
- Commit log on `audit/mobile-runtime` — one commit per role.
- **No onboarding flow walks.** Field-level gaps already in §3 of the checklist. Capture only "does the onboarding entry render without crashing" as a single line.
- **No code changes in this sprint.** Bugs are filed, not fixed. (Fix sprint is a separate phase.)

---

## Codex scope — Website + Cockpit runtime walk

Branch `audit/web-runtime`. Surfaces: `website/` on `:5173`, `cockpit/` on `:5174`.

### Boot dev servers

```bash
# Website (Vite)
npm run dev --workspace @emappa/website
# (separate terminal) Cockpit
npm run dev --workspace @emappa/cockpit
```

Use Preview MCP with the `website` and `cockpit` entries already in `.claude/launch.json`.

### Skip onboarding — log in directly as seeded users

Same logic as the mobile scope: §3 audit already captured the field-level gaps; runtime walks would re-discover them. Log in as the seeded `{role}@emappa.test` accounts with OTP `000000` and walk straight to the workspace.

Per role, capture only "does the onboarding entry render without crashing" as a single line in that role's workspace audit. If the entry crashes, file a bug. Otherwise, skip the flow.

### Website workspace tabs

Every `website/src/screens/stakeholders/{role}/{tab}.tsx`. Same 28 tabs as mobile. Verify visual parity (IA-U10) is real — not just "files exist with matching names."

### Cockpit dashboard tabs

Cockpit has no public roles. Walk the admin-only views:

- Command (default)
- DRS Queue
- Settlement
- Counterparties
- Alerts
- Stress Test
- Each building's drill-down: `BuildingDetail.tsx` with tabs `overview`, `energy`, `pledges`, `drs`, `lbrs`, `ops`, `settlement`, `roof`

Boot a real session as `admin@emappa.test`, OTP `000000`.

### Codex's deliverables

- `docs/audits/runtime-reality/website/{role}/{tab}.md` (28 files — 6 public roles × ~4-5 tabs)
- `docs/audits/runtime-reality/cockpit/{view}.md` (~14 files)
- `docs/audits/runtime-reality/screenshots/website/*.png` and `screenshots/cockpit/*.png`
- Commit log on `audit/web-runtime` — one commit per surface.
- **No onboarding flow walks.** Single-line "renders or crashes" per role.
- **Bonus deliverable: visual parity report.** For each role's 4-5 tabs, produce a side-by-side comparison of mobile vs website screenshots. IA-U10 in the checklist claims they're at parity. Confirm or refute.

---

## Claude Code scope — Backend + integration

Branch `audit/backend-runtime`. Also coordinator.

### Backend runtime checks

While Cursor and Codex walk frontends, Claude runs:

1. **CI from cold:** `rm -rf node_modules .turbo dist && npm install && npm run ci && cd backend && pytest tests -q`. Must be green before anyone trusts the audit findings.
2. **API contract spot-checks via curl:** for each endpoint cited in SPEC_COMPLIANCE_CHECKLIST §7, hit it with realistic payloads and verify response shape matches scenario-doc claims. File one audit file per endpoint: `docs/audits/runtime-reality/backend/{endpoint}.md`.
3. **Doctrine enforcement runtime checks:**
   - Pledge-before-activation: try `POST /prepaid/buy-tokens` on a non-activated apartment, expect 4xx
   - Admin role rejection: try `POST /me/onboarding-complete` with `role=admin`, expect 403
   - Settlement E_sold invariant: run `POST /settlement/run` and verify revenue == `E_sold * priceKwh` (not `E_gen * priceKwh`)
   - Resident isolation: log in as resident-a, try to GET resident-c's wallet, expect 403/404
   - JWT scope: try `GET /cockpit/...` as non-admin, expect 403
4. **Seed integrity:** confirm seed produces invite codes, real building data, correct doctrine state (homeowner has `is_host=false`, etc.).

Output: `docs/audits/runtime-reality/backend/{topic}.md` files (~10).

### Coordinator duties

After Cursor and Codex push:

1. **Pull all three audit branches into `audit/runtime-reality`:**
   ```bash
   git checkout main && git pull
   git checkout -b audit/runtime-reality
   git merge --no-ff audit/backend-runtime
   git merge --no-ff audit/mobile-runtime
   git merge --no-ff audit/web-runtime
   ```
   No source-code conflicts expected — agents only write to `docs/audits/runtime-reality/**`. If conflicts surface in shared files, something went wrong.
2. **Roll findings into [SPEC_COMPLIANCE_CHECKLIST.md](../SPEC_COMPLIANCE_CHECKLIST.md):**
   - Add a new column **"Runtime status"** to every §4 row (and other rows where runtime evidence exists).
   - Status values: ✅ Works / 🟨 Renders but broken / ❌ Crashes or empty / ❓ Not walked.
   - Each runtime status cell links to the per-screen audit file.
   - Tally the real runtime Pass count. Add a v3.0 changelog entry: "Runtime-reality pass — N rows survive a real user."
3. **File the consolidated fix backlog:**
   - `docs/audits/runtime-reality/BACKLOG.md` — every fix flagged in every audit file, deduped, severity-tagged, file:line citations, owner suggestion.
4. **Run final CI.** If green, open PR `audit/runtime-reality → main` with a summary.

---

## Definition of done

| Deliverable | Owner | Done when |
|---|---|---|
| Mobile 28 workspace tabs walked | Cursor | 28 audit files exist, each ≤ 80 lines, each has a screenshot or explicit "blank screen" evidence |
| Website 28 tabs + cockpit ~14 views walked | Codex | 42 audit files exist |
| Backend doctrine + API runtime checks | Claude | ~10 backend audit files exist, all 5 doctrine assertions tested |
| Runtime column added to checklist | Claude | Every §4 row has a runtime status cell with link to audit file |
| BACKLOG.md filed | Claude | Every "Concrete fixes filed" item from every audit, dedupe'd, sorted by severity |
| CI still green | Claude | `npm run ci` 6/6 + `pytest` 32/32 on the integration branch |
| PR open | Claude | `audit/runtime-reality → main` with v3.0 changelog entry |

**A "runtime ✅ Works" verdict requires:**
- 0 console errors
- 0 failed network requests for the spec items the screen claims to render
- Every spec item from the scenario doc visible on screen with real data (not `undefined`, not empty state, not stub copy)
- Screenshot shows it

Anything less is 🟨 or ❌.

---

## Timeline

This is a verification sprint, not a build sprint. Tighter than the original 8-hour build.

```
T+0:00   Claude boots backend, reseeds DB, posts "backend live" signal.
T+0:15   Cursor + Codex pull main, branch, boot their dev servers, post "ready" signal.
T+0:30   Walk phase begins. All three agents work in parallel.
T+2:30   Walk phase cutoff. Each agent commits their audit files to their branch.
T+3:00   Claude merges all three branches into audit/runtime-reality.
T+3:15   Claude rolls findings into SPEC_COMPLIANCE_CHECKLIST.md + writes BACKLOG.md.
T+3:30   CI green; PR open.
```

**~3.5 hours real time** if everyone hits their walk cadence (~6 minutes per screen including evidence capture). Cut from the original 5-hour estimate because the 12 onboarding flow walks were dropped — §3 already documented their gaps; runtime walks would re-discover the same misses.

---

## What this sprint will probably reveal

Honest predictions based on the runtime walk evidence already on hand from earlier in this session:

1. **Most workspace screens render only the shell + some KPI cards.** The "items missing" tally will be 5–10 items per screen on average across §4.
2. **Several screens will throw runtime errors** (duplicate keys, undefined access, network 400s from data-shape mismatches) and still appear to "render."
3. **Discover screens for Provider/Electrician/Financier will all be near-empty** — no real Airbnb-style marketplace card grid as the specs demand. Likely ❌ Crashes or empty.
4. **Onboarding flows for Provider/Electrician/Financier** will work mechanically (form submits, role saved) but show no actual data when the user lands at their workspace, because the seeded data doesn't include orders/jobs/positions for fresh audit users.
5. **Cockpit will reveal more data wiring than the public roles** because that's where the team's been working most recently.
6. **Honest Pass count after this sprint:** somewhere in the single digits to low teens. Down from 40 source-verified to maybe 5–10 runtime-verified.

That's the point of this sprint. The current checklist is too forgiving. After this, it tells the truth.

---

## Failure modes to watch

- **Agent loses focus and starts fixing bugs.** Do not fix during the walk phase — file them. Fix sprint is separate.
- **Backend port collision.** Always `:8765` for this sprint. Confirm nothing else is on the port before booting.
- **Stale localStorage / IndexedDB carrying old sessions across walks.** Every role transition: `localStorage.clear()` before the next session.
- **Screenshot of "loading spinner" mistaken for a real render.** Wait for network idle before capturing; if still spinning after 5 s, that's a 🟨 or ❌.
- **Agent walks a non-existent route and reports it as broken.** Cross-check the route against the registry in `packages/shared/src/stakeholderSections.ts`.
- **Agent claims "Pass" because the screen rendered.** A Pass requires every scenario-doc item visible with real data, not just "screen loaded."

---

## Status

- **Drafted:** 2026-05-16 by Claude Code
- **Approved by:** _(pending — Shawn to confirm before kicking off)_
- **Agents start when:** Shawn signals; Claude posts "backend live" first, then Cursor + Codex begin in parallel.
