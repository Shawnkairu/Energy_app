# Frontend Coverage Sprint — does the UI capture what the docs describe?

> **Mission.** For every screen, field, flow, decision, document, training module, and gate the [imported-specs/](../imported-specs/) describe, check whether the frontend has *any* surface for it. The deliverable is a "missing surfaces" backlog organized by spec, not by code.
>
> **Why not runtime?** Runtime audits assume the UI exists. We already know it doesn't — onboarding alone runs 5–35% spec coverage per role. Walking incomplete screens in a browser would re-discover the same gaps and burn time on bugs in code that shouldn't exist yet. Completeness first, correctness later.
>
> **Inverse audit.** [SPEC_COMPLIANCE_CHECKLIST.md](../SPEC_COMPLIANCE_CHECKLIST.md) is organized by what we *have*. This sprint is organized by what the *spec* demands. Items the spec lists that don't appear in the code at all are the most important findings — they're absent from the existing checklist by definition (no row to mark Gap on something that has no implementation file to cite).
>
> **Source of truth:** [imported-specs/](../imported-specs/README.md) — A, B, C, D, E, F + installation + ai-native. Nothing else.

---

## Two-agent split (frontend-focused)

Backend coverage is deferred to a follow-up sprint. This one is strictly about mobile + web surfaces.

| Agent | Surface | Branch | Scope |
|---|---|---|---|
| **Cursor** | **Mobile** (`mobile/app/**` + `mobile/components/**`) | `audit/mobile-coverage` | For every item in every imported spec, does the mobile app have a surface? |
| **Codex** | **Website + Cockpit** (`website/src/**` + `cockpit/src/**`) | `audit/web-coverage` | Same question for web surfaces (website portals + cockpit admin views) |
| **Claude Code** | Coordinator + integration | `audit/coverage` (merge target) | Merge findings, update SPEC_COMPLIANCE_CHECKLIST.md, produce the consolidated MISSING.md backlog |

Backend coverage is **explicitly out of scope** for this sprint. (Most backend gaps are already in §6 / §7 of the checklist; the question this sprint answers is "does the UI exist," not "does the API back it.")

---

## The coverage method (per agent, per spec doc)

For each of the 9 imported-spec docs:

1. **Extract every concrete artifact the spec demands.** Examples:
   - A screen ("Wallet shows pledged total, edit/cancel pledge, pledge history…")
   - A field ("Capture KRA PIN")
   - A flow ("Step 5: authority verification — title/lease upload")
   - A state ("Capacity-cleared / queued / waitlisted / blocked pill on Home")
   - A decision gate ("Approve / provisional / restricted / rejected")
   - A training module / acknowledgement
   - A document / signed record
   - An entity (covered in §6 of the checklist — skip in this sprint)
2. **For each artifact, search your surface for any code that captures it.**
   Use Grep / Glob to look for: matching component names, field IDs, flow routes, scenario-doc copy verbatim, scenario-doc state names.
3. **Classify the coverage:**
   - ✅ **Captured** — a surface exists that holds this artifact, even if it's a stub or doesn't post to backend. The artifact is at least *visible somewhere in the UI shape*.
   - 🟨 **Partially captured** — surface exists but is missing some sub-items the spec names (e.g. a "Wallet" tab exists but no edit/cancel pledge action).
   - ❌ **Not captured at all** — no screen, no field, no route, no component, nothing the user could ever see for this artifact.
4. **For every ❌ Not captured row, write a "needed surface" line** that says what to build (e.g. "Add `mobile/app/(resident)/queue.tsx` rendering the 7-state capacity queue with copy from scenario A §6.2").

## Per-spec coverage file (one per agent per spec)

Each agent produces one file per spec at:

```
docs/audits/frontend-coverage/{surface}/scenario-{x}.md
```

Where `{surface}` is `mobile` or `web` (Codex also produces `cockpit/scenario-?.md` if a spec describes admin-only views — none of A–F really do; the cockpit gap is mostly under ai-native + installation).

### Template

