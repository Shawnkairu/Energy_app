import { useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { requestOtp, verifyOtp } from "@emappa/api-client";
import { AppMark, colors, GlassCard, Label, PrimaryButton, typography } from "@emappa/ui";
import { savePilotSession } from "../../components/session";

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState("+254700000000");
  const [code, setCode] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [status, setStatus] = useState("Console OTP for API mode; any 6 digits work in mock mode.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function continueToRoleSelect() {
    setIsSubmitting(true);
    try {
      if (!otpRequested) {
        await requestOtp(phone);
        setOtpRequested(true);
        setStatus("OTP requested. Check backend logs, or enter any 6 digits in mock mode.");
        return;
      }

      const auth = await verifyOtp(phone, code || "000000");
      savePilotSession({ phone, token: auth.token, role: auth.user.role, buildingId: auth.user.buildingId });
      router.push("/(auth)/role-select");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.root}>
      <View style={{ marginTop: 40 }}>
        <AppMark size={50} />
      </View>
      <Text style={styles.headline}>Welcome back</Text>
      <Text style={styles.lede}>
        Pilot phone login for the e.mappa demo. This creates a local session that can be swapped for OTP/KYC when the backend is connected.
      </Text>
      <GlassCard>
        <Label>Pilot phone</Label>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
          style={styles.input}
          accessibilityLabel="Pilot phone number"
        />
        {otpRequested ? (
          <>
            <Label>OTP code</Label>
            <TextInput
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="000000"
              placeholderTextColor={colors.dim}
              style={styles.input}
              accessibilityLabel="Six digit OTP code"
            />
          </>
        ) : null}
        <Text style={styles.note}>{status}</Text>
      </GlassCard>
      <PrimaryButton onPress={continueToRoleSelect}>{isSubmitting ? "Working..." : otpRequested ? "Verify and continue" : "Request OTP"}</PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  headline: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "600",
    letterSpacing: -1.2,
    lineHeight: 40,
    marginTop: 22,
  },
  lede: { color: colors.muted, fontSize: typography.body, lineHeight: 22, marginTop: 10 },
  input: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "600",
    letterSpacing: -0.45,
    marginTop: 8,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  note: { color: colors.muted, fontSize: typography.small, lineHeight: 20, marginTop: 8 },
});
