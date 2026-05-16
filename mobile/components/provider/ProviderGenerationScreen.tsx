import {
  ProviderActionPlan,
  ProviderDashboard,
  ProviderGenerationGraphic,
  ProviderPerformanceFlow,
  ProviderRows,
  formatKes,
  formatKwh,
  formatPercent,
} from "./ProviderShared";
import { PilotBanner } from "../PilotBanner";
import { SystemEnergyImmersiveHero } from "../energy/SystemImmersiveOverview";
import { immersiveHourlyFromDayTotal } from "../energy/immersiveHourlyFromDayTotal";
import { View } from "react-native";
import { spacing } from "@emappa/ui";
import { generationVisibilityForRole } from "@emappa/shared";

export function ProviderGenerationScreen() {
  return (
    <ProviderDashboard
      section="Generation"
      title="Generation"
      subtitle="Array output, sold solar, unused energy."
      actions={["Array", "Flow", "Proof"]}
      minimalChrome
      renderPanels={(building) => {
        const view = building.roleViews.provider;
        const hasShares = generationVisibilityForRole("provider", { shareOwnershipPct: view.retainedOwnership }).visible;
        const e = building.energy;
        const genDay = e.E_gen / 30;
        const loadDay = (e.E_sold + e.E_grid) / 30;
        const genH = immersiveHourlyFromDayTotal(genDay);
        const loadH = immersiveHourlyFromDayTotal(loadDay, 19);
        const peakGen = genH.length ? Math.max(...genH) : 0;
        const peakLoad = loadH.length ? Math.max(...loadH) : 0;
        const batteryStatus = peakGen > peakLoad * 1.08 ? "charging" : peakLoad > peakGen * 1.08 ? "discharging" : "idle";

        return (
          <>
            <PilotBanner
              title="Pilot mode"
              message="Array telemetry is synthetic until live metering backs settlement."
            />
            <View style={{ marginHorizontal: -spacing.lg, marginTop: spacing.sm }}>
              <SystemEnergyImmersiveHero
                siteName={building.project.name}
                weatherHint="Generation · monetized vs raw output"
                generationKwhToday={genDay}
                loadKwhToday={loadDay}
                generationHourly={genH}
                loadHourly={loadH}
                batterySoc={Math.min(0.96, Math.max(0.1, e.utilization * 0.92))}
                batteryStatus={batteryStatus}
                savingsKesLabel={formatKes(Math.round(Math.min(genDay, loadDay) * 14))}
                summaryCards={[
                  { label: "Generated (mo)", value: formatKwh(view.generatedKwh), hint: "Array output", icon: "flash-outline" },
                  { label: "Monetized (mo)", value: formatKwh(view.monetizedKwh), hint: "Payout basis", icon: "cash-outline" },
                  { label: "Utilization", value: formatPercent(view.utilization), hint: "Sold / gen", icon: "pulse-outline" },
                ]}
              />
            </View>
            {hasShares ? (
              <>
                <ProviderGenerationGraphic building={building} />
                <ProviderPerformanceFlow building={building} />
              </>
            ) : (
              <ProviderRows
                title="Generation visibility"
                eyebrow="Shares"
                rows={[
                  {
                    label: "Retained ownership",
                    value: formatPercent(view.retainedOwnership),
                    tone: "warn",
                  },
                  {
                    label: "Live array telemetry",
                    value: "Gated",
                    note: "When counterparties buy your shares, payouts can continue but detailed generation views require retained ownership.",
                    tone: "neutral",
                  },
                ]}
              />
            )}
            <ProviderRows
              title="Generation proof"
              eyebrow="Telemetry"
              rows={[
                { label: "Generated", value: formatKwh(view.generatedKwh) },
                { label: "Sold", value: formatKwh(view.monetizedKwh), tone: "good" },
                { label: "Utilization", value: formatPercent(view.utilization), tone: view.utilization >= 0.6 ? "good" : "warn" },
              ]}
            />
            <ProviderActionPlan section="Generation" />
          </>
        );
      }}
    />
  );
}
