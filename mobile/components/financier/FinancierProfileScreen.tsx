import { ProfileEssentials } from "../ProfileEssentials";
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
            title="Compliance-gated finance mode."
            body="Concise numbers, readiness gates, range-first recovery copy, and explicit pilot boundaries for KYC and escrow."
            rows={[
              { label: "View", value: "Deal room", note: "Building-level exposure." },
              { label: "KYC / escrow", value: primary.roleViews.financier.kycEscrow?.status.replace(/_/g, " ") ?? "prototype", note: primary.roleViews.financier.kycEscrow?.detail ?? "Pilot status only.", tone: "warn" },
              { label: "Support", value: "Context", note: "Messages include active building and compliance state." },
            ]}
          />
          <ProfileEssentials
            roleLabel="Financier"
            accountRows={[
              { label: "Deal context", value: primary.project.name, note: "named-building funding only" },
              { label: "Disclosure mode", value: "Range-first", note: "no guaranteed ROI" },
            ]}
            supportSubject={`Financier support - ${primary.project.name}`}
          />
        </>
      )}
    </FinancierScreenShell>
  );
}
