import { type ReactNode } from "react";
import { Text, View } from "react-native";
import type { ProjectedBuilding } from "@emappa/shared";
import {
  colors,
  GlassCard,
  Label,
  Pill,
  typography,
  Value,
  radius,
  shadows,
  spacing,
} from "@emappa/ui";
import { RoleDashboardScaffold } from "../roles/RoleDashboardScaffold";

export type InstallerTone = "good" | "warn" | "bad" | "neutral";

export interface InstallerHero {
  label: string;
  value: string;
  sub: string;
  tone?: InstallerTone;
}

export interface InstallerStatusItem {
  label: string;
  value: string;
  note: string;
  tone?: InstallerTone;
}

export interface InstallerRowItem {
  label: string;
  value: string;
  note: string;
  tone?: InstallerTone;
}

export interface InstallerActionItem {
  label: string;
  detail: string;
  status: string;
  tone?: InstallerTone;
}

export function InstallerScaffold({
  section,
  title,
  subtitle,
  actions,
  hero,
  children,
}: {
  section: string;
  title: string;
  subtitle: string;
  actions: string[];
  hero: (building: ProjectedBuilding) => InstallerHero;
  children: (building: ProjectedBuilding) => ReactNode;
}) {
  return (
    <RoleDashboardScaffold
      role="installer"
      section={section}
      title={title}
      subtitle={subtitle}
      actions={actions}
      cohesionRole="installer"
      renderHero={(building) => {
        const h = hero(building);
        return { label: h.label, value: h.value, sub: h.sub };
      }}
      renderPanels={children}
    />
  );
}

/** Layered field row for checklist-style stacks on warm tinted surfaces. */
export function InstallerFieldRow({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.md,
        backgroundColor: colors.sky,
        padding: spacing.md,
        ...shadows.soft,
      }}
    >
      {children}
    </View>
  );
}

export function InstallerStatusGrid({ items }: { items: InstallerStatusItem[] }) {
  return (
    <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg }}>
      {items.map((item) => (
        <View
          key={item.label}
          style={{
            flex: 1,
            minHeight: 104,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: radius.lg,
            backgroundColor: colors.sky,
            padding: spacing.md,
            ...shadows.soft,
          }}
        >
          <Pill tone={item.tone ?? "neutral"}>{item.label}</Pill>
          <Text
            style={{
              color: colors.text,
              fontSize: typography.heading,
              fontWeight: "700",
              letterSpacing: -0.4,
              marginTop: 11,
            }}
          >
            {item.value}
          </Text>
          <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 18, marginTop: 6 }}>{item.note}</Text>
        </View>
      ))}
    </View>
  );
}

export function InstallerBrief({
  eyebrow,
  title,
  body,
  rows,
}: {
  eyebrow: string;
  title: string;
  body: string;
  rows: InstallerRowItem[];
}) {
  return (
    <GlassCard>
      <Label>{eyebrow}</Label>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.title,
          fontWeight: "700",
          letterSpacing: -0.5,
          marginTop: 6,
          lineHeight: typography.title + 6,
        }}
      >
        {title}
      </Text>
      <Text style={{ color: colors.muted, fontSize: typography.body, lineHeight: 22, marginTop: 8 }}>{body}</Text>
      <View
        style={{
          marginTop: 14,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.lg,
          overflow: "hidden",
          backgroundColor: colors.sky,
          ...shadows.soft,
        }}
      >
        {rows.map((row, index) => (
          <View
            key={`${row.label}-${row.value}`}
            style={{
              padding: spacing.md,
              backgroundColor: index % 2 === 0 ? colors.white : colors.panelSoft,
              borderTopColor: index === 0 ? "transparent" : colors.border,
              borderTopWidth: index === 0 ? 0 : 1,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <Text
                style={{
                  color: colors.muted,
                  fontSize: typography.micro,
                  fontWeight: "600",
                  letterSpacing: 0.65,
                  textTransform: "uppercase",
                }}
              >
                {row.label}
              </Text>
              <Text style={{ color: toneColor(row.tone), flexShrink: 0, fontWeight: "700" }}>{row.value}</Text>
            </View>
            <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 5 }}>{row.note}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

export function InstallerActionList({
  eyebrow = "Field sequence",
  title,
  items,
}: {
  eyebrow?: string;
  title: string;
  items: InstallerActionItem[];
}) {
  return (
    <GlassCard>
      <Label>{eyebrow}</Label>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.title,
          fontWeight: "700",
          letterSpacing: -0.5,
          marginTop: 6,
          lineHeight: typography.title + 4,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          marginTop: spacing.md,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
          backgroundColor: colors.sky,
          ...shadows.soft,
        }}
      >
        {items.map((item, index) => (
          <View
            key={item.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.sm,
              backgroundColor: index % 2 === 0 ? colors.white : colors.panelSoft,
              borderTopColor: index === 0 ? "transparent" : colors.border,
              borderTopWidth: index === 0 ? 0 : 1,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: typography.body, fontWeight: "600" }}>{item.label}</Text>
              <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 4 }}>{item.detail}</Text>
            </View>
            <Pill tone={item.tone ?? "neutral"}>{item.status}</Pill>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

export function InstallerEvidenceList({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; detail: string; complete: boolean }>;
}) {
  const completeCount = items.filter((item) => item.complete).length;

  return (
    <GlassCard>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <View>
          <Label>Evidence</Label>
          <Text
            style={{
              color: colors.text,
              fontSize: typography.title,
              fontWeight: "700",
              letterSpacing: -0.5,
              marginTop: 5,
              lineHeight: typography.title + 4,
            }}
          >
            {title}
          </Text>
        </View>
        <Pill tone={completeCount === items.length ? "good" : "warn"}>{completeCount}/{items.length}</Pill>
      </View>
      <View
        style={{
          marginTop: spacing.sm,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
          backgroundColor: colors.sky,
          ...shadows.soft,
        }}
      >
      {items.map((item, index) => (
        <View
          key={item.label}
          style={{
            flexDirection: "row",
            gap: spacing.md,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.sm,
            backgroundColor: index % 2 === 0 ? colors.white : colors.panelSoft,
            borderTopColor: index === 0 ? "transparent" : colors.border,
            borderTopWidth: index === 0 ? 0 : 1,
          }}
        >
          <View
            style={{
              height: 24,
              width: 24,
              borderRadius: 999,
              backgroundColor: item.complete ? `${colors.green}18` : `${colors.amber}18`,
              borderColor: item.complete ? colors.green : colors.amber,
              borderWidth: 1,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 1,
            }}
          >
            <View style={{ height: 8, width: 8, borderRadius: 999, backgroundColor: item.complete ? colors.green : colors.amber }} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: typography.body, fontWeight: "600" }}>{item.label}</Text>
            <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 4 }}>{item.detail}</Text>
          </View>
        </View>
      ))}
      </View>
    </GlassCard>
  );
}

export function InstallerMetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <GlassCard>
      <Label>{label}</Label>
      <Value>{value}</Value>
      <Text style={{ color: colors.muted, fontSize: typography.small, marginTop: 7, lineHeight: 19 }}>{detail}</Text>
    </GlassCard>
  );
}

function toneColor(tone?: InstallerTone) {
  if (tone === "good") return colors.green;
  if (tone === "warn") return colors.amber;
  if (tone === "bad") return colors.red;
  return colors.text;
}

export { colors, GlassCard, Label, Pill, Value };
