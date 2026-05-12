import { PortalKpiBar, PortalLedger, PortalPanel, PortalWorkflow } from "../../../components/PortalPrimitives";
import { PilotBanner, WalletTransactions, kes, kwh, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ResidentWallet({ project, data }: PortalScreenProps) {
  const view = project.roleViews.resident;
  const pledgedTotal = data.prepaidBalance?.confirmed_total_kes ?? view.prepaidBalanceKes;
  const earnings = project.providerPayouts
    .filter((payout) => payout.ownerRole === "resident")
    .reduce((sum, payout) => sum + payout.payout, 0);
  const projectedValue = earnings * 24;
  const hasShares = view.ownedProviderShare > 0;

  return (
    <>
      <PilotBanner>Demo wallet: pledges, savings, and share earnings are shown as separate tracks so the money story stays audit-friendly.</PilotBanner>
      <PortalKpiBar items={[
        { label: "Pledged total", value: kes(pledgedTotal), detail: "confirmed pilot pledges" },
        { label: "Earnings", value: kes(earnings), detail: "share credits" },
        { label: "Net savings", value: kes(view.savingsKes), detail: "vs grid-only" },
      ]} />
      <PortalPanel eyebrow="Wallet logic" title="How resident value is separated">
        <PortalWorkflow
          steps={[
            { label: "Pledge balance", detail: `${kes(pledgedTotal)} reserves prepaid solar for the household.`, status: "no charge" },
            { label: "Energy allocation", detail: `${kwh(view.monthlySolarKwh)} of solar is matched before grid fallback.`, status: pct(view.solarCoverage) },
            { label: "Ownership credits", detail: hasShares ? `${pct(view.ownedProviderShare)} share produces separate earnings.` : "Share earnings appear after resident ownership exists.", status: hasShares ? kes(earnings) : "optional" },
          ]}
        />
      </PortalPanel>
      <div className="portal-two-col">
        <PortalPanel eyebrow="Cashflow" title="Pledges and earnings">
          <WalletTransactions rows={data.walletTransactions} />
        </PortalPanel>
        <PortalPanel eyebrow="Ownership" title="Shares held per array">
          <PortalLedger rows={[
            { label: "Owned provider share", value: pct(view.ownedProviderShare), note: hasShares ? "generation unlocked" : "generation visibility gate" },
            { label: "Projected value", value: kes(projectedValue), note: "24-month pilot estimate" },
            { label: "Marketplace", value: hasShares ? "Asset detail" : "Browse shares", note: "embedded screen" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
