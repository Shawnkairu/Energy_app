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
      title="Performance"
      subtitle="Sold solar, unused output, grid fallback."
      actions={["Flow", "Utilization", "Fallback"]}
      renderPanels={(building) => {
        const view = building.roleViews.provider;

        return (
          <>
            <ProviderSectionBrief
              section="Performance"
              title="The array is only as strong as demand."
              body="Generation stays separate from payout here."
              building={building}
            />
            <ProviderMetric
              label="Utilization"
              value={formatPercent(view.utilization)}
              detail="Sold kWh divided by generated kWh"
            />
            <ProviderPerformanceFlow building={building} />
            <ProviderRows
              title="Flow readings"
              eyebrow="Performance"
              rows={[
                { label: "Sold solar", value: formatKwh(view.monetizedKwh), tone: "good" },
                { label: "Unused output", value: formatKwh(view.wasteKwh), tone: view.wasteKwh > 0 ? "warn" : "good" },
                { label: "Grid fallback", value: formatKwh(view.gridFallbackKwh), tone: view.gridFallbackKwh > 0 ? "bad" : "good" },
              ]}
            />
            <ProviderTruthCard
              title="No payout on unused energy."
              body="Generated, wasted, curtailed, or free-exported kWh stay outside settlement."
            />
            <ProviderActionPlan section="Performance" />
          </>
        );
      }}
    />
  );
}
