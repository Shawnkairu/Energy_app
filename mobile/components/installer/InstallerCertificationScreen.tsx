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

export function InstallerCertificationScreen() {
  return (
    <InstallerScaffold
      section="Certification"
      title="Lead Eligibility"
      subtitle="A focused eligibility lane for the accountable lead electrician before any installer schedule opens."
      actions={["Review lead", "Attach license", "Clear dispatch"]}
      hero={(building) => ({
        label: "Lead electrician",
        value: building.roleViews.installer.certified ? "Ready" : "Blocked",
        sub: "No certified lead means no deployment scheduling",
      })}
    >
      {(building) => {
        const certified = building.roleViews.installer.certified;

        return (
          <>
            <InstallerBrief
              eyebrow="Scheduling guard"
              title={certified ? "This crew can be scheduled." : "Scheduling is blocked until lead proof clears."}
              body="Certification stays narrow: one accountable lead, one named building, and a clear DRS kill switch if eligibility is missing."
              rows={[
                {
                  label: "Lead proof",
                  value: certified ? "Verified" : "Missing",
                  note: "License, assignment, and safety accountability stay attached to the job.",
                  tone: certified ? "good" : "bad",
                },
                {
                  label: "Installer DRS",
                  value: `${building.drs.components.installerReadiness}`,
                  note: "Displayed as the readiness outcome, not recalculated in the UI.",
                  tone: building.drs.components.installerReadiness >= 80 ? "good" : "warn",
                },
                {
                  label: "Dispatch",
                  value: certified ? "Allowed" : "Blocked",
                  note: "Installer scheduling opens only after lead electrician eligibility is verified.",
                  tone: certified ? "good" : "bad",
                },
              ]}
            />

            <GlassCard>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 14 }}>
                <View style={{ flex: 1 }}>
                  <Label>Credential packet</Label>
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
                    Lead electrician eligibility only
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 7 }}>
                    This packet avoids commissioning clutter and keeps the scheduling decision auditable.
                  </Text>
                </View>
                <Pill tone={certified ? "good" : "bad"}>{certified ? "valid" : "hold"}</Pill>
              </View>
              <View style={{ gap: 10, marginTop: 16 }}>
                {[
                  ["License", certified ? "Verified" : "Missing", "Current lead electrician license attached to this crew."],
                  ["Assignment", certified ? "Bound" : "Unbound", "Named lead is accountable for this building's site work."],
                  ["Dispatch", certified ? "Open" : "Closed", "Crew scheduling remains closed until eligibility clears."],
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
                      <Text style={{ color: certified ? colors.green : colors.red, fontSize: typography.small, fontWeight: "600" }}>{value}</Text>
                    </View>
                    <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 18, marginTop: 5 }}>{note}</Text>
                  </InstallerFieldRow>
                ))}
              </View>
            </GlassCard>

            <InstallerMetricCard
              label="Scheduling state"
              value={certified ? "Cleared" : "Hold"}
              detail="Deployment cannot be scheduled without a certified lead electrician, even if other gates look ready."
            />
          </>
        );
      }}
    </InstallerScaffold>
  );
}
