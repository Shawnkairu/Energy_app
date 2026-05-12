import {
  ProviderActionPlan,
  ProviderDashboard,
  ProviderGenerationGraphic,
  ProviderPerformanceFlow,
  ProviderRows,
  formatKwh,
  formatPercent,
} from "./ProviderShared";

export function ProviderGenerationScreen() {
  return (
    <ProviderDashboard
      section="Generation"
      title="Generation"
      subtitle="Array output, sold solar, unused energy."
      actions={["Array", "Flow", "Proof"]}
      renderPanels={(building) => {
        const view = building.roleViews.provider;

        return (
          <>
            <ProviderGenerationGraphic building={building} />
            <ProviderPerformanceFlow building={building} />
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
