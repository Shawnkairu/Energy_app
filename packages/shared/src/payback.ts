import type { PaybackInputs, PaybackResult } from "./types";

const round = (value: number) => Number(value.toFixed(2));
const months = (target: number, monthlyPayout: number) =>
  monthlyPayout > 0 ? target / monthlyPayout : Number.POSITIVE_INFINITY;

export function calculatePayback(input: PaybackInputs): PaybackResult {
  const targetMultiple = input.targetMultiple ?? 1.5;
  const notCurrentlyRecovering = input.monthlyPayout <= 0;
  const principalMonths = notCurrentlyRecovering ? Number.POSITIVE_INFINITY : months(input.investment, input.monthlyPayout);
  const targetMonths = notCurrentlyRecovering
    ? Number.POSITIVE_INFINITY
    : months(input.investment * targetMultiple, input.monthlyPayout);

  return {
    principalMonths: notCurrentlyRecovering ? Number.POSITIVE_INFINITY : round(principalMonths),
    targetMonths: notCurrentlyRecovering ? Number.POSITIVE_INFINITY : round(targetMonths),
    yearsToPrincipal: notCurrentlyRecovering ? Number.POSITIVE_INFINITY : round(principalMonths / 12),
    yearsToTarget: notCurrentlyRecovering ? Number.POSITIVE_INFINITY : round(targetMonths / 12),
    notCurrentlyRecovering,
  };
}

export function calculateRecoveryPercent(cumulativePayout: number, investment: number) {
  return investment > 0 ? round(Math.min(1, cumulativePayout / investment)) : 0;
}
