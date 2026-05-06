import { Text, View } from "react-native";
import { GlassCard, Label, PrimaryButton, colors } from "@emappa/ui";
import { OwnerBriefCard, OwnerScreenShell } from "../owner/OwnerShared";

export function OwnerAccountScreen() {
  return (
    <OwnerScreenShell
      showHandoffRibbon
      section="Profile"
      title="Owner Settings"
      subtitle="Owner identity, building access, contacts, and notification preferences. Private to this owner session."
      actions={["Edit details", "Manage access", "Sign out"]}
      hero={(building) => ({
        label: "Signed in as",
        value: "Primary owner",
        sub: `${building.project.name} · verified session`,
        tone: "good",
        status: "verified",
      })}
    >
      {() => (
        <>
          <OwnerBriefCard
            eyebrow="Owner identity"
            title="Verified once, used everywhere."
            body="Owner identity is the signature of record for terms, inspections, and approvals."
            rows={[
              { label: "Role", value: "building owner", note: "One signer of record per building operator account.", tone: "good" },
              { label: "Contacts", value: "masked", note: "Installer and financier routes messages without exposing personal phones on-screen.", tone: "neutral" },
            ]}
          />
          <GlassCard>
            <Label>Account actions</Label>
            <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8 }}>
              Wireframe: edit profile, delegate access, and session controls match the design-handoff owner profile surface.
            </Text>
            <View style={{ marginTop: 14, gap: 10 }}>
              <PrimaryButton>Manage notification cadence</PrimaryButton>
            </View>
          </GlassCard>
        </>
      )}
    </OwnerScreenShell>
  );
}
