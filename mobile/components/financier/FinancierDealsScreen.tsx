import { PilotBanner } from "../PilotBanner";
import {
  BuildingSnapshotCard,
  DealPipelineCard,
  FinancierBriefCard,
  FinancierScreenShell,
  MetricRail,
  formatKesShort,
  formatPercent,
} from "./FinancierShared";

export function FinancierDealsScreen() {
  return (
    <FinancierScreenShell
      section="Discover"
      title="Deal cards"
      subtitle="Readiness first. Raise second."
      pilotSlot={
        <PilotBanner
          compact
          title="Pilot mode"
          message="Pilot: pledges are non-binding and no money is charged. Deal and energy figures may be synthesized until live settlement."
        />
      }
      actions={["Cards", "DRS", "Open raise"]}
      hero={({ projects }) => ({
        label: "Active raises",
        value: String(projects.length),
        sub: "Building-specific opportunities.",
      })}
    >
      {({ primary, projects }) => (
        <>
          <BuildingSnapshotCard building={primary} />
          <MetricRail
            items={[
              { label: "Lead DRS", value: `${primary.drs.score}/100`, note: primary.drs.decision },
              { label: "Funded", value: formatPercent(primary.roleViews.financier.fundingProgress), note: "Current raise" },
              { label: "Open", value: formatKesShort(primary.roleViews.financier.remainingCapitalKes), note: "Capital gap" },
            ]}
          />
          <DealPipelineCard projects={projects} />
          <FinancierBriefCard
            eyebrow="Screening"
            title="No hype card."
            body="Each card shows named exposure, DRS, and open capital."
            rows={[
              { label: "Lead", value: primary.project.name, note: `${primary.project.locationBand}; ${primary.project.units} apartments.` },
              {
                label: "Funded",
                value: formatPercent(primary.roleViews.financier.fundingProgress),
                note: `${formatKesShort(primary.roleViews.financier.remainingCapitalKes)} open.`,
              },
              { label: "Gate", value: `${primary.drs.score}/100`, note: primary.drs.label ?? "Readiness gate." },
            ]}
          />
        </>
      )}
    </FinancierScreenShell>
  );
}
