import {
  ProviderActionPlan,
  ProviderDashboard,
  ProviderMetric,
  ProviderRows,
  ProviderSectionBrief,
  ProviderTruthCard,
  formatKes,
  formatKwh,
} from "./ProviderShared";

export function ProviderEarningsScreen() {
  return (
    <ProviderDashboard
      section="Earnings"
      title="Earnings"
      subtitle="Cash earned from sold prepaid solar."
      actions={["Payout", "Sold kWh", "Excluded"]}
      renderPanels={(building) => {
        const view = building.roleViews.provider;

        return (
          <>
            <ProviderSectionBrief
              section="Earnings"
              title="Earnings start with sold kWh."
              body="Generation alone is not revenue."
              building={building}
            />
            <ProviderMetric
              label="Projected payout"
              value={formatKes(view.monthlyPayoutKes)}
              detail="Current period estimate"
            />
            <ProviderRows
              title="Earnings basis"
              eyebrow="Settlement"
              rows={[
                { label: "Sold kWh", value: formatKwh(view.monetizedKwh), tone: "good" },
                { label: "Provider pool", value: formatKes(building.settlement.providerPool) },
                { label: "Excluded output", value: formatKwh(view.wasteKwh), tone: view.wasteKwh > 0 ? "warn" : "good" },
              ]}
            />
            <ProviderTruthCard
              title="No prepaid demand, no payout."
              body="Provider earnings do not accrue until residents prepay and consume solar."
            />
            <ProviderActionPlan section="Earnings" />
          </>
        );
      }}
    />
  );
}
