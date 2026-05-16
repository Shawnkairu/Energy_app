import { View } from "react-native";
import { FinancierScreenShell, StatusRail, formatKes, formatKesShort } from "./FinancierShared";
import { PilotBanner } from "../PilotBanner";
import { SystemEnergyImmersiveHero } from "../energy/SystemImmersiveOverview";
import { immersiveHourlyFromDayTotal } from "../energy/immersiveHourlyFromDayTotal";

export function FinancierGenerationScreen() {
  return (
    <FinancierScreenShell
      section="Energy"
      title="Generation vs monetized solar"
      subtitle="Returns follow E_sold (prepaid, delivered kWh), not sunlight alone."
      actions={["E_gen", "E_sold", "LBRS"]}
      hideChrome
      hero={({ primary }) => ({
        label: "Monetized base",
        value: `${primary.energy.E_sold.toFixed(0)} kWh`,
        sub: `Utilization ${(primary.energy.utilization * 100).toFixed(0)}% · LBRS ${primary.lbrs.decision}`,
      })}
    >
      {({ primary }) => {
        const e = primary.energy;
        const genDay = e.E_gen / 30;
        const loadDay = (e.E_sold + e.E_grid) / 30;
        const genH = immersiveHourlyFromDayTotal(genDay);
        const loadH = immersiveHourlyFromDayTotal(loadDay, 19);
        const peakGen = genH.length ? Math.max(...genH) : 0;
        const peakLoad = loadH.length ? Math.max(...loadH) : 0;
        const batteryStatus = peakGen > peakLoad * 1.08 ? "charging" : peakLoad > peakGen * 1.08 ? "discharging" : "idle";

        return (
          <>
            <PilotBanner title="Pilot mode" message="Physics vs economics uses projected building energy until live settlement." />
            <View style={{ marginHorizontal: -20, marginTop: 4 }}>
              <SystemEnergyImmersiveHero
                siteName={primary.project.name}
                weatherHint={`Financier · LBRS ${primary.lbrs.decision}`}
                generationKwhToday={genDay}
                loadKwhToday={loadDay}
                generationHourly={genH}
                loadHourly={loadH}
                batterySoc={Math.min(0.96, Math.max(0.1, e.utilization * 0.9))}
                batteryStatus={batteryStatus}
                savingsKesLabel={formatKes(Math.round(Math.min(genDay, loadDay) * 14))}
                summaryCards={[
                  { label: "E_gen (mo)", value: `${Math.round(e.E_gen)} kWh`, hint: "Operational", icon: "flash-outline" },
                  { label: "E_sold (mo)", value: `${Math.round(e.E_sold)} kWh`, hint: "Settlement base", icon: "cash-outline" },
                  { label: "Utilization", value: `${Math.round(e.utilization * 100)}%`, hint: "Economics", icon: "pulse-outline" },
                ]}
              />
            </View>
          <StatusRail
            items={[
              { label: "E_gen", value: `${primary.energy.E_gen.toFixed(0)} kWh`, note: "Operational production", tone: "neutral" },
              { label: "E_sold", value: `${primary.energy.E_sold.toFixed(0)} kWh`, note: "Settlement base", tone: "good" },
              { label: "Waste", value: `${primary.energy.E_waste.toFixed(0)} kWh`, note: "Unmonetized surplus", tone: "warn" },
              { label: "Grid fallback", value: `${primary.energy.E_grid.toFixed(0)} kWh`, note: "KPLC shortfall", tone: "neutral" },
            ]}
          />
          <StatusRail
            items={[
              { label: "Financier pool", value: formatKesShort(primary.settlement.financierPool), note: "From E_sold tariff", tone: "good" },
              { label: "Payback signal", value: primary.financierPayback.notCurrentlyRecovering ? "Not recovering" : `${primary.financierPayback.principalMonths} mo est.`, note: "Not guaranteed", tone: "neutral" },
            ]}
          />
          </>
        );
      }}
    </FinancierScreenShell>
  );
}
