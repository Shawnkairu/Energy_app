import { OwnershipLedgerEntry } from "../design-handoff";
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
      title="Provider Share Ledger"
      subtitle="Ownership changes only: retained rights, sold rights, and future cashflow impact."
      actions={["Review ledger", "Sale impact", "Retained rights"]}
      renderPanels={(building) => {
        const view = building.roleViews.provider;

        return (
          <>
            <ProviderSectionBrief
              section="Shares"
              title="Selling shares is a ledger event."
              body="This screen avoids asset output and deployment detail so the cashflow-rights impact is obvious."
              building={building}
            />
            <OwnershipLedgerEntry lens="provider" />
            <ProviderOwnershipImpact building={building} />
            <ProviderRows
              title="Ledger controls"
              eyebrow="Ownership ledger"
              rows={[
                { label: "Provider retained", value: formatPercent(view.retainedOwnership), note: "Future provider payout that remains with the provider.", tone: "good" },
                { label: "Sold to residents", value: formatPercent(view.soldOwnership), note: "Future payout redirected away from the provider.", tone: view.soldOwnership > 0 ? "warn" : "neutral" },
                { label: "Retained payout", value: formatKes(view.monthlyPayoutKes), note: "Projected against the current ledger only." },
              ]}
            />
            <ProviderActionPlan section="Shares" />
          </>
        );
      }}
    />
  );
}
