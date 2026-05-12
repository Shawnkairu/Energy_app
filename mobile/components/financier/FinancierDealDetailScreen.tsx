import {
  BuildingSnapshotCard,
  CashflowWaterfallCard,
  FinancierDiligenceCard,
  FinancierMilestoneBriefCard,
  FinancierScoreArtifact,
  FinancierScreenShell,
  GateRailCard,
  RecoveryBandCard,
} from "./FinancierShared";

export function FinancierDealDetailScreen() {
  return (
    <FinancierScreenShell
      section="Deal"
      title="Diligence"
      subtitle="Evidence, gates, and monetized cashflow."
      actions={["Evidence", "Gates", "Range"]}
      hero={({ primary }) => ({
        label: "Target",
        value: primary.project.name,
        sub: `${primary.project.locationBand} · ${primary.project.units} apartments.`,
      })}
    >
      {({ primary }) => (
        <>
          <BuildingSnapshotCard building={primary} />
          <FinancierScoreArtifact building={primary} />
          <GateRailCard building={primary} />
          <CashflowWaterfallCard building={primary} />
          <FinancierDiligenceCard building={primary} />
          <FinancierMilestoneBriefCard building={primary} />
          <RecoveryBandCard building={primary} title="Stress band" />
        </>
      )}
    </FinancierScreenShell>
  );
}
