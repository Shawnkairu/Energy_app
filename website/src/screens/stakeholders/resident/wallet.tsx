import { PortalKpiBar, PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { WalletTransactions, kes, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ResidentWallet({ project, data }: PortalScreenProps) {
  const view = project.roleViews.resident;
  const earnings = project.providerPayouts
    .filter((payout) => payout.ownerRole === "resident")
    .reduce((sum, payout) => sum + payout.payout, 0);

  return (
    <>
      <PortalKpiBar items={[
        { label: "Pledged total", value: kes(data.prepaidBalance?.confirmed_total_kes ?? view.prepaidBalanceKes), detail: "confirmed pilot pledges" },
        { label: "Earnings", value: kes(earnings), detail: "share credits" },
        { label: "Net savings", value: kes(view.savingsKes), detail: "vs grid-only" },
      ]} />
      <div className="portal-two-col">
        <PortalPanel eyebrow="Cashflow" title="Pledges and earnings">
          <WalletTransactions rows={data.walletTransactions} />
        </PortalPanel>
        <PortalPanel eyebrow="Ownership" title="Shares held per array">
          <PortalLedger rows={[
            { label: "Owned provider share", value: pct(view.ownedProviderShare), note: "generation visibility gate" },
            { label: "Current value", value: kes(earnings * 24), note: "pilot estimate" },
            { label: "Marketplace", value: view.ownedProviderShare > 0 ? "Asset detail" : "Browse shares", note: "embedded screen" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
