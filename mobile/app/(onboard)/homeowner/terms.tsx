import { Text } from "react-native";
import { useRouter } from "expo-router";
import { GlassCard } from "@emappa/ui";
import { ActionButton, OnboardShell, useRequiredParams, styles } from "../_shared";

export default function HomeownerTermsScreen() {
  const router = useRouter();
  const { buildingId } = useRequiredParams<{ buildingId: string }>(["buildingId"]);

  return (
    <OnboardShell
      eyebrow="Homeowner"
      title="Preview your project terms"
      footer={
        <ActionButton
          onPress={() =>
            router.push({
              pathname: "/(onboard)/homeowner/first-pledge",
              params: { buildingId },
            })
          }
        >
          Continue
        </ActionButton>
      }
    >
      <GlassCard>
        <Text style={styles.cardTitle}>You keep rooftop ownership and future cashflow visibility.</Text>
        <Text style={styles.helper}>
          Any sold shares reduce your future payout proportionally. Payouts only come from monetized solar after readiness gates pass.
        </Text>
      </GlassCard>
      <GlassCard>
        <Text style={styles.cardTitle}>Tokens activate after go-live.</Text>
        <Text style={styles.helper}>
          You can pledge prepaid solar now, but no charge or allocation happens until your project is funded, installed, and live.
        </Text>
      </GlassCard>
    </OnboardShell>
  );
}
