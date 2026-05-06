import {
  OwnerBriefCard,
  OwnerJourneyCard,
  OwnerMetricGrid,
  OwnerScreenShell,
  decisionTone,
  formatPercent,
  stageLabel,
} from "./OwnerShared";

export function OwnerDeploymentScreen() {
  return (
    <OwnerScreenShell
      section="Deployment"
      title="Deployment Journey"
      subtitle="A timeline for owner access, resident readiness, supplier lock, installer proof, monitoring, and go-live."
      actions={["Confirm access", "Invite residents", "Track go-live"]}
      hero={(building) => ({
        label: "Current stage",
        value: stageLabel(building.project.stage),
        sub: `${building.project.name} advances only after readiness gates are cleared.`,
        tone: decisionTone(building.drs.decision),
        status: building.drs.decision,
      })}
    >
      {(building) => {
        const view = building.roleViews.owner;
        const drsInput = building.project.drs;
        const readyGates = view.gates.filter((gate) => gate.complete).length;

        return (
          <>
            <OwnerMetricGrid
              metrics={[
                {
                  label: "Journey progress",
                  value: `${readyGates}/${view.gates.length}`,
                  detail: "Required handoffs ready.",
                  tone: readyGates === view.gates.length ? "good" : "warn",
                },
                {
                  label: "Residents",
                  value: formatPercent(view.residentParticipation),
                  detail: "Pre-onboarding demand signal.",
                  tone: view.residentParticipation >= 0.8 ? "good" : "warn",
                },
                {
                  label: "Supplier lock",
                  value: drsInput.hasVerifiedSupplierQuote ? "locked" : "pending",
                  detail: "BOM and quote proof before scheduling.",
                  tone: drsInput.hasVerifiedSupplierQuote ? "good" : "bad",
                },
                {
                  label: "Installer proof",
                  value: drsInput.hasCertifiedLeadElectrician ? "assigned" : "missing",
                  detail: "Certified lead electrician is a deployment kill switch.",
                  tone: drsInput.hasCertifiedLeadElectrician ? "good" : "bad",
                },
              ]}
            />
            <OwnerBriefCard
              eyebrow="Go-live path"
              title="Activation is a sequence, not a status card."
              body="This screen keeps the owner oriented around the path to deployment: access first, demand next, partner proof, then monitored go-live."
              rows={[
                {
                  label: "Building access",
                  value: drsInput.ownerPermissionsComplete ? "ready" : "blocked",
                  note: "Inspection and installation access must be confirmed before the site can move.",
                  tone: drsInput.ownerPermissionsComplete ? "good" : "bad",
                },
                {
                  label: "Resident onboarding",
                  value: formatPercent(view.residentParticipation),
                  note: "Owners drive resident pre-onboarding so demand exists before solar allocation.",
                  tone: view.residentParticipation >= 0.6 ? "good" : "bad",
                },
                {
                  label: "Monitoring",
                  value: drsInput.monitoringConnectivityResolved ? "online" : "blocked",
                  note: "Unresolved monitoring connectivity blocks go-live even if installation is complete.",
                  tone: drsInput.monitoringConnectivityResolved ? "good" : "bad",
                },
              ]}
            />
            <OwnerJourneyCard
              title="Owner and partner handoffs"
              items={[
                {
                  label: "Access window",
                  detail: "Keep permission, rooftop access, and meter room availability explicit.",
                  status: drsInput.ownerPermissionsComplete ? "ready" : "blocked",
                  tone: drsInput.ownerPermissionsComplete ? "good" : "bad",
                },
                {
                  label: "Resident pre-onboarding",
                  detail: "Deployment should not move ahead of prepaid demand.",
                  status: view.residentParticipation >= 0.6 ? "qualified" : "short",
                  tone: view.residentParticipation >= 0.6 ? "good" : "bad",
                },
                {
                  label: "Supplier lock",
                  detail: "BOM and quote proof are required before installer scheduling.",
                  status: drsInput.hasVerifiedSupplierQuote ? "locked" : "pending",
                  tone: drsInput.hasVerifiedSupplierQuote ? "good" : "warn",
                },
                {
                  label: "Installer assignment",
                  detail: "Certified labor must be assigned before installation can start.",
                  status: drsInput.hasCertifiedLeadElectrician ? "assigned" : "missing",
                  tone: drsInput.hasCertifiedLeadElectrician ? "good" : "bad",
                },
                {
                  label: "Monitoring go-live",
                  detail: "Connectivity and settlement trust must be clean before activation.",
                  status: drsInput.monitoringConnectivityResolved ? "online" : "blocked",
                  tone: drsInput.monitoringConnectivityResolved ? "good" : "bad",
                },
              ]}
            />
          </>
        );
      }}
    </OwnerScreenShell>
  );
}
