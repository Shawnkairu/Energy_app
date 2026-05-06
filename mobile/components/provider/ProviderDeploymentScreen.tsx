import { GateList } from "../roles/RoleCards";
import {
  ProviderActionPlan,
  ProviderDashboard,
  ProviderRows,
  ProviderSectionBrief,
  ProviderTruthCard,
  formatPercent,
} from "./ProviderShared";

export function ProviderDeploymentScreen() {
  return (
    <ProviderDashboard
      section="Deployment"
      title="Readiness Gate Path"
      subtitle="DRS, supplier lock, installer lead, monitoring, and settlement trust before go-live."
      actions={["Review gates", "Supplier lock", "Go-live proof"]}
      renderPanels={(building) => {
        const view = building.roleViews.provider;
        const completeGates = view.deploymentGates.filter((gate) => gate.complete).length;

        return (
          <>
            <ProviderSectionBrief
              section="Deployment"
              title="Deployment waits for readiness."
              body="This path is only about gates: what is ready, what is blocked, and what must clear before activation."
              building={building}
            />
            <GateList gates={view.deploymentGates} />
            <ProviderRows
              title="Readiness basis"
              eyebrow="DRS and field proof"
              rows={[
                { label: "DRS decision", value: building.drs.label, note: `Score ${Math.round(building.drs.score)} with ${completeGates}/${view.deploymentGates.length} gates ready.`, tone: building.drs.decision === "approve" ? "good" : building.drs.decision === "review" ? "warn" : "bad" },
                { label: "Demand coverage", value: formatPercent(building.energy.utilization), note: "Demand below 60% blocks deployment.", tone: building.energy.utilization >= 0.6 ? "good" : "bad" },
                { label: "Supplier quote", value: building.project.drs.hasVerifiedSupplierQuote ? "locked" : "missing", note: "Supplier lock requires verified BOM and quote.", tone: building.project.drs.hasVerifiedSupplierQuote ? "good" : "bad" },
                { label: "Installer lead", value: building.project.drs.hasCertifiedLeadElectrician ? "assigned" : "missing", note: "A certified lead is required before scheduling.", tone: building.project.drs.hasCertifiedLeadElectrician ? "good" : "bad" },
                { label: "Monitoring", value: view.monitoringStatus, note: "Unresolved monitoring connectivity blocks go-live.", tone: building.project.drs.monitoringConnectivityResolved ? "good" : "bad" },
              ]}
            />
            <ProviderTruthCard
              title="Go-live waits for readiness."
              body="DRS gates capital release, supplier lock, installer scheduling, and activation. Provider assets should not be treated as live before those gates clear."
              tone={building.drs.decision === "approve" ? "good" : "warn"}
            />
            <ProviderActionPlan section="Deployment" />
          </>
        );
      }}
    />
  );
}
