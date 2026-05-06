import { PortalKpiBar, PortalPanel } from "../../../components/PortalPrimitives";
import { WalletTransactions, kes } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ElectricianWallet({ project, data }: PortalScreenProps) {
  const pipeline = project.roleViews.installer.checklistTotal * 8500;

  return (
    <>
      <PortalKpiBar items={[
        { label: "Job earnings", value: kes(pipeline), detail: "active work" },
        { label: "Paid out", value: kes(data.walletBalance?.kes ?? 0), detail: "wallet balance" },
        { label: "Projected pipeline", value: kes(pipeline * 1.4), detail: "next jobs" },
      ]} />
      <PortalPanel eyebrow="Cashflow" title="Job payments and payout history">
        <WalletTransactions rows={data.walletTransactions} />
      </PortalPanel>
    </>
  );
}
