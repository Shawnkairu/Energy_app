import { type ReactNode } from "react";
import { Text, View, type DimensionValue } from "react-native";
import type { ProjectedBuilding } from "@emappa/shared";
import { colors, GlassCard, Label, PaletteCard, Pill, typography } from "@emappa/ui";

export function supplierView(building: ProjectedBuilding) {
  return building.roleViews.supplier;
}

export function SupplierMetricGrid({ metrics }: { metrics: Array<{ label: string; value: string; detail: string }> }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 4 }}>
      {metrics.map((metric) => (
        <PaletteCard key={metric.label} borderRadius={24} padding={14} style={{ width: "48%", minHeight: 112 }}>
          <View
            style={{
              height: 1,
              alignSelf: "stretch",
              backgroundColor: colors.border,
              marginBottom: 10,
            }}
          />
          <Text
            style={{
              color: colors.muted,
              fontSize: typography.micro,
              fontWeight: "600",
              letterSpacing: 0.65,
              textTransform: "uppercase",
            }}
          >
            {metric.label}
          </Text>
          <Text style={{ color: colors.text, fontSize: typography.title, fontWeight: "800", letterSpacing: -0.45, lineHeight: 28, marginTop: 6 }}>
            {metric.value}
          </Text>
          <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 18, marginTop: 4 }}>{metric.detail}</Text>
        </PaletteCard>
      ))}
    </View>
  );
}

export function SupplierCard({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title?: string;
  body?: string;
  children?: ReactNode;
}) {
  return (
    <GlassCard>
      <Label>{eyebrow}</Label>
      {title ? (
        <Text style={{ color: colors.text, fontSize: typography.title, fontWeight: "800", letterSpacing: -0.35, lineHeight: 28, marginTop: 6 }}>
          {title}
        </Text>
      ) : null}
      {body ? <Text style={{ color: colors.muted, fontSize: typography.body, lineHeight: 22, marginTop: title ? 7 : 6 }}>{body}</Text> : null}
      {children ? <View style={{ marginTop: 14 }}>{children}</View> : null}
    </GlassCard>
  );
}

export function SupplierRow({
  label,
  detail,
  value,
  tone = "neutral",
}: {
  label: string;
  detail: string;
  value: string;
  tone?: "good" | "warn" | "bad" | "neutral";
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderTopColor: colors.border, borderTopWidth: 1 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: typography.body, fontWeight: "700", letterSpacing: -0.1 }}>{label}</Text>
        <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 4 }}>{detail}</Text>
      </View>
      <Pill tone={tone}>{value}</Pill>
    </View>
  );
}

export function SupplierProofTable({
  rows,
}: {
  rows: Array<{ label: string; primary: string; secondary: string; status: string; tone?: "good" | "warn" | "bad" | "neutral" }>;
}) {
  return (
    <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 18, overflow: "hidden" }}>
      {rows.map((row, index) => (
        <View
          key={`${row.label}-${row.primary}`}
          style={{
            padding: 13,
            backgroundColor: colors.white,
            borderTopColor: index === 0 ? "transparent" : colors.border,
            borderTopWidth: 1,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
            <Text style={{ color: colors.text, flex: 1, fontSize: typography.body, fontWeight: "700" }}>{row.label}</Text>
            <Pill tone={row.tone ?? "neutral"}>{row.status}</Pill>
          </View>
          <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "800", letterSpacing: -0.2, lineHeight: 24, marginTop: 8 }}>
            {row.primary}
          </Text>
          <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 4 }}>{row.secondary}</Text>
        </View>
      ))}
    </View>
  );
}

export function SupplierTimeline({
  steps,
  listLabel,
}: {
  steps: Array<{ label: string; detail: string; complete: boolean }>;
  listLabel?: string;
}) {
  return (
    <View>
      {listLabel ? (
        <>
          <Label>{listLabel}</Label>
          <View style={{ height: 10 }} />
        </>
      ) : null}
      {steps.map((step, index) => (
        <View key={step.label} style={{ flexDirection: "row", gap: 12, paddingVertical: 11 }}>
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                height: 24,
                width: 24,
                borderRadius: 999,
                backgroundColor: step.complete ? `${colors.green}18` : `${colors.amber}16`,
                borderColor: step.complete ? colors.green : colors.amber,
                borderWidth: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={{ height: 8, width: 8, borderRadius: 999, backgroundColor: step.complete ? colors.green : colors.amber }} />
            </View>
            {index < steps.length - 1 ? <View style={{ flex: 1, width: 1, minHeight: 22, backgroundColor: colors.border }} /> : null}
          </View>
          <View style={{ flex: 1, paddingBottom: 8 }}>
            <Text style={{ color: colors.text, fontSize: typography.body, fontWeight: "700" }}>{step.label}</Text>
            <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 4 }}>{step.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function SupplierBar({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <Text style={{ color: colors.text, fontSize: typography.body, fontWeight: "700" }}>{label}</Text>
        <Text style={{ color: colors.muted, fontSize: typography.small, fontWeight: "700" }}>{value}%</Text>
      </View>
      <View style={{ height: 9, borderRadius: 999, backgroundColor: colors.panelSoft, marginTop: 8 }}>
        <View style={{ height: 9, width: `${Math.min(100, Math.max(0, value))}%` as DimensionValue, borderRadius: 999, backgroundColor: colors.solar }} />
      </View>
      <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 18, marginTop: 5 }}>{note}</Text>
    </View>
  );
}

export function SupplierActivityCard({ activity }: { activity: string[] }) {
  return (
    <SupplierCard eyebrow="Supplier activity">
      {activity.map((item, index) => (
        <View
          key={item}
          style={{
            flexDirection: "row",
            gap: 10,
            paddingVertical: 11,
            borderTopColor: index === 0 ? "transparent" : colors.border,
            borderTopWidth: 1,
          }}
        >
          <View style={{ height: 6, width: 6, borderRadius: 999, backgroundColor: colors.borderStrong, marginTop: 7 }} />
          <Text style={{ color: colors.muted, flex: 1, fontSize: typography.small, lineHeight: 20 }}>{item}</Text>
        </View>
      ))}
    </SupplierCard>
  );
}

export { colors, Label };
