import { PortalKpiBar, PortalLedger, PortalPanel, PortalWorkflow } from "../../../components/PortalPrimitives";
import { WalletTransactions, kes } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function FinancierWallet({ project, data }: PortalScreenProps) {
  const view = project.roleViews.financier;
  const transactions = data.walletTransactions.length ? data.walletTransactions : [
    {
      id: "capital-deploy-preview",
      userId: "financier-demo",
      at: new Date().toISOString(),
      kind: "capital_deploy" as const,
      amountKes: -Math.min(125000, view.committedCapitalKes || view.remainingCapitalKes),
      reference: `${project.project.name} reserved capital`,
    },
    {
      id: "capital-return-preview",
      userId: "financier-demo",
      at: new Date().toISOString(),
      kind: "capital_return" as const,
      amountKes: view.monthlyRecoveryKes,
      reference: "Projected sold-solar recovery",
    },
  ];
  const moneyIn = transactions.filter((row) => row.amountKes > 0).reduce((sum, row) => sum + row.amountKes, 0);
  const moneyOut = transactions.filter((row) => row.amountKes < 0).reduce((sum, row) => sum + Math.abs(row.amountKes), 0);
  const netFlow = moneyIn - moneyOut;

  return (
    <>
      <PortalKpiBar items={[
        { label: "Cash available", value: kes(view.remainingCapitalKes), detail: "uncommitted" },
        { label: "Cash deployed", value: kes(view.committedCapitalKes), detail: "named deals" },
        { label: "Returns received", value: kes(moneyIn), detail: "wallet inflow" },
        { label: "Net flow", value: kes(netFlow), detail: "selected ledger rows" },
      ]} />
      <div className="portal-main-grid">
        <PortalPanel eyebrow="Cashflow" title="Deployments out, returns in">
          <WalletTransactions rows={transactions} />
        </PortalPanel>
        <PortalPanel eyebrow="Treasury rules" title="Money movement guardrails">
          <PortalLedger rows={[
            { label: "Deployment release", value: "After DRS gate", note: `${project.drs.score} readiness score` },
            { label: "Return trigger", value: "Sold kWh", note: `${kes(project.settlement.financierPool)} modeled recovery` },
            { label: "Pilot charge", value: "KSh 0", note: "no money charged" },
            { label: "Audit trail", value: "Append-only", note: `${transactions.length} visible rows` },
          ]} />
          <PortalWorkflow steps={[
            { label: "Reserve", detail: "Capital is marked against a named building.", status: "non-binding" },
            { label: "Deploy", detail: `Release requires ${project.drs.label.toLowerCase()} readiness evidence.`, status: project.drs.decision },
            { label: "Settle", detail: "Returns flow from sold solar into the wallet ledger.", status: moneyIn > 0 ? "active" : "waiting" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
