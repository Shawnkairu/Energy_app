import { Text, View } from "react-native";
import { colors, GlassCard, Label, PaletteCard, Pill, typography, Value } from "@emappa/ui";

export function Insight({ title, body }: { title: string; body: string }) {
  return (
    <GlassCard>
      <Label>Insight</Label>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.title,
          fontWeight: "600",
          letterSpacing: -0.4,
          marginTop: 6,
          lineHeight: typography.title + 4,
        }}
      >
        {title}
      </Text>
      <Text style={{ color: colors.muted, marginTop: 8, fontSize: typography.body, lineHeight: 22 }}>{body}</Text>
    </GlassCard>
  );
}

export function GateList({ gates }: { gates: Array<{ label: string; complete: boolean }> }) {
  const completeCount = gates.filter((gate) => gate.complete).length;

  return (
    <GlassCard>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <View>
          <Label>Readiness</Label>
          <Text
            style={{
              color: colors.text,
              fontSize: typography.title,
              fontWeight: "600",
              letterSpacing: -0.4,
              marginTop: 5,
              lineHeight: typography.title + 4,
            }}
          >
            Deployment Gates
          </Text>
        </View>
        <Pill tone={completeCount === gates.length ? "good" : "warn"}>{completeCount}/{gates.length}</Pill>
      </View>
      {gates.map((gate, index) => (
        <View
          key={gate.label}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
            paddingVertical: 11,
            borderTopColor: index === 0 ? "transparent" : colors.border,
            borderTopWidth: 1,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
            <View
              style={{
                height: 22,
                width: 22,
                borderRadius: 999,
                backgroundColor: gate.complete ? `${colors.green}18` : `${colors.red}12`,
                borderColor: gate.complete ? colors.green : colors.red,
                borderWidth: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={{ height: 8, width: 8, borderRadius: 999, backgroundColor: gate.complete ? colors.green : colors.red }} />
            </View>
            <Text style={{ color: colors.text, flex: 1, fontWeight: "700" }}>{gate.label}</Text>
          </View>
          <Text style={{ color: gate.complete ? colors.green : colors.red, fontWeight: "600" }}>
            {gate.complete ? "Ready" : "Blocked"}
          </Text>
        </View>
      ))}
    </GlassCard>
  );
}

export function SectionBrief({
  eyebrow,
  title,
  body,
  rows,
  stripedRows = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  rows: Array<{ label: string; value: string; note: string }>;
  /** Ops / warm shells: alternate sky + cream row wells (other-screens / admin parity). */
  stripedRows?: boolean;
}) {
  return (
    <GlassCard>
      <Label>{eyebrow}</Label>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.title,
          fontWeight: "600",
          letterSpacing: -0.5,
          marginTop: 6,
          lineHeight: typography.title + 4,
        }}
      >
        {title}
      </Text>
      <Text style={{ color: colors.muted, fontSize: typography.body, lineHeight: 22, marginTop: 8 }}>{body}</Text>
      <View style={{ marginTop: 14, borderColor: colors.border, borderWidth: 1, borderRadius: 18, overflow: "hidden" }}>
        {rows.map((row, index) => (
          <View
            key={`${row.label}-${row.value}`}
            style={{
              padding: 12,
              backgroundColor: stripedRows ? (index % 2 === 0 ? colors.sky : colors.cream) : colors.white,
              borderTopColor: index === 0 ? "transparent" : colors.border,
              borderTopWidth: 1,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600", letterSpacing: 0.7, textTransform: "uppercase" }}>
                {row.label}
              </Text>
              <Text style={{ color: colors.text, flexShrink: 0, fontWeight: "600" }}>{row.value}</Text>
            </View>
            <Text style={{ color: colors.muted, lineHeight: 19, marginTop: 5 }}>{row.note}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

export function StatusRail({
  items,
}: {
  items: Array<{ label: string; value: string; note: string; tone?: "good" | "warn" | "bad" | "neutral" }>;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
      {items.map((item) => (
        <PaletteCard
          key={item.label}
          borderRadius={24}
          padding={14}
          style={{ flex: 1, minHeight: 112 }}
        >
          <Pill tone={item.tone ?? "neutral"}>{item.label}</Pill>
          <Text
            style={{
              color: colors.text,
              fontSize: typography.title,
              fontWeight: "600",
              letterSpacing: -0.5,
              marginTop: 12,
              lineHeight: typography.title + 4,
            }}
          >
            {item.value}
          </Text>
          <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 17, marginTop: 6 }}>{item.note}</Text>
        </PaletteCard>
      ))}
    </View>
  );
}

export function ActionList({
  eyebrow = "Next actions",
  title,
  items,
}: {
  eyebrow?: string;
  title: string;
  items: Array<{ label: string; detail: string; status: string; tone?: "good" | "warn" | "bad" | "neutral" }>;
}) {
  return (
    <GlassCard>
      <Label>{eyebrow}</Label>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.title,
          fontWeight: "600",
          letterSpacing: -0.5,
          marginTop: 6,
          lineHeight: typography.title + 4,
        }}
      >
        {title}
      </Text>
      <View style={{ marginTop: 12 }}>
        {items.map((item, index) => (
          <View
            key={item.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingVertical: 12,
              borderTopColor: index === 0 ? "transparent" : colors.border,
              borderTopWidth: 1,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "600" }}>{item.label}</Text>
              <Text style={{ color: colors.muted, lineHeight: 19, marginTop: 4 }}>{item.detail}</Text>
            </View>
            <Pill tone={item.tone ?? "neutral"}>{item.status}</Pill>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

export { GlassCard, Label, PaletteCard, Value, colors };
