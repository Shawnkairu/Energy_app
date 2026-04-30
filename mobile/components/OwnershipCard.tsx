import { Text } from "react-native";
import type { OwnershipPayout } from "@emappa/shared";
import { colors, GlassCard } from "@emappa/ui";

export function OwnershipCard({ payouts }: { payouts: OwnershipPayout[] }) {
  return (
    <GlassCard accent={colors.amber}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>Ownership Ledger</Text>
      {payouts.map((payout) => (
        <Text key={payout.ownerId} style={{ color: colors.muted, marginTop: 10 }}>
          {payout.ownerRole}: {Math.round(payout.percentage * 100)}% → KSh {payout.payout.toLocaleString()}
        </Text>
      ))}
    </GlassCard>
  );
}
