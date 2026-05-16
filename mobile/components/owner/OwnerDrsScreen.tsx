import { View } from "react-native";
import { SystemProjectImmersiveHero } from "../energy/SystemImmersiveOverview";
import {
  OwnerBriefCard,
  OwnerGateCard,
  OwnerMetricGrid,
  OwnerProgressCard,
  OwnerScoreArtifact,
  OwnerScreenShell,
  decisionTone,
  formatPercent,
} from "./OwnerShared";

export function OwnerDrsScreen() {
  return (
    <OwnerScreenShell
      section="DRS"
      title="Readiness Score"
      subtitle="Readiness only: the score, open gates, and kill switches that decide whether the building can advance."
      actions={["Resolve blockers", "Request inspection", "Review gates"]}
      hero={(building) => ({
        label: "Deployment readiness",
        value: `${building.drs.score}/100`,
        sub: `${building.drs.label}. Open blockers prevent premature deployment and go-live.`,
        tone: decisionTone(building.drs.decision),
        status: building.drs.decision,
      })}
    >
      {(building) => {
        const view = building.roleViews.owner;
        const openGates = view.gates.filter((gate) => !gate.complete);
        const components = building.drs.components;
        const drsProgress = building.drs.score <= 1 ? building.drs.score : building.drs.score / 100;
        const gates = view.gates;
        const gateDone = gates.filter((g) => g.complete).length;

        return (
          <>
            <View style={{ marginHorizontal: -20, marginTop: 8 }}>
              <SystemProjectImmersiveHero
                siteName={building.project.name}
                weatherHint="Owner readiness · DRS"
                ringLabel="Owner view tracks DRS, resident participation, and prepaid signal before capital and install move."
                ringProgress={drsProgress}
                ringCenterHint="DRS"
                statusLine={building.drs.label ?? building.drs.decision}
                primaryCtaHint="Resolve blockers & review gates"
                callouts={[
                  { label: "DRS", value: `${Math.round(drsProgress * 100)}` },
                  { label: "Stage", value: building.project.stage },
                  { label: "Gates", value: `${gateDone}/${gates.length}` },
                  { label: "Prepaid", value: formatPercent(view.prepaidCoverage) },
                ]}
                summaryCards={[
                  { label: "Open gates", value: String(openGates.length), hint: "Need attention", icon: "alert-circle-outline" },
                  { label: "Participation", value: formatPercent(view.residentParticipation), hint: "Demand", icon: "people-outline" },
                  { label: "Prepaid", value: formatPercent(view.prepaidCoverage), hint: "Cash signal", icon: "wallet-outline" },
                ]}
              />
            </View>
            <OwnerScoreArtifact
              score={building.drs.score}
              label={building.drs.label}
              decision={building.drs.decision}
              components={components}
              blockers={building.drs.reasons}
            />
            <OwnerMetricGrid
              metrics={[
                {
                  label: "Decision",
                  value: building.drs.decision,
                  detail: "Capital, provider lock, electrician scheduling, and go-live follow this gate.",
                  tone: decisionTone(building.drs.decision),
                },
                {
                  label: "Open gates",
                  value: `${openGates.length}`,
                  detail: openGates.length === 0 ? "All deployment gates are ready." : "Resolve before activation.",
                  tone: openGates.length === 0 ? "good" : "warn",
                },
                {
                  label: "Participation",
                  value: formatPercent(view.residentParticipation),
                  detail: "Demand below 60% blocks deployment.",
                  tone: view.residentParticipation >= 0.6 ? "good" : "bad",
                },
                {
                  label: "Prepaid",
                  value: formatPercent(view.prepaidCoverage),
                  detail: "No prepaid funds blocks deployment.",
                  tone: view.prepaidCoverage > 0 ? "good" : "bad",
                },
              ]}
            />
            <OwnerProgressCard
              title="Weighted score inputs"
              rows={[
                { label: "Demand coverage", value: components.demandCoverage, detail: "Resident demand signal used by DRS.", tone: components.demandCoverage >= 60 ? "good" : "bad" },
                { label: "Prepaid commitment", value: components.prepaidCommitment, detail: "Prepaid cash committed before allocation.", tone: components.prepaidCommitment > 0 ? "good" : "bad" },
                { label: "Load profile", value: components.loadProfile, detail: "Quality of building demand shape.", tone: components.loadProfile >= 65 ? "good" : "warn" },
                { label: "Installation", value: components.installationReadiness, detail: "Site and permission readiness.", tone: components.installationReadiness >= 65 ? "good" : "warn" },
                { label: "Electrician / labor", value: components.electricianReadiness, detail: "Certified crew readiness.", tone: components.electricianReadiness >= 65 ? "good" : "warn" },
                { label: "Capital alignment", value: components.capitalAlignment, detail: "Named building capital progress.", tone: components.capitalAlignment >= 65 ? "good" : "warn" },
              ]}
            />
            <OwnerGateCard gates={view.gates} title="Activation gates" />
            <OwnerBriefCard
              eyebrow="Kill switches"
              title={building.drs.reasons.length === 0 ? "No active kill switches." : "Open blockers are visible before activation."}
              body="DRS blocks deployment when demand, prepaid cash, certified labor, supplier proof, monitoring, settlement trust, or owner permission is not ready."
              rows={(building.drs.reasons.length > 0 ? building.drs.reasons : ["No blocking readiness reasons returned."]).map((reason) => ({
                label: "Blocker",
                value: building.drs.reasons.length > 0 ? "open" : "clear",
                note: reason,
                tone: building.drs.reasons.length > 0 ? "bad" : "good",
              }))}
            />
          </>
        );
      }}
    </OwnerScreenShell>
  );
}
