# FM-1 … FM-5 audit (§6 formulas / API parity)

**Scope:** `docs/SPEC_COMPLIANCE_CHECKLIST.md` §6 — compare `packages/shared/src` with `backend/app/services/`, note `backend/tests/` coverage, cross-read formula docs at high level.  
**Date:** 2026-05-15  
**Out of scope:** Updating rows on `SPEC_COMPLIANCE_CHECKLIST.md` (parent task).

## Formula docs (high level)

| Doc | Intent |
|-----|--------|
| [DRS_FORMULA.md](../DRS_FORMULA.md) | Gate-first deployment readiness; display score is informational; decisions from booleans + utilization/demand rules; references imported installation spec. |
| [LBRS_FORMULA.md](../LBRS_FORMULA.md) | Binary go-live gates; apartment vs homeowner test emphasis; token/settlement dry run tied to **E_sold**, not raw generation. |
| [SETTLEMENT_AND_PAYBACK.md](../SETTLEMENT_AND_PAYBACK.md) | Revenue from monetized kWh; deterministic scale-down on pool shortfall; recovery vs royalty splits as constants in shared code; homeowner vs building-owner royalty semantics. |
| [ENERGY_FORMULAS.md](../ENERGY_FORMULAS.md) | E_gen → direct/charge/battery path; **E_sold** clamped to demand and generation; utilization/coverage definitions. |

## Backend tests inventory

| File | What it exercises |
|------|-------------------|
| `backend/tests/test_drs.py` | **Indirect:** `project_building()` → nested `calculate_drs`; demo fixtures only (blocked vs deployment_ready, hardware gate). |
| `backend/tests/test_settlement.py` | **Direct:** `calculate_settlement`; asserts waterfall + unallocated reconciles to revenue (one case). |
| `backend/tests/test_energy.py` | **Direct:** `calculate_energy`; asserts numeric parity with shared TypeScript baseline for Nyeri demo inputs. |
| `backend/tests/test_api.py` | HTTP/project contracts; **does not** assert formula parity. |
| *Absent* | No `test_lbrs.py`, `test_payback.py`, `test_projector.py`, or backend mirror of `auditProjectConsistency`. |

---

## Recommended §6 status per row

| ID | Recommended status | Notes (1–2 lines) |
|----|-------------------|-------------------|
| **FM-1** | **Partial** | Apartment-path gate **codes and messages** largely match `drs.ts`; Python **`calculate_drs` has no homeowner (`siteKind`) branch**, returns **no `checklist`**, and **`project_building` never passes `siteKind`** into DRS input (TS does from `buildingKind`). Tests only cover DRS **via** projector + two demo scenarios. |
| **FM-2** | **Gap** | **`calculate_lbrs` is not algorithmically aligned:** TS uses weighted checklist **displayScore** + structured failures (`responsibleRole`, stable codes); Python uses **penalty score** (`100 − 12 × failures`), **different failure shapes**, and **no checklist payload**. Python **`_default_lbrs` fixes `siteKind` to apartment** while TS derives homeowner vs apartment from project kind. **No dedicated LBRS tests.** |
| **FM-3** | **Partial** | **`calculate_settlement`** matches TS scale-down and rounding pattern for the exercised path; Python **always reports `"phase": "recovery"`** and **`calculate_settlement` ignores settlement phase** unlike TS `calculateSettlement(..., options.phase)`. **`calculate_payback`** matches branching for zero payout but **month/year rounding differs** (TS **2** dp vs Python **1** dp). Payback **untested** in backend. |
| **FM-4** | **Pass** | **`calculate_energy` mirrors `energy.ts`** field-for-field; **`test_energy.py`** locks a full golden-vector parity check against shared outputs for the demo project. |
| **FM-5** | **Gap** | **`project_building` diverges materially from `projector.ts`:** gates come from a **hardcoded list** vs TS **`drs.checklist` labels**; TS **zeros owner host royalty for homeowner sites**, Python does not; TS threads **LBRS/DRS site kind** from building metadata. **`consistency.ts` (`auditProjectConsistency`) has no Python counterpart.** Projector **only lightly touched** by `test_drs.py`. |

---

## File parity matrix (primary implementations)

| Concern | Shared (TS) | Backend (Python) |
|---------|-------------|------------------|
| DRS | `packages/shared/src/drs.ts` | `backend/app/services/drs.py` |
| LBRS | `packages/shared/src/lbrs.ts` | `backend/app/services/lbrs.py` |
| Settlement | `packages/shared/src/settlement.ts` | `backend/app/services/settlement.py` |
| Payback | `packages/shared/src/payback.ts` | `backend/app/services/payback.py` |
| Energy | `packages/shared/src/energy.ts` | `backend/app/services/energy.py` |
| Projection orchestration | `packages/shared/src/projector.ts` | `backend/app/services/projector.py` |
| Cross-cutting audits | `packages/shared/src/consistency.ts` | *(none)* |

---

## Follow-ups (if pursuing Pass)

1. **FM-1:** Extend `drs.py` with **`siteKind` / homeowner failures**, return **`checklist`** (or document API as intentionally slim); align **`project_building` drs_input** with TS (`siteKind`, demand-signal defaults).
2. **FM-2:** Reimplement **`calculate_lbrs`** to match **`lbrs.ts`** (scores, checklist, failure metadata); align **`_default_lbrs`** with TS **`defaultLbrs`**; add **`test_lbrs.py`** with apartment vs homeowner cases.
3. **FM-3:** Thread **`phase`** through Python settlement; align **payback rounding** with TS; add **`test_payback.py`** (zero vs positive payout).
4. **FM-4:** Optional **additional fixtures** (edge cases: zero generation, max clamps) — core already strong.
5. **FM-5:** Port **`project_building`** semantics from **`projector.ts`** (gates, homeowner royalty, site kinds); optionally add **`audit_project_consistency`** in Python or shared-only CI assertion for API payloads.
