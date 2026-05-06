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
      section="Maintenance"
      title="Service Trust"
      subtitle="A post-live trust loop for restoring telemetry, readings, and closeout proof when service issues appear."
      actions={["Open tickets", "Restore data", "Close with proof"]}
      hero={(building) => ({
        label: "Tickets",
        value: `${building.roleViews.installer.maintenanceTickets}`,
        sub: "Open post-live service items",
      })}
    >
      {(building) => {
        const view = building.roleViews.installer;
        const drs = building.project.drs;

        return (
          <>
            <InstallerBrief
              eyebrow="Post-live"
              title="Maintenance protects settlement data trust."
              body="Maintenance is not a generic support queue. It is the field loop that keeps monitoring and readings credible after go-live."
              rows={[
                {
                  label: "Monitoring",
                  value: drs.monitoringConnectivityResolved ? "Online" : "Blocked",
                  note: "Unresolved monitoring connectivity blocks go-live and weakens live operations.",
                  tone: drs.monitoringConnectivityResolved ? "good" : "bad",
                },
                {
                  label: "Settlement data",
                  value: drs.settlementDataTrusted ? "Trusted" : "Paused",
                  note: "Untrusted settlement data pauses activation until readings are reliable.",
                  tone: drs.settlementDataTrusted ? "good" : "bad",
                },
                {
                  label: "Tickets",
                  value: view.maintenanceTickets === 0 ? "Clear" : `${view.maintenanceTickets} open`,
                  note: "Post-live service work stays attached to the building record.",
                  tone: view.maintenanceTickets === 0 ? "good" : "warn",
                },
              ]}
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard
                  label="Telemetry"
                  value={drs.monitoringConnectivityResolved ? "Live" : "Restore"}
                  detail="Monitoring must remain online for trusted settlement."
                />
              </View>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard
                  label="Data trust"
                  value={drs.settlementDataTrusted ? "Trusted" : "Paused"}
                  detail="Readings must support monetized solar allocation."
                />
              </View>
            </View>

            <GlassCard>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 14 }}>
                <View style={{ flex: 1 }}>
                  <Label>Service ledger</Label>
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
                    Trust work after activation
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 7 }}>
                    Each ticket resolves toward monitored data the settlement engine can trust.
                  </Text>
                </View>
                <Pill tone={view.maintenanceTickets === 0 ? "good" : "warn"}>
                  {view.maintenanceTickets === 0 ? "clear" : "open"}
                </Pill>
              </View>
              <View style={{ gap: 10, marginTop: 16 }}>
                {[
                  ["Telemetry", drs.monitoringConnectivityResolved ? "Live" : "Restore feed", "Monitoring heartbeat and inverter feed."],
                  ["Reading trust", drs.settlementDataTrusted ? "Trusted" : "Recheck", "Fresh readings when settlement confidence drops."],
                  ["Closeout", view.maintenanceTickets === 0 ? "No open ticket" : "Proof required", "Repair notes or photos before ops closes the item."],
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
