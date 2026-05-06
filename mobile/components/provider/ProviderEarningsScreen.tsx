import { SettlementWaterfall, SoldVsWaste } from "../design-handoff";
import {
  ProviderActionPlan,
  ProviderDashboard,
  ProviderMetric,
  ProviderRows,
  ProviderSectionBrief,
  ProviderTruthCard,
  formatKes,
  formatKwh,
  formatPercent,
} from "./ProviderShared";

export function ProviderEarningsScreen() {
  return (
    <ProviderDashboard
      section="Earnings"
      title="Monetized Solar Payout"
      subtitle="Payout basis only: prepaid solar consumed by residents, provider pool, and excluded output."
      actions={["Track payout", "Revenue basis", "Excluded output"]}
      renderPanels={(building) => {
        const view = building.roleViews.provider;

        return (
          <>
            <ProviderSectionBrief
              section="Earnings"
              title="Earnings start with monetized kWh."
              body="The screen keeps the settlement basis explicit so generation never looks like automatic revenue."
              building={building}
            />
            <SettlementWaterfall role="provider" building={building} />
            <SoldVsWaste building={building} headline="Provider payout = sold kWh" />
            <ProviderMetric
              label="Monthly provider payout"
              value={formatKes(view.monthlyPayoutKes)}
              detail="Projected from monetized solar and retained provider ownership."
            />
            <ProviderRows
              title="Payout basis"
              eyebrow="Settlement"
              rows={[
                { label: "Monetized kWh", value: formatKwh(view.monetizedKwh), note: "Prepaid solar consumed by residents.", tone: "good" },
                { label: "Provider pool", value: formatKes(building.settlement.providerPool), note: "Provider-side pool before ownership split." },
                { label: "Retained rights", value: formatPercent(view.retainedOwnership), note: "Sold shares reduce this payout basis." },
                { label: "Excluded output", value: formatKwh(view.wasteKwh), note: "Generated but unpaid energy is not counted.", tone: view.wasteKwh > 0 ? "warn" : "good" },
              ]}
            />
            <ProviderTruthCard
              title="No prepaid demand, no payout."
              body="If residents have not prepaid and consumed solar, provider earnings do not accrue even when panels generate energy."
            />
            <ProviderActionPlan section="Earnings" />
          </>
        );
      }}
    />
  );
}
