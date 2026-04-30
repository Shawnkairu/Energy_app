import { Text } from "react-native";
import { colors, GlassCard, Label, Value } from "@emappa/ui";

export function MetricCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <GlassCard accent={colors.orange}>
      <Label>{label}</Label>
      <Value>{value}</Value>
      {detail ? <Text style={{ color: colors.muted, marginTop: 6 }}>{detail}</Text> : null}
    </GlassCard>
  );
}
