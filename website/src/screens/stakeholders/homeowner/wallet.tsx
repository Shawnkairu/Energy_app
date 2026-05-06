import { PortalKpiBar, PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { WalletTransactions, kes } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function HomeownerWallet({ project, data }: PortalScreenProps) {
  const resident = project.roleViews.resident;
  const owner = project.roleViews.owner;
  const provider = project.roleViews.provider;

  return (
    <>
      <PortalKpiBar items={[
        { label: "Pledged total", value: kes(data.prepaidBalance?.confirmed_total_kes ?? resident.prepaidBalanceKes), detail: "resident stream" },
        { label: "Royalties earned", value: kes(owner.monthlyRoyaltyKes), detail: "rooftop stream" },
        { label: "Share earnings", value: kes(provider.monthlyPayoutKes), detail: "retained share stream" },
      ]} />
      <div className="portal-two-col">
        <PortalPanel eyebrow="Cashflow" title="Three-stream wallet">
          <WalletTransactions rows={data.walletTransactions} />
        </PortalPanel>
        <PortalPanel eyebrow="Segments" title="Cashflow / Ownership / Pledges">
          <PortalLedger rows={[
            { label: "Cashflow", value: kes((data.walletBalance?.kes ?? 0) + owner.monthlyRoyaltyKes), note: "credits and debits" },
            { label: "Ownership", value: kes(provider.monthlyPayoutKes * 24), note: "own-array position" },
            { label: "Pledges", value: `${data.prepaidHistory.length || 1} rows`, note: "confirmed history" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
