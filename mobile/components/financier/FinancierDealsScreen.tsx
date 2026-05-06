import { BuildingPulse, KillSwitchBanner } from "../design-handoff";
import { FinancierBriefCard, FinancierScreenShell, DealPipelineCard, formatKes, formatPercent } from "./FinancierShared";

export function FinancierDealsScreen() {
  return (
    <FinancierScreenShell
      section="Deals"
      title="Named Building Deals"
      subtitle="A compact pipeline of building-specific raises, sorted around readiness and remaining capital."
      actions={["Browse deals", "Compare DRS", "Review raise"]}
      hero={({ projects }) => ({
        label: "Active raises",
        value: String(projects.length),
        sub: "Sorted by readiness and remaining capital.",
      })}
    >
      {({ primary, projects }) => (
        <>
          <BuildingPulse role="financier" building={primary} />
          <KillSwitchBanner building={primary} />
          <DealPipelineCard projects={projects} />
          <FinancierBriefCard
            eyebrow="Screening focus"
            title="Funding follows readiness, not deal hype."
            body="The deal list keeps DRS, prepaid demand, supplier readiness, and the remaining raise in front of the financier before any commitment."
            rows={[
              { label: "Current lead", value: primary.project.name, note: `${primary.project.locationBand}; ${primary.project.units} apartments.` },
              {
                label: "Funding progress",
                value: formatPercent(primary.roleViews.financier.fundingProgress),
                note: `${formatKes(primary.roleViews.financier.remainingCapitalKes)} remains to close this raise.`,
              },
              { label: "DRS gate", value: `${primary.drs.score}/100`, note: primary.drs.label ?? "Deployment readiness controls capital release." },
            ]}
          />
        </>
      )}
    </FinancierScreenShell>
  );
}
