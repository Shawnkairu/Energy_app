import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { createSyntheticDemoSession, type PublicRole } from "@emappa/shared";
import { AppMark, colors, GlassCard, Label, PrimaryButton, spacing, typography } from "@emappa/ui";
import { useAuth } from "../../components/AuthContext";
import { __API_BASE_URL, useApi } from "../../lib/api";

const demoRoles: Array<{ role: PublicRole; label: string }> = [
  { role: "resident", label: "Resident" },
  { role: "homeowner", label: "Homeowner" },
  { role: "building_owner", label: "Building owner" },
  { role: "provider", label: "Provider" },
  { role: "financier", label: "Financier" },
  { role: "electrician", label: "Electrician" },
];

export default function Login() {
  const router = useRouter();
  const api = useApi();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Use the email from your invite. We will send a one-time code.");
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
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : String(error);
      setStatus(`Could not send code: ${detail} (API: ${__API_BASE_URL ?? "none"})`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function openSyntheticDemo(role: PublicRole) {
    const session = createSyntheticDemoSession(role, { phase: "settlement" });
    signIn(session);
    router.replace(roleHomeHref(role));
  }

  return (
    <View style={styles.root}>
      <View style={{ marginTop: 40 }}>
        <AppMark size={50} />
      </View>
      <Text style={styles.headline}>Welcome back</Text>
      <Text style={styles.lede}>Email one-time codes keep workspaces tied to your invite and building context.</Text>
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
      <PrimaryButton
        onPress={requestEmailOtp}
        disabled={isSubmitting}
        accessibilityLabel={isSubmitting ? "Sending code" : "Send verification code"}
      >
        {isSubmitting ? "Sending..." : "Send code"}
      </PrimaryButton>
      <GlassCard>
        <Label>Synthetic demo</Label>
        <Text style={styles.note}>Open any stakeholder workspace with scenario-backed synthetic data.</Text>
        <View style={styles.demoGrid}>
          {demoRoles.map((item) => (
            <Pressable
              key={item.role}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.label} synthetic demo`}
              onPress={() => openSyntheticDemo(item.role)}
              style={({ pressed }) => [styles.demoChip, pressed && styles.demoChipPressed]}
            >
              <Text style={styles.demoChipText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
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
  demoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  demoChip: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  demoChipPressed: { backgroundColor: `${colors.orangeDeep}12` },
  demoChipText: { color: colors.text, fontSize: typography.micro, fontWeight: "800" },
});

function roleHomeHref(role: PublicRole) {
  const routes: Record<PublicRole, string> = {
    resident: "/(resident)/home",
    homeowner: "/(homeowner)/home",
    building_owner: "/(building-owner)/home",
    provider: "/(provider)/discover",
    financier: "/(financier)/discover",
    electrician: "/(electrician)/discover",
  };

  return routes[role];
}
