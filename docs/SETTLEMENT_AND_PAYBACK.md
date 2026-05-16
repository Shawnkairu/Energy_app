# Settlement, Waterfall, and Payback

This document ties settlement math to the imported canonical specs. Detailed tables also live in [SETTLEMENT_RULES.md](./SETTLEMENT_RULES.md).

## Economic base

- **Gross revenue** = `E_sold × solarTokenPrice` (prepaid, delivered, measured kWh).
- **Never** settle stakeholder pools from raw `E_gen`, pledges, or unpaid usage.
- **Shortfall**: if configured pool percentages exceed available cash, apply a **deterministic scale-down** — **no debt** is created (see `packages/shared/src/settlement.ts`).

## Suggested pool splits (reference)

Recovery and royalty phase splits appear in [installation-process-drs-lbrs-go-live.md](./imported-specs/installation-process-drs-lbrs-go-live.md) §5.1. Constants `RECOVERY_WATERFALL_RATES` and `ROYALTY_WATERFALL_RATES` in shared `settlement.ts` mirror those 20-part examples.

## Homeowner vs building owner

- **Building owners** may receive **host royalty** only from **monetized** prepaid flows after go-live.
- **Homeowners** do **not** receive host royalty on self-consumption; show **savings / net effective cost** and route true cashflows only from **external monetization** (export / trading where enabled).

## Payback

- `Payback = NetInvestment / MonthlyNetPayout` when payout > 0.
- If payout ≤ 0, show **“not currently recovering”** (`notCurrentlyRecovering` in `packages/shared/src/payback.ts`).
- Financier **count** changes per-person payout, **not** the physics of payback duration for a fixed pool.

## Stress scenarios

Utilization bands (90 / 75 / 60 / 45 / 30%), demand spikes with grid fallback, downtime / missing LBRS, and regulatory/export delay are modeled in financier docs — see [scenario F](./imported-specs/scenario-f-financier-flow.md) §17–18.
