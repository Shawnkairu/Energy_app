import { Text, View } from "react-native";
import type { OwnershipPayout } from "@emappa/shared";
import { colors, GlassCard, Label } from "@emappa/ui";

export function OwnershipCard({ payouts }: { payouts: OwnershipPayout[] }) {
  return (
    <GlassCard>
      <Label>Cashflow ownership</Label>
      <Text style={{ color: colors.text, fontSize: 19, fontWeight: "600", letterSpacing: -0.4, marginTop: 5 }}>
        Ownership Ledger
      </Text>
      <Text style={{ color: colors.muted, lineHeight: 21, marginTop: 6 }}>
        Payouts follow monetized solar and current share ownership only.
      </Text>
      {payouts.map((payout, index) => (
        <View
          key={payout.ownerId}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            paddingVertical: 12,
            borderTopColor: index === 0 ? "transparent" : colors.border,
            borderTopWidth: 1,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: "600", textTransform: "capitalize" }}>{payout.ownerRole}</Text>
            <Text style={{ color: colors.muted, marginTop: 2 }}>{Math.round(payout.percentage * 100)}% future cashflows</Text>
          </View>
          <Text style={{ color: colors.text, fontWeight: "600" }}>KSh {payout.payout.toLocaleString()}</Text>
        </View>
      ))}
    </GlassCard>
  );
}
