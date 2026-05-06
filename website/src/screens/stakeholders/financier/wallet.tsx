import { PortalKpiBar, PortalPanel } from "../../../components/PortalPrimitives";
import { WalletTransactions, kes } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function FinancierWallet({ project, data }: PortalScreenProps) {
  const view = project.roleViews.financier;

  return (
    <>
      <PortalKpiBar items={[
        { label: "Cash available", value: kes(view.remainingCapitalKes), detail: "uncommitted" },
        { label: "Cash deployed", value: kes(view.committedCapitalKes), detail: "named deals" },
        { label: "Returns received", value: kes(project.settlement.financierPool), detail: "settlement stream" },
      ]} />
      <PortalPanel eyebrow="Cashflow" title="Deployments out, returns in">
        <WalletTransactions rows={data.walletTransactions} />
      </PortalPanel>
    </>
  );
}
