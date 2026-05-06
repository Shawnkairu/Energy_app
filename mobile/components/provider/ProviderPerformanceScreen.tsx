import { SoldVsWaste } from "../design-handoff";
import {
  ProviderActionPlan,
  ProviderDashboard,
  ProviderMetric,
  ProviderPerformanceFlow,
  ProviderRows,
  ProviderSectionBrief,
  ProviderTruthCard,
  formatKwh,
  formatPercent,
} from "./ProviderShared";

export function ProviderPerformanceScreen() {
  return (
    <ProviderDashboard
      section="Performance"
      title="Utilization & Fallback"
      subtitle="A performance-only view of sold solar, unpaid waste, and grid fallback."
      actions={["Read utilization", "Waste reasons", "Fallback"]}
      renderPanels={(building) => {
        const view = building.roleViews.provider;

        return (
          <>
            <ProviderSectionBrief
              section="Performance"
              title="Performance explains the gap."
              body="This screen keeps ownership and payout language out of the way so output quality is easy to read."
              building={building}
            />
            <ProviderMetric
              label="Utilization"
              value={formatPercent(view.utilization)}
              detail="Sold kWh divided by generated kWh."
            />
            <SoldVsWaste building={building} headline="Sold solar vs the rest" />
            <ProviderPerformanceFlow building={building} />
            <ProviderRows
              title="Performance notes"
              eyebrow="Performance"
              rows={[
                { label: "Sold solar", value: formatKwh(view.monetizedKwh), note: "Prepaid demand absorbed this portion.", tone: "good" },
                { label: "Waste", value: formatKwh(view.wasteKwh), note: "Visible for operations; not a revenue event.", tone: view.wasteKwh > 0 ? "warn" : "good" },
                { label: "Grid fallback", value: formatKwh(view.gridFallbackKwh), note: "Demand not covered by solar or battery.", tone: view.gridFallbackKwh > 0 ? "bad" : "good" },
              ]}
            />
            <ProviderTruthCard
              title="No payout on unused energy."
              body="Generated, wasted, curtailed, or free-exported energy stays outside settlement until prepaid building demand monetizes it."
            />
            <ProviderActionPlan section="Performance" />
          </>
        );
      }}
    />
  );
}
