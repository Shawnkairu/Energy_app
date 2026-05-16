import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { type ReactNode, useMemo } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Defs, G, Line, LinearGradient as SvgLinearGradient, Path, Rect, Stop } from "react-native-svg";
import { colors, energyImmersive, radius, spacing, typography } from "@emappa/ui";

function peakKw(hourly: number[]): number {
  if (!hourly.length) return 0;
  return Math.max(...hourly);
}

function fmtKw(kw: number): string {
  if (kw <= 0) return "0.0 kW";
  return `${kw.toFixed(1)} kW`;
}

export interface EnergySummaryCard {
  label: string;
  value: string;
  hint?: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export interface ImmersiveCallout {
  label: string;
  value: string;
}

/** Tesla / Enphase–style system overview: dark hero, flow schematic, bottom sheet with ring + KPI row. */
export function SystemEnergyImmersiveHero({
  siteName,
  weatherHint,
  generationKwhToday,
  loadKwhToday,
  generationHourly,
  loadHourly,
  batterySoc,
  batteryStatus,
  summaryCards,
  footerExtras,
  savingsKesLabel,
}: {
  siteName: string;
  weatherHint?: string;
  generationKwhToday: number;
  loadKwhToday: number;
  generationHourly: number[];
  loadHourly: number[];
  batterySoc: number;
  batteryStatus: "charging" | "discharging" | "idle";
  summaryCards: EnergySummaryCard[];
  footerExtras?: ReactNode;
  savingsKesLabel: string;
}) {
  const { width: winW } = useWindowDimensions();
  const heroW = winW;
  const svgH = 268;

  const peakGen = peakKw(generationHourly);
  const peakLoad = peakKw(loadHourly);
  const gridKw = Math.max(0, peakLoad - peakGen * 0.82);
  const chargingKw = Math.max(0, peakGen - peakLoad * 0.88);

  const statusLine = useMemo(() => {
    if (batteryStatus === "charging") return "Charging";
    if (batteryStatus === "discharging") return "Supporting load";
    return "Balanced";
  }, [batteryStatus]);

  const ringPct = Math.round(Math.min(1, Math.max(0, batterySoc)) * 100);
  const ringSize = 76;
  const ringStroke = 7;
  const ringR = (ringSize - ringStroke) / 2;
  const ringCirc = 2 * Math.PI * ringR;
  const ringDash = ringCirc * (ringPct / 100);

  return (
    <View style={[styles.heroWrap, { width: heroW }]}>
      <LinearGradient
        colors={[energyImmersive.heroTop, energyImmersive.heroMid, energyImmersive.heroDeep]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.heroTopBar}>
        <View style={styles.sitePick}>
          <Text style={styles.siteName} numberOfLines={1}>
            {siteName}
          </Text>
          <Ionicons name="chevron-down" size={16} color={energyImmersive.textMuted} />
        </View>
        <View style={styles.weatherRow}>
          <Ionicons name="sunny-outline" size={18} color={energyImmersive.flowCore} />
          <Text style={styles.weatherText}>{weatherHint ?? "Pilot data"}</Text>
          <Ionicons name="notifications-outline" size={20} color={energyImmersive.textMuted} style={{ marginLeft: spacing.md }} />
        </View>
      </View>

      <View style={{ height: svgH, marginTop: 6 }}>
        <Svg width={heroW} height={svgH} viewBox={`0 0 ${heroW} ${svgH}`}>
          <Defs>
            <SvgLinearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={energyImmersive.flowLine} stopOpacity="0.35" />
              <Stop offset="0.5" stopColor={energyImmersive.flowCore} stopOpacity="1" />
              <Stop offset="1" stopColor={energyImmersive.flowLine} stopOpacity="0.4" />
            </SvgLinearGradient>
          </Defs>

          {/* Grid pole */}
          <Line
            x1={heroW * 0.88}
            y1={svgH * 0.22}
            x2={heroW * 0.88}
            y2={svgH * 0.72}
            stroke={energyImmersive.gridStroke}
            strokeWidth={3}
          />
          <Circle cx={heroW * 0.88} cy={svgH * 0.78} r={7} fill={energyImmersive.gridStroke} />

          {/* House silhouette */}
          <Path
            d={`M ${heroW * 0.38} ${svgH * 0.62} L ${heroW * 0.42} ${svgH * 0.38} L ${heroW * 0.58} ${svgH * 0.38} L ${heroW * 0.62} ${svgH * 0.62} Z`}
            fill="rgba(247,242,236,0.08)"
            stroke={energyImmersive.gridStroke}
            strokeWidth={1.2}
          />
          {/* Roof solar */}
          <Rect x={heroW * 0.4} y={svgH * 0.33} width={heroW * 0.2} height={svgH * 0.045} rx={4} fill="rgba(245,198,91,0.35)" stroke={energyImmersive.flowCore} strokeWidth={0.8} />
          <Rect x={heroW * 0.42} y={svgH * 0.378} width={4} height={svgH * 0.028} fill={energyImmersive.flowCore} opacity={0.5} />
          <Rect x={heroW * 0.48} y={svgH * 0.378} width={4} height={svgH * 0.028} fill={energyImmersive.flowCore} opacity={0.5} />
          <Rect x={heroW * 0.54} y={svgH * 0.378} width={4} height={svgH * 0.028} fill={energyImmersive.flowCore} opacity={0.5} />

          {/* Battery */}
          <Rect x={heroW * 0.52} y={svgH * 0.64} width={heroW * 0.11} height={svgH * 0.16} rx={8} fill="rgba(47,159,107,0.25)" stroke={energyImmersive.battery} strokeWidth={1.5} />
          <Rect x={heroW * 0.555} y={svgH * 0.6} width={heroW * 0.04} height={6} rx={2} fill={energyImmersive.battery} opacity={0.7} />

          {/* Flow lines */}
          <Path
            d={`M ${heroW * 0.52} ${svgH * 0.355} Q ${heroW * 0.5} ${svgH * 0.28} ${heroW * 0.5} ${svgH * 0.42}`}
            stroke="url(#flowGrad)"
            strokeWidth={2.5}
            fill="none"
          />
          <Path
            d={`M ${heroW * 0.5} ${svgH * 0.48} L ${heroW * 0.5} ${svgH * 0.55}`}
            stroke="url(#flowGrad)"
            strokeWidth={2.2}
            fill="none"
          />
          <Path
            d={`M ${heroW * 0.62} ${svgH * 0.5} Q ${heroW * 0.74} ${svgH * 0.48} ${heroW * 0.86} ${svgH * 0.52}`}
            stroke="url(#flowGrad)"
            strokeWidth={2}
            fill="none"
            opacity={0.85}
          />
          <Path
            d={`M ${heroW * 0.58} ${svgH * 0.68} Q ${heroW * 0.72} ${svgH * 0.72} ${heroW * 0.86} ${svgH * 0.68}`}
            stroke="url(#flowGrad)"
            strokeWidth={1.8}
            fill="none"
            opacity={0.65}
          />
        </Svg>

        <View style={[styles.callout, { left: heroW * 0.34, top: svgH * 0.08 }]} pointerEvents="none">
          <Text style={styles.calloutLabel}>Producing</Text>
          <Text style={styles.calloutValue}>{fmtKw(peakGen)}</Text>
        </View>
        <View style={[styles.callout, { left: heroW * 0.38, top: svgH * 0.2 }]} pointerEvents="none">
          <Text style={styles.calloutLabel}>Consuming</Text>
          <Text style={styles.calloutValue}>{fmtKw(peakLoad)}</Text>
        </View>
        <View style={[styles.callout, { left: heroW * 0.02, top: svgH * 0.42 }]} pointerEvents="none">
          <Text style={styles.calloutLabel}>Grid</Text>
          <Text style={styles.calloutValue}>{fmtKw(gridKw)}</Text>
        </View>
        <View style={[styles.callout, { right: heroW * 0.06, top: svgH * 0.58 }]} pointerEvents="none">
          <Text style={styles.calloutLabel}>Battery</Text>
          <Text style={styles.calloutValue}>{fmtKw(chargingKw)}</Text>
        </View>
      </View>

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetTopRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.statusPill}>
              <View style={[styles.dot, { backgroundColor: energyImmersive.battery }]} />
              <Text style={styles.statusText}>{statusLine}</Text>
            </View>
            <View style={styles.touRow}>
              <Text style={styles.touText}>Solar-first allocation</Text>
              <Ionicons name="chevron-forward" size={16} color={energyImmersive.textMuted} />
            </View>
          </View>
          <View style={styles.ringWrap}>
            <Svg width={ringSize} height={ringSize}>
              <Circle cx={ringSize / 2} cy={ringSize / 2} r={ringR} stroke={energyImmersive.batteryMuted} strokeWidth={ringStroke} fill="none" />
              <G rotation="-90" origin={`${ringSize / 2}, ${ringSize / 2}`}>
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringR}
                  stroke={energyImmersive.battery}
                  strokeWidth={ringStroke}
                  fill="none"
                  strokeDasharray={`${ringDash} ${ringCirc}`}
                  strokeLinecap="round"
                />
              </G>
            </Svg>
            <View style={styles.ringCenter}>
              <Ionicons name="flash" size={18} color={energyImmersive.battery} />
              <Text style={styles.ringPct}>{ringPct}%</Text>
              <Text style={styles.ringSub}>SOC</Text>
            </View>
          </View>
        </View>

