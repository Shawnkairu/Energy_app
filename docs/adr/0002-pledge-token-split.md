# ADR 0002 — Pledge vs token API split

- **Status:** Accepted (stricter variant — 2-PR migration with observation window)
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

## Decision (Accepted — 2-PR migration)

**Hard-cut destination, achieved in 2 PRs with a 24-hour parity observation window.** This is stricter than a single-PR hard-cut because it adds a safety net that catches doctrine drift before the legacy endpoint is irreversibly gone.

Three reasons for hard-cut destination:

1. **There are no production clients.** The repo is pre-MVP. Every client (mobile, website, cockpit, simulator, tests) is in this monorepo and we control the rollout. Backwards-compat costs us nothing and a clean cut prevents the bug class where a client accidentally sends a pledge as a purchase or vice-versa.

2. **The two flows have different doctrine guards.** Conflating them at the endpoint layer means the doctrine check (e.g., "is the apartment activated?") has to live inside `/prepaid/commit` as a branch. Splitting endpoints lets each one enforce its own preconditions cleanly:
   - `POST /pledges` rejects if `apartment.is_activated == true` (Scenario A §5 — pledges only pre-activation).
   - `POST /tokens/purchase` rejects if `apartment.is_activated == false` OR `capacity_status != 'cleared'` (Scenario A §5 + §6 — purchase only post-activation + capacity-cleared, enforces P9.1.5 + P9.1.6).

3. **Backend foundation P0.3.15 already splits the tables** — the migration creates `pledge` and `token_purchase` as separate tables with different invariants. Endpoints should mirror table shape.

### 2-PR Migration

**PR 1 — Land new endpoints + dual-write (P0.3.15 + P1.6.2a)**

1. Alembic migration creates `pledge` (nullable + cancellable) and `token_purchase` (NOT NULL + immutable) tables. Backfill from existing `prepaid_commit` rows by apartment activation state.
2. Implement `POST /pledges` + `POST /tokens/purchase` with spec preconditions + audit middleware + Pydantic v2 models.
3. **Keep `POST /prepaid/commit` alive** as a thin façade: receives the legacy payload, classifies by `apartment.is_activated`, and writes to BOTH the legacy `prepaid_commit` table AND the new split table. Reads still hit the legacy table.
4. Add `backend/tests/test_pledges_tokens_dual_write.py`: every `POST /prepaid/commit` write produces a matching new-table row with identical economic meaning.
5. **Observation window: 24h.** Coordinator runs `scripts/audit_pledge_token_parity.py` daily — asserts `sum(prepaid_commit) == sum(pledge) + sum(token_purchase)` for the same period, by user. Any drift = halt PR 2.

**PR 2 — Switch reads + delete legacy (P1.6.2b)**

1. Switch every read path (Resident Wallet, Cockpit Settlement Monitor, Settlement Service) to the new tables.
2. Update every client write call site to call the new endpoints directly:
   - `mobile/app/(resident)/_embedded/first-pledge.tsx` → `POST /pledges`
   - `mobile/app/(resident)/_embedded/token-purchase.tsx` (P1.2.7) → `POST /tokens/purchase`
   - `website/src/screens/stakeholders/resident/wallet.tsx` → match by intent
3. Delete the `POST /prepaid/commit` route + façade + legacy table (after final backup snapshot per D6 reversibility).
4. `backend/tests/test_prepaid_legacy.py` — assert old endpoint returns 410 Gone.
5. Audit row: migration completion logged with `actor='migration'`, `reason='adr-0002 step 2 — legacy retired'`.

### Why 2 PRs not 1

Single-PR hard-cut: if the new endpoint's doctrine check is subtly wrong, you've already deleted the old one when you find out. **You can't roll back.**

2-PR migration: the dual-write phase produces real parity data. If `sum(pledge) + sum(token_purchase) != sum(prepaid_commit)` for any user, you halt PR 2, fix the classifier, and try again. The legacy endpoint stays available as the source of truth until you've proven the new ones agree with it.

The cost is one extra PR (~150 LOC of dual-write logic that gets deleted in PR 2). For infrastructure that handles real money downstream of these tables, that observation window is cheap insurance.

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
