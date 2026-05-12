import { ProviderActionPlan, ProviderDashboard, ProviderRows, ProviderWalletSummary, formatKes } from "./ProviderShared";

export function ProviderWalletScreen() {
  return (
    <ProviderDashboard
      section="Wallet"
      title="Wallet"
      subtitle="Available balance, pending settlement, and transfer history."
      actions={["Available", "Pending", "Transfers"]}
      renderPanels={(building) => {
        const view = building.roleViews.provider;

        return (
          <>
            <ProviderWalletSummary building={building} />
            <ProviderRows
              title="Transfer rail"
              eyebrow="Wallet"
              rows={[
                { label: "Available now", value: formatKes(Math.round(view.monthlyPayoutKes * 0.72)), tone: "good" },
                { label: "Pending", value: formatKes(Math.round(view.monthlyPayoutKes * 0.28)) },
                { label: "Last payout", value: formatKes(Math.round(view.monthlyPayoutKes * 0.48)) },
              ]}
            />
            <ProviderActionPlan section="Wallet" />
          </>
        );
      }}
    />
  );
}
