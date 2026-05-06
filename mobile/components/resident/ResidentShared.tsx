import type { ReactNode } from "react";
import { StyleSheet, Text, View, type DimensionValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { ProjectedBuilding } from "@emappa/shared";
import { GlassCard, Label, PaletteCard, Pill, colors, officialPalette, radius, spacing, typography } from "@emappa/ui";
import { formatKes, formatKwh, formatPercent, residentView } from "./residentUtils";

export { formatKes, formatKwh, formatPercent, residentView };

/** Inset panel: sits on PaletteCard/GlassCard gradient without painting flat white. */
function InsetWell({
  children,
  padding = 14,
  borderRadius = 22,
  marginTop,
}: {
  children: ReactNode;
  padding?: number;
  borderRadius?: number;
  marginTop?: number;
}) {
  return (
    <View
      style={{
        marginTop,
        borderRadius,
        borderWidth: StyleSheet.hairlineWidth * 2,
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      <LinearGradient
        colors={[colors.panelSoft, `${officialPalette.furCream}30`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={{ padding }}>{children}</View>
    </View>
  );
}

export type ResidentTone = "good" | "warn" | "bad" | "neutral";

/** BigMetric-style tile (matches `screen-kit` / resident-screens-v2). */
export function ResidentBigMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <GlassCard>
      <Label>{label}</Label>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.hero - 4,
          fontWeight: "600",
          letterSpacing: -0.7,
          marginTop: spacing.sm,
          lineHeight: typography.hero + 2,
        }}
      >
        {value}
      </Text>
      {detail ? (
        <Text style={{ color: colors.muted, fontSize: typography.micro, lineHeight: 16, marginTop: spacing.sm }}>{detail}</Text>
      ) : null}
    </GlassCard>
  );
}

export const ResidentBalanceCard = ResidentBigMetric;

export function ResidentKpiRow({
  items,
}: {
  items: Array<{ label: string; value: string; note: string }>;
}) {
  return (
    <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg }}>
      {items.map((item) => (
        <PaletteCard key={item.label} borderRadius={20} padding={11} style={{ flex: 1 }}>
          <View
            style={{
              height: 2,
              alignSelf: "stretch",
              borderRadius: 2,
              backgroundColor: `${officialPalette.scarfOat}88`,
              marginBottom: spacing.sm,
            }}
          />
          <Text
            style={{
              color: colors.muted,
              fontSize: typography.micro - 1,
              fontWeight: "700",
              letterSpacing: 0.65,
              textTransform: "uppercase",
            }}
          >
            {item.label}
          </Text>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600", letterSpacing: -0.35, marginTop: 6 }}>
            {item.value}
          </Text>
          <Text style={{ color: colors.muted, fontSize: typography.micro - 1, lineHeight: 15, marginTop: 4 }}>{item.note}</Text>
        </PaletteCard>
      ))}
    </View>
  );
}

export function ResidentMiniGrid({
  items,
}: {
  items: Array<{ label: string; value: string; note: string; tone?: ResidentTone }>;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
      {items.map((item) => (
        <PaletteCard
          key={item.label}
          borderRadius={24}
          padding={14}
          style={{ width: "48%", minHeight: 118 }}
        >
          <View
            style={{
              height: 2,
              alignSelf: "stretch",
              borderRadius: 2,
              backgroundColor: `${officialPalette.toastedClay}44`,
              marginBottom: 10,
            }}
          />
          <Pill tone={item.tone ?? "neutral"}>{item.label}</Pill>
          <Text style={{ color: colors.text, fontSize: 21, fontWeight: "600", letterSpacing: -0.6, marginTop: 12 }}>
            {item.value}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 6 }}>{item.note}</Text>
        </PaletteCard>
      ))}
    </View>
  );
}

export function ResidentProgressBar({
  label,
  value,
  caption,
}: {
  label: string;
  value: number;
  caption: string;
}) {
  const width = `${Math.min(100, Math.max(0, value * 100))}%` as DimensionValue;
  const barH = 10;

  return (
    <View style={{ marginTop: spacing.sm + 2 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: typography.small, fontWeight: "600" }}>{label}</Text>
        <Text style={{ color: colors.text, fontSize: typography.small, fontWeight: "600" }}>{formatPercent(value)}</Text>
      </View>
      <View
        style={{
          height: barH,
          borderRadius: radius.pill,
          backgroundColor: colors.sky,
          marginTop: 6,
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        }}
      >
        <View style={{ width, height: barH, borderRadius: radius.pill, backgroundColor: colors.borderStrong }} />
      </View>
      <Text style={{ color: colors.muted, fontSize: typography.micro, lineHeight: 16, marginTop: 6 }}>{caption}</Text>
    </View>
  );
}

