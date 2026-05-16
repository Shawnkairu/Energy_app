import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { typography } from "@emappa/ui";
import { ProfileEssentials } from "../ProfileEssentials";
import {
  colors,
  GlassCard,
  Label,
  InstallerMetricCard,
  InstallerScaffold,
  InstallerTrustCard,
} from "./InstallerShared";

export function InstallerProfileScreen() {
  const router = useRouter();

  return (
    <InstallerScaffold
      section="Profile"
      title="Crew Profile"
      subtitle="Credentials, certification, and support — compliance lives here."
      actions={["Certification", "Crew queue", "Wallet"]}
      hero={(building) => ({
        label: "Trust score",
        value: building.roleViews.electrician.certified ? "4.9" : "Hold",
        sub: building.roleViews.electrician.certified ? "Verified lead electrician" : "Certification needed",
        tone: building.roleViews.electrician.certified ? "good" : "bad",
      })}
    >
      {(building) => {
        const certified = building.roleViews.electrician.certified;

        return (
          <>
            <Pressable
              onPress={() => router.push("/(electrician)/compliance")}
              accessibilityRole="button"
              accessibilityLabel="Open certification and compliance"
              style={{ marginBottom: 12 }}
            >
              <GlassCard>
                <Label>Certification & compliance</Label>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.title,
                    fontWeight: "700",
                    marginTop: 6,
                    letterSpacing: -0.3,
                  }}
                >
                  e.mappa certification & safety
                </Text>
                <Text style={{ color: colors.muted, fontSize: 13, marginTop: 8, lineHeight: 20 }}>
                  Tiers, training, expiries, and LBRS sign-off readiness. Tap to open the full checklist — this is the only entry
                  point for compliance (not a separate tab).
                </Text>
                <Text style={{ color: colors.orangeDeep, fontSize: 13, fontWeight: "700", marginTop: 10 }}>
                  Open certification center →
                </Text>
              </GlassCard>
            </Pressable>

            <InstallerTrustCard
              name="Amina Otieno"
              role="Lead electrician"
              status={certified ? "verified" : "hold"}
              tone={certified ? "good" : "bad"}
              stats={[
                { label: "rating", value: certified ? "4.9" : "-" },
                { label: "jobs", value: "38" },
                { label: "closeout", value: "96%" },
              ]}
              checks={[
                { label: "Identity", detail: "Account verified.", complete: true },
                { label: "License", detail: certified ? "Current license." : "Upload license.", complete: certified },
                { label: "Current site", detail: building.project.name, complete: certified },
              ]}
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard label="Response" value="18m" detail="Avg field reply." />
              </View>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard label="Proof" value={`${building.roleViews.electrician.checklistComplete}/${building.roleViews.electrician.checklistTotal}`} detail="Active job." />
              </View>
            </View>

            <ProfileEssentials
              roleLabel="Electrician"
              accountRows={[
                { label: "Certification", value: certified ? "Current" : "Needed", note: "compliance center lives in Profile" },
                { label: "Current project", value: building.project.name, note: building.project.locationBand },
              ]}
              supportSubject={`Electrician support - ${building.project.name}`}
            />
          </>
        );
      }}
    </InstallerScaffold>
  );
}
