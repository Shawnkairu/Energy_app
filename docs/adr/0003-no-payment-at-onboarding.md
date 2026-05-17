# ADR 0003 — No payment / bank / card details collected during onboarding

- **Status:** Accepted
- **Date:** 2026-05-16
- **Driver:** Project-owner directive (overrides imported-specs)
- **Constraint:** Reduces onboarding friction, reduces stored-PII surface, defers regulated financial data until point of need

## Context

Several imported-specs include payment-rail / payout-account capture in onboarding:

| Role | Spec section | What it says today |
|---|---|---|
| Building Owner | Scenario B §4 (data model) | `BuildingOwnerProfile.payout_account_id` |
| Electrician | Scenario D §3 (identity setup) | "M-Pesa payout details" at account setup |
| Provider | Scenario E §5 (verification) | "payout account" in identity setup |
| Financier | Scenario F §5 step 11 | "Payment rail setup" as a numbered onboarding step |

The original IA_SPEC reflected these as onboarding fields and BUILD_PLAN P6.4.7 was named "Payment rail setup."

**Decision: override the spec for the pilot.** No role's onboarding form, route, or backend endpoint collects bank account, M-Pesa number, card details, IBAN, PayPal, crypto address, or any other payment-rail identifier. Payment details are captured **only at the point of first action that needs them**.

## Rationale

1. **Friction.** Onboarding friction kills conversion. Asking a homeowner who's just downloaded the app to enter their M-Pesa number before they've even seen what e.mappa does is a drop-off cliff.

2. **Stored-PII surface.** Per ADR 0001, payment fields fall under `pii:view:financial` — the most sensitive class with the tightest controls. Every payment field stored requires a row in audit log, step-up auth on view, time-bounded claims. The fewer such rows, the smaller the attack surface and the simpler the compliance posture.

3. **Regulatory exposure.** Storing bank/card data triggers PCI-DSS, Kenya CBK rules, and DPA scrutiny. For roles who never end up moving money (e.g., a financier who watchlists but never invests), there's zero reason to ever have their payout details.

4. **Point-of-need is the right time.** Each role has a clear "first action that needs payment":
   - Building Owner: first host-royalty payout (after building goes live + first settlement period)
   - Electrician: first milestone payout (after first DRS/LBRS task signed off)
   - Provider: first sale payout (after first delivered inventory or first usage-linked period)
   - Financier: first investment (after first commit, before escrow funds release)
   - Resident: first token purchase post-activation (M-Pesa or equivalent — collected inline at purchase)
   - Homeowner: first net-metering credit or trading payout (only if/when those are enabled)

   At each of those moments, the user has clear intent and the system has a clear use for the data.

5. **The spec assumed mature regulated rails.** Imported-specs describe the production-ready state. The pilot can defer rails until rails are actually being used.

## Decision

### What changes vs imported-specs

1. **IA_SPEC §Doctrine Enforcement** gains a new universal rule:

   > **No payment details at onboarding.** No role's onboarding form, route, or backend endpoint shall accept bank account, M-Pesa number, card details, IBAN, PayPal, crypto address, or other payment-rail identifier. Payment details are captured only at the point of first action that needs them (see ADR 0003).

2. **IA_SPEC role sections** — onboarding step lists are amended:
   - **Building Owner Onboarding** — no `payout_account` step.
   - **Electrician Onboarding** — no `payout_account` / `M-Pesa` step.
   - **Provider Onboarding** — no `payout account` step.
   - **Financier Onboarding** — step "Payment rail setup" removed; financier completes KYC/KYB/eligibility/jurisdiction without rail. Rail collected at first commit.

3. **BUILD_PLAN** tasks:
   - **P6.4.7** (was: "Payment rail setup") — **removed from onboarding.** Replaced by P6.4.7b (point-of-need): `mobile/app/(financier)/_embedded/payment-rail-setup.tsx`, triggered at first commit before escrow release.
   - Similar point-of-need tasks added per role.

4. **Backend** endpoints:
   - `POST /financiers/{id}/payment-rail` deferred from P6 onboarding to P6.6.11 (new), invoked at first commit.
   - Same pattern for `POST /building-owner/{id}/payout-account`, `POST /electricians/{id}/payout-account`, `POST /providers/{id}/payout-account` — all become **point-of-need endpoints**, not onboarding endpoints.
   - Backend tables (`BuildingOwnerProfile.payout_account_id`, etc.) keep the column (nullable) but no onboarding flow writes it.

5. **CI gate** added (P9.1.25 new): `backend/tests/test_no_payment_at_onboarding.py` — scans every onboarding endpoint's Pydantic request model and asserts no field matches `/bank|mpesa|m_pesa|iban|card|paypal|crypto|payout/i`. Lint rule similar for onboarding form components.

6. **DONE_DEFINITION anti-pattern** added: "Any onboarding form/endpoint that captures payment-rail data → auto-reject."

### What stays

- The fields themselves remain in the data model (per spec data models).
- Point-of-need flows are still spec-compliant (Scenario F §5 step 11 still happens, just at a later moment).
- Settlement / payout / escrow logic unchanged.
- ADR 0001 PII protections apply at point-of-need just as they would at onboarding.

## Consequences

### Positive
- Lower drop-off in onboarding (no payment field is the friction killer).
- Smaller stored-PII surface — many users will never have payment data stored.
- Clearer audit story ("we only collect financial data when we need to move money").
- Regulatory posture simpler — for roles that don't transact, we never enter PCI/CBK scope for them.
- Easier sprint scope — point-of-need flows can ship in the sprint where the action lands (Financier rail in P6 still, but inside commit-flow not onboarding).

### Negative
- Adds an extra step to first-payout (BO sees "Set up payout to receive royalty" prompt before first settlement). Acceptable — they have clear intent + the money is sitting waiting.
- For financiers, "I want to invest" → "first you need to set up a rail" adds one screen. Acceptable for the same reason.
- A user could onboard fully and never set up payment, then later be confused why no money has moved. Mitigated by clear empty-state messaging in wallet screens.

### Migration
- No data to migrate (no payment fields currently captured at onboarding per the current code grep).
- Spec deviation documented here so future audits know why IA differs from imported-specs.

## Open follow-ups

- **F1:** What if a regulator mandates payment-rail-at-onboarding for some role? Re-open this ADR + amend with the new constraint.
- **F2:** Should we ever pre-fill rail from a public source (e.g., M-Pesa connected via OAuth)? Considered out of scope; revisit when rails APIs exist.

## References

- [imported-specs/scenario-b §4](../imported-specs/scenario-b-apartment-building-owner-flow.md), [scenario-d §3](../imported-specs/scenario-d-electrician-flow.md), [scenario-e §5](../imported-specs/scenario-e-suppliers-providers-flow.md), [scenario-f §5 step 11](../imported-specs/scenario-f-financier-flow.md) — original onboarding payment specs being overridden
- [ADR 0001 — PII view-claim JWT format](0001-pii-view-claims.md) (`pii:view:financial` class)
- [IA_SPEC §Doctrine Enforcement](../IA_SPEC.md) — new universal rule lands here
- [BUILD_PLAN P6.4.7 → P6.6.11 + parallel per-role point-of-need tasks](../BUILD_PLAN.md)
- [DONE_DEFINITION §CI gates — P9.1.25 new gate; anti-pattern list — payment-at-onboarding rejection](../DONE_DEFINITION.md)