function ruleToneFg(t?: ResidentTone) {
  if (t === "good") return colors.green;
  if (t === "warn") return colors.amber;
  if (t === "bad") return colors.red;
  return colors.text;
}

/** BriefCard-style rule table (striped rows, matches resident-screens-v2 / screen-kit). */
export function ResidentRuleCard({
  eyebrow,
  title,
  body,
  rows,
}: {
  eyebrow: string;
  title: string;
  body: string;
  rows: Array<{ label: string; value: string; note: string; tone?: ResidentTone }>;
}) {
  return (
    <GlassCard>
      <Label>{eyebrow}</Label>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.heading,
          fontWeight: "600",
          letterSpacing: -0.35,
          marginTop: 5,
          lineHeight: typography.heading + 4,
        }}
      >
        {title}
      </Text>
      <Text style={{ color: colors.muted, fontSize: typography.micro, lineHeight: 17, marginTop: 6 }}>{body}</Text>
      <View
        style={{
          marginTop: spacing.md,
          borderRadius: radius.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          overflow: "hidden",
        }}
      >
        {rows.map((row, index) => (
          <View
            key={row.label}
            style={{
              padding: 10,
              backgroundColor: index % 2 === 0 ? colors.white : colors.sky,
              borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
              borderTopColor: colors.border,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
              <Text
                style={{
                  color: colors.muted,
                  fontSize: typography.micro - 1,
                  fontWeight: "700",
                  letterSpacing: 0.65,
                  textTransform: "uppercase",
                  flex: 1,
                }}
              >
                {row.label}
              </Text>
              <Text style={{ color: ruleToneFg(row.tone), fontSize: typography.small - 1, fontWeight: "600" }}>{row.value}</Text>
            </View>
            <Text style={{ color: colors.muted, fontSize: typography.micro, lineHeight: 16, marginTop: 4 }}>{row.note}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

export function ResidentFlowLane({
  steps,
}: {
  steps: Array<{ label: string; value: string; detail: string; color: string }>;
}) {
  return (
    <GlassCard>
      <Label>Energy flow</Label>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.heading,
          fontWeight: "600",
          letterSpacing: -0.35,
          marginTop: 5,
          lineHeight: typography.heading + 4,
        }}
      >
        Solar first, fallback clearly labeled
      </Text>
      <Text style={{ color: colors.muted, fontSize: typography.micro, lineHeight: 16, marginTop: 6 }}>
        A simple source map for household power, not a wallet or ownership summary.
      </Text>
      <InsetWell marginTop={12} borderRadius={20} padding={10}>
        {steps.map((step, index) => (
          <View
            key={step.label}
            style={{
              flexDirection: "row",
              gap: 10,
              paddingVertical: 10,
              borderTopColor: index === 0 ? "transparent" : colors.border,
              borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
            }}
          >
            <View
              style={{
                height: 30,
                width: 30,
                borderRadius: radius.pill,
                backgroundColor: colors.sky,
                borderColor: step.color,
                borderWidth: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: step.color, fontWeight: "600", fontSize: typography.small }}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: typography.small }}>{step.label}</Text>
                <Text style={{ color: colors.text, fontWeight: "600", fontSize: typography.small }}>{step.value}</Text>
              </View>
              <Text style={{ color: colors.muted, fontSize: typography.micro, lineHeight: 16, marginTop: 3 }}>{step.detail}</Text>
            </View>
          </View>
        ))}
      </InsetWell>
    </GlassCard>
  );
}

export function ResidentTrustList({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; detail: string; status: string; tone?: ResidentTone }>;
}) {
  return (
    <GlassCard>
      <Label>Trust checklist</Label>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.heading,
          fontWeight: "600",
          letterSpacing: -0.35,
          marginTop: 5,
          lineHeight: typography.heading + 4,
        }}
      >
        {title}
      </Text>
      <View style={{ marginTop: spacing.sm }}>
        {items.map((item, index) => (
          <View
            key={item.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingVertical: 11,
              borderTopColor: index === 0 ? "transparent" : colors.border,
              borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: typography.small }}>{item.label}</Text>
              <Text style={{ color: colors.muted, fontSize: typography.micro, lineHeight: 16, marginTop: 3 }}>{item.detail}</Text>
            </View>
            <Pill tone={item.tone ?? "neutral"}>{item.status}</Pill>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

export function ResidentTokenArtifact({
  balance,
  topUp,
  fundedRatio,
}: {
  balance: string;
  topUp: string;
  fundedRatio: number;
}) {
  const width = `${Math.min(100, Math.max(0, fundedRatio * 100))}%` as DimensionValue;
  const barH = 8;

  return (
    <GlassCard>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Label>Prepaid token</Label>
          <Text
            style={{
              color: colors.text,
              fontSize: typography.title + 1,
              fontWeight: "600",
              letterSpacing: -0.55,
              marginTop: 5,
              lineHeight: typography.title + 8,
            }}
          >
            Solar allocation pass
          </Text>
        </View>
        <Pill tone="good">cash first</Pill>
      </View>
      <InsetWell marginTop={12} borderRadius={18} padding={12}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View>
            <Text
              style={{
                color: colors.muted,
                fontSize: typography.micro - 1,
                fontWeight: "700",
                letterSpacing: 0.65,
                textTransform: "uppercase",
              }}
            >
              Balance
            </Text>
            <Text style={{ color: colors.text, fontSize: typography.hero - 4, fontWeight: "600", letterSpacing: -0.65, marginTop: 4 }}>
              {balance}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                color: colors.muted,
                fontSize: typography.micro - 1,
                fontWeight: "700",
                letterSpacing: 0.65,
                textTransform: "uppercase",
              }}
            >
              Suggested
            </Text>
            <Text style={{ color: colors.text, fontSize: typography.body - 1, fontWeight: "600", marginTop: 5 }}>{topUp}</Text>
          </View>
        </View>
        <View
          style={{
            height: barH,
            borderRadius: radius.pill,
            backgroundColor: colors.sky,
            marginTop: 14,
            overflow: "hidden",
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
          }}
        >
          <View style={{ height: barH, width, borderRadius: radius.pill, backgroundColor: colors.borderStrong }} />
        </View>
        <Text style={{ color: colors.muted, fontSize: typography.micro, lineHeight: 16, marginTop: 6 }}>
          Allocation opens only after top-up cash clears and local solar is sold.
        </Text>
      </InsetWell>
    </GlassCard>
  );
}

