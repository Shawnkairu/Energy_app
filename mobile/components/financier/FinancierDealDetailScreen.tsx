import { BuildingPulse, KillSwitchBanner, SoldVsWaste } from "../design-handoff";
import {
  FinancierDiligenceCard,
  FinancierMilestoneBriefCard,
  FinancierRecoveryBandsCard,
  FinancierScoreArtifact,
  FinancierScreenShell,
} from "./FinancierShared";

export function FinancierDealDetailScreen() {
  return (
    <FinancierScreenShell
      section="Deal Detail"
      title="Deal Diligence"
      subtitle="Evidence, release gates, and downside cases for one building before any capital movement."
      actions={["Review evidence", "Stress cases", "Milestones"]}
      hero={({ primary }) => ({
        label: "Diligence target",
        value: primary.project.name,
        sub: `${primary.project.locationBand} · ${primary.project.units} apartments.`,
      })}
    >
      {({ primary }) => (
        <>
          <BuildingPulse role="financier" building={primary} />
          <KillSwitchBanner building={primary} />
          <FinancierScoreArtifact building={primary} />
          <SoldVsWaste building={primary} headline="What this deal earns from" />
          <FinancierDiligenceCard building={primary} />
          <FinancierMilestoneBriefCard building={primary} />
          <FinancierRecoveryBandsCard building={primary} variant="diligence" />
        </>
      )}
    </FinancierScreenShell>
  );
}
