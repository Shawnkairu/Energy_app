# Live Building Readiness Score (LBRS)

LBRS answers: **“Can users safely consume prepaid e.mappa energy now?”** It is separate from DRS (which answers whether installation should begin). Canonical definitions and apartment vs homeowner test lists live in [imported-specs/installation-process-drs-lbrs-go-live.md](./imported-specs/installation-process-drs-lbrs-go-live.md).

## Gate rule (non‑negotiable)

- **Live-ready** only when **every critical LBRS test passes** (binary gates). Display percentages are informational.
- **Blocked** if any critical test fails (safety, isolation, metering, token/settlement dry run, launch readiness).
- **Review** may be used when non-critical warnings exist and no critical failures remain (product choice; default strict path is all-green).

## Apartment LBRS tests (summary)

| Area | Why it matters |
|------|----------------|
| As-built / BOM | Installed system matches approved design and serials |
| Electrical safety | Breakers, SPD, earthing, enclosures, labeling |
| Solar bus isolation | No unintended tie to KPLC/main common bus; no unsafe backfeed |
| Inverter + battery | Commissioning, modes, monitoring |
| ATS per apartment | KPLC vs e.mappa path per enrolled unit |
| Meter mapping + data | Correct resident/unit mapping; reliable readings |
| Token / backend dry run | Token states and settlement use **E_sold**, not raw generation |
| Resident/owner launch | Instructions, support, no buy/top-up before activation |

## Homeowner LBRS

See [scenario C spec](./imported-specs/scenario-c-homeowner-flow-net-metering-trading.md) §10 — home-level changeover/ATS, metering, token control, monitoring, settlement dry run, handover.

## Code

- Shared implementation: `packages/shared/src/lbrs.ts` (`calculateLbrs`, `getLbrsLabel`).
- Backend mirror: `backend/app/services/lbrs.py` (keep aligned with shared).
