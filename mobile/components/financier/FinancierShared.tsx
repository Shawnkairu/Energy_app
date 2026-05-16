import { getRoleHome, type RoleHome } from "@emappa/api-client";
import type { DeploymentDecision, ProjectedBuilding } from "@emappa/shared";
import { useEffect, useState, type ReactNode } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import {
  AppMark,
  Pill,
  cardBorderColor,
  colors,
  officialPalette,
  radius,
  shadows,
  spacing,
  typography,
} from "@emappa/ui";

export type FinancierTone = "good" | "warn" | "bad" | "neutral";

export type FinancierHero = {
  label: string;
  value: string;
  sub: string;
  tone?: FinancierTone;
  status?: string;
};

type LoadedRoleHome = RoleHome & { primary: ProjectedBuilding };

const ORANGE = officialPalette.foxOrange;
const LINE = cardBorderColor;
const SOFT_ORANGE = "rgba(150, 90, 53, 0.1)";
const CARD_FACE = "#FFFCFA";
const TILE_FACE = colors.panelSoft;

export function FinancierScreenShell({
  section,
  title,
  subtitle,
  actions,
  hero,
  showActivity = false,
  hideChrome = false,
  pilotSlot,
  children,
}: {
  section: string;
  title: string;
  subtitle: string;
  actions: string[];
  hero: (home: LoadedRoleHome) => FinancierHero;
  showActivity?: boolean;
  /** Tesla / Enphase system-overview: full-bleed project pulse, hide document header + hero card. */
  hideChrome?: boolean;
  /** Screen-level pilot / disclosure banner (e.g. Discover per PILOT_SCOPE §2–3). */
  pilotSlot?: ReactNode;
  children: (home: LoadedRoleHome) => ReactNode;
}) {
  const [home, setHome] = useState<RoleHome | null>(null);

  useEffect(() => {
    getRoleHome("financier").then(setHome);
  }, []);

  if (!home) {
    return <FinancierState title="Loading deal room" detail="Fetching named building data." />;
  }

  if (!home.primary) {
    return <FinancierState title="No deal room" detail="No named building is assigned yet." />;
  }

  const loadedHome: LoadedRoleHome = { ...home, primary: home.primary };
  const heroMetric = hero(loadedHome);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {hideChrome ? null : (
          <>
            <View style={styles.topbar}>
              <View>
                <Text style={styles.section}>{section}</Text>
                <Text style={styles.role}>Financier</Text>
              </View>
              <AppMark size={34} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            {pilotSlot ? <View style={{ marginBottom: spacing.md }}>{pilotSlot}</View> : null}
            <ActionRail actions={actions} />
            <HeroCard hero={heroMetric} />
          </>
        )}
        {children(loadedHome)}
        {showActivity ? <ActivityCard activity={home.activity} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export const FinancierScreenScaffold = FinancierScreenShell;

function FinancierState({ title, detail }: { title: string; detail: string }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.state}>
        <AppMark size={48} />
        <Text style={styles.stateTitle}>{title}</Text>
        <Text style={styles.stateDetail}>{detail}</Text>
      </View>
    </SafeAreaView>
  );
}

