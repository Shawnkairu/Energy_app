import { Text } from "react-native";
import { GlassCard, Label, colors, typography } from "@emappa/ui";
import { RoleDashboardScaffold } from "../roles/RoleDashboardScaffold";
import {
  ResidentBigMetric,
  ResidentKpiRow,
  ResidentProgressBar,
  SettlementWaterfall,
  formatKes,
  formatKwh,
  formatPercent,
  residentView,
} from "./ResidentShared";

export function ResidentHomeScreen() {
  return (
    <RoleDashboardScaffold
      role="resident"
      cohesionRole="resident"
      section="Home"
      title="Today at Home"
      subtitle="A calm snapshot of prepaid balance, local solar coverage, and savings for this household."
      actions={["Top up", "See flow", "Review saving"]}
      renderHero={(building) => {
        const view = residentView(building);

        return {
          label: "Prepaid solar balance",
          value: formatKes(view.prepaidBalanceKes),
          sub: `${formatKwh(view.monthlySolarKwh)} sold solar has been available to this home this month.`,
        };
      }}
      renderPanels={(building) => {
        const view = residentView(building);
        const hasBalance = view.prepaidBalanceKes > 0;

        return (
          <>
            <ResidentKpiRow
              items={[
                {
                  label: "Coverage",
                  value: formatPercent(view.solarCoverage),
                  note: "Local solar share",
                },
                {
                  label: "Savings",
                  value: formatKes(view.savingsKes),
                  note: "Projected vs grid",
                },
                {
                  label: "Balance",
                  value: hasBalance ? "Ready" : "Top up",
                  note: hasBalance ? "Solar can allocate" : "Solar blocked",
                },
              ]}
            />

            <ResidentBigMetric
              label="Household balance"
              value={formatKes(view.averagePrepaidBalanceKes)}
              detail={`${building.project.name} residents are shown with mock averaged wallet values so private household finances stay hidden.`}
            />

            <GlassCard>
              <Label>Daily rhythm</Label>
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.heading,
                  fontWeight: "600",
                  letterSpacing: -0.35,
                  marginTop: 5,
                  lineHeight: typography.heading + 4,
                }}
              >
                Solar carries the day when tokens are funded
              </Text>
              <ResidentProgressBar
                label="Home solar cover"
                value={view.solarCoverage}
                caption="Coverage is capped to sold solar. Grid fallback remains separate from e.mappa prepaid balance."
              />
            </GlassCard>

            <ResidentBigMetric
              label="Building context"
              value={`${building.project.units} homes`}
              detail={`${building.project.name} is shown as a privacy-safe resident view for ${building.project.locationBand}.`}
            />
            <SettlementWaterfall role="resident" building={building} />
          </>
        );
      }}
    />
  );
}
