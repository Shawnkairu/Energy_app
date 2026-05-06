import { Text, View } from "react-native";
import type { DrsResult } from "@emappa/shared";
import { colors, GlassCard, Label, Pill } from "@emappa/ui";

export function DrsCard({ drs }: { drs: DrsResult & { label?: string } }) {
  const tone = drs.decision === "approve" ? "good" : drs.decision === "review" ? "warn" : "bad";

  return (
    <GlassCard>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Label>DRS gate</Label>
          <Text style={{ color: colors.text, fontSize: 19, fontWeight: "600", letterSpacing: -0.4, marginTop: 5 }}>
            Deployment Readiness
          </Text>
        </View>
        <Pill tone={tone}>{drs.decision}</Pill>
      </View>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 12 }}>
        <Text style={{ color: colors.text, fontSize: 48, fontWeight: "600", letterSpacing: -1.6 }}>{drs.score}</Text>
        <Text style={{ color: colors.muted, fontWeight: "600", marginBottom: 10 }}>/ 100</Text>
      </View>
      <View style={{ height: 10, backgroundColor: colors.panelSoft, borderRadius: 999, marginTop: 10 }}>
        <View
          style={{
            height: 10,
            width: `${Math.max(0, Math.min(100, drs.score))}%`,
            borderRadius: 999,
            backgroundColor: tone === "good" ? colors.green : tone === "warn" ? colors.amber : colors.red,
          }}
        />
      </View>
      <Text style={{ color: colors.muted, lineHeight: 21, marginTop: 10 }}>{drs.label}</Text>
      {drs.reasons.slice(0, 2).map((reason) => (
        <View key={reason} style={{ backgroundColor: `${colors.red}10`, borderColor: `${colors.red}30`, borderWidth: 1, borderRadius: 16, padding: 10, marginTop: 8 }}>
          <Text style={{ color: colors.red, fontWeight: "600" }}>{reason}</Text>
        </View>
      ))}
    </GlassCard>
  );
}
