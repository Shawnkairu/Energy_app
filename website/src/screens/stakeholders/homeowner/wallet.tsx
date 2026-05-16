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
        { label: "Savings / offset", value: kes(owner.monthlyRoyaltyKes), detail: "no host royalty on your own roof" },
        { label: "External / share", value: kes(provider.monthlyPayoutKes), detail: "export, trading, or ownership pool only" },
      ]} />
      <div className="portal-two-col">
        <PortalPanel eyebrow="Cashflow" title="Segmented wallet">
          <p>Pledges, avoided grid cost (savings), and external monetization or share earnings stay separate — self-consumption is not cash income.</p>
          <WalletTransactions rows={data.walletTransactions} />
        </PortalPanel>
        <PortalPanel eyebrow="Segments" title="Account composition">
          <PortalLedger rows={[
            { label: "Cashflow", value: kes(cashBalance), note: "wallet balance; savings shown separately" },
            { label: "Net effective offset", value: kes(owner.monthlyRoyaltyKes), note: "savings vs grid — not host royalty" },
            { label: "Ownership", value: kes(provider.monthlyPayoutKes * 24), note: "own-array position" },
            { label: "Pledges", value: `${data.prepaidHistory.length || 1} rows`, note: "confirmed history" },
            { label: "Retained share", value: pct(provider.retainedOwnership), note: "rooftop economics" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
