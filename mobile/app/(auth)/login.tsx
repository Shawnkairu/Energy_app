import { useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { AppMark, colors, GlassCard, Label, PrimaryButton, typography } from "@emappa/ui";
import { useApi } from "../../lib/api";

export default function Login() {
  const router = useRouter();
  const api = useApi();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Enter the email tied to your e.mappa invite. We will send a one-time code.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function requestEmailOtp() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || isSubmitting) {
      setStatus("Enter a valid email address to request a code.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.requestOtp(normalizedEmail);
      router.push({ pathname: "/(auth)/verify-phone", params: { email: normalizedEmail } });
    } catch {
      setStatus("We could not send a code. Check your API connection and try again.");
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
        Email OTP keeps each stakeholder workspace tied to an invited account and named building context.
      </Text>
      <GlassCard>
        <Label>Email</Label>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="you@example.com"
          placeholderTextColor={colors.dim}
          style={styles.input}
          accessibilityLabel="Email address"
        />
        <Text style={styles.note}>{status}</Text>
      </GlassCard>
      <PrimaryButton onPress={requestEmailOtp}>{isSubmitting ? "Sending..." : "Send code"}</PrimaryButton>
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
