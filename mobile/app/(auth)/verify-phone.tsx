import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Label, PrimaryButton, colors, typography } from "@emappa/ui";
import { useAuth } from "../../components/AuthContext";
import { useApi } from "../../lib/api";

/** `ScreenVerify` — Nav title set via route; body matches OTP + resend + primary. */
export default function VerifyPhone() {
  const router = useRouter();
  const api = useApi();
  const { signIn } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("Enter the 6-digit code from your email.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function verifyEmailOtp() {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedCode = code.trim();

    if (!normalizedEmail) {
      setStatus("Start from login so we know which email to verify.");
      return;
    }

    if (normalizedCode.length < 6 || isSubmitting) {
      setStatus("Enter the 6-digit code from your email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const authSession = await api.verifyOtp(normalizedEmail, normalizedCode);
      signIn(authSession);
      router.replace(authSession.user.onboardingComplete ? roleHomeHref(authSession.user.role) : "/(auth)/role-select");
    } catch {
      setStatus("We could not verify that code. Check the code and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendCode() {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || isSubmitting) {
      setStatus("Start from login so we know where to send the code.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.requestOtp(normalizedEmail);
      setStatus("We sent a fresh code to your email.");
    } catch {
      setStatus("We could not resend the code. Try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.root}>
      <Label>Verify</Label>
      <Text style={styles.pageTitle}>Confirm it's you</Text>
      <Text style={styles.step}>Step 2 of 3</Text>
      <Text style={styles.lede}>
        We sent a 6-digit code to{" "}
        <Text style={{ color: colors.text, fontWeight: "600" }}>{email ?? "your email"}</Text>
      </Text>
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
      <Text style={styles.note}>{status}</Text>
      <Text style={styles.resend} onPress={resendCode}>
        {isSubmitting ? "Working..." : "Resend code"}
      </Text>
      <View style={{ flex: 1, minHeight: 12 }} />
      <PrimaryButton onPress={verifyEmailOtp}>{isSubmitting ? "Verifying..." : "Verify and continue"}</PrimaryButton>
    </View>
  );
}

function roleHomeHref(role: string) {
  const routes: Record<string, string> = {
    resident: "/(resident)/home",
    homeowner: "/(building-owner)/home",
    building_owner: "/(building-owner)/home",
    provider: "/(provider)/home",
    financier: "/(financier)/portfolio",
    electrician: "/(electrician)/jobs",
    admin: "/(admin)/home",
  };

  return routes[role] ?? "/(auth)/role-select";
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28 },
  pageTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "600",
    letterSpacing: -0.4,
    marginTop: 4,
  },
  step: { color: colors.muted, fontSize: typography.small, marginTop: 6 },
  lede: { color: colors.muted, fontSize: typography.small, lineHeight: 21, marginTop: 16, marginBottom: 20 },
  input: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "600",
    letterSpacing: 2,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  note: { color: colors.muted, fontSize: typography.small, lineHeight: 20, marginTop: 10 },
  resend: { color: colors.dim, fontSize: typography.micro, marginTop: 24 },
});