function HeroCard({ hero }: { hero: FinancierHero }) {
  return (
    <Card style={styles.hero}>
      <View style={styles.heroAccent} />
      <View style={{ flex: 1 }}>
        <Text style={styles.kicker}>{hero.label}</Text>
        <Text style={styles.heroValue}>{hero.value}</Text>
        <Text style={styles.heroSub}>{hero.sub}</Text>
        {hero.status ? (
          <View style={{ marginTop: spacing.md }}>
            <Pill tone={hero.tone ?? "neutral"}>{hero.status}</Pill>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

function ActionRail({ actions }: { actions: string[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
      {actions.map((action, index) => (
        <View
          key={action}
          style={[styles.action, index === 0 && styles.actionActive]}
          accessibilityRole="text"
          accessibilityLabel={action}
        >
          <Text style={[styles.actionText, index === 0 && styles.actionTextActive]}>{action}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function MetricRail({
  items,
}: {
  items: Array<{ label: string; value: string; note?: string; tone?: FinancierTone }>;
}) {
  return (
    <View style={styles.metricRail}>
      {items.map((item) => (
        <View key={item.label} style={styles.metricTile}>
          <Text style={styles.kicker}>{item.label}</Text>
          <Text style={[styles.metricValue, { color: toneColor(item.tone) }]}>{item.value}</Text>
          {item.note ? <Text style={styles.microNote}>{item.note}</Text> : null}
        </View>
      ))}
    </View>
  );
}

export function FinancierBriefCard({
  eyebrow,
  title,
  body,
  rows,
}: {
  eyebrow: string;
  title: string;
  body: string;
  rows: Array<{ label: string; value: string; note: string; tone?: FinancierTone }>;
}) {
  return (
    <Card>
      <Text style={styles.kicker}>{eyebrow}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.disclaimer}>{body}</Text>
      <View style={styles.rowStack}>
        {rows.map((row) => (
          <View key={`${row.label}-${row.value}`} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowNote}>{row.note}</Text>
            </View>
            <Text style={[styles.rowValue, { color: toneColor(row.tone) }]}>{row.value}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function BuildingSnapshotCard({ building }: { building: ProjectedBuilding }) {
  const view = building.roleViews.financier;
  return (
    <Card>
      <View style={styles.snapshotTop}>
        <View style={styles.buildingMark}>
          <Text style={styles.buildingMarkText}>{building.project.name.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.cardTitle}>{building.project.name}</Text>
          <Text style={styles.snapshotMeta}>
            {building.project.locationBand} · {building.project.units} units
          </Text>
        </View>
        <Pill tone={drsTone(building)}>{building.drs.decision}</Pill>
      </View>
      <ProgressRail value={view.fundingProgress} label="Funded" right={formatKesShort(view.remainingCapitalKes)} />
    </Card>
  );
}

export function DealPipelineCard({ projects }: { projects: ProjectedBuilding[] }) {
  return (
    <Card>
      <Text style={styles.kicker}>Discover</Text>
      <Text style={styles.cardTitle}>Building deals</Text>
      <Text style={styles.cardLead}>Named exposure per building. Raises are gated by readiness.</Text>
      <View style={styles.rowStack}>
        {projects.map((building) => {
          const view = building.roleViews.financier;
          return (
            <View key={building.project.id} style={styles.dealRow}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.dealTitle}>{building.project.name}</Text>
                <Text style={styles.dealMeta}>
                  DRS {building.drs.score} · {formatPercent(view.fundingProgress)} funded
                </Text>
                <ProgressBar value={view.fundingProgress} />
              </View>
              <View style={styles.dealAmountCol}>
                <Text style={styles.dealAmount}>{formatKesShort(view.remainingCapitalKes)}</Text>
                <Text style={styles.microNote}>open</Text>
              </View>
            </View>
          );
        })}
      </View>
      <Text style={styles.disclaimer}>Demo figures. Not a pooled fund.</Text>
    </Card>
  );
}

export function FinancierScoreArtifact({ building }: { building: ProjectedBuilding }) {
  const drs = building.drs;
  const components = drs.components;
  const componentRows = [
    { label: "Demand", value: components.demandCoverage, tone: components.demandCoverage >= 60 ? "good" : "bad" },
    { label: "Prepaid", value: components.prepaidCommitment, tone: components.prepaidCommitment > 0 ? "good" : "bad" },
    { label: "Load", value: components.loadProfile, tone: components.loadProfile >= 65 ? "good" : "warn" },
    { label: "Install", value: components.installationReadiness, tone: components.installationReadiness >= 65 ? "good" : "warn" },
    { label: "Electrician", value: components.electricianReadiness, tone: components.electricianReadiness >= 65 ? "good" : "warn" },
    { label: "Capital", value: components.capitalAlignment, tone: components.capitalAlignment >= 65 ? "good" : "warn" },
  ] as const;

  return (
    <Card>
      <View style={styles.scoreWrap}>
        <View style={styles.scoreRing}>
          <Text style={styles.score}>{drs.score}</Text>
          <Text style={styles.microNote}>DRS</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>Readiness</Text>
          <Text style={styles.cardTitle}>{drs.label}</Text>
          <Text style={styles.cardLead}>Capital moves after gates clear.</Text>
          <Pill tone={decisionTone(drs.decision)}>{drs.decision}</Pill>
        </View>
      </View>
      <View style={styles.componentGrid}>
        {componentRows.map((row) => (
          <View key={row.label} style={styles.componentTile}>
            <Text style={styles.microNote}>{row.label}</Text>
            <Text style={[styles.componentValue, { color: toneColor(row.tone) }]}>{Math.round(row.value)}%</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function GateRailCard({ building }: { building: ProjectedBuilding }) {
  const gates = [
    { label: "Owner", complete: building.project.drs.ownerPermissionsComplete },
    { label: "Supplier", complete: building.project.drs.hasVerifiedSupplierQuote },
    { label: "Electrician", complete: building.project.drs.hasCertifiedLeadElectrician },
    { label: "Monitor", complete: building.project.drs.monitoringConnectivityResolved },
    { label: "Data", complete: building.project.drs.settlementDataTrusted },
  ];

  return (
    <Card>
      <Text style={styles.kicker}>Gates</Text>
      <View style={styles.gateRail}>
        {gates.map((gate) => (
          <View key={gate.label} style={styles.gateItem}>
            <View style={[styles.gateDot, gate.complete && styles.gateDotDone]} />
            <Text style={styles.microNote}>{gate.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function RecoveryBandCard({
  building,
  title = "Projected recovery band",
}: {
  building: ProjectedBuilding;
  title?: string;
}) {
  const base = Math.max(0, building.roleViews.financier.monthlyRecoveryKes);
  const bands = [
    { label: "Low", value: Math.round(base * 0.62), width: 42 },
    { label: "Base", value: base, width: 68 },
    { label: "High", value: Math.round(base * 1.27), width: 86 },
  ];

  return (
    <Card>
      <Text style={styles.kicker}>Range</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={{ marginTop: spacing.sm }}>
        {bands.map((band) => (
          <View key={band.label} style={styles.bandRow}>
            <Text style={styles.bandLabel}>{band.label}</Text>
            <View style={styles.bandTrack}>
              <View style={[styles.bandFill, { width: `${band.width}%` }]} />
            </View>
            <Text style={styles.bandValue}>{formatKesShort(band.value)}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.disclaimer}>Projected from sold prepaid solar only.</Text>
    </Card>
  );
}

export function CashflowWaterfallCard({ building }: { building: ProjectedBuilding }) {
  const total = Math.max(1, building.settlement.revenue);
  const slices = [
    { label: "Reserve", value: building.settlement.reserve, color: "#DAD7D2" },
    { label: "Provider", value: building.settlement.providerPool, color: "#CDB99E" },
    { label: "Financier", value: building.settlement.financierPool, color: ORANGE },
    { label: "Owner", value: building.settlement.ownerRoyalty, color: "#9B8064" },
    { label: "e.mappa", value: building.settlement.emappaFee, color: "#6E5644" },
  ];

  return (
    <Card>
      <Text style={styles.kicker}>Waterfall</Text>
      <Text style={styles.cardTitle}>{formatKesShort(total)} monetized</Text>
      <View style={styles.waterfall}>
        {slices.map((slice) => (
          <View key={slice.label} style={{ width: `${Math.max(2, (slice.value / total) * 100)}%`, backgroundColor: slice.color }} />
        ))}
      </View>
      <View style={styles.legendGrid}>
        {slices.map((slice) => (
          <View key={slice.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
            <Text style={styles.microNote}>{slice.label}</Text>
            <Text style={styles.legendValue}>{Math.round((slice.value / total) * 100)}%</Text>
          </View>
        ))}
      </View>
      <Text style={styles.disclaimer}>Monetized pool only; illustrative split for demo.</Text>
    </Card>
  );
}

export function WalletRailCard({ building }: { building: ProjectedBuilding }) {
  const view = building.roleViews.financier;
  const committed = Math.max(1, view.committedCapitalKes);
  const recoveredShare = Math.min(1, view.monthlyRecoveryKes / committed);

  return (
    <Card>
      <Text style={styles.kicker}>Wallet</Text>
      <Text style={styles.cardTitle}>Capital status</Text>
      <Text style={styles.cardLead}>Funded to this building only. Meter shows raise progress toward deploy.</Text>
      <View style={styles.walletMeter}>
        <View style={[styles.walletMeterFill, { width: `${Math.max(4, view.fundingProgress * 100)}%` }]} />
      </View>
      <MetricRail
        items={[
          { label: "Deployed", value: formatKesShort(view.committedCapitalKes), note: "Named deal" },
          { label: "Open", value: formatKesShort(view.remainingCapitalKes), note: "Raise gap" },
          { label: "1-mo rec.", value: formatPercent(recoveredShare), note: "Projected" },
        ]}
      />
    </Card>
  );
}

export function FinancierDiligenceCard({ building }: { building: ProjectedBuilding }) {
  const ownerV = building.roleViews.owner;
  return (
    <FinancierBriefCard
      eyebrow="Evidence"
      title="Before release"
      body="Proof first. Capital second."
      rows={[
        {
          label: "Prepaid",
          value: formatPercent(ownerV.residentParticipation),
          note: `${ownerV.prepaidMonthsCovered.toFixed(1)} months covered.`,
          tone: ownerV.residentParticipation >= 0.6 ? "good" : "warn",
        },
        {
          label: "Supplier",
          value: building.project.drs.hasVerifiedSupplierQuote ? "Locked" : "Open",
          note: "BOM and quote proof.",
          tone: building.project.drs.hasVerifiedSupplierQuote ? "good" : "warn",
        },
        {
          label: "Monitoring",
          value: building.project.drs.monitoringConnectivityResolved ? "Online" : "Open",
          note: "Needed for settlement trust.",
          tone: building.project.drs.monitoringConnectivityResolved ? "good" : "warn",
        },
      ]}
    />
  );
}

export function FinancierMilestoneBriefCard({ building }: { building: ProjectedBuilding }) {
  const view = building.roleViews.financier;
  return (
    <FinancierBriefCard
      eyebrow="Release"
      title="Milestones"
      body="Released by verified gates."
      rows={[
        { label: "T1", value: view.committedCapitalKes > 0 ? "Done" : "Queued", note: "Survey and owner access.", tone: view.committedCapitalKes > 0 ? "good" : "neutral" },
        { label: "T2", value: building.project.drs.hasVerifiedSupplierQuote ? "Ready" : "Open", note: "BOM and delivery proof.", tone: building.project.drs.hasVerifiedSupplierQuote ? "good" : "warn" },
        { label: "T3", value: building.project.stage === "live" ? "Live" : "Queued", note: "Monitoring and first settlement.", tone: building.project.stage === "live" ? "good" : "neutral" },
      ]}
    />
  );
}

export function StatusRail({
  items,
}: {
  items: Array<{ label: string; value: string; note: string; tone?: FinancierTone }>;
}) {
  return <MetricRail items={items} />;
}

export function formatKes(value: number) {
  return `KSh ${Math.round(value).toLocaleString()}`;
}

export function formatKesShort(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `KSh ${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  }
  if (abs >= 1_000) {
    return `KSh ${(value / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}k`;
  }
  return `KSh ${Math.round(value)}`;
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function drsTone(building: ProjectedBuilding): FinancierTone {
  return building.drs.decision === "deployment_ready" ? "good" : building.drs.decision === "review" ? "warn" : "bad";
}

function ProgressRail({ value, label, right }: { value: number; label: string; right: string }) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <View style={styles.progressMeta}>
        <Text style={styles.microNote}>{label}</Text>
        <Text style={styles.microNote}>{right} open</Text>
      </View>
      <ProgressBar value={value} />
    </View>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.max(3, Math.min(100, value * 100))}%` }]} />
    </View>
  );
}

function ActivityCard({ activity }: { activity: string[] }) {
  return (
    <Card>
      <Text style={styles.kicker}>Activity</Text>
      {activity.slice(0, 3).map((item) => (
        <View key={item} style={styles.activityRow}>
          <View style={styles.activityDot} />
          <Text style={styles.rowNote}>{item}</Text>
        </View>
      ))}
    </Card>
  );
}

function decisionTone(decision: DeploymentDecision): FinancierTone {
  return decision === "deployment_ready" ? "good" : decision === "review" ? "warn" : "bad";
}

function toneColor(tone: FinancierTone = "neutral") {
  if (tone === "good") return colors.green;
  if (tone === "warn") return colors.amber;
  if (tone === "bad") return colors.red;
  return colors.text;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sky },
  scroll: { paddingHorizontal: 20, paddingTop: spacing.md, paddingBottom: 42, backgroundColor: colors.sky },
  state: { flex: 1, justifyContent: "center", paddingHorizontal: 28, backgroundColor: colors.sky },
  stateTitle: { color: colors.text, fontSize: 24, fontWeight: "700", letterSpacing: -0.6, marginTop: 18 },
  stateDetail: { color: colors.muted, fontSize: typography.body, lineHeight: 22, marginTop: 8 },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg },
  section: { color: ORANGE, fontSize: 11, fontWeight: "700", letterSpacing: 1.05, textTransform: "uppercase" },
  role: { color: colors.dim, fontSize: 11, marginTop: 4, fontWeight: "600" },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", letterSpacing: -1.2, lineHeight: 36 },
  subtitle: { color: colors.muted, fontSize: typography.small, lineHeight: 20, marginTop: spacing.sm, marginBottom: spacing.lg, maxWidth: 320 },
  action: {
    borderRadius: radius.pill,
    backgroundColor: CARD_FACE,
    borderColor: LINE,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  actionActive: { borderColor: ORANGE, backgroundColor: SOFT_ORANGE },
  actionText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  actionTextActive: { color: ORANGE },
  card: {
    backgroundColor: CARD_FACE,
    borderColor: LINE,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  hero: { flexDirection: "row", gap: spacing.md, padding: spacing.xl, backgroundColor: colors.white },
  heroAccent: { width: 4, borderRadius: 999, backgroundColor: ORANGE },
  kicker: { color: colors.dim, fontSize: 10, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  heroValue: { color: colors.text, fontSize: 34, fontWeight: "800", letterSpacing: -1.35, marginTop: spacing.sm },
  heroSub: { color: colors.dim, fontSize: 12, lineHeight: 17, marginTop: 6 },
  cardTitle: { color: colors.text, fontSize: typography.title, fontWeight: "800", letterSpacing: -0.5, marginTop: 6 },
  cardLead: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: spacing.sm },
  snapshotMeta: { color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 5 },
  disclaimer: { color: colors.dim, fontSize: 11.5, lineHeight: 16.5, marginTop: spacing.md, fontWeight: "500" },
  metricRail: { flexDirection: "row", gap: 10, marginBottom: spacing.md },
  metricTile: { flex: 1, backgroundColor: TILE_FACE, borderColor: LINE, borderWidth: StyleSheet.hairlineWidth * 2, borderRadius: radius.lg, padding: spacing.md },
  metricValue: { color: colors.text, fontSize: typography.hero - 8, fontWeight: "800", letterSpacing: -0.55, marginTop: spacing.sm },
  microNote: { color: colors.dim, fontSize: 10.5, lineHeight: 14.5, marginTop: 4, fontWeight: "500" },
  rowStack: { marginTop: spacing.md, borderTopColor: LINE, borderTopWidth: StyleSheet.hairlineWidth * 2 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md, borderBottomColor: LINE, borderBottomWidth: StyleSheet.hairlineWidth * 2 },
  rowLabel: { color: colors.dim, fontSize: 10, fontWeight: "700", letterSpacing: 0.75, textTransform: "uppercase" },
  rowValue: { color: colors.text, fontSize: typography.heading - 1, fontWeight: "700", letterSpacing: -0.2 },
  rowNote: { color: colors.dim, fontSize: 12, lineHeight: 16.5, marginTop: 4 },
  snapshotTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  buildingMark: {
    height: 42,
    width: 42,
    borderRadius: 999,
    backgroundColor: SOFT_ORANGE,
    borderColor: ORANGE,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buildingMarkText: { color: ORANGE, fontSize: 18, fontWeight: "800" },
  dealRow: { flexDirection: "row", gap: spacing.md, paddingVertical: spacing.md, borderBottomColor: LINE, borderBottomWidth: StyleSheet.hairlineWidth * 2 },
  dealTitle: { color: colors.text, fontSize: typography.heading, fontWeight: "800", letterSpacing: -0.25 },
  dealMeta: { color: colors.dim, fontSize: 12, lineHeight: 16.5, marginTop: 4 },
  dealAmountCol: { alignItems: "flex-end", justifyContent: "flex-start", paddingLeft: spacing.sm },
  dealAmount: { color: colors.text, fontSize: typography.heading, fontWeight: "800", letterSpacing: -0.2 },
  progressMeta: { flexDirection: "row", justifyContent: "space-between", marginBottom: 7 },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: "rgba(42, 33, 28, 0.07)", overflow: "hidden", marginTop: 8 },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: ORANGE },
  scoreWrap: { flexDirection: "row", alignItems: "center", gap: 16 },
  scoreRing: {
    width: 104,
    height: 104,
    borderRadius: 999,
    borderColor: ORANGE,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  score: { color: colors.text, fontSize: 36, fontWeight: "800", letterSpacing: -1.4 },
  componentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  componentTile: { width: "31%", borderColor: LINE, borderWidth: 1, borderRadius: 16, padding: 10 },
  componentValue: { fontSize: 17, fontWeight: "800", marginTop: 5 },
  gateRail: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  gateItem: { alignItems: "center", flex: 1 },
  gateDot: { height: 16, width: 16, borderRadius: 999, borderColor: LINE, borderWidth: 2, backgroundColor: colors.white },
  gateDotDone: { backgroundColor: ORANGE, borderColor: ORANGE },
  bandRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 11 },
  bandLabel: { color: colors.dim, width: 34, fontSize: 11, fontWeight: "700" },
  bandTrack: { flex: 1, height: 10, borderRadius: 999, backgroundColor: "rgba(42, 33, 28, 0.07)", overflow: "hidden" },
  bandFill: { height: "100%", borderRadius: 999, backgroundColor: ORANGE },
  bandValue: { color: colors.text, width: 66, textAlign: "right", fontSize: 12, fontWeight: "700" },
  waterfall: {
    height: 36,
    borderRadius: radius.pill,
    overflow: "hidden",
    flexDirection: "row",
    marginTop: spacing.md,
    borderColor: LINE,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  legendGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5, width: "47%" },
  legendDot: { height: 7, width: 7, borderRadius: 999 },
  legendValue: { color: colors.text, fontSize: 10.5, fontWeight: "700", marginLeft: "auto" },
  walletMeter: {
    height: 112,
    borderRadius: radius.lg,
    backgroundColor: "rgba(42, 33, 28, 0.055)",
    overflow: "hidden",
    justifyContent: "flex-end",
    marginTop: spacing.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: LINE,
  },
  walletMeterFill: { height: "100%", backgroundColor: SOFT_ORANGE, borderRightColor: ORANGE, borderRightWidth: 3 },
  activityRow: { flexDirection: "row", gap: 9, paddingTop: 12 },
  activityDot: { height: 7, width: 7, borderRadius: 999, backgroundColor: ORANGE, marginTop: 6 },
});
