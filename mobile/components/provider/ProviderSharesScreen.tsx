import {
  ProviderActionPlan,
  ProviderDashboard,
  ProviderOwnershipImpact,
  ProviderRows,
  ProviderSectionBrief,
  formatKes,
  formatPercent,
} from "./ProviderShared";

export function ProviderSharesScreen() {
  return (
    <ProviderDashboard
      section="Shares"
      title="Share ledger"
      subtitle="Retained rights and sold rights."
      actions={["Retained", "Sold", "Ledger"]}
      renderPanels={(building) => {
        const view = building.roleViews.provider;

        return (
          <>
            <ProviderSectionBrief
              section="Shares"
              title="Ownership controls future cashflow."
              body="This screen avoids generation and wallet activity."
              building={building}
            />
            <ProviderOwnershipImpact building={building} />
            <ProviderRows
              title="Ledger"
              eyebrow="Ownership ledger"
              rows={[
                { label: "Provider retained", value: formatPercent(view.retainedOwnership), tone: "good" },
                { label: "Sold to residents", value: formatPercent(view.soldOwnership), tone: view.soldOwnership > 0 ? "warn" : "neutral" },
                { label: "Retained payout", value: formatKes(view.monthlyPayoutKes) },
              ]}
            />
            <ProviderActionPlan section="Shares" />
          </>
        );
      }}
    />
  );
}
