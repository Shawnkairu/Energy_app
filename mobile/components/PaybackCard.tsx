import { Text, View } from "react-native";
import type { PaybackResult } from "@emappa/shared";
import { colors, GlassCard, Label, Value } from "@emappa/ui";

export function PaybackCard({ payback }: { payback: PaybackResult }) {
  return (
    <GlassCard>
      <Label>Projected payback</Label>
      <Value>{payback.yearsToPrincipal.toFixed(1)} years</Value>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.white,
            borderRadius: 18,
            padding: 12,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600", textTransform: "uppercase" }}>Target</Text>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", marginTop: 4 }}>{payback.yearsToTarget.toFixed(1)} yrs</Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.white,
            borderRadius: 18,
            padding: 12,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600", textTransform: "uppercase" }}>Basis</Text>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "600", marginTop: 4 }}>Sold kWh</Text>
        </View>
      </View>
      <Text style={{ color: colors.muted, marginTop: 12, lineHeight: 21 }}>
        Not guaranteed; recovery is driven by prepaid, monetized solar.
      </Text>
    </GlassCard>
  );
}
