# ADR 0001 — PII view-claim JWT format

- **Status:** Accepted (stricter variant)
- **Date:** 2026-05-16
- **Driver:** [BUILD_PLAN.md §P0.0.2](../BUILD_PLAN.md#p00--pre-foundation-must-land-before-p01p04)
- **Constraint:** [IA_SPEC §Universal Cockpit Rules CR-3](../IA_SPEC.md), [AI-native §4 governance](../imported-specs/ai-native-company-system-design.md), Kenya Data Protection Act (regulated-PII context)

## Context

Cockpit will render PII fields (resident phone, national ID, payout account, M-Pesa number) for ops triage. Per CR-3, these must be masked by default and unmaskable only when the admin has a "PII view" claim. Every unmask must write to the audit log; denied attempts must also write a denied-attempt row.

Stakeholder context shifts the bar: financiers will audit "show me every admin who viewed resident X's national ID in the last 90 days" and regulators (Kenya DPA, GDPR-like) expect granular, time-bounded, justifiable access. Build the stricter variant once instead of paying to retrofit after the first audit request.

We need to decide:

1. **Claim string format** — what shape does the JWT claim take?
2. **Granularity** — per-field, per-field-class, or per-resource?
3. **Enforcement points** — where in the stack does the check happen?
4. **Lifetime** — session-long or time-bounded?
5. **Step-up** — does high-sensitivity access require fresh authentication?
6. **Grant audit** — is "granting the claim" itself an auditable event?

If we get this wrong now, every later cockpit page that renders PII has to retrofit.

## Decision (Accepted — stricter variant)

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
| **Backend middleware** (`backend/app/middleware/pii.py`) | Validates JWT carries the required class AND `claim_expires_at > now()` AND `step_up_verified_at > now() - 5min` for `financial` class | Returns the field masked OR returns 403 if the endpoint exists only to serve unmasked data. Always writes audit row with `actor_id`, `requested_field`, `granted=false`, `reason='no_pii_claim'` or `'claim_expired'` or `'step_up_required'`. |
| **Frontend primitive** (`cockpit/src/components/MaskedField.tsx`) | Renders `••• 5678` by default; shows full value only if claim present + not expired. Click-to-reveal triggers backend GET to `/admin/<resource>/{id}/unmask?field=phone` which double-checks and writes audit row on success. For `financial` class, click triggers step-up modal first. | UI shows masked + "Request unmask" disabled with tooltip "Requires PII view claim" or "Re-authenticate to view financial PII". |
| **Database** | No enforcement; tables store plaintext. PII never written to logs / Sentry / agent transcripts. | n/a |

**Why double enforcement (backend + frontend):** frontend hides the unmask CTA when the claim is absent (UX); backend enforces even if the frontend lies (security). Both write audit rows so we can correlate.

### 4. Lifetime — time-bounded with reason re-prompt

| Class | TTL | Renewal |
|---|---|---|
| `pii:view:contact` | 8 hours | Re-grant via RBAC console with one-line reason. |
| `pii:view:identity` | 4 hours | Re-grant requires reason + incident_id (free-text "INC-…" or "n/a — routine review"). |
| `pii:view:financial` | 1 hour | Re-grant requires reason + incident_id + supervising-admin co-sign (`admin:approve_pii:financial`). |

**Why time-bounded:** the moment you grant `pii:view:identity` for a session, that admin could open a tab a week later and still unmask. Bounding it to hours forces every prolonged access to generate the question "why are you still looking at this?" — exactly the question auditors ask.

**Why reason-on-grant:** the grant event itself writes to `audit_log` with `{actor, class, reason, incident_id, granted_by, expires_at}`. Daily reviews of grant patterns surface anomalies ("Jane grants herself `pii:view:identity` every morning with no incident").

### 5. Step-up auth for `pii:view:financial`

The `financial` class (payout account, M-Pesa, tax PIN) requires a fresh re-authentication challenge (password + MFA) **at the moment of each unmask**, even if the admin has the claim. The fresh-auth window is 5 minutes — after that, the next unmask in that class requires re-auth.

Implementation: `cockpit/src/components/StepUpModal.tsx` intercepts the unmask request, calls `POST /auth/step-up`, sets a short-lived (`step_up_token`, 5min) header on subsequent unmask calls. Backend `pii.py` middleware checks both the claim and the step-up header.

**Why:** mirrors how banks treat sensitive account access. Compromised JWT alone cannot exfiltrate financial PII; attacker would also need the admin's password + MFA in the same 5-minute window.

### 6. Agent backends have zero PII claims

Per the closed-loop economic engine (AI-native §3.4), agents may propose actions but never autonomously read PII. If an agent's analysis needs PII context, it surfaces the request to an admin who decides whether to grant for that one operation. Codified: agents are issued JWTs with `scope: []` for any `pii:view:*` — backend rejects + writes audit row even if the agent tries.

## Consequences

### Positive
- 3 classes is small enough to grant cleanly; large enough to model actual trust boundaries.
- Audit log captures every grant + every denial + every unmask attempt — defensible to a regulator.
- Time-bounded claims force admins to re-justify prolonged access — natural anomaly detection.
- Step-up auth on `financial` defeats stolen-JWT attacks on the most sensitive class.
- Frontend + backend share the claim shape (one source of truth in `packages/shared/src/types.ts` as `PiiClass` union).
- Agents structurally cannot exfiltrate PII (zero claims).

### Negative
- Extra UI work: re-grant flow + step-up modal + claim-expiry banners (~1 day for Codex web).
- Re-grant friction for ops staff doing legitimate triage; tempting to grant long TTLs. **Mitigation:** TTL caps are baked into backend; UI cannot request longer.
- Step-up MFA dependency: requires the MFA stack to exist. **If MFA not yet shipped**, fall back to password-only step-up for `financial` and add MFA in P9 hardening.

### Migration
- No existing JWTs to migrate (claim is net-new).
- Seed an `EMAPPA_ADMIN_PII_CLAIMS` env var so dev admin emails get `pii:view:contact` (8h TTL) automatically. `identity` + `financial` require explicit RBAC console grant even in dev.

## Open follow-ups

- **F1:** A 4th class `pii:view:behavioral` if we ever surface tracking/usage analytics with personally-identifying patterns. Defer.
- **F2:** TTL anomaly agent — daily review of grant patterns, flags admins with high re-grant frequency. Defer to P8.
- **F3:** Right-to-be-forgotten flow (DPA-mandated). Defer; needs schema design for soft-delete.

## References

- [IA_SPEC §Universal Cockpit Rules — CR-3 PII masking](../IA_SPEC.md)
- [DONE_DEFINITION §CR-3 test target: `backend/tests/test_pii_claim.py`](../DONE_DEFINITION.md)
- [imported-specs/ai-native-company-system-design.md §4](../imported-specs/ai-native-company-system-design.md)
- [BUILD_PLAN P0.3.5 PII service](../BUILD_PLAN.md), [P0.0.2 this ADR](../BUILD_PLAN.md)
