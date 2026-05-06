import {
  ProviderActionPlan,
  ProviderDashboard,
  ProviderMetric,
  ProviderRows,
  ProviderSectionBrief,
  formatKes,
  formatKwh,
  formatPercent,
} from "./ProviderShared";

export function ProviderHomeScreen() {
  return (
    <ProviderDashboard
      section="Home"
      title="Provider Asset Desk"
      subtitle="A clean desk view of the active provider asset: payout, sold solar, and current operating posture."
      actions={["Open asset desk", "Review payout", "Check posture"]}
      renderPanels={(building) => {
        const view = building.roleViews.provider;

        return (
          <>
            <ProviderSectionBrief
              section="Home"
              title="One building, one operating snapshot."
              body="The home screen stays high level so providers can see whether the asset is monetizing and ready for attention."
              building={building}
            />
            <ProviderMetric
              label="Projected payout"
              value={formatKes(view.monthlyPayoutKes)}
              detail="Monthly payout after sold provider shares are removed."
            />
            <ProviderRows
              title="Desk summary"
              rows={[
                { label: "Monetized solar", value: formatKwh(view.monetizedKwh), note: "Prepaid solar consumed by residents.", tone: "good" },
                { label: "Retained stake", value: formatPercent(view.retainedOwnership), note: "Current provider-side cashflow right." },
                { label: "Stage", value: building.project.stage, note: "Current provider operating posture." },
              ]}
            />
            <ProviderActionPlan section="Home" />
          </>
        );
      }}
    />
  );
}
