import {
  CashflowWaterfallCard,
  FinancierBriefCard,
  FinancierMilestoneBriefCard,
  FinancierScreenShell,
  GateRailCard,
  WalletRailCard,
  formatKesShort,
  formatPercent,
} from "./FinancierShared";

export function FinancierWalletScreen() {
  return (
    <FinancierScreenShell
      section="Wallet"
      title="Cash ledger"
      subtitle="Capital status and monetized recovery only."
      actions={["Capital", "Waterfall", "Releases"]}
      hero={({ primary }) => ({
        label: "Projected monthly",
        value: formatKesShort(primary.roleViews.financier.monthlyRecoveryKes),
        sub: "From sold prepaid solar.",
      })}
    >
      {({ primary }) => (
        <>
          <WalletRailCard building={primary} />
          <CashflowWaterfallCard building={primary} />
          <GateRailCard building={primary} />
          <FinancierMilestoneBriefCard building={primary} />
          <FinancierBriefCard
            eyebrow="Ledger rules"
            title="No free energy payout."
            body="Generated, wasted, curtailed, or free-exported energy does not create recovery."
            rows={[
              {
                label: "Funded",
                value: formatPercent(primary.roleViews.financier.fundingProgress),
                note: `${formatKesShort(primary.roleViews.financier.remainingCapitalKes)} still open.`,
              },
              {
                label: "Source",
                value: "Prepaid",
                note: "Only sold solar enters the waterfall.",
              },
              {
                label: "Status",
                value: primary.project.stage,
                note: "Release follows verified milestones.",
              },
            ]}
          />
        </>
      )}
    </FinancierScreenShell>
  );
}
