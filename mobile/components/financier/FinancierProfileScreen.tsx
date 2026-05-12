import {
  BuildingSnapshotCard,
  FinancierBriefCard,
  FinancierScreenShell,
  MetricRail,
  RecoveryBandCard,
  drsTone,
  formatKesShort,
} from "./FinancierShared";

export function FinancierProfileScreen() {
  return (
    <FinancierScreenShell
      section="Profile"
      title="Account"
      subtitle="Preferences, mandate, and support context."
      actions={["Mandate", "Alerts", "Support"]}
      hero={({ primary }) => ({
        label: "Mandate",
        value: "Named deals",
        sub: `${primary.project.name} is the active account context.`,
      })}
    >
      {({ primary }) => (
        <>
          <BuildingSnapshotCard building={primary} />
          <MetricRail
            items={[
              { label: "Risk view", value: primary.drs.decision, note: "DRS gate", tone: drsTone(primary) },
              { label: "Exposure", value: formatKesShort(primary.roleViews.financier.committedCapitalKes), note: "Active deal" },
              { label: "Alerts", value: String(primary.drs.reasons.length), note: "Open blockers", tone: primary.drs.reasons.length ? "warn" : "good" },
            ]}
          />
          <RecoveryBandCard building={primary} title="Default range view" />
          <FinancierBriefCard
            eyebrow="Settings"
            title="Quiet finance mode."
            body="Concise numbers, readiness gates, and range-first recovery copy."
            rows={[
              { label: "View", value: "Deal room", note: "Building-level exposure." },
              { label: "Alerts", value: "Gates", note: "DRS and release changes." },
              { label: "Support", value: "Context", note: "Messages include active building." },
            ]}
          />
        </>
      )}
    </FinancierScreenShell>
  );
}
