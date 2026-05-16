import type { SettlementOutputs, SettlementRates, SettlementPhase } from "./types";
import { calculateRevenue } from "./energy";

const round = (value: number) => Number(value.toFixed(2));

/** Suggested recovery-phase split (20 parts) — see docs/imported-specs/installation-process-drs-lbrs-go-live.md §5.1 */
export const RECOVERY_WATERFALL_RATES: SettlementRates = {
  reserve: 1 / 20,
  providers: 6 / 20,
  financiers: 10 / 20,
  owner: 1 / 20,
  emappa: 2 / 20,
};

/** Suggested royalty-phase split (20 parts) */
export const ROYALTY_WATERFALL_RATES: SettlementRates = {
  reserve: 2 / 20,
  providers: 7 / 20,
  financiers: 2 / 20,
  owner: 2 / 20,
  emappa: 7 / 20,
};

export function defaultWaterfallRates(phase: SettlementPhase): SettlementRates {
  return phase === "recovery" ? { ...RECOVERY_WATERFALL_RATES } : { ...ROYALTY_WATERFALL_RATES };
}

export function calculateSettlement(
  E_sold: number,
  pricePerKwh: number,
  rates: SettlementRates,
  options?: { phase?: SettlementPhase },
): SettlementOutputs {
  const phase = options?.phase ?? "recovery";
  void phase; // reserved for future phase-specific rules beyond rates passed in
  const revenue = calculateRevenue(E_sold, pricePerKwh);
  const reserve = revenue * rates.reserve;
  const providerPool = revenue * rates.providers;
  const financierPool = revenue * rates.financiers;
  const ownerRoyalty = revenue * rates.owner;
  const emappaFee = revenue * rates.emappa;
  const allocated = reserve + providerPool + financierPool + ownerRoyalty + emappaFee;
  const shortfallKes = round(Math.max(0, allocated - revenue));
  const scale = allocated > revenue && allocated > 0 ? revenue / allocated : 1;
  const reserveA = round(reserve * scale);
  const providerA = round(providerPool * scale);
  const financierA = round(financierPool * scale);
  const ownerA = round(ownerRoyalty * scale);
  const emappaA = round(emappaFee * scale);
  const allocatedTotal = round(reserveA + providerA + financierA + ownerA + emappaA);
  const unallocated = round(revenue - allocatedTotal);

  return {
    revenue,
    reserve: reserveA,
    providerPool: providerA,
    financierPool: financierA,
    ownerRoyalty: ownerA,
    emappaFee: emappaA,
    unallocated,
    allocatedTotal,
    shortfallKes,
    phase: options?.phase ?? "recovery",
  };
}

export function validateSettlementRates(rates: SettlementRates) {
  const total = rates.reserve + rates.providers + rates.financiers + rates.owner + rates.emappa;
  return {
    total: round(total),
    isBalanced: Math.abs(total - 1) < 0.0001,
  };
}
