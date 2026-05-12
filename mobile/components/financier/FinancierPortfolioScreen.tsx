import {
  BuildingSnapshotCard,
  CashflowWaterfallCard,
  DealPipelineCard,
  FinancierScreenShell,
  RecoveryBandCard,
  StatusRail,
  formatKesShort,
} from "./FinancierShared";

export function FinancierPortfolioScreen() {
  return (
    <FinancierScreenShell
      section="Portfolio"
      title="Positions"
      subtitle="Exposure, recovery band, and named deals."
      actions={["Exposure", "Range", "Deals"]}
      hero={({ primary }) => ({
        label: "Total committed",
        value: formatKesShort(primary.roleViews.financier.committedCapitalKes),
        sub: `${formatKesShort(primary.roleViews.financier.monthlyRecoveryKes)} projected monthly recovery.`,
      })}
    >
      {({ primary, projects }) => (
        <>
          <BuildingSnapshotCard building={primary} />
          <StatusRail
            items={[
              { label: "Exposure", value: formatKesShort(primary.roleViews.financier.committedCapitalKes), note: "Named deal.", tone: "neutral" },
              { label: "Recovery", value: formatKesShort(primary.roleViews.financier.monthlyRecoveryKes), note: "Projected monthly.", tone: "good" },
              { label: "Open", value: formatKesShort(primary.roleViews.financier.remainingCapitalKes), note: "Unfunded.", tone: "neutral" },
            ]}
          />
          <DealPipelineCard projects={projects} />
          <CashflowWaterfallCard building={primary} />
          <RecoveryBandCard building={primary} />
        </>
      )}
    </FinancierScreenShell>
  );
}
