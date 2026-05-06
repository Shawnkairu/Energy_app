import { BuildingPulse, KillSwitchBanner, SettlementWaterfall } from "../design-handoff";
import {
  DealPipelineCard,
  FinancierRecoveryBandsCard,
  FinancierScreenShell,
  StatusRail,
  formatKes,
} from "./FinancierShared";

export function FinancierPortfolioScreen() {
  return (
    <FinancierScreenShell
      section="Portfolio"
      title="Recovery Portfolio"
      subtitle="Named exposure and projected recovery bands, kept separate from deal-room diligence."
      actions={["Track exposure", "Recovery ranges", "Review deals"]}
      hero={({ primary }) => ({
        label: "Total committed",
        value: formatKes(primary.roleViews.financier.committedCapitalKes),
        sub: `${formatKes(primary.roleViews.financier.monthlyRecoveryKes)} projected monthly recovery from the active building.`,
      })}
    >
      {({ primary, projects }) => (
        <>
          <BuildingPulse role="financier" building={primary} />
          <KillSwitchBanner building={primary} />
          <StatusRail
            items={[
              { label: "Exposure", value: formatKes(primary.roleViews.financier.committedCapitalKes), note: "Committed to primary named deal.", tone: "neutral" },
              { label: "Recovery", value: formatKes(primary.roleViews.financier.monthlyRecoveryKes), note: "Projected monthly waterfall.", tone: "good" },
            ]}
          />
          <DealPipelineCard projects={projects} />
          <SettlementWaterfall role="financier" building={primary} />
          <FinancierRecoveryBandsCard building={primary} variant="portfolio" />
        </>
      )}
    </FinancierScreenShell>
  );
}
