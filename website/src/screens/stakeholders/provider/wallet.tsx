import { PortalKpiBar, PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { WalletTransactions, kes } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";
import { ProviderCallout, ProviderMetricRail } from "./providerUi";

export default function ProviderWallet({ project, data }: PortalScreenProps) {
  const view = project.roleViews.provider;
  const equipmentSales = data.inventory.reduce((sum, item) => sum + item.stock * item.unitPriceKes, 0);
  const projectedEquipmentSales = equipmentSales || project.project.capitalRequiredKes * 0.28;
  const incoming = data.walletTransactions
    .filter((row) => row.amountKes > 0)
    .reduce((sum, row) => sum + row.amountKes, 0);
  const outgoing = data.walletTransactions
    .filter((row) => row.amountKes < 0)
    .reduce((sum, row) => sum + Math.abs(row.amountKes), 0);
  const walletNet = incoming - outgoing;
  const payoutBasis = view.monetizedKwh > 0 ? project.settlement.providerPool / view.monetizedKwh : 0;

  return (
    <>
      <PortalKpiBar items={[
        { label: "Equipment sales", value: kes(projectedEquipmentSales), detail: "one-time fulfillment stream" },
        { label: "Share royalties", value: kes(view.monthlyPayoutKes), detail: "recurring sold-solar stream" },
        { label: "Wallet net", value: kes(walletNet || view.monthlyPayoutKes), detail: data.walletTransactions.length ? "posted transaction balance" : "projected pilot balance" },
      ]} />
      <div className="portal-two-col">
        <PortalPanel eyebrow="Cashflow" title="Provider wallet">
          <ProviderMetricRail items={[
            { label: "Incoming", value: kes(incoming || view.monthlyPayoutKes), detail: "royalties and equipment sales" },
            { label: "Outgoing", value: kes(outgoing), detail: "refunds or transfers" },
          ]} />
          <WalletTransactions rows={data.walletTransactions} />
        </PortalPanel>
        <PortalPanel eyebrow="Settlement" title="Only sold solar funds payouts">
          <PortalLedger rows={[
            { label: "Sold-solar revenue", value: kes(project.settlement.revenue), note: "monetized kWh x tariff" },
            { label: "Provider pool", value: kes(project.settlement.providerPool), note: "settlement split" },
            { label: "Provider payout", value: kes(view.monthlyPayoutKes), note: "retained share allocation" },
            { label: "Reserve", value: kes(project.settlement.reserve), note: "held before distributions" },
            { label: "Pool per sold kWh", value: kes(payoutBasis), note: "settlement density" },
          ]} />
          <ProviderCallout label="Wallet clarity" title="Two streams stay separate.">
            <span>Equipment sales are one-time fulfillment payments. Royalties are recurring and depend on retained ownership, monitored generation, and actual sold solar.</span>
          </ProviderCallout>
        </PortalPanel>
      </div>
    </>
  );
}
