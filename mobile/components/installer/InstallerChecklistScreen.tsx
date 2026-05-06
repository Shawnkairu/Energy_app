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
      title="Go-Live Checklist"
      subtitle="The commissioning proof lane: photos, readings, connectivity, and ops signoff before activation."
      actions={["Upload photos", "Add readings", "Request signoff"]}
      hero={(building) => ({
        label: "Proof complete",
        value: `${building.roleViews.installer.checklistComplete}/${building.roleViews.installer.checklistTotal}`,
        sub: "All evidence gates must close before go-live",
      })}
    >
      {(building) => {
        const view = building.roleViews.installer;
        const drs = building.project.drs;
        const checklistComplete = view.checklistComplete === view.checklistTotal;

        return (
          <>
            <InstallerBrief
              eyebrow="Activation proof"
              title={checklistComplete ? "Checklist evidence is ready for ops review." : "Checklist evidence still has blockers."}
              body="This is the only installer screen with the full go-live checklist, keeping proof capture concentrated instead of repeated everywhere."
              rows={[
                {
                  label: "Photos",
                  value: "Required",
                  note: "Distribution board, roof works, cable route, inverter, and meter photos.",
                  tone: "warn",
                },
                {
                  label: "Readings",
                  value: drs.meterInverterMatchResolved ? "Aligned" : "Mismatch",
                  note: "Meter and inverter readings must agree before activation.",
                  tone: drs.meterInverterMatchResolved ? "good" : "bad",
                },
                {
                  label: "Ops signoff",
                  value: checklistComplete ? "Ready" : "Pending",
                  note: "Ops acceptance happens after evidence and connectivity are complete.",
                  tone: checklistComplete ? "good" : "warn",
                },
              ]}
            />

            <InstallerEvidenceList
              title="Commissioning checklist"
              items={[
                { label: "Site photos", detail: "Capture physical proof for DB, roof, cable route, and inverter install.", complete: drs.meterInverterMatchResolved },
                { label: "Meter readings", detail: "Record commissioning readings for meter/inverter reconciliation.", complete: drs.meterInverterMatchResolved },
                { label: "Connectivity test", detail: "Confirm monitoring is online before go-live.", complete: drs.monitoringConnectivityResolved },
                { label: "Ops signoff", detail: "Final internal acceptance before solar allocation starts.", complete: checklistComplete && drs.settlementDataTrusted },
              ]}
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard
                  label="Monitoring"
                  value={drs.monitoringConnectivityResolved ? "Online" : "Blocked"}
                  detail="Unresolved connectivity blocks activation."
                />
              </View>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard
                  label="Settlement data"
                  value={drs.settlementDataTrusted ? "Trusted" : "Paused"}
                  detail="Go-live needs trusted telemetry."
                />
              </View>
            </View>

            <InstallerActionList
              eyebrow="Proof capture order"
              title="Capture in order"
              items={[
                { label: "Photo pack", detail: "Upload site proof before readings so ops can compare physical layout.", status: "photos", tone: "neutral" },
                { label: "Readings pack", detail: "Add meter and inverter readings after commissioning checks.", status: "readings", tone: drs.meterInverterMatchResolved ? "good" : "warn" },
                { label: "Connectivity and signoff", detail: "Request ops signoff once monitoring and settlement data are trusted.", status: "signoff", tone: drs.monitoringConnectivityResolved && drs.settlementDataTrusted ? "good" : "warn" },
              ]}
            />
          </>
        );
      }}
    </InstallerScaffold>
  );
}