        <View style={styles.kpiRow}>
          {summaryCards.map((card) => (
            <View key={card.label} style={styles.kpiTile}>
              <Ionicons name={card.icon} size={20} color={colors.orangeDeep} style={{ marginBottom: 6 }} />
              <Text style={styles.kpiLabel}>{card.label}</Text>
              <Text style={styles.kpiValue}>{card.value}</Text>
              {card.hint ? <Text style={styles.kpiHint}>{card.hint}</Text> : null}
            </View>
          ))}
        </View>

        <View style={styles.savingsRow}>
          <Ionicons name="pricetag-outline" size={18} color={colors.orangeDeep} />
          <Text style={styles.savingsLabel}>Savings vs grid-only</Text>
          <Text style={styles.savingsValue}>{savingsKesLabel}</Text>
        </View>

        {footerExtras ? <View style={{ marginTop: spacing.md }}>{footerExtras}</View> : null}
      </View>
    </View>
  );
}

/** Project / portfolio pulse — same chrome as system overview; center is abstract “gates” schematic. */
export function SystemProjectImmersiveHero({
  siteName,
  weatherHint,
  ringLabel,
  ringProgress,
  ringCenterHint,
  statusLine,
  primaryCtaHint,
  callouts,
  summaryCards,
  footerExtras,
}: {
  siteName: string;
  weatherHint?: string;
  ringLabel: string;
  ringProgress: number;
  ringCenterHint: string;
  statusLine: string;
  primaryCtaHint?: string;
  callouts: ImmersiveCallout[];
  summaryCards: EnergySummaryCard[];
  footerExtras?: ReactNode;
}) {
  const { width: winW } = useWindowDimensions();
  const heroW = winW;
  const svgH = 240;

  const ringPct = Math.round(Math.min(1, Math.max(0, ringProgress)) * 100);
  const ringSize = 76;
  const ringStroke = 7;
  const ringR = (ringSize - ringStroke) / 2;
  const ringCirc = 2 * Math.PI * ringR;
  const ringDash = ringCirc * (ringPct / 100);

  const [c0, c1, c2, c3] = callouts;

  return (
    <View style={[styles.heroWrap, { width: heroW }]}>
      <LinearGradient
        colors={[energyImmersive.heroTop, energyImmersive.heroMid, energyImmersive.heroDeep]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.heroTopBar}>
        <View style={styles.sitePick}>
          <Text style={styles.siteName} numberOfLines={1}>
            {siteName}
          </Text>
          <Ionicons name="chevron-down" size={16} color={energyImmersive.textMuted} />
        </View>
        <View style={styles.weatherRow}>
          <Ionicons name="pulse-outline" size={18} color={energyImmersive.flowCore} />
          <Text style={styles.weatherText}>{weatherHint ?? "Project pulse"}</Text>
          <Ionicons name="notifications-outline" size={20} color={energyImmersive.textMuted} style={{ marginLeft: spacing.md }} />
        </View>
      </View>

      <View style={{ height: svgH, marginTop: 6 }}>
        <Svg width={heroW} height={svgH} viewBox={`0 0 ${heroW} ${svgH}`}>
          <Defs>
            <SvgLinearGradient id="pulseGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={energyImmersive.flowCore} stopOpacity="0.9" />
              <Stop offset="1" stopColor={energyImmersive.flowLine} stopOpacity="0.35" />
            </SvgLinearGradient>
          </Defs>
          <Rect x={heroW * 0.12} y={svgH * 0.35} width={heroW * 0.22} height={svgH * 0.38} rx={14} fill="rgba(247,242,236,0.06)" stroke={energyImmersive.gridStroke} />
          <Rect x={heroW * 0.4} y={svgH * 0.28} width={heroW * 0.2} height={svgH * 0.48} rx={16} fill="rgba(247,242,236,0.09)" stroke={energyImmersive.flowCore} strokeWidth={1.2} opacity={0.9} />
          <Rect x={heroW * 0.66} y={svgH * 0.38} width={heroW * 0.2} height={svgH * 0.32} rx={12} fill="rgba(247,242,236,0.06)" stroke={energyImmersive.gridStroke} />
          <Path
            d={`M ${heroW * 0.34} ${svgH * 0.54} L ${heroW * 0.4} ${svgH * 0.54} M ${heroW * 0.6} ${svgH * 0.52} L ${heroW * 0.66} ${svgH * 0.52}`}
            stroke="url(#pulseGrad)"
            strokeWidth={3}
          />
          <Circle cx={heroW * 0.5} cy={svgH * 0.52} r={10} fill={energyImmersive.flowCore} opacity={0.9} />
        </Svg>

        {c0 ? (
          <View style={[styles.callout, { left: heroW * 0.02, top: svgH * 0.12 }]}>
            <Text style={styles.calloutLabel}>{c0.label}</Text>
            <Text style={styles.calloutValue}>{c0.value}</Text>
          </View>
        ) : null}
        {c1 ? (
          <View style={[styles.callout, { right: heroW * 0.04, top: svgH * 0.1 }]}>
            <Text style={styles.calloutLabel}>{c1.label}</Text>
            <Text style={styles.calloutValue}>{c1.value}</Text>
          </View>
        ) : null}
        {c2 ? (
          <View style={[styles.callout, { left: heroW * 0.06, top: svgH * 0.72 }]}>
            <Text style={styles.calloutLabel}>{c2.label}</Text>
            <Text style={styles.calloutValue}>{c2.value}</Text>
          </View>
        ) : null}
        {c3 ? (
          <View style={[styles.callout, { right: heroW * 0.04, top: svgH * 0.74 }]}>
            <Text style={styles.calloutLabel}>{c3.label}</Text>
            <Text style={styles.calloutValue}>{c3.value}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetTopRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.statusPill}>
              <View style={[styles.dot, { backgroundColor: energyImmersive.flowCore }]} />
              <Text style={styles.statusText}>{statusLine}</Text>
            </View>
            {primaryCtaHint ? (
              <View style={styles.touRow}>
                <Text style={styles.touText}>{primaryCtaHint}</Text>
                <Ionicons name="chevron-forward" size={16} color={energyImmersive.textMuted} />
              </View>
            ) : null}
          </View>
          <View style={styles.ringWrap}>
            <Svg width={ringSize} height={ringSize}>
              <Circle cx={ringSize / 2} cy={ringSize / 2} r={ringR} stroke="rgba(150, 90, 53, 0.25)" strokeWidth={ringStroke} fill="none" />
              <G rotation="-90" origin={`${ringSize / 2}, ${ringSize / 2}`}>
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringR}
                  stroke="#965A35"
                  strokeWidth={ringStroke}
                  fill="none"
                  strokeDasharray={`${ringDash} ${ringCirc}`}
                  strokeLinecap="round"
                />
              </G>
            </Svg>
            <View style={styles.ringCenter}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#965A35" />
              <Text style={styles.ringPct}>{ringPct}%</Text>
              <Text style={styles.ringSub}>{ringCenterHint}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.ringCaption}>{ringLabel}</Text>

        <View style={styles.kpiRow}>
          {summaryCards.map((card) => (
            <View key={card.label} style={styles.kpiTile}>
              <Ionicons name={card.icon} size={20} color="#965A35" style={{ marginBottom: 6 }} />
              <Text style={styles.kpiLabel}>{card.label}</Text>
              <Text style={styles.kpiValue}>{card.value}</Text>
              {card.hint ? <Text style={styles.kpiHint}>{card.hint}</Text> : null}
            </View>
          ))}
        </View>

        {footerExtras ? <View style={{ marginTop: spacing.md }}>{footerExtras}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  heroTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  sitePick: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "62%",
  },
  siteName: {
    color: energyImmersive.textPrimary,
    fontSize: typography.body,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  weatherText: {
    color: energyImmersive.textMuted,
    fontSize: typography.micro,
    fontWeight: "600",
  },
  callout: {
    position: "absolute",
    backgroundColor: "rgba(15, 14, 12, 0.55)",
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(247, 242, 236, 0.12)",
  },
  calloutLabel: {
    color: energyImmersive.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  calloutValue: {
    color: energyImmersive.textPrimary,
    fontSize: typography.small,
    fontWeight: "800",
    marginTop: 2,
  },
  sheet: {
    marginHorizontal: spacing.md,
    backgroundColor: energyImmersive.sheetBg,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: energyImmersive.sheetBorder,
    marginTop: -18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 3,
    backgroundColor: "rgba(87, 54, 27, 0.12)",
    marginBottom: spacing.md,
  },
  sheetTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  statusText: {
    color: "#2A211C",
    fontSize: typography.small,
    fontWeight: "700",
  },
  touRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: 4,
  },
  touText: {
    color: "#5C534A",
    fontSize: typography.micro,
    fontWeight: "600",
  },
  ringWrap: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
  },
  ringCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  ringPct: {
    color: "#2A211C",
    fontSize: typography.micro,
    fontWeight: "800",
    marginTop: 2,
  },
  ringSub: {
    color: "#8A8178",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  ringCaption: {
    marginTop: spacing.sm,
    color: "#5C534A",
    fontSize: typography.micro,
    lineHeight: 16,
  },
  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  kpiTile: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(118, 73, 39, 0.1)",
  },
  kpiLabel: {
    color: "#8A8178",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  kpiValue: {
    color: "#2A211C",
    fontSize: typography.small,
    fontWeight: "800",
    marginTop: 4,
  },
  kpiHint: {
    color: "#8A8178",
    fontSize: 10,
    marginTop: 4,
    lineHeight: 14,
  },
  savingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(118, 73, 39, 0.1)",
  },
  savingsLabel: {
    flex: 1,
    color: "#5C534A",
    fontSize: typography.small,
    fontWeight: "600",
  },
  savingsValue: {
    color: "#2A211C",
    fontSize: typography.body,
    fontWeight: "800",
  },
});
