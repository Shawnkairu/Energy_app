import { View } from "react-native";
import {
  InstallerActionList,
  InstallerBrief,
  InstallerEvidenceList,
  InstallerMetricCard,
  InstallerScaffold,
} from "./InstallerShared";

export function InstallerChecklistScreen() {
  return (
    <InstallerScaffold
      section="Checklist"
      title="Go-Live"
      subtitle="Close the proof. Then activate."
      actions={["Capture proof", "Request signoff", "Crew queue"]}
      hero={(building) => ({
        label: "Checklist",
        value: `${building.roleViews.electrician.checklistComplete}/${building.roleViews.electrician.checklistTotal}`,
        sub: "Evidence complete",
        tone:
          building.roleViews.electrician.checklistComplete === building.roleViews.electrician.checklistTotal
            ? "good"
            : "warn",
      })}
    >
      {(building) => {
        const view = building.roleViews.electrician;
        const drs = building.project.drs;
        const checklistComplete = view.checklistComplete === view.checklistTotal;

        return (
          <>
            <InstallerBrief
              eyebrow="Activation"
              title={checklistComplete ? "Ready for ops." : "Finish proof."}
              body="DRS deployment gates."
              rows={[
                {
                  label: "Photos",
                  value: "Needed",
                  note: "DB, roof, solar path, apartment ATS.",
                  tone: "warn",
                },
                {
                  label: "Apartment path",
                  value:
                    drs.solarApartmentCapacityFitVerified &&
                    drs.apartmentAtsMeterMappingVerified &&
                    drs.atsKplcSwitchingVerified
                      ? "Aligned"
                      : "Open",
                  note: "Capacity fit, ATS map, KPLC switch test.",
                  tone:
                    drs.solarApartmentCapacityFitVerified &&
                    drs.apartmentAtsMeterMappingVerified &&
                    drs.atsKplcSwitchingVerified
                      ? "good"
                      : "bad",
                },
                {
                  label: "Signoff",
                  value: view.signoff?.status.replace(/_/g, " ") ?? (checklistComplete ? "Ready" : "Pending"),
                  note: view.signoff?.detail ?? "After proof.",
                  tone: view.signoff?.status === "ready" || checklistComplete ? "good" : "warn",
                },
              ]}
            />

            <InstallerEvidenceList
              title="Proof checklist"
              items={[
                { label: "Site photos", detail: "DB, roof, e.mappa solar path, apartment ATS.", complete: drs.apartmentAtsMeterMappingVerified },
                { label: "Capacity fit", detail: "Solar vs participating apartments.", complete: drs.solarApartmentCapacityFitVerified },
                { label: "ATS / PAYG map", detail: "Per-unit ATS at or near PAYG meter.", complete: drs.apartmentAtsMeterMappingVerified },
                { label: "Switching test", detail: "ATS selects solar path vs KPLC.", complete: drs.atsKplcSwitchingVerified },
                { label: "Connectivity", detail: "Monitoring online.", complete: drs.monitoringConnectivityResolved },
                { label: "Ops signoff", detail: "Activation approval.", complete: checklistComplete && drs.settlementDataTrusted },
                { label: "AI evidence queue", detail: view.aiEvidenceIngestion?.detail ?? "Placeholder only; no automatic gate approval.", complete: false },
              ]}
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard
                  label="Monitoring"
                  value={drs.monitoringConnectivityResolved ? "Online" : "Blocked"}
                  detail="Activation gate."
                />
              </View>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard
                  label="Telemetry"
                  value={drs.settlementDataTrusted ? "Trusted" : "Paused"}
                  detail="Trusted readings."
                />
              </View>
            </View>

            <InstallerActionList
              eyebrow="Order"
              title="Capture in order"
              items={[
                { label: "Photo pack", detail: "Physical install proof.", status: "photos", tone: "neutral" },
                {
                  label: "Readings pack",
                  detail: "Commissioning + ATS switching proof.",
                  status: "readings",
                  tone:
                    drs.solarApartmentCapacityFitVerified &&
                    drs.apartmentAtsMeterMappingVerified &&
                    drs.atsKplcSwitchingVerified
                      ? "good"
                      : "warn",
                },
                { label: "Signoff", detail: "Monitoring and telemetry trusted.", status: "ops", tone: drs.monitoringConnectivityResolved && drs.settlementDataTrusted ? "good" : "warn" },
                {
                  label: "Evidence ingestion",
                  detail: view.evidenceCapture?.evidenceLabel ?? "Photo, serial, and reading pack.",
                  status: view.evidenceCapture?.status.replace(/_/g, " ") ?? "pending",
                  tone: view.evidenceCapture?.status === "ready" ? "good" : "warn",
                },
              ]}
            />
          </>
        );
      }}
    </InstallerScaffold>
  );
}
