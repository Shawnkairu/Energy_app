import type { SettlementOutputs, SettlementRates } from "./types";
import { calculateRevenue } from "./energy";

const round = (value: number) => Number(value.toFixed(2));

export function calculateSettlement(
  E_sold: number,
  pricePerKwh: number,
  rates: SettlementRates,
): SettlementOutputs {
  const revenue = calculateRevenue(E_sold, pricePerKwh);
  const reserve = revenue * rates.reserve;
  const providerPool = revenue * rates.providers;
  const financierPool = revenue * rates.financiers;
  const ownerRoyalty = revenue * rates.owner;
  const emappaFee = revenue * rates.emappa;
  const allocated = reserve + providerPool + financierPool + ownerRoyalty + emappaFee;

  return {
    revenue,
    reserve: round(reserve),
    providerPool: round(providerPool),
    financierPool: round(financierPool),
    ownerRoyalty: round(ownerRoyalty),
    emappaFee: round(emappaFee),
    unallocated: round(revenue - allocated),
  };
}

export function validateSettlementRates(rates: SettlementRates) {
  const total = rates.reserve + rates.providers + rates.financiers + rates.owner + rates.emappa;
  return {
    total: round(total),
    isBalanced: Math.abs(total - 1) < 0.0001,
  };
}
