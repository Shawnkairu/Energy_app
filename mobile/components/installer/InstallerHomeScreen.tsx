import { Text, View } from "react-native";
import { typography } from "@emappa/ui";
import {
  colors,
  InstallerBrief,
  InstallerFieldRow,
  InstallerMetricCard,
  InstallerScaffold,
  StatusOrb,
  Label,
  Pill,
  GlassCard,
} from "./InstallerShared";

export function InstallerHomeScreen() {
  return (
    <InstallerScaffold
      section="Home"
      title="Today"
      subtitle="One site. One next step."
      actions={["Capture proof", "Crew queue", "Lead card"]}
      hero={(building) => ({
        label: building.project.name,
        value: `${building.roleViews.installer.checklistComplete}/${building.roleViews.installer.checklistTotal}`,
        sub: "Checklist complete",
        tone:
          building.roleViews.installer.checklistComplete === building.roleViews.installer.checklistTotal
            ? "good"
            : building.roleViews.installer.certified
              ? "warn"
              : "bad",
      })}
    >
      {(building) => {
        const view = building.roleViews.installer;
        const drs = building.project.drs;

        return (
          <>
            <InstallerBrief
              eyebrow="Active job"
              title={building.project.name}
              body={building.project.locationBand}
              rows={[
                {
                  label: "Lead",
                  value: view.certified ? "Ready" : "Blocked",
                  note: "Certified lead required.",
                  tone: view.certified ? "good" : "bad",
                },
                {
                  label: "Proof",
                  value: `${view.checklistComplete}/${view.checklistTotal}`,
                  note: "Photos, readings, connectivity.",
                  tone: view.checklistComplete === view.checklistTotal ? "good" : "warn",
                },
                {
                  label: "DRS",
                  value: building.drs.label,
                  note: "Readiness gate.",
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
                    Field board
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 7 }}>
                    Task-first closeout.
                  </Text>
                </View>
                <Pill tone={drs.monitoringConnectivityResolved && drs.settlementDataTrusted ? "good" : "warn"}>
                  {drs.monitoringConnectivityResolved && drs.settlementDataTrusted ? "stable" : "watch"}
                </Pill>
              </View>
              <View style={{ gap: 10, marginTop: 16 }}>
                {[
                  ["Site", building.project.locationBand, "Named building."],
                  ["Next", drs.meterInverterMatchResolved ? "Connectivity" : "Meter map", "Capture the unblocker."],
                  ["Risk", view.maintenanceTickets === 0 ? "Clear" : `${view.maintenanceTickets} ticket`, "Service stays visible."],
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
                  label="Readiness"
                  value={`${building.drs.components.installerReadiness}`}
                  detail="Installer gate."
                />
              </View>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard
                  label="Service"
                  value={`${view.maintenanceTickets}`}
                  detail="Open tickets."
                />
              </View>
            </View>

            <GlassCard>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                <StatusOrb tone={view.certified ? "good" : "bad"} />
                <View style={{ flex: 1 }}>
                  <Label>Dispatch</Label>
                  <Text style={{ color: colors.text, fontSize: typography.title, fontWeight: "800", letterSpacing: -0.5, marginTop: 5 }}>
                    {view.certified ? "Crew can move." : "Lead missing."}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 5 }}>
                    License clears the schedule.
                  </Text>
                </View>
              </View>
            </GlassCard>
          </>
        );
      }}
    </InstallerScaffold>
  );
}
