import { PortalKpiBar, PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { WalletTransactions, kes } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ProviderWallet({ project, data }: PortalScreenProps) {
  const view = project.roleViews.provider;
  const equipmentSales = data.inventory.reduce((sum, item) => sum + item.stock * item.unitPriceKes, 0);

  return (
    <>
      <PortalKpiBar items={[
        { label: "Equipment sales", value: kes(equipmentSales || project.project.capitalRequiredKes * 0.28), detail: "one-shot stream" },
        { label: "Share royalties", value: kes(view.monthlyPayoutKes), detail: "recurring stream" },
        { label: "Projected next month", value: kes(view.monthlyPayoutKes * 1.04), detail: "pilot forecast" },
      ]} />
      <div className="portal-two-col">
        <PortalPanel eyebrow="Cashflow" title="Provider wallet">
          <WalletTransactions rows={data.walletTransactions} />
        </PortalPanel>
        <PortalPanel eyebrow="Settlement" title="Only monetized solar pays">
          <PortalLedger rows={[
            { label: "Generated", value: kes(project.settlement.revenue), note: "sold-solar revenue" },
            { label: "Provider pool", value: kes(project.settlement.providerPool), note: "settlement split" },
            { label: "Reserve", value: kes(project.settlement.reserve), note: "held back" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
