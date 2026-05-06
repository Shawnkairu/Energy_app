/**
 * Global RN layout primitives aligned with the Claude design handoff.
 *
 * Sources (read-only reference under `mobile/claude design hov1/project/`):
 * - `screen-kit.jsx` — ScreenHeader, ActionRail → ActionChipRail, KpiRow / StatusRail → MetricStrip,
 *   MiniGrid → StatGrid, BriefCard row well → ListWell, Label patterns → SectionEyebrow.
 * - `screen-primitives.jsx` — PageHeader subtitle/eyebrow rhythm, Metric typography, horizontal chips.
 * - `palette.jsx` / `tokens.ts` — warm light-first surfaces; accents via `officialPalette` + `colors`.
 * - `cohesion.jsx` — shared section rhythm (identity strips, calm dividers, status tone colors).
 * - `Stakeholder Canvas v2.html` — HUD kicker + swimlane section labeling → DividerLabel.
 */

import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { AppMark, PaletteCard, Pill } from "./components";
import { colors, officialPalette, radius, spacing, typography } from "./tokens";

export type StatusTone = "good" | "warn" | "bad" | "neutral";

function toneColor(tone: StatusTone = "neutral"): string {
  switch (tone) {
    case "good":
      return colors.green;
    case "warn":
      return colors.amber;
    case "bad":
      return colors.red;
    default:
      return colors.orangeDeep;
  }
}

/** Uppercase section label — `screen-kit.jsx` Label + `screen-primitives.jsx` PageHeader `sub`. */
export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        color: colors.muted,
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 1.4,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Text>
  );
}

export type ScreenHeaderProps = {
  /** Section chip (e.g. workflow name) — `screen-kit.jsx` Pill. */
  section: ReactNode;
  /** Role workspace line — `screen-kit.jsx` `roleLabel`. */
  roleLabel: string;
  title: string;
  subtitle: string;
  /** Optional mark; defaults to `AppMark`. */
  mark?: ReactNode;
};

/** Top-of-screen identity block — `screen-kit.jsx` ScreenHeader. */
export function ScreenHeader({ section, roleLabel, title, subtitle, mark }: ScreenHeaderProps) {
  return (
    <View style={{ marginTop: spacing.sm }}>
      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1, marginRight: spacing.md }}>
          <View style={{ alignSelf: "flex-start" }}>{typeof section === "string" ? <Pill>{section}</Pill> : section}</View>
          <Text
            style={{
              color: colors.muted,
              fontSize: typography.micro,
              fontWeight: "600",
              letterSpacing: 1.2,
              marginTop: spacing.sm,
              textTransform: "uppercase",
            }}
          >
            {roleLabel}
          </Text>
        </View>
        {mark ?? <AppMark size={22} />}
      </View>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.hero,
          fontWeight: "600",
          letterSpacing: -0.35,
          lineHeight: 32,
          marginTop: spacing.md,
        }}
      >
        {title}
      </Text>
      <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: spacing.xs }}>{subtitle}</Text>
    </View>
  );
}

export type ActionChipRailProps = {
  /** Primary action first — `screen-kit.jsx` ActionRail. */
  actions: readonly string[];
  /** `orange`: bordered fox accent; `dark`: graphite fill on primary. */
  primaryStyle?: "orange" | "dark";
  onPressAction?: (label: string, index: number) => void;
};

