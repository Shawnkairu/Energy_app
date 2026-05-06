import { Text } from "react-native";
import { GlassCard } from "@emappa/ui";
import { ActionButton, OnboardShell, StatusText, styles, useFinishOnboarding } from "../_shared";

export default function BuildingOwnerTermsScreen() {
  const { finish, isSubmitting, error } = useFinishOnboarding("building_owner", "/(building-owner)/home");

  return (
    <OnboardShell
      eyebrow="Building owner"
      title="Preview owner terms"
      footer={<ActionButton onPress={() => finish()} disabled={isSubmitting}>{isSubmitting ? "Finishing..." : "Finish onboarding"}</ActionButton>}
    >
      <GlassCard>
        <Text style={styles.cardTitle}>Royalties come from monetized solar only.</Text>
        <Text style={styles.helper}>
          Generated, wasted, curtailed, or free-exported energy does not create payout. Deal funding stays tied to this named building.
        </Text>
      </GlassCard>
      <GlassCard>
        <Text style={styles.cardTitle}>Deployment waits for readiness.</Text>
        <Text style={styles.helper}>
          DRS gates funding, supplier lock, electrician scheduling, and go-live so the building launches only when demand and infrastructure are ready.
        </Text>
      </GlassCard>
      <StatusText status={error} tone="error" />
    </OnboardShell>
  );
}
