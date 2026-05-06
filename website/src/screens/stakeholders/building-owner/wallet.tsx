import { PortalKpiBar, PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { WalletTransactions, kes } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function BuildingOwnerWallet({ project, data }: PortalScreenProps) {
  const owner = project.roleViews.owner;

  return (
    <>
      <PortalKpiBar items={[
        { label: "Royalty balance", value: kes(owner.monthlyRoyaltyKes), detail: "projected month" },
        { label: "Next-month royalty", value: kes(owner.comparableMedianRoyaltyKes), detail: "median comparison" },
        { label: "Payout rows", value: `${data.walletTransactions.length || 1}`, detail: "wallet cashflow" },
      ]} />
      <div className="portal-two-col">
        <PortalPanel eyebrow="Payout history" title="Royalty cashflow">
          <WalletTransactions rows={data.walletTransactions} />
        </PortalPanel>
        <PortalPanel eyebrow="Projection" title="Pledged demand drives royalty">
          <PortalLedger rows={[
            { label: "Resident demand", value: kes(project.project.prepaidCommittedKes), note: "confirmed pledges" },
            { label: "Sold solar revenue", value: kes(project.settlement.revenue), note: "settlement input" },
            { label: "Owner royalty", value: kes(project.settlement.ownerRoyalty), note: "host stream" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
