# ADR 0001 — PII view-claim JWT format

- **Status:** Proposed
- **Date:** 2026-05-16
- **Driver:** [BUILD_PLAN.md §P0.0.2](../BUILD_PLAN.md#p00--pre-foundation-must-land-before-p01p04)
- **Constraint:** [IA_SPEC §Universal Cockpit Rules CR-3](../IA_SPEC.md), [AI-native §4 governance](../imported-specs/ai-native-company-system-design.md)

## Context

Cockpit will render PII fields (resident phone, national ID, payout account, M-Pesa number) for ops triage. Per CR-3, these must be masked by default and unmaskable only when the admin has a "PII view" claim. Every unmask must write to the audit log; denied attempts must also write a denied-attempt row.

We need to decide three things before P0 backend foundation lands:

1. **Claim string format** — what shape does the JWT claim take?
2. **Granularity** — per-field, per-field-class, or per-resource?
3. **Enforcement points** — where in the stack does the check happen?

If we get this wrong now, every later cockpit page that renders PII has to retrofit.

## Decision

### 1. Claim string format

Use a namespaced action verb under a `scope` claim:

```json
{
  "sub": "admin-uuid",
  "role": "admin",
  "scope": [
    "pii:view:contact",
    "pii:view:identity",
    "queue:drs",
    "queue:lbrs",
    "settlement:hold"
  ],
  ...
}
```

`pii:view:<class>` is the prefix. Classes are enumerated below. Both backend middleware (Python) and the frontend `<MaskedField>` primitive (TS) read this list and check membership.

### 2. Granularity: per-field-class

Three classes, mapped from imported-spec PII surfaces:

| Class | Covers | Spec |
|---|---|---|
| `pii:view:contact` | phone, email, physical address | Scenario A §4 (resident contact), Scenario B §3 step 5 (BO contact) |
| `pii:view:identity` | national ID, passport, ID document images, beneficial-ownership docs | Scenario C §6 step 5 (HO authority), Scenario D §4 (electrician ID), Scenario F §5 (financier KYC) |
| `pii:view:financial` | M-Pesa number, payout bank account, tax PIN | Scenario B §5 (BO payout), Scenario D §22 (electrician payout), Scenario F §16 (financier rails) |

**Why per-field-class, not per-field:** per-field (e.g., `pii:view:phone`) would mean ~15 different claim strings (phone, email, address, national ID, passport, ID image, lease URI, payout account, M-Pesa, …). Onboarding new admins becomes painful and over-time we'll grant `pii:view:*` to everyone, defeating the purpose. Per-class strikes the balance: an ops triage admin gets `pii:view:contact`; an underwriter gets `pii:view:identity` + `pii:view:financial`; only legal gets all three.

**Why not per-resource (e.g., `pii:view:resident`):** the same admin who can view a resident's phone should also be able to view a building owner's phone (it's the same trust). Class-level matches actual trust boundaries.

### 3. Enforcement points

| Layer | Check | Behavior on missing claim |
|---|---|---|
| **Backend middleware** (`backend/app/middleware/pii.py`) | Validates JWT carries the required class for any endpoint that returns the field unmasked | Returns the field masked OR returns 403 if the endpoint exists only to serve unmasked data (`/admin/resident/{id}/unmask`). Always writes audit row with `actor_id`, `requested_field`, `granted=false`, `reason='no_pii_claim'`. |
| **Frontend primitive** (`cockpit/src/components/MaskedField.tsx`) | Renders `••• 5678` by default; shows full value only if the auth context says the user has the required class. Click-to-reveal triggers a backend GET to `/admin/<resource>/{id}/unmask?field=phone` which double-checks the claim and writes the audit row on success too. | UI shows masked + "Request unmask" disabled with tooltip "Requires PII view claim". |
| **Database** | No enforcement; tables store plaintext. PII never written to logs. | n/a |

**Why double enforcement (backend + frontend):** frontend hides the unmask CTA when the claim is absent (UX); backend enforces even if the frontend lies (security). Both write audit rows so we can correlate.

## Consequences

### Positive
- 3 classes is small enough to grant cleanly; large enough to model actual trust boundaries.
- Audit log captures every grant + every denial — meets AI-native §4 governance.
- Frontend + backend share the claim list shape (one source of truth in `packages/shared/src/types.ts` as `PiiClass` union).
- New PII fields slot into an existing class without a schema change.

### Negative
- A new PII field class (e.g., biometrics) requires a new claim string + admin grants — but those are rare and design-worth.
- Frontend tooltip / disabled-button UX adds ~30 LOC per masked field — acceptable.

### Migration
- No existing JWTs to migrate (claim is net-new).
- Seed an `EMAPPA_ADMIN_PII_CLAIMS` env var so dev admin emails get `pii:view:contact` automatically.

## Open follow-ups

- **F1:** A 4th class `pii:view:financial-statements` might be needed if we surface settlement statements with bank-detail-level data. Defer until we hit it.
- **F2:** Time-bounded claims (e.g., `pii:view:identity` expires after 24h, must be re-requested with reason). Defer to post-MVP; currently claims are session-lifetime.
- **F3:** Should agent backends (per AI-native §4) hold PII claims for autonomous read access? Decision: **no**. Agents propose actions but cannot unmask PII; if their analysis needs PII, they request it from an admin. Codified by giving agents zero `pii:view:*` claims.

## References

- [IA_SPEC §Universal Cockpit Rules — CR-3 PII masking](../IA_SPEC.md)
- [DONE_DEFINITION §CR-3 test target: `backend/tests/test_pii_claim.py`](../DONE_DEFINITION.md)
- [imported-specs/ai-native-company-system-design.md §4](../imported-specs/ai-native-company-system-design.md)
- [BUILD_PLAN P0.3.5 PII service](../BUILD_PLAN.md), [P0.0.2 this ADR](../BUILD_PLAN.md)
