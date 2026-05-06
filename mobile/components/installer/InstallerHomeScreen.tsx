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

export function InstallerHomeScreen() {
  return (
    <InstallerScaffold
      section="Home"
      title="Today's Field Board"
      subtitle="A calm snapshot for the crew: active site, lead gate, proof progress, and post-live risk."
      actions={["Review site", "Capture proof", "Sync crew"]}
      hero={(building) => ({
        label: "Active proof",
        value: `${building.roleViews.installer.checklistComplete}/${building.roleViews.installer.checklistTotal}`,
        sub: "Commissioning items closed for the active building",
      })}
    >
      {(building) => {
        const view = building.roleViews.installer;
        const drs = building.project.drs;

        return (
          <>
            <InstallerBrief
              eyebrow="Today"
              title={`${building.project.name} is the crew's current site.`}
              body="Home is only the field dashboard snapshot: what building the crew is on, whether the lead can dispatch, and what proof still affects activation."
              rows={[
                {
                  label: "Lead gate",
                  value: view.certified ? "Ready" : "Blocked",
                  note: "Certified lead electrician is required before scheduling.",
                  tone: view.certified ? "good" : "bad",
                },
                {
                  label: "Proof count",
                  value: `${view.checklistComplete}/${view.checklistTotal}`,
                  note: "Only the active go-live proof count is surfaced here.",
                  tone: view.checklistComplete === view.checklistTotal ? "good" : "warn",
                },
                {
                  label: "DRS",
                  value: building.drs.label,
                  note: "Installer work advances only when readiness gates allow it.",
                  tone: building.drs.decision === "approve" ? "good" : building.drs.decision === "review" ? "warn" : "bad",
                },
              ]}
            />

            <GlassCard>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 14 }}>
                <View style={{ flex: 1 }}>
                  <Label>Crew board</Label>
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
                    Field rhythm for this visit
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 7 }}>
                    Keep the crew pointed at site proof and activation blockers, not repeated admin queues.
                  </Text>
                </View>
                <Pill tone={drs.monitoringConnectivityResolved && drs.settlementDataTrusted ? "good" : "warn"}>
                  {drs.monitoringConnectivityResolved && drs.settlementDataTrusted ? "stable" : "watch"}
                </Pill>
              </View>
              <View style={{ gap: 10, marginTop: 16 }}>
                {[
                  ["Site focus", building.project.locationBand, "Named building job, not pooled work."],
                  ["Next proof", drs.meterInverterMatchResolved ? "Connectivity" : "Meter map", "Capture the artifact that unblocks ops review."],
                  ["Closeout risk", view.maintenanceTickets === 0 ? "None open" : `${view.maintenanceTickets} service item`, "Post-live tickets stay visible without crowding commissioning."],
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

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard
                  label="Installer readiness"
                  value={`${building.drs.components.installerReadiness}`}
                  detail="DRS installer/labor component for the active building."
                />
              </View>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard
                  label="Open service risk"
                  value={`${view.maintenanceTickets}`}
                  detail="Post-live items that can affect monitoring trust."
                />
              </View>
            </View>
          </>
        );
      }}
    </InstallerScaffold>
  );
}