```markdown
# {Surface} coverage — Scenario {X}: {role} ({doc title})

- **Spec file:** [scenario-{x}.md](../../../imported-specs/scenario-{x}-...md)
- **Audited:** 2026-05-16 by {Cursor|Codex}
- **Surface root:** `mobile/app/({role})/**` + `mobile/components/{role}/**`

## Coverage matrix

| Spec § | Spec artifact | Surface? | Where (file:line) | Notes |
|---|---|---|---|---|
| §2.1 | ATS state per apartment (7 states: not-mapped → activated, suspended) | ❌ | — | No surface anywhere. `AtsState` enum not in shared types either. Needed: Home pill + dedicated detail screen showing the 7 states with resident action per state. |
| §3 | Building availability state machine (A0–A6) | ❌ | — | No surface. Home only shows DRS score, not A0–A6 state. Needed: Home hero that branches on the 7-state machine. |
| §4 | Resident onboarding step "Find building" (location permission + building name + unit number + invite code + manual address) | 🟨 | `mobile/app/(onboard)/resident/index.tsx` | Has invite code + building lookup; missing unit number field, location permission ask, manual address fallback. |
| §5 | Pledge capability before activation | ✅ | `mobile/app/(onboard)/resident/first-pledge.tsx` + `PledgeStep` in `_shared.tsx` | Captured. Edit/cancel before activation (§7) missing — see row below. |
| §5 | Pledge edit / cancel before activation | ❌ | — | No edit/cancel UI. Needed: pledge detail screen with edit + cancel actions. |
| §6.2 | Capacity queue status display (interested / pledged / capacity_review / capacity_cleared / queued / waitlisted / activated) | ❌ | — | No surface. Needed: status pill on resident Home + queue detail screen. |
| §7 | Load profile — Level 1 fast (KPLC spend, appliance checklist, daytime/evening, receipt photo) | ❌ | — | No screen, no field. Needed: onboarding step + Profile edit. |
| §8 | Ownership marketplace (cost / replacement / income / blended valuation) | ❌ | — | No marketplace anywhere in mobile. Needed: discoverable marketplace screen, share-purchase flow, valuation-basis disclosure. |
| §10 | Token balance hero (post-activation Home) | 🟨 | `mobile/components/resident/ResidentHomeScreen.tsx:33` | Pledge balance shown; activation-state branching missing — Home always shows pledge mode regardless of `apartment.is_activated`. |
| ... | ... | ... | ... | ... |

## Surface-level summary

- **Total spec artifacts:** N
- **Captured (✅):** N (M%)
- **Partial (🟨):** N
- **Not captured (❌):** N — **these are the priority builds**

## Needed surfaces (the "build this" list)

1. **Apartment connection / queue surface** — Home pill + detail screen rendering 7-state ATS + queue states. Captures §2.1, §3, §6.2 in one surface.
2. **Load profile capture** — onboarding step + Profile-editable section. Captures §7.
3. **Ownership marketplace** — discoverable from Wallet. Captures §8.
4. **Pledge management** — detail screen with edit/cancel. Captures §5/§7.
5. ...
```

End the file with a per-section "must-build screens" enumeration so the consolidated backlog can group by needed-surface, not by spec line.

---

## Cursor scope — Mobile coverage

Branch `audit/mobile-coverage`. Surface root: `mobile/app/**` + `mobile/components/**`.

### Specs to audit

For each, produce one coverage file at `docs/audits/frontend-coverage/mobile/scenario-{x}.md`:

1. [scenario-a-resident-ats-capacity-ownership-trading-spec.md](../imported-specs/scenario-a-resident-ats-capacity-ownership-trading-spec.md) (454 lines)
2. [scenario-b-apartment-building-owner-flow.md](../imported-specs/scenario-b-apartment-building-owner-flow.md)
3. [scenario-c-homeowner-flow-net-metering-trading.md](../imported-specs/scenario-c-homeowner-flow-net-metering-trading.md)
4. [scenario-d-electrician-flow.md](../imported-specs/scenario-d-electrician-flow.md)
5. [scenario-e-suppliers-providers-flow.md](../imported-specs/scenario-e-suppliers-providers-flow.md)
6. [scenario-f-financier-flow.md](../imported-specs/scenario-f-financier-flow.md)

(Skip installation + ai-native — those are mostly backend/ops/system-level, not user-facing mobile UI.)

### Process per spec

1. Read the spec end-to-end. List every concrete artifact (screens, fields, flows, states, gates, documents, modules).
2. Grep mobile surface root for each artifact. Use scenario-doc copy verbatim when possible (e.g. grep for "capacity-cleared", "queue position", "ATS scheduled", "loadProfile", etc.).
3. Fill the coverage matrix.
4. End each file with the "needed surfaces" list for that spec.

### Cursor's deliverables

- `docs/audits/frontend-coverage/mobile/scenario-{a,b,c,d,e,f}.md` (6 files)
- Each file ends with a numbered "must-build screens" list
- Commit log on `audit/mobile-coverage` — one commit per scenario
- **No code changes in this sprint.** Findings only.

---

## Codex scope — Website + Cockpit coverage

Branch `audit/web-coverage`. Surface roots: `website/src/**` + `cockpit/src/**`.

### Specs to audit

Same 6 scenario docs as Cursor, plus:
- [ai-native-company-system-design.md](../imported-specs/ai-native-company-system-design.md) — for cockpit-side surfaces (query layer UI, agent panels, audit log viewer, eval harness UI) only
- [installation-process-drs-lbrs-go-live.md](../imported-specs/installation-process-drs-lbrs-go-live.md) — for cockpit-side surfaces (DRS queue management, LBRS test recording, go-live approval) only

Output files:
- `docs/audits/frontend-coverage/website/scenario-{a..f}.md` (6 files — public-role portals)
- `docs/audits/frontend-coverage/cockpit/scenario-{a..f}.md` (6 files — admin views of each role's data)
- `docs/audits/frontend-coverage/cockpit/ai-native.md` (1 file)
- `docs/audits/frontend-coverage/cockpit/installation.md` (1 file)

### Process per spec

Same as Cursor's process. Two extra notes:

- **Website portals must match mobile structure** (IA-U10 promises parity). If the spec demands a screen and mobile has a stub but website doesn't even have the route, that's a ❌ on the web side even if mobile is 🟨.
- **Cockpit views are admin-only.** For each scenario doc, identify any spec items that should be visible from the admin/ops side (e.g. scenario E §11 "Verification decision workflow (approved / provisional / needs-inspection / restricted / rejected)" requires a cockpit screen for ops to make that decision — check if it exists). The ai-native and installation-process specs are mostly cockpit territory.

### Codex's deliverables

- 6 website coverage files
- 8 cockpit coverage files (6 per-role admin views + ai-native + installation)
- Commit log on `audit/web-coverage` — one commit per surface group
- Same "no code changes" rule

---

## Claude Code scope — Coordinator + integration

Branch `audit/coverage` (merge target).

### During the walk phase

Stay out of the way. Available to answer cross-cutting questions (e.g. "should this spec item belong to mobile or cockpit?"). Maintain a live status doc at `docs/audits/frontend-coverage/STATUS.md` showing which scenarios each agent has completed.

### After both agents push

1. **Merge:**
   ```bash
   git checkout main && git pull
   git checkout -b audit/coverage
   git merge --no-ff audit/mobile-coverage
   git merge --no-ff audit/web-coverage
   ```
   No source-code conflicts expected — all writes land under `docs/audits/frontend-coverage/**`.

2. **Produce the consolidated `MISSING.md` backlog:**

   File at `docs/audits/frontend-coverage/MISSING.md`. Structure:

   ```markdown
   # Missing frontend surfaces — consolidated backlog

   Sourced from the per-scenario coverage audits. Each row is one needed surface (a screen, flow, or component group). Severity is from the spec's role criticality (e.g. financier KYC = Critical, resident invite UI = Medium).

   ## By role × severity

   | Role | Severity | Needed surface | Spec source | Mobile? | Web? | Cockpit? |
   |---|---|---|---|---|---|---|
   | Resident | Critical | Unit/meter/ATS detail screen with 7-state pills | A §2.1, §3 | ❌ build | ❌ build | 🟨 partial (BuildingDetail.tsx has gates tab) |
   | Resident | High | Capacity queue status surface + detail | A §6.2 | ❌ build | ❌ build | ❌ build |
   | Resident | High | Load profile capture (onboarding + Profile-editable) | A §7 | ❌ build | ❌ build | N/A |
   | Resident | Medium | Ownership marketplace | A §8 | ❌ build | ❌ build | N/A |
   | Resident | Medium | Pledge edit/cancel detail | A §5/§7 | ❌ build | ❌ build | N/A |
   | Homeowner | Critical | Authority verification upload flow + status | C §6 step 5 | ❌ build | ❌ build | ❌ build (review queue) |
   | ... | ... | ... | ... | ... | ... | ... |

   ## By surface (build order proposal)

   Sorted by leverage — surfaces that close multiple spec items first.

   1. **Apartment connection + capacity queue + ATS state** (resident) — closes A §2.1 + §3 + §6.2 in one screen group. ~3 components.
   2. **Authority verification + upload + ops review** (homeowner + building owner) — closes C §6 step 5 + B §3 step 5 + cockpit review queue. ~4 components.
   3. **Electrician training + practice test + certification decision** (electrician + cockpit) — closes D §4 steps 8–10. ~5 components.
   4. ...

   ## Tally

   - **Total needed surfaces:** N
   - **Critical (block any real launch):** N
   - **High (block first cohort of real users):** N
   - **Medium (UX polish):** N
   ```

3. **Update SPEC_COMPLIANCE_CHECKLIST.md:**

   Add a new column **"UI surface?"** to §3 (onboarding), §4 (workspace tabs), §10 (installation/go-live). Values:
   - ✅ Captured (surface exists, even if stubbed)
   - 🟨 Partial
   - ❌ Not captured

   The existing **Status** column ("does the code do what the row claims") stays. The new column says "is there even a UI surface for this." Most ❌ Gap rows in the current checklist will probably also be ❌ in the new column — but some Partial rows might reveal as "no UI exists at all," which is a stricter finding.

   Add v3.0 changelog entry: "Frontend coverage sprint — N spec artifacts have no UI surface anywhere; MISSING.md lists the consolidated build backlog."

4. **CI green + PR open:** `audit/coverage → main`.

---

## Definition of done

| Deliverable | Owner | Done when |
|---|---|---|
| Mobile 6 scenario coverage files | Cursor | One file per scenario A–F; each file ends with a numbered must-build list |
| Web 6 scenario coverage files + cockpit 6 + ai-native + installation | Codex | 14 files; each ends with must-build list |
| Coverage map merged into SPEC_COMPLIANCE_CHECKLIST.md (new "UI surface?" column) | Claude | Every §3/§4/§10 row has a UI surface cell |
| `MISSING.md` consolidated backlog | Claude | Sorted by role × severity AND by build order; tally section accurate |
| CI green | Claude | `npm run ci` 6/6 + `pytest` 32/32 on `audit/coverage` |
| PR open | Claude | `audit/coverage → main` with v3.0 changelog entry |

---

## Timeline

```
T+0:00   Cursor + Codex pull main, branch, post "ready" signal.
T+0:15   Walk phase begins. No backend boot needed (coverage audit is static).
T+2:30   Walk phase cutoff. Each agent commits coverage files to their branch.
T+3:00   Claude merges branches into audit/coverage.
T+3:30   Claude rolls findings into SPEC_COMPLIANCE_CHECKLIST.md + writes MISSING.md.
T+4:00   CI green; PR open.
```

**~4 hours real time.** No backend or dev-server boot overhead because this is a static code audit.

---

## What this sprint will probably reveal

Honest predictions:

1. **Most scenario §11 / §16 / §24 / §27 data-model entities** have no UI surface at all (consistent with the existing §6 Gap findings in the checklist).
2. **Cockpit ops decision queues** (provider verification, electrician certification, financier eligibility) — entirely absent. Spec demands ops makes these decisions; no admin UI exists for the ops person to do so.
3. **Capacity queue + ATS state** (scenario A core mechanic) — almost no UI surface; the resident sees pledge balance and DRS but not their actual queue position.
4. **Marketplace / discovery for every ecosystem role** (resident shares, provider deals, electrician jobs, financier projects) — the spec demands Airbnb-style cards; mobile/web have at best minimal "discover" screens with stub data.
5. **Authority / identity / certification document upload** — across homeowner, building owner, electrician, provider, financier, the spec demands real document upload + review workflow. No surface exists for *any* of it. This is probably the single biggest missing-surface cluster.
6. **Training + practice test** (electrician + provider + financier) — spec demands real modules; no surface exists.

Expected output: **MISSING.md will list ~30–50 needed surfaces**, of which roughly half are Critical for any real user to transact.

---

## After this sprint

Once `MISSING.md` exists, the next sprint becomes obvious: **build the missing surfaces in priority order.** Runtime audits become useful at that point because the surfaces will exist for users to actually walk.

---

## Status

- **Drafted:** 2026-05-16 by Claude Code
- **Approved by:** _(pending — Shawn to confirm before kicking off)_
- **Predecessor:** [RUNTIME_REALITY_SPRINT.md](RUNTIME_REALITY_SPRINT.md) — superseded by this plan. Runtime audits are deferred until the surface coverage is closed.
