import {
  ProviderActionPlan,
  ProviderDashboard,
  ProviderHomeSummary,
  ProviderRows,
  formatKes,
  formatKwh,
  formatPercent,
} from "./ProviderShared";

export function ProviderHomeScreen() {
  return (
    <ProviderDashboard
      section="Discover"
      title="Discover"
      subtitle="Named buildings, array signals, and payout context before you commit capacity."
      actions={["Status", "Generation", "Revenue", "Gates"]}
      renderPanels={(building) => {
        const view = building.roleViews.provider;

        return (
          <>
            <ProviderHomeSummary building={building} />
            <ProviderRows
              title="Desk snapshot"
              eyebrow="Discover"
              rows={[
                { label: "Sold solar", value: formatKwh(view.monetizedKwh), tone: "good" },
                { label: "Payout", value: formatKes(view.monthlyPayoutKes), tone: "good" },
                { label: "Retained", value: formatPercent(view.retainedOwnership) },
                { label: "Stage", value: building.project.stage },
              ]}
            />
            <ProviderActionPlan section="Discover" />
          </>
        );
      }}
    />
  );
}
