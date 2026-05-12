import { PortalKpiBar, PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { WalletTransactions, kes } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ElectricianWallet({ project, user, data }: PortalScreenProps) {
  const milestoneRateKes = 8500;
  const openMilestones = Math.max(0, project.roleViews.installer.checklistTotal - project.roleViews.installer.checklistComplete);
  const pendingMilestonesKes = openMilestones * milestoneRateKes;
  const activeJobPayKes = data.jobs
    .filter((job) => job.status === "active")
    .reduce((sum, job) => sum + job.payEstimateKes, 0);
  const projectedPipelineKes = Math.max(activeJobPayKes, project.roleViews.installer.checklistTotal * milestoneRateKes);
  const transactions = data.walletTransactions.length ? data.walletTransactions : [
    {
      id: "install-mobilization",
      userId: user.id,
      at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      kind: "job_payment" as const,
      amountKes: 14000,
      reference: `${project.project.name} mobilization`,
    },
    {
      id: "inspection-signoff",
      userId: user.id,
      at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      kind: "job_payment" as const,
      amountKes: 9500,
      reference: "Inspection sign-off",
    },
  ];
  const jobPaymentsKes = transactions
    .filter((row) => row.kind === "job_payment")
    .reduce((sum, row) => sum + Math.max(0, row.amountKes), 0);
  const walletBalanceKes = data.walletBalance?.kes ?? jobPaymentsKes;

  return (
    <>
      <PortalKpiBar items={[
        { label: "Wallet balance", value: kes(walletBalanceKes), detail: "available" },
        { label: "Job payments", value: kes(jobPaymentsKes), detail: "received" },
        { label: "Pending milestones", value: kes(pendingMilestonesKes), detail: `${openMilestones} open` },
        { label: "Projected pipeline", value: kes(projectedPipelineKes * 1.4), detail: "next jobs" },
      ]} />
      <div className="portal-two-col">
        <PortalPanel eyebrow="Cashflow" title="Job payments and payout history">
          <WalletTransactions rows={transactions} />
        </PortalPanel>
        <PortalPanel eyebrow="Settlement" title="Milestone payout clarity">
          <PortalLedger rows={[
            { label: "Paid on", value: "Signed proof", note: "checklist item accepted" },
            { label: "Rate model", value: kes(milestoneRateKes), note: "per demo milestone" },
            { label: "Hold reason", value: openMilestones ? "Open proof" : "None", note: project.roleViews.installer.certified ? "compliance clear" : "certification pending" },
            { label: "Next payout", value: openMilestones ? kes(milestoneRateKes) : "Ready", note: openMilestones ? "after next sign-off" : "queue clear" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
