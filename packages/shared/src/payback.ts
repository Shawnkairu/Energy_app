import type { PaybackInputs, PaybackResult } from "./types";

const round = (value: number) => Number(value.toFixed(2));
const months = (target: number, monthlyPayout: number) =>
  monthlyPayout > 0 ? target / monthlyPayout : Number.POSITIVE_INFINITY;

export function calculatePayback(input: PaybackInputs): PaybackResult {
  const targetMultiple = input.targetMultiple ?? 1.5;
  const principalMonths = months(input.investment, input.monthlyPayout);
  const targetMonths = months(input.investment * targetMultiple, input.monthlyPayout);

  return {
    principalMonths: round(principalMonths),
    targetMonths: round(targetMonths),
    yearsToPrincipal: round(principalMonths / 12),
    yearsToTarget: round(targetMonths / 12),
  };
}

export function calculateRecoveryPercent(cumulativePayout: number, investment: number) {
  return investment > 0 ? round(Math.min(1, cumulativePayout / investment)) : 0;
}
