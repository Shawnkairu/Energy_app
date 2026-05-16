import { colors } from "@emappa/ui";
import { RoleDashboardScaffold } from "../roles/RoleDashboardScaffold";
import { ROLE_TINT } from "./residentTint";
import {
  ResidentEnergyFlowGraphic,
  ResidentFlowLane,
  TariffComparison,
  formatKwh,
  formatPercent,
  residentView,
} from "./ResidentShared";

export function ResidentUsageScreen() {
  return (
    <RoleDashboardScaffold
      role="resident"
      cohesionRole="resident"
      section="Usage"
      title="Energy Flow"
      subtitle="A visual source map only: solar, stored support, and grid fallback without wallet or ownership repetition."
      actions={["View source map", "Check fallback", "Read kWh"]}
      renderHero={(building) => {
        const view = residentView(building);

        return {
          label: "Solar coverage",
          value: formatPercent(view.solarCoverage),
          sub: `${formatKwh(view.monthlySolarKwh)} sold solar moved through this household flow.`,
        };
      }}
      renderPanels={(building) => {
        const view = residentView(building);
        const householdGridKwh = building.energy.E_grid / building.project.units;
        const householdBatteryKwh = building.energy.E_battery_used / building.project.units;

        return (
          <>
            <TariffComparison building={building} />
            <ResidentEnergyFlowGraphic
              coverage={view.solarCoverage}
              solar={formatKwh(view.monthlySolarKwh)}
              battery={formatKwh(householdBatteryKwh)}
              grid={formatKwh(householdGridKwh)}
            />

            <ResidentFlowLane
              steps={[
                {
                  label: "Solar allocation",
                  value: formatKwh(view.monthlySolarKwh),
                  detail: "Prepaid tokens are matched against monetized local solar first.",
                  color: ROLE_TINT.fg,
                },
                {
                  label: "Battery support",
                  value: formatKwh(householdBatteryKwh),
                  detail: "Stored solar smooths the day when direct sunlight is not available.",
                  color: colors.amber,
                },
                {
                  label: "Grid fallback",
                  value: formatKwh(householdGridKwh),
                  detail: "KPLC covers the shortfall; e.mappa stays prepaid-only (no arrears product).",
                  color: colors.muted,
                },
              ]}
            />
          </>
        );
      }}
    />
  );
}
