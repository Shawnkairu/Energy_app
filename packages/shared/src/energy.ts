import type { EnergyInputs, EnergyOutputs } from "./types";

const round = (value: number) => Number(value.toFixed(2));
const ratio = (numerator: number, denominator: number) =>
  denominator > 0 ? numerator / denominator : 0;

export function calculateEnergy(input: EnergyInputs): EnergyOutputs {
  const dailyGeneration = input.arrayKw * input.peakSunHours * input.systemEfficiency;
  const E_gen = dailyGeneration * 30;

  const dailyDemand = input.monthlyDemandKwh / 30;
  const dailyDaytimeDemand = dailyDemand * input.daytimeDemandFraction;
  const dailyNightDemand = dailyDemand - dailyDaytimeDemand;

  const directDaily = Math.min(dailyGeneration, dailyDaytimeDemand);
  const excessDaily = Math.max(0, dailyGeneration - directDaily);
  const usableBattery = input.batteryKwh * input.batteryDepthOfDischarge;
  const chargedDaily = Math.min(excessDaily, usableBattery);
  const batteryUsedDaily = Math.min(
    chargedDaily * input.batteryRoundTripEfficiency,
    dailyNightDemand,
  );
  const wasteDaily = Math.max(0, excessDaily - chargedDaily);

  const E_direct = directDaily * 30;
  const E_charge = chargedDaily * 30;
  const E_battery_used = batteryUsedDaily * 30;
  const E_gen_raw = round(E_gen);
  const E_sold_uncapped = round(E_direct + E_battery_used);
  const E_sold = round(Math.min(E_sold_uncapped, input.monthlyDemandKwh, E_gen_raw));
  const E_waste = round(Math.max(0, E_gen_raw - E_direct - E_charge));
  const E_grid = round(Math.max(0, input.monthlyDemandKwh - E_sold));

  const utilization = round(ratio(E_sold, E_gen_raw));
  const wasteRate = round(ratio(E_waste, E_gen_raw));

  return {
    E_gen: E_gen_raw,
    E_direct: round(E_direct),
    E_charge: round(E_charge),
    E_battery_used: round(E_battery_used),
    E_sold,
    E_waste,
    E_grid,
    utilization,
    wasteRate,
    coverage: round(ratio(E_sold, input.monthlyDemandKwh)),
  };
}

export function calculateRevenue(E_sold: number, pricePerKwh: number) {
  return round(E_sold * pricePerKwh);
}

export function calculateSavings(E_sold: number, gridPriceKes: number, solarPriceKes: number) {
  return round(Math.max(0, (gridPriceKes - solarPriceKes) * E_sold));
}