export function ResidentEnergyFlowGraphic({
  coverage,
  solar,
  battery,
  grid,
}: {
  coverage: number;
  solar: string;
  battery: string;
  grid: string;
}) {
  const ring = 110;

  return (
    <GlassCard>
      <Label>Monthly source map</Label>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.title + 1,
          fontWeight: "600",
          letterSpacing: -0.55,
          marginTop: 5,
          lineHeight: typography.title + 8,
        }}
      >
        {formatPercent(coverage)} of the home ran on sold solar
      </Text>
      <View style={{ marginTop: 14, alignItems: "center" }}>
        <View
          style={{
            height: ring,
            width: ring,
            borderRadius: radius.pill,
            borderWidth: 2,
            borderColor: colors.borderStrong,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={[colors.sky, `${officialPalette.plushCaramel}44`]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: colors.text, fontSize: 26, fontWeight: "600", letterSpacing: -0.65 }}>{formatPercent(coverage)}</Text>
            <Text style={{ color: colors.muted, fontSize: typography.micro, fontWeight: "600", marginTop: 2 }}>solar cover</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: 14 }}>
        {[
          { label: "Solar", value: solar },
          { label: "Battery", value: battery },
          { label: "Grid", value: grid },
        ].map((item) => (
          <View key={item.label} style={{ flex: 1, alignItems: "center" }}>
            <View style={{ height: 2, width: 22, borderRadius: 2, backgroundColor: `${officialPalette.guitarMaple}88`, marginBottom: 6 }} />
            <Text style={{ color: colors.text, fontWeight: "600", fontSize: typography.micro }}>{item.label}</Text>
            <Text style={{ color: colors.muted, fontSize: typography.micro - 1, marginTop: 3 }}>{item.value}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

export function ResidentOwnershipPrimer({
  share,
  payout,
}: {
  share: string;
  payout: string;
}) {
  return (
    <GlassCard>
      <Label>Future cashflow education</Label>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.title + 1,
          fontWeight: "600",
          letterSpacing: -0.55,
          marginTop: 5,
          lineHeight: typography.title + 8,
        }}
      >
        Optional ownership, never required for solar use
      </Text>
      <View
        style={{
          marginTop: spacing.md,
          borderLeftColor: `${officialPalette.foxOrange}99`,
          borderLeftWidth: 3,
          paddingLeft: 14,
          paddingVertical: 4,
          borderRadius: radius.sm,
          backgroundColor: `${officialPalette.furCream}18`,
        }}
      >
        {[
          { label: "Current resident pool", value: share, note: "Share of future provider-side cashflows in this demo." },
          { label: "Projected pool payout", value: payout, note: "Only from monetized solar, not wasted or free-exported energy." },
          { label: "Transfer caveat", value: "future only", note: "Buying or selling changes future payout periods after payment clears." },
        ].map((item) => (
          <View key={item.label} style={{ paddingVertical: 11 }}>
            <Text
              style={{
                color: colors.muted,
                fontSize: typography.micro,
                fontWeight: "700",
                letterSpacing: 0.65,
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </Text>
            <Text style={{ color: colors.text, fontSize: typography.title, fontWeight: "600", letterSpacing: -0.45, marginTop: 3 }}>
              {item.value}
            </Text>
            <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 4 }}>{item.note}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

export function ResidentIdentityCard({
  buildingName,
  location,
  units,
  trustReady,
  privacyNote,
}: {
  buildingName: string;
  location: string;
  units: number;
  trustReady: boolean;
  privacyNote: string;
}) {
  return (
    <GlassCard>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
        <View style={{ flex: 1 }}>
          <Label>Resident membership</Label>
          <Text style={{ color: colors.text, fontSize: typography.hero - 2, fontWeight: "600", letterSpacing: -0.75, marginTop: 7 }}>
            {buildingName}
          </Text>
          <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 20, marginTop: 8 }}>
            {location} - {units} homes - one verified resident session.
          </Text>
        </View>
        <Pill tone={trustReady ? "good" : "warn"}>{trustReady ? "verified" : "review"}</Pill>
      </View>
      <InsetWell marginTop={12} borderRadius={18}>
        <Text style={{ color: colors.text, fontSize: typography.small, fontWeight: "600" }}>Privacy boundary</Text>
        <Text style={{ color: colors.muted, fontSize: typography.micro, lineHeight: 16, marginTop: 5 }}>{privacyNote}</Text>
      </InsetWell>
    </GlassCard>
  );
}

export function ResidentSupportTriage({
  hasBlocker,
  blocker,
}: {
  hasBlocker: boolean;
  blocker?: string;
}) {
  const items = [
    { label: "Wallet", detail: "Top-up, missing token, or allocation blocked.", status: "money" },
    { label: "Power", detail: "Solar unavailable, battery support, or grid fallback.", status: "energy" },
    { label: "Shares", detail: "Optional ownership and payout caveat questions.", status: "learn" },
  ];

  return (
    <GlassCard>
      <Label>Simple triage</Label>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.title + 1,
          fontWeight: "600",
          letterSpacing: -0.45,
          marginTop: 5,
          lineHeight: typography.title + 8,
        }}
      >
        Pick one issue type
      </Text>
      <View style={{ marginTop: 10 }}>
        {items.map((item, index) => (
          <View
            key={item.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingVertical: 11,
              borderTopColor: index === 0 ? "transparent" : colors.border,
              borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
            }}
          >
            <View
              style={{
                height: 30,
                width: 30,
                borderRadius: radius.pill,
                backgroundColor: colors.white,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: typography.micro }}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "600", fontSize: typography.small }}>{item.label}</Text>
              <Text style={{ color: colors.muted, fontSize: typography.micro, lineHeight: 16, marginTop: 3 }}>{item.detail}</Text>
            </View>
            <Pill>{item.status}</Pill>
          </View>
        ))}
      </View>
      <InsetWell marginTop={8} borderRadius={16} padding={10}>
        <Text style={{ color: colors.text, fontWeight: "600", fontSize: typography.small }}>
          {hasBlocker ? "Building readiness note" : "No building blocker visible"}
        </Text>
        <Text style={{ color: colors.muted, fontSize: typography.micro, lineHeight: 16, marginTop: 4 }}>
          {hasBlocker ? blocker : "Support can stay focused on the household issue."}
        </Text>
      </InsetWell>
    </GlassCard>
  );
}

export { BuildingPulse, KillSwitchBanner, SettlementWaterfall, TariffComparison, OwnershipLedgerEntry } from "../design-handoff";
