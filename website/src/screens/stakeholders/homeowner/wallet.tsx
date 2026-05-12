import { PortalKpiBar, PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { WalletTransactions, kes, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function HomeownerWallet({ project, data }: PortalScreenProps) {
  const resident = project.roleViews.resident;
  const owner = project.roleViews.owner;
  const provider = project.roleViews.provider;
  const cashBalance = data.walletBalance?.kes ?? 0;
  const confirmedPledges = data.prepaidBalance?.confirmed_total_kes ?? resident.prepaidBalanceKes;

  return (
    <>
      <PortalKpiBar items={[
        { label: "Pledged total", value: kes(confirmedPledges), detail: "resident stream" },
        { label: "Royalties earned", value: kes(owner.monthlyRoyaltyKes), detail: "rooftop stream" },
        { label: "Share earnings", value: kes(provider.monthlyPayoutKes), detail: "retained share stream" },
      ]} />
      <div className="portal-two-col">
        <PortalPanel eyebrow="Cashflow" title="Three-stream wallet">
          <p>Pledges, rooftop royalties, and retained-share earnings stay visibly separate while still rolling into one homeowner account.</p>
          <WalletTransactions rows={data.walletTransactions} />
        </PortalPanel>
        <PortalPanel eyebrow="Segments" title="Account composition">
          <PortalLedger rows={[
            { label: "Cashflow", value: kes(cashBalance + owner.monthlyRoyaltyKes), note: "available plus projected royalty" },
            { label: "Ownership", value: kes(provider.monthlyPayoutKes * 24), note: "own-array position" },
            { label: "Pledges", value: `${data.prepaidHistory.length || 1} rows`, note: "confirmed history" },
            { label: "Retained share", value: pct(provider.retainedOwnership), note: "rooftop economics" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