/** Horizontal action chips — `screen-kit.jsx` ActionRail (scrolls when needed). */
export function ActionChipRail({ actions, primaryStyle = "orange", onPressAction }: ActionChipRailProps) {
  const isDark = primaryStyle === "dark";
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.sm, marginBottom: spacing.md, marginTop: spacing.md, paddingRight: spacing.xs }}
    >
      {actions.map((a, i) => {
        const primary = i === 0;
        const borderColor = primary
          ? isDark
            ? colors.graphite
            : officialPalette.burntChestnut
          : colors.border;
        const backgroundColor = primary && isDark ? colors.graphite : colors.white;
        const color = primary ? (isDark ? colors.white : officialPalette.burntChestnut) : colors.text;
        return (
          <Pressable
            key={`${a}-${i}`}
            onPress={onPressAction ? () => onPressAction(a, i) : undefined}
            style={({ pressed }) => [
              {
                backgroundColor,
                borderColor,
                borderRadius: radius.pill,
                borderWidth: StyleSheet.hairlineWidth * 2,
                opacity: pressed ? 0.85 : 1,
                paddingHorizontal: 13,
                paddingVertical: spacing.sm,
              },
            ]}
          >
            <Text style={{ color, fontSize: typography.micro, fontWeight: "600" }}>{a}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export type MetricStripItem = {
  label: string;
  value: string;
  note?: string;
  tone?: StatusTone;
};

/** Compact 3-up (or scrollable) metric rail — `screen-kit.jsx` KpiRow + StatusRail. */
export function MetricStrip({ items }: { items: readonly MetricStripItem[] }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.sm, marginBottom: spacing.md }}
    >
      {items.map((it) => (
        <PaletteCard
          key={it.label}
          borderRadius={20}
          contentStyle={{ marginBottom: 0, minWidth: 108 }}
          padding={11}
          style={{ flexGrow: 0 }}
        >
          <View
            style={{
              backgroundColor: it.tone && it.tone !== "neutral" ? toneColor(it.tone) : `${officialPalette.scarfOat}55`,
              borderRadius: 2,
              height: 2,
              marginBottom: spacing.sm,
            }}
          />
          <Text
            style={{
              color: colors.muted,
              fontSize: 9.5,
              fontWeight: "700",
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            {it.label}
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: typography.title,
              fontWeight: "600",
              letterSpacing: -0.35,
              marginTop: spacing.sm,
            }}
          >
            {it.value}
          </Text>
          {it.note ? (
            <Text style={{ color: colors.muted, fontSize: typography.micro, lineHeight: 16, marginTop: spacing.xs }}>{it.note}</Text>
          ) : null}
        </PaletteCard>
      ))}
    </ScrollView>
  );
}

export type ListWellRow = {
  label: string;
  value: string;
  note?: string;
  tone?: StatusTone;
};

/** Striped inset rows — `screen-kit.jsx` BriefCard / ProofTable row stack. */
export function ListWell({
  rows,
  framed = true,
  style,
}: {
  rows: readonly ListWellRow[];
  framed?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        framed
          ? {
              borderColor: colors.border,
              borderRadius: radius.md,
              borderWidth: StyleSheet.hairlineWidth * 2,
              overflow: "hidden",
            }
          : {},
        style,
      ]}
    >
      {rows.map((r, i) => (
        <View
          key={`${r.label}-${i}`}
          style={{
            backgroundColor: i % 2 === 0 ? colors.white : colors.sky,
            borderTopColor: colors.border,
            borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth * 2,
            padding: spacing.sm + 2,
          }}
        >
          <View style={{ flexDirection: "row", gap: spacing.sm, justifyContent: "space-between" }}>
            <Text
              style={{
                color: colors.muted,
                flex: 1,
                fontSize: 9.5,
                fontWeight: "700",
                letterSpacing: 0.8,
                textTransform: "uppercase",
              }}
            >
              {r.label}
            </Text>
            <Text style={{ color: toneColor(r.tone ?? "neutral"), flexShrink: 0, fontSize: typography.small, fontWeight: "600" }}>
              {r.value}
            </Text>
          </View>
          {r.note ? (
            <Text style={{ color: colors.muted, fontSize: typography.micro, lineHeight: 16, marginTop: spacing.xs }}>{r.note}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

/** Section divider with label — `Stakeholder Canvas v2.html` HUD kicker / legend title rhythm. */
export function DividerLabel({ label }: { label: string }) {
  return (
    <View style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm, marginVertical: spacing.md }}>
      <View style={{ backgroundColor: colors.border, flex: 1, height: StyleSheet.hairlineWidth * 2 }} />
      <Text style={{ color: colors.muted, fontSize: 9.5, fontWeight: "700", letterSpacing: 1.6, textTransform: "uppercase" }}>{label}</Text>
      <View style={{ backgroundColor: colors.border, flex: 1, height: StyleSheet.hairlineWidth * 2 }} />
    </View>
  );
}

export type StatGridItem = {
  label: string;
  value: string;
  detail?: string;
  tone?: StatusTone;
};

/** Two-column stat tiles — `screen-kit.jsx` MiniGrid + `screen-primitives.jsx` Metric density. */
export function StatGrid({ items }: { items: readonly StatGridItem[] }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md }}>
      {items.map((it) => (
        <View
          key={it.label}
          style={{
            backgroundColor: colors.white,
            borderColor: it.tone ? `${toneColor(it.tone)}50` : colors.border,
            borderRadius: 18,
            borderWidth: StyleSheet.hairlineWidth * 2,
            flexBasis: "47%",
            flexGrow: 1,
            padding: spacing.md,
          }}
        >
          <SectionEyebrow>{it.label}</SectionEyebrow>
          <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "600", letterSpacing: -0.35, marginTop: spacing.sm }}>
            {it.value}
          </Text>
          {it.detail ? (
            <Text style={{ color: colors.muted, fontSize: 10.5, lineHeight: 15, marginTop: spacing.xs }}>{it.detail}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}
