# ADR 0002 — Pledge vs token API split

- **Status:** Proposed
- **Date:** 2026-05-16
- **Driver:** [BUILD_PLAN.md §P0.0.5](../BUILD_PLAN.md#p00--pre-foundation-must-land-before-p01p04), §P1.6.2
- **Constraint:** [Scenario A §5](../imported-specs/scenario-a-resident-ats-capacity-ownership-trading-spec.md), [IA_SPEC §Doctrine Enforcement](../IA_SPEC.md)

## Context

Current backend has `POST /prepaid/commit` that conflates two semantically different actions:

1. **Pledge** — non-binding, pre-activation, *no money moves*. Resident says "I want X kWh worth of solar when the building goes live." Editable/cancellable until activation.
2. **Token purchase** — real money, post-activation only, immutable. Resident buys kWh-denominated tokens from a live system.

Scenario A §5 product law is unambiguous: these are different flows with different rules, different UI surfaces, and different doctrine guards (e.g., "buy tokens" CTA is forbidden pre-activation per P9.1.6 CI gate; pledges are forbidden post-activation per the same §5 rule).

We need to decide whether to:
- **Option A: Hard-cut** — delete `/prepaid/commit`, ship `POST /pledges` + `POST /tokens/purchase` cleanly.
- **Option B: Dual-write** — keep `/prepaid/commit` as a façade that routes to one or the other based on building activation state. Deprecate over a sprint.
- **Option C: In-place rename** — keep one endpoint but require an explicit `kind: 'pledge' | 'token_purchase'` discriminator. Deprecate later.

## Decision

**Option A: Hard-cut.**

Three reasons:

1. **There are no production clients.** The repo is pre-MVP. Every client (mobile, website, cockpit, simulator, tests) is in this monorepo and we control the rollout. Backwards-compat costs us nothing and a clean cut prevents the bug class where a client accidentally sends a pledge as a purchase or vice-versa.

2. **The two flows have different doctrine guards.** Conflating them at the endpoint layer means the doctrine check (e.g., "is the apartment activated?") has to live inside `/prepaid/commit` as a branch. Splitting endpoints lets each one enforce its own preconditions cleanly:
   - `POST /pledges` rejects if `apartment.is_activated == true` (Scenario A §5 — pledges only pre-activation).
   - `POST /tokens/purchase` rejects if `apartment.is_activated == false` OR `capacity_status != 'cleared'` (Scenario A §5 + §6 — purchase only post-activation + capacity-cleared, enforces P9.1.5 + P9.1.6).

3. **Backend foundation P0.3.15 already splits the tables** — the migration creates `pledge` and `token_purchase` as separate tables with different invariants (pledge.kes is `nullable=true` and `cancellable=true`; token_purchase.kes is `nullable=false` and immutable). Endpoints should mirror table shape.

### Migration steps

1. **P0.3.15** (Claude backend, Sat morning): Alembic migration creates `pledge` and `token_purchase` tables. Backfill from current `prepaid_commit` rows: if `apartment.is_activated == false` → `pledge`; if `true` → `token_purchase`.

2. **P1.6.2** (Claude backend, Sat afternoon): Implement `POST /pledges` and `POST /tokens/purchase` with the spec-mandated preconditions + audit middleware (CR-2) + Pydantic v2 request/response models. Each writes to its respective table.

3. **Same PR:** Delete the `POST /prepaid/commit` route + handler. Search-and-replace every client call site:
   - `mobile/app/(resident)/_embedded/first-pledge.tsx` → `POST /pledges`
   - `mobile/app/(resident)/_embedded/token-purchase.tsx` (P1.2.7) → `POST /tokens/purchase`
   - `website/src/screens/stakeholders/resident/wallet.tsx` → match by intent
   - `cockpit/src/pages/SettlementMonitor.tsx` (P7.2.3) → read-side only, no client call to update

4. **Tests:**
   - `backend/tests/test_pledges.py` — happy + sad (cannot pledge post-activation)
   - `backend/tests/test_tokens.py` — happy + sad (cannot purchase pre-activation, cannot purchase without capacity_cleared per P9.1.5)
   - `backend/tests/test_prepaid_legacy.py` — assert old endpoint returns 410 Gone (or just doesn't exist)

5. **Audit:** the migration backfill writes a single audit row per converted row with `actor='migration'`, `reason='adr-0002 split'`.

## Consequences

### Positive
- Endpoint preconditions match doctrine 1:1. No "is this a pledge or a purchase" branch hiding in the handler.
- Settlement code can assume `token_purchase` rows are immutable + monetized; downstream invariants (P9.1.4 solvency, P9.1.3 monetized-only) are simpler to assert.
- Audit log clearly distinguishes "user pledged" from "user paid" — important for regulatory readability per Scenario F §3.
- No deprecation window means no "old clients still call the old endpoint" risk during the weekend sprint.

### Negative
- Any out-of-tree consumer of `/prepaid/commit` (none known) breaks immediately. **Acceptable risk** because pre-MVP.
- Mobile + web client search-and-replace required in the same PR as the backend split — coordinated commit, but only ~6 call sites total.

### Migration safety
- Alembic downgrade restores `prepaid_commit` table from `pledge` + `token_purchase` snapshots (per DONE_DEFINITION D6 reversibility).
- If the migration fails mid-flight, the upgrade is transactional (single DDL transaction); no half-migrated state.

## Alternatives rejected

- **Option B (dual-write façade):** would leave `/prepaid/commit` alive for a sprint with a feature flag. Rejected because there are no clients to protect and the façade adds a code path that has to be tested + audited + eventually deleted anyway. Net more work.

- **Option C (in-place rename with discriminator):** would keep one endpoint, add `kind` field, validate. Rejected because it still couples the two flows at the API layer — the discriminator-branch hides the doctrine check and a typo in `kind` could send a pledge as a purchase. Cleaner to enforce at the route boundary.

## Open follow-ups

- **F1:** Should `POST /pledges` support batch (resident pledges multiple kWh allocations across multiple buildings if multi-property)? Defer — current spec only has single-building residents, but the table allows it.
- **F2:** Refund flow for cancelled pledges — should there be a `DELETE /pledges/{id}` endpoint? Per Scenario A §5, pre-activation pledges are cancellable; needs a P1 task. Add as P1.6.7: `DELETE /pledges/{id}` (pre-activation cancellation).

## References

- [Scenario A §5 — Pledge, Buy, and Capacity Queue Rules](../imported-specs/scenario-a-resident-ats-capacity-ownership-trading-spec.md)
- [BUILD_PLAN P0.0.5 this ADR, P0.3.15 table split, P1.6.2 endpoint split](../BUILD_PLAN.md)
- [DONE_DEFINITION §CI gates P9.1.5–P9.1.6 (capacity-cleared, buy-tokens pre-activation)](../DONE_DEFINITION.md)
- [IA_SPEC §Doctrine Enforcement — prepaid-only](../IA_SPEC.md)
