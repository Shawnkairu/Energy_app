import { useRouter } from "expo-router";
import { GlassCard } from "@emappa/ui";
import { ActionButton, OnboardShell, styles } from "./_shared";
import { Text } from "react-native";

export default function OnboardWelcomeScreen() {
  const router = useRouter();

  return (
    <OnboardShell
      eyebrow="e.mappa onboarding"
      title="Build your building-level energy economy"
      footer={<ActionButton onPress={() => router.replace("/(auth)/login")}>Get started</ActionButton>}
    >
      <GlassCard>
        <Text style={styles.cardTitle}>Prepaid-first solar, role by role.</Text>
        <Text style={styles.helper}>
          Sign in with email OTP, then finish the onboarding steps for your assigned role before entering the guarded workspace.
        </Text>
      </GlassCard>
    </OnboardShell>
  );
}
