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
        value: `${building.roleViews.installer.checklistComplete}/${building.roleViews.installer.checklistTotal}`,
        sub: "Evidence complete",
        tone:
          building.roleViews.installer.checklistComplete === building.roleViews.installer.checklistTotal
            ? "good"
            : "warn",
      })}
    >
      {(building) => {
        const view = building.roleViews.installer;
        const drs = building.project.drs;
        const checklistComplete = view.checklistComplete === view.checklistTotal;

        return (
          <>
            <InstallerBrief
              eyebrow="Activation"
              title={checklistComplete ? "Ready for ops." : "Finish proof."}
              body="Four gates."
              rows={[
                {
                  label: "Photos",
                  value: "Needed",
                  note: "DB, roof, cable, inverter.",
                  tone: "warn",
                },
                {
                  label: "Readings",
                  value: drs.meterInverterMatchResolved ? "Aligned" : "Mismatch",
                  note: "Meter + inverter.",
                  tone: drs.meterInverterMatchResolved ? "good" : "bad",
                },
                {
                  label: "Signoff",
                  value: checklistComplete ? "Ready" : "Pending",
                  note: "After proof.",
                  tone: checklistComplete ? "good" : "warn",
                },
              ]}
            />

            <InstallerEvidenceList
              title="Proof checklist"
              items={[
                { label: "Site photos", detail: "DB, roof, cable, inverter.", complete: drs.meterInverterMatchResolved },
                { label: "Meter readings", detail: "Commissioning values.", complete: drs.meterInverterMatchResolved },
                { label: "Connectivity", detail: "Monitoring online.", complete: drs.monitoringConnectivityResolved },
                { label: "Ops signoff", detail: "Activation approval.", complete: checklistComplete && drs.settlementDataTrusted },
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
                { label: "Readings pack", detail: "Meter and inverter.", status: "readings", tone: drs.meterInverterMatchResolved ? "good" : "warn" },
                { label: "Signoff", detail: "Monitoring and telemetry trusted.", status: "ops", tone: drs.monitoringConnectivityResolved && drs.settlementDataTrusted ? "good" : "warn" },
              ]}
            />
          </>
        );
      }}
    </InstallerScaffold>
  );
}
