import { Text } from "react-native";
import { useRouter } from "expo-router";
import { GlassCard } from "@emappa/ui";
import { ActionButton, OnboardShell, styles } from "./_shared";

export default function OnboardWelcomeScreen() {
  const router = useRouter();

  return (
    <OnboardShell
      eyebrow="Onboarding"
      title={"Your building's energy economy"}
      footer={
        <ActionButton onPress={() => router.replace("/(auth)/login")} accessibilityLabel="Get started — sign in with email">
          Get started
        </ActionButton>
      }
    >
      <GlassCard>
        <Text style={styles.cardTitle}>Prepaid-only solar · role workspaces</Text>
        <Text style={styles.helper}>
          Sign in with email one-time codes, finish the checklist for your role, then enter a guarded stakeholder workspace.
        </Text>
      </GlassCard>
    </OnboardShell>
  );
}
