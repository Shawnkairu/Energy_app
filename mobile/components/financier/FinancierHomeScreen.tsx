import {
  BuildingSnapshotCard,
  FinancierBriefCard,
  FinancierScreenShell,
  GateRailCard,
  RecoveryBandCard,
  StatusRail,
  drsTone,
  formatKes,
  formatKesShort,
  formatPercent,
} from "./FinancierShared";

function formatStage(stage: string) {
  return stage
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`)
    .join(" ");
}

export function FinancierHomeScreen() {
  return (
    <FinancierScreenShell
      section="Home"
      title="Deal room"
      subtitle="Named exposure, readiness, and recovery range."
      actions={["Open", "DRS", "Range"]}
      showActivity
      hero={({ primary }) => ({
        label: "Active building",
        value: primary.project.name,
        sub: `${primary.project.units} units · ${primary.project.locationBand}`,
      })}
    >
      {({ primary }) => {
        const view = primary.roleViews.financier;
        return (
          <>
            <BuildingSnapshotCard building={primary} />
            <StatusRail
              items={[
                {
                  label: "Committed",
                  value: formatKesShort(view.committedCapitalKes),
                  note: "Named deal",
                  tone: "neutral",
                },
                {
                  label: "Progress",
                  value: formatPercent(view.fundingProgress),
                  note: `${formatKesShort(view.remainingCapitalKes)} open`,
                  tone: "good",
                },
                {
                  label: "DRS",
                  value: `${primary.drs.score}/100`,
                  note: primary.drs.label ?? "Readiness gate",
                  tone: drsTone(primary),
                },
              ]}
            />
            <GateRailCard building={primary} />
            <RecoveryBandCard building={primary} title="Monthly recovery range" />
            <FinancierBriefCard
              eyebrow="Position"
              title="Named building. Named risk."
              body="No pool view. Ranges stay explicit."
              rows={[
                { label: "Site", value: primary.project.locationBand, note: `${primary.project.units} apartments.` },
                { label: "Stage", value: formatStage(primary.project.stage), note: "Moves after gates clear." },
                {
                  label: "Capital",
                  value: formatKes(view.committedCapitalKes),
                  note: `${formatPercent(view.fundingProgress)} funded; ${formatKes(view.remainingCapitalKes)} open.`,
                },
              ]}
            />
          </>
        );
      }}
    </FinancierScreenShell>
  );
}
