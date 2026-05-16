# Deployment Readiness Score (DRS)

DRS answers: **“Should installation begin?”** It is **not** approved by an “80% score.” The UI may show a weighted **display score**, but **`deployment_ready`** requires **every critical gate** to pass. Canonical categories, weights, and gate rules: [imported-specs/installation-process-drs-lbrs-go-live.md](./imported-specs/installation-process-drs-lbrs-go-live.md).

## Display score (informational only)

For apartment projects the reference document suggests display weights (totalling 100%) across owner authorization, stakeholders, inspection, capacity plan, demand, hardware, electrician payment, and contracts — **all marked critical**. The shared package keeps a **legacy 6-component blend** for charts (`demandCoverage`, `prepaidCommitment`, `loadProfile`, etc.) but **decision** is derived **only** from gate booleans + utilization/demand rules.

## Critical outcomes

On **`siteKind: homeowner`**, **stakeholder readiness** is satisfied when **`stakeholdersVetted`** is true **or** both **`hasCertifiedLeadElectrician`** and **`hasVerifiedSupplierQuote`** are true — the critical gate and checklist row share this rule so UI never disagrees.

| `decision` | Meaning |
|------------|---------|
| `deployment_ready` | All critical gates satisfied; installation may be scheduled |
| `review` | No critical failures, but warnings (e.g. utilization watch band) |
| `blocked` | One or more critical failures (missing BOM, low utilization, unpaid labor path, etc.) |

## Demand / pledges (pilot)

- **Pledges are not purchases** and do not create usable kWh.
- `hasResidentDemandSignal` captures demand evidence; `projectedUtilization < 0.6` is a **critical** economic block for apartments.

## Code

- Shared: `packages/shared/src/drs.ts` — `calculateDrs`, `getDrsLabel`, `normalizeDeploymentDecision`.
- Backend: `backend/app/services/drs.py` — keep aligned with shared rules.

## Related

- LBRS (go-live): [LBRS_FORMULA.md](./LBRS_FORMULA.md)
- Roles & flows: [USER_FLOWS.md](./USER_FLOWS.md), [ROLE_MATRIX.md](./ROLE_MATRIX.md) *(create/update as needed)*
