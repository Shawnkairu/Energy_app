import { Text, View } from "react-native";
import { typography } from "@emappa/ui";
import {
  colors,
  InstallerBrief,
  InstallerFieldRow,
  InstallerMetricCard,
  InstallerScaffold,
  InstallerTrustCard,
  Label,
  Pill,
  GlassCard,
} from "./InstallerShared";

export function InstallerCertificationScreen() {
  return (
    <InstallerScaffold
      section="Compliance"
      title="Lead Card"
      subtitle="Trust, license, dispatch."
      actions={["Discover", "Crew queue", "Profile"]}
      hero={(building) => ({
        label: "Certification",
        value: building.roleViews.electrician.certified ? "Ready" : "Blocked",
        sub: "Lead gate",
        tone: building.roleViews.electrician.certified ? "good" : "bad",
      })}
    >
      {(building) => {
        const certified = building.roleViews.electrician.certified;

        return (
          <>
            <InstallerTrustCard
              name="Amina Otieno"
              role="Lead electrician"
              status={certified ? "verified" : "hold"}
              tone={certified ? "good" : "bad"}
              stats={[
                { label: "rating", value: "4.9" },
                { label: "jobs", value: "38" },
                { label: "drs", value: `${building.drs.components.installerReadiness}` },
              ]}
              checks={[
                { label: "License", detail: certified ? "Current license attached." : "Upload current license.", complete: certified },
                { label: "Site assignment", detail: building.project.name, complete: certified },
                { label: "Dispatch", detail: certified ? "Schedule can open." : "Schedule stays closed.", complete: certified },
              ]}
            />

            <InstallerBrief
              eyebrow="Gate"
              title={certified ? "Crew can be scheduled." : "Lead proof missing."}
              body="One accountable lead."
              rows={[
                {
                  label: "License",
                  value: certified ? "Verified" : "Missing",
                  note: "Current credential.",
                  tone: certified ? "good" : "bad",
                },
                {
                  label: "DRS",
                  value: `${building.drs.components.installerReadiness}`,
                  note: "Readiness.",
                  tone: building.drs.components.installerReadiness >= 80 ? "good" : "warn",
                },
                {
                  label: "Dispatch",
                  value: certified ? "Allowed" : "Blocked",
                  note: "Schedule gate.",
                  tone: certified ? "good" : "bad",
                },
              ]}
            />

            <GlassCard>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 14 }}>
                <View style={{ flex: 1 }}>
                  <Label>Certificate</Label>
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
                    Field credential
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 7 }}>
                    Airbnb-style trust proof for the site.
                  </Text>
                </View>
                <Pill tone={certified ? "good" : "bad"}>{certified ? "valid" : "hold"}</Pill>
              </View>
              <View style={{ gap: 10, marginTop: 16 }}>
                {[
                  ["License", certified ? "Verified" : "Missing", "Current credential."],
                  ["Assignment", certified ? "Bound" : "Unbound", building.project.name],
                  ["Dispatch", certified ? "Open" : "Closed", "Eligibility clears the job."],
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
              detail="No lead, no schedule."
            />
          </>
        );
      }}
    </InstallerScaffold>
  );
}
