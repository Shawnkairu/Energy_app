import { Text, View } from "react-native";
import type { DrsResult } from "@emappa/shared";
import { colors, GlassCard, Pill } from "@emappa/ui";

export function DrsCard({ drs }: { drs: DrsResult & { label?: string } }) {
  const tone = drs.decision === "approve" ? "good" : drs.decision === "review" ? "warn" : "bad";

  return (
    <GlassCard accent={drs.decision === "approve" ? colors.green : colors.orange}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>Deployment Readiness</Text>
        <Pill tone={tone}>{drs.decision}</Pill>
      </View>
      <Text style={{ color: colors.text, fontSize: 48, fontWeight: "900", marginTop: 10 }}>{drs.score}</Text>
      <Text style={{ color: colors.muted }}>{drs.label}</Text>
      {drs.reasons.slice(0, 2).map((reason) => (
        <Text key={reason} style={{ color: colors.red, marginTop: 8 }}>
          {reason}
        </Text>
      ))}
    </GlassCard>
  );
}
