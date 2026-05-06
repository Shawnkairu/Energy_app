import { Text, View } from "react-native";
import { GlassCard, Label, PrimaryButton, colors, typography } from "@emappa/ui";
import { ResidentRuleCard } from "../resident/ResidentShared";
import { ProposedPageChrome } from "./ProposedPageChrome";

export function ResidentVerifyPhoneScreen() {
  return (
    <ProposedPageChrome
      section="Verify"
      workspace="resident workspace"
      title="Verify your Phone"
      subtitle="A one-time code confirms this household account belongs to you. After verification, your prepaid wallet opens."
      actions={["Send code", "Use new number", "Help"]}
      hero={{
        label: "Step 2 of 3",
        value: "+254 7•• ••• 412",
        sub: "We will send a 6-digit code to this number. Standard SMS rates may apply.",
        status: "awaiting OTP",
        statusTone: "warn",
      }}
    >
      <GlassCard>
        <Label>One-time code</Label>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: "600", marginTop: 6 }}>Enter the 6-digit code</Text>
        <View style={{ flexDirection: "row", gap: 6, marginTop: 12, justifyContent: "space-between" }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: i === 0 ? colors.text : colors.border,
                backgroundColor: colors.white,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700" }}>{i === 0 ? "4" : ""}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
          <Text style={{ color: colors.muted, fontSize: typography.micro }}>Code expires in 4:32</Text>
          <Text style={{ color: colors.text, fontSize: typography.micro, fontWeight: "600" }}>Resend</Text>
        </View>
        <View style={{ marginTop: 14, alignSelf: "stretch" }}>
          <PrimaryButton>Verify</PrimaryButton>
        </View>
      </GlassCard>
      <ResidentRuleCard
        eyebrow="What unlocks after verify"
        title="Three things start working."
        body="Verification opens a household session. Solar allocation still needs prepaid cash."
        rows={[
          { label: "Wallet", value: "open", note: "Top up to receive solar allocation.", tone: "good" },
          { label: "Usage", value: "visible", note: "See solar / battery / grid for your home." },
          { label: "Shares", value: "optional", note: "Browse but never required to use solar." },
        ]}
      />
    </ProposedPageChrome>
  );
}
