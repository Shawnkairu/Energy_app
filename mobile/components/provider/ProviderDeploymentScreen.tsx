import { View } from "react-native";
import { spacing } from "@emappa/ui";
import { PilotBanner } from "../PilotBanner";
import { SystemProjectImmersiveHero } from "../energy/SystemImmersiveOverview";
import { GateList } from "../roles/RoleCards";
import {
  ProviderActionPlan,
  ProviderDashboard,
  ProviderRows,
  ProviderSectionBrief,
  ProviderTruthCard,
  formatPercent,
} from "./ProviderShared";

export function ProviderProjectsScreen() {
  return (
    <ProviderDashboard
      section="Projects"
      title="Projects"
      subtitle="Current project status, DRS gates, provider lock, delivery proof, and go-live readiness."
      actions={["Current status", "Supplier lock", "Go-live proof"]}
      minimalChrome
      renderPanels={(building) => {
        const view = building.roleViews.provider;
        const completeGates = view.deploymentGates.filter((gate) => gate.complete).length;
        const drs = building.drs;
        const drsProgress = drs.score <= 1 ? drs.score : drs.score / 100;

        return (
          <>
            <PilotBanner
              title="Pilot mode"
              message="Deployment gates use synthetic project data until live readiness proofs attach."
            />
            <View style={{ marginHorizontal: -spacing.lg, marginTop: spacing.sm }}>
              <SystemProjectImmersiveHero
                siteName={building.project.name}
                weatherHint="Projects · DRS & field proof"
                ringLabel="Capital release and scheduling follow the same DRS evidence this Projects tab tracks."
                ringProgress={drsProgress}
                ringCenterHint="DRS"
                statusLine={drs.label ?? drs.decision}
                primaryCtaHint="Current status, supplier lock, go-live proof"
                callouts={[
                  { label: "DRS", value: `${Math.round(drsProgress * 100)}` },
                  { label: "Gates", value: `${completeGates}/${view.deploymentGates.length}` },
                  { label: "Quote", value: building.project.drs.hasVerifiedSupplierQuote ? "Verified" : "Open" },
                  { label: "Lead elec.", value: building.project.drs.hasCertifiedLeadElectrician ? "Assigned" : "Open" },
                ]}
                summaryCards={[
                  { label: "Utilization", value: formatPercent(building.energy.utilization), hint: "Demand", icon: "pulse-outline" },
                  { label: "Monitoring", value: view.monitoringStatus, hint: "Connectivity", icon: "radio-outline" },
                  { label: "Gates done", value: `${completeGates}/${view.deploymentGates.length}`, hint: "Checklist", icon: "shield-checkmark-outline" },
                ]}
              />
            </View>
            <ProviderSectionBrief
              section="Projects"
              title="Project status waits for readiness."
              body="Providers track current project commitments here: what is ready, what is blocked, and what must clear before activation."
              building={building}
            />
            <GateList gates={view.deploymentGates} />
            <ProviderRows
              title="Readiness basis"
              eyebrow="DRS and field proof"
              rows={[
                { label: "DRS decision", value: building.drs.label, note: `Score ${Math.round(building.drs.score)} with ${completeGates}/${view.deploymentGates.length} gates ready.`, tone: building.drs.decision === "deployment_ready" ? "good" : building.drs.decision === "review" ? "warn" : "bad" },
                { label: "Demand coverage", value: formatPercent(building.energy.utilization), note: "Demand below 60% blocks deployment.", tone: building.energy.utilization >= 0.6 ? "good" : "bad" },
                { label: "Supplier quote", value: building.project.drs.hasVerifiedSupplierQuote ? "locked" : "missing", note: "Supplier lock requires verified BOM and quote.", tone: building.project.drs.hasVerifiedSupplierQuote ? "good" : "bad" },
                { label: "Electrician lead", value: building.project.drs.hasCertifiedLeadElectrician ? "assigned" : "missing", note: "A certified lead is required before scheduling.", tone: building.project.drs.hasCertifiedLeadElectrician ? "good" : "bad" },
                { label: "Monitoring", value: view.monitoringStatus, note: "Unresolved monitoring connectivity blocks go-live.", tone: building.project.drs.monitoringConnectivityResolved ? "good" : "bad" },
              ]}
            />
            <ProviderRows
              title="Operational workflow status"
              eyebrow="Scenario E trace"
              rows={[
                {
                  label: "Quote reservation",
                  value: view.quoteReservation?.status.replace(/_/g, " ") ?? "pending",
                  note: view.quoteReservation?.detail ?? "Quote validity and stock reservation are not returned.",
                  tone: workflowTone(view.quoteReservation?.status),
                },
                {
                  label: "Delivery proof",
                  value: view.deliveryEvidence?.status.replace(/_/g, " ") ?? "pending",
                  note: view.deliveryEvidence?.detail ?? "Delivery proof, serials, and warranty docs remain pending.",
                  tone: workflowTone(view.deliveryEvidence?.status),
                },
              ]}
            />
            <ProviderTruthCard
              title="Go-live waits for readiness."
              body="DRS gates capital release, provider lock, electrician scheduling, and activation. Provider assets should not be treated as live before those gates clear."
              tone={building.drs.decision === "deployment_ready" ? "good" : "warn"}
            />
            <ProviderActionPlan section="Projects" />
          </>
        );
      }}
    />
  );
}

export function ProviderDeploymentScreen() {
  return <ProviderProjectsScreen />;
}

function workflowTone(status?: string) {
  if (status === "ready") return "good";
  if (status === "blocked") return "bad";
  return "warn";
}
