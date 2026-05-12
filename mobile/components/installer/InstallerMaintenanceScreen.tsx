import { Text, View } from "react-native";
import { typography } from "@emappa/ui";
import {
  colors,
  InstallerBrief,
  InstallerFieldRow,
  InstallerMetricCard,
  InstallerScaffold,
  Label,
  Pill,
  GlassCard,
} from "./InstallerShared";

export function InstallerMaintenanceScreen() {
  return (
    <InstallerScaffold
      section="Service"
      title="Closeout"
      subtitle="Tickets, telemetry, pay."
      actions={["Service ticket", "Capture proof", "Profile"]}
      hero={(building) => ({
        label: "Tickets",
        value: `${building.roleViews.installer.maintenanceTickets}`,
        sub: "Open service items",
        tone: building.roleViews.installer.maintenanceTickets === 0 ? "good" : "warn",
      })}
    >
      {(building) => {
        const view = building.roleViews.installer;
        const drs = building.project.drs;

        return (
          <>
            <InstallerBrief
              eyebrow="Post-live"
              title="Keep telemetry trusted."
              body="Repair, prove, close."
              rows={[
                {
                  label: "Monitoring",
                  value: drs.monitoringConnectivityResolved ? "Online" : "Blocked",
                  note: "Heartbeat.",
                  tone: drs.monitoringConnectivityResolved ? "good" : "bad",
                },
                {
                  label: "Telemetry",
                  value: drs.settlementDataTrusted ? "Trusted" : "Paused",
                  note: "Reliable readings.",
                  tone: drs.settlementDataTrusted ? "good" : "bad",
                },
                {
                  label: "Tickets",
                  value: view.maintenanceTickets === 0 ? "Clear" : `${view.maintenanceTickets} open`,
                  note: "Proof before close.",
                  tone: view.maintenanceTickets === 0 ? "good" : "warn",
                },
              ]}
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard
                  label="Telemetry"
                  value={drs.monitoringConnectivityResolved ? "Live" : "Restore"}
                  detail="Monitoring."
                />
              </View>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard
                  label="Data"
                  value={drs.settlementDataTrusted ? "Trusted" : "Paused"}
                  detail="Settlement input."
                />
              </View>
            </View>

            <GlassCard>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 14 }}>
                <View style={{ flex: 1 }}>
                  <Label>Ledger</Label>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: typography.title,
                      fontWeight: "700",
                      letterSpacing: -0.5,
                      marginTop: 6,
                      lineHeight: typography.title + 4,
                    }}
                  >
                    Service proof
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 7 }}>
                    Every ticket needs proof.
                  </Text>
                </View>
                <Pill tone={view.maintenanceTickets === 0 ? "good" : "warn"}>
                  {view.maintenanceTickets === 0 ? "clear" : "open"}
                </Pill>
              </View>
              <View style={{ gap: 10, marginTop: 16 }}>
                {[
                  ["Telemetry", drs.monitoringConnectivityResolved ? "Live" : "Restore", "Heartbeat + inverter feed."],
                  ["Readings", drs.settlementDataTrusted ? "Trusted" : "Recheck", "Fresh values."],
                  ["Closeout", view.maintenanceTickets === 0 ? "Clear" : "Proof required", "Notes or photos."],
                ].map(([label, value, note]) => (
                  <InstallerFieldRow key={label}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                      <Text
                        style={{
                          color: colors.muted,
                          fontSize: typography.micro,
                          fontWeight: "600",
                          letterSpacing: 0.65,
                          textTransform: "uppercase",
                        }}
                      >
                        {label}
                      </Text>
                      <Text style={{ color: colors.text, fontSize: typography.small, fontWeight: "600" }}>{value}</Text>
                    </View>
                    <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 18, marginTop: 5 }}>{note}</Text>
                  </InstallerFieldRow>
                ))}
              </View>
            </GlassCard>
          </>
        );
      }}
    </InstallerScaffold>
  );
}
