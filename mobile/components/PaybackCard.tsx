import { Text } from "react-native";
import type { PaybackResult } from "@emappa/shared";
import { colors, GlassCard, Label, Value } from "@emappa/ui";

export function PaybackCard({ payback }: { payback: PaybackResult }) {
  return (
    <GlassCard accent={colors.blue}>
      <Label>Projected payback</Label>
      <Value>{payback.yearsToPrincipal.toFixed(1)} years</Value>
      <Text style={{ color: colors.muted, marginTop: 6 }}>
        Target recovery: {payback.yearsToTarget.toFixed(1)} years. Not guaranteed; driven by monetized solar.
      </Text>
    </GlassCard>
  );
}
