import { getRoleHome, type RoleHome } from "@emappa/api-client";
import type { DeploymentDecision, ProjectedBuilding } from "@emappa/shared";
import { useEffect, useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  AppMark,
  GlassCard,
  Label,
  PaletteCard,
  Pill,
  Surface,
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
  /** Shown as a pill under the hero; omit to match calm v2 shells without status chips. */
  status?: string;
};

export function FinancierScreenShell({
  section,
  title,
  subtitle,
  actions,
  hero,
  roleLabel = "Financier workspace",
  showActivity = false,
  children,
}: {
  section: string;
  title: string;
  subtitle: string;
  actions: string[];
  hero: (home: RoleHome) => FinancierHero;
  roleLabel?: string;
  showActivity?: boolean;
  children: (home: RoleHome) => ReactNode;
}) {
  const [home, setHome] = useState<RoleHome | null>(null);

  useEffect(() => {
    getRoleHome("financier").then(setHome);
  }, []);

  if (!home) {
    return (
      <Surface>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <AppMark size={52} />
          <Text
            style={{
              color: colors.text,
              fontSize: typography.title,
              fontWeight: "700",
              letterSpacing: -0.5,
              marginTop: 18,
            }}
          >
            Preparing financier deal room
          </Text>
          <Text style={{ color: colors.muted, fontSize: typography.body, marginTop: 8, lineHeight: 22 }}>
            Loading named building data...
          </Text>
        </View>
      </Surface>
    );
  }

  const heroMetric = hero(home);

  return (
    <Surface>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1, backgroundColor: colors.sky }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 22 }}>
          <View>
            <Pill>{section}</Pill>
            <Text
              style={{
                color: colors.muted,
                fontSize: typography.micro,
                fontWeight: "600",
                letterSpacing: 0.6,
                marginTop: 10,
                textTransform: "uppercase",
              }}
            >
              {roleLabel}
            </Text>
          </View>
          <AppMark />
        </View>
        <Text
          style={{
            color: colors.text,
            fontSize: 34,
            fontWeight: "600",
            letterSpacing: -1.2,
            lineHeight: 39,
            marginTop: 20,
          }}
        >
          {title}
        </Text>
        <Text style={{ color: colors.muted, fontSize: typography.body, lineHeight: 22, marginTop: 10, marginBottom: 20 }}>
          {subtitle}
        </Text>

        <FinancierActionRail actions={actions} />
        <ShellHeroCard hero={heroMetric} />
        {children(home)}
        {showActivity ? <FinancierActivityCard activity={home.activity} /> : null}
      </ScrollView>
    </Surface>
  );
}

/** @deprecated Use FinancierScreenShell — same component, aligned to global screen primitives. */
export const FinancierScreenScaffold = FinancierScreenShell;

function ShellHeroCard({ hero }: { hero: FinancierHero }) {
  return (
    <PaletteCard
      borderRadius={30}
      padding={22}
      style={{
        marginBottom: 18,
        borderColor: `${officialPalette.deepWood}26`,
        ...shadows.card,
      }}
      contentStyle={{
        borderLeftWidth: 3,
        borderLeftColor: `${officialPalette.foxOrange}55`,
        paddingLeft: 19,
      }}
    >
      <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8 }}>
        {hero.label}
      </Text>
      <Text style={{ color: colors.text, fontSize: 38, fontWeight: "600", letterSpacing: -1.5, marginTop: 10 }}>{hero.value}</Text>
      <Text style={{ color: colors.muted, lineHeight: 21, marginTop: 6 }}>{hero.sub}</Text>
      {hero.status ? (
        <View style={{ marginTop: spacing.sm }}>
          <Pill tone={hero.tone ?? "neutral"}>{hero.status}</Pill>
        </View>
      ) : null}
    </PaletteCard>
  );
}

function FinancierActionRail({ actions }: { actions: string[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
      {actions.map((action, index) => (
        <Pressable
          key={action}
          style={{
            borderRadius: radius.pill,
            backgroundColor: colors.panel,
            borderColor: index === 0 ? colors.orangeDeep : colors.border,
            borderWidth: 1,
            paddingHorizontal: 14,
            paddingVertical: 9,
            marginRight: 8,
          }}
        >
          <Text style={{ color: index === 0 ? colors.orangeDeep : colors.text, fontSize: 12, fontWeight: "600" }}>{action}</Text>
        </Pressable>
      ))}
    </ScrollView>
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
    <GlassCard>
      <Label>{eyebrow}</Label>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: "600", letterSpacing: -0.4, marginTop: 6 }}>{title}</Text>
      <Text style={{ color: colors.muted, lineHeight: 22, marginTop: 8 }}>{body}</Text>
      <View
        style={{
          marginTop: 16,
          borderColor: `${officialPalette.plushCaramel}40`,
          borderWidth: 1,
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: `${officialPalette.furCream}12`,
        }}
      >
        {rows.map((row, index) => (
          <View
            key={`${row.label}-${row.value}`}
            style={{
              padding: 12,
              backgroundColor: index % 2 === 0 ? `${officialPalette.guitarMaple}14` : colors.panelSoft,
              borderTopColor: index === 0 ? "transparent" : `${officialPalette.warmUmbar}22`,
              borderTopWidth: 1,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600", letterSpacing: 0.7, textTransform: "uppercase" }}>
                {row.label}
              </Text>
              <Text style={{ color: toneColor(row.tone), flexShrink: 0, fontWeight: "600" }}>{row.value}</Text>
            </View>
            <Text style={{ color: colors.muted, lineHeight: 19, marginTop: 5 }}>{row.note}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

export function FinancierWorkflowCard({
  title,
  items,
  eyebrow = "Next deal-room moves",
}: {
  title: string;
  items: Array<{ label: string; detail: string; status: string; tone?: FinancierTone }>;
  eyebrow?: string;
}) {
  return (
    <GlassCard>
      <Label>{eyebrow}</Label>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: "600", letterSpacing: -0.4, marginTop: 6 }}>{title}</Text>
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

export function FinancierScoreArtifact({ building }: { building: ProjectedBuilding }) {
  const drs = building.drs;
  const tone = decisionTone(drs.decision);
  const components = drs.components;
  const componentRows = [
    { label: "Demand", value: components.demandCoverage, tone: components.demandCoverage >= 60 ? "good" : "bad" },
    { label: "Prepaid", value: components.prepaidCommitment, tone: components.prepaidCommitment > 0 ? "good" : "bad" },
    { label: "Load", value: components.loadProfile, tone: components.loadProfile >= 65 ? "good" : "warn" },
    { label: "Install", value: components.installationReadiness, tone: components.installationReadiness >= 65 ? "good" : "warn" },
    { label: "Labor", value: components.installerReadiness, tone: components.installerReadiness >= 65 ? "good" : "warn" },
    { label: "Capital", value: components.capitalAlignment, tone: components.capitalAlignment >= 65 ? "good" : "warn" },
  ] as const;
  const blockers = drs.reasons;

  return (
    <GlassCard>
      <View style={{ alignItems: "center", paddingVertical: 4 }}>
        <View
          style={{
            height: 170,
            width: 170,
            borderRadius: 999,
            borderColor: `${officialPalette.deepWood}33`,
            borderWidth: 2,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${officialPalette.furCream}2E`,
            ...shadows.soft,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 44, fontWeight: "600", letterSpacing: -1.8 }}>{drs.score}</Text>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase" }}>/ 100 DRS</Text>
        </View>
        <Pill tone={tone}>{drs.decision}</Pill>
        <Text style={{ color: colors.text, fontSize: 19, fontWeight: "600", letterSpacing: -0.3, marginTop: 12 }}>{drs.label}</Text>
        <Text style={{ color: colors.muted, lineHeight: 21, marginTop: 6, textAlign: "center" }}>
          DRS gates capital release, supplier lock, installer scheduling, and go-live.
        </Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
        {componentRows.map((row) => (
          <View
            key={row.label}
            style={{
              width: "31%",
              backgroundColor: `${officialPalette.scarfOat}18`,
              borderColor: `${officialPalette.toastedClay}38`,
              borderWidth: 1,
              borderRadius: 18,
              padding: 10,
            }}
          >
            <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "600", letterSpacing: 0.6, textTransform: "uppercase" }}>{row.label}</Text>
            <Text style={{ color: toneColor(row.tone), fontSize: 18, fontWeight: "600", letterSpacing: -0.4, marginTop: 6 }}>
              {Math.round(row.value)}%
            </Text>
          </View>
        ))}
      </View>
      <View style={{ marginTop: 16 }}>
        {(blockers.length > 0 ? blockers : ["No active kill switches returned."]).slice(0, 3).map((blocker) => (
          <View
            key={blocker}
            style={{
              backgroundColor: blockers.length > 0 ? `${colors.red}10` : `${colors.green}10`,
              borderColor: blockers.length > 0 ? `${colors.red}30` : `${colors.green}30`,
              borderWidth: 1,
              borderRadius: 16,
              padding: 10,
              marginTop: 8,
            }}
          >
            <Text style={{ color: blockers.length > 0 ? colors.red : colors.green, fontWeight: "600" }}>{blocker}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

export function FinancierDiligenceCard({ building }: { building: ProjectedBuilding }) {
  const drs = building.project.drs;
  const ownerV = building.roleViews.owner;
  const participation = ownerV.residentParticipation;
  const prepaidM = ownerV.prepaidMonthsCovered;

  const items: Array<{ label: string; detail: string; status: string; tone: FinancierTone }> = [
    {
      label: "Owner permission",
      detail: "Inspection, roof access, and meter-room access confirmed for underwriting.",
      status: drs.ownerPermissionsComplete ? "verified" : "open",
      tone: drs.ownerPermissionsComplete ? "good" : "warn",
    },
    {
      label: "Resident demand",
      detail: `${formatPercent(participation)} participation; ${prepaidM.toFixed(1)} prepaid month(s) covered.`,
      status: participation >= 0.75 ? "qualified" : "review",
      tone: participation >= 0.6 ? "good" : "warn",
    },
    {
      label: "Supplier lock",
      detail: drs.hasVerifiedSupplierQuote ? "BOM and quote proof attached to the named deal record." : "Awaiting verified supplier quote and BOM proof.",
      status: drs.hasVerifiedSupplierQuote ? "locked" : "open",
      tone: drs.hasVerifiedSupplierQuote ? "good" : "warn",
    },
    {
      label: "Installer lead",
      detail: drs.hasCertifiedLeadElectrician ? "Certified lead electrician assigned and bound to site." : "Certified lead not yet assigned.",
      status: drs.hasCertifiedLeadElectrician ? "assigned" : "open",
      tone: drs.hasCertifiedLeadElectrician ? "good" : "warn",
    },
    {
      label: "Monitoring",
      detail: drs.monitoringConnectivityResolved ? "Heartbeat and inverter feed online; readings trusted." : "Monitoring path not yet trusted for settlement.",
      status: drs.monitoringConnectivityResolved ? "online" : "blocked",
      tone: drs.monitoringConnectivityResolved ? "good" : "warn",
    },
  ];

  return (
    <GlassCard>
      <Label>Diligence register</Label>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: "600", letterSpacing: -0.4, marginTop: 6 }}>Evidence before capital moves</Text>
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
            <Pill tone={item.tone}>{item.status}</Pill>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

export function FinancierMilestoneBriefCard({ building }: { building: ProjectedBuilding }) {
  const view = building.roleViews.financier;
  const drs = building.project.drs;

  const t1 = view.committedCapitalKes > 0;
  const t2Open = view.remainingCapitalKes > 0 || !drs.hasVerifiedSupplierQuote;
  const t3Queued = !drs.monitoringConnectivityResolved || building.project.stage !== "live";

  return (
    <FinancierBriefCard
      eyebrow="Milestones"
      title="Capital release schedule"
      body="Capital is released against verified milestones, not against time."
      rows={[
        {
          label: "Tranche 1",
          value: t1 ? "released" : "queued",
          note: "Site survey, owner permission, supplier lock.",
          tone: t1 ? "good" : "neutral",
        },
        {
          label: "Tranche 2",
          value: t2Open ? "pending" : "released",
          note: "Installer scheduling and BOM delivery proof.",
          tone: t2Open ? "warn" : "good",
        },
        {
          label: "Tranche 3",
          value: t3Queued ? "queued" : "released",
          note: "Monitoring online and first settlement run.",
          tone: t3Queued ? "neutral" : "good",
        },
      ]}
    />
  );
}

/** Recovery bands are illustrative ranges around the projected monthly financier pool (not a promise). */
export function FinancierRecoveryBandsCard({
  building,
  variant,
}: {
  building: ProjectedBuilding;
  variant: "diligence" | "portfolio";
}) {
  const view = building.roleViews.financier;
  const base = Math.max(0, view.monthlyRecoveryKes);
  const low = Math.round(base * 0.62);
  const high = Math.round(base * 1.27);
  const du = view.downsideUtilization;
  const bu = view.baseUtilization;

  const diligenceNotes =
    variant === "diligence"
      ? {
          low: `Demand ${formatPercent(du)} · stress utilization`,
          base: `Demand ${formatPercent(bu)} · waste ${building.energy.E_waste > 0 ? "tracked" : "minimal"}`,
          high: "Demand at top band · minimal waste",
        }
      : {
          low: "Curtailment heavy month",
          base: `${building.transparency.utilizationBand} · median building outcome`,
          high: "Full demand absorption",
        };

  return (
    <GlassCard>
      <Label>Risk cases</Label>
      <Text style={{ color: colors.text, fontSize: typography.title, fontWeight: "700", letterSpacing: -0.35, marginTop: 6, lineHeight: 28 }}>
        {variant === "diligence" ? "Downside and base recovery stay visible before commitment." : "Recovery stays a band, not a single number."}
      </Text>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
        <RiskBandTile label="Low" value={formatKes(low)} note={diligenceNotes.low} tone="warn" />
        <RiskBandTile label="Base" value={formatKes(base)} note={diligenceNotes.base} tone="good" />
        <RiskBandTile label="High" value={formatKes(high)} note={diligenceNotes.high} tone="good" />
      </View>
      <Text style={{ color: colors.muted, lineHeight: 21, marginTop: 12 }}>
        Recovery is projected from sold prepaid solar; wasted or free-exported energy does not create financier payout.
      </Text>
    </GlassCard>
  );
}

function RiskBandTile({ label, value, note, tone }: { label: string; value: string; note: string; tone: FinancierTone }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.sky,
        borderRadius: radius.md,
        padding: 14,
        borderColor: colors.border,
        borderWidth: 1,
      }}
    >
      <Text
        style={{
          color: colors.muted,
          fontSize: typography.micro,
          fontWeight: "600",
          letterSpacing: 0.65,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      <Text style={{ color: toneColor(tone), fontSize: typography.title, fontWeight: "700", letterSpacing: -0.4, marginTop: 6 }}>{value}</Text>
      <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 18, marginTop: 6 }}>{note}</Text>
    </View>
  );
}

export function DealPipelineCard({ projects }: { projects: ProjectedBuilding[] }) {
  return (
    <GlassCard>
      <Label>Building-specific deals</Label>
      <Text style={{ color: colors.text, fontSize: typography.title, fontWeight: "700", letterSpacing: -0.35, marginTop: 6, lineHeight: 28 }}>
        Pipeline by building
      </Text>
      <View style={{ marginTop: 12 }}>
        {projects.map((building, index) => {
          const view = building.roleViews.financier;

          return (
            <View key={building.project.id} style={{ paddingVertical: 13, borderTopColor: index === 0 ? "transparent" : colors.border, borderTopWidth: 1 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "700", letterSpacing: -0.2 }}>
                    {building.project.name}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 20, marginTop: 4 }}>
                    DRS {building.drs.score}/100 · {formatPercent(view.fundingProgress)} funded · {formatKes(view.remainingCapitalKes)} remaining
                  </Text>
                </View>
                <Pill tone={drsTone(building)}>{building.drs.decision}</Pill>
              </View>
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
}

export function formatKes(value: number) {
  return `KSh ${Math.round(value).toLocaleString()}`;
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function drsTone(building: ProjectedBuilding): FinancierTone {
  return building.drs.decision === "approve" ? "good" : building.drs.decision === "review" ? "warn" : "bad";
}

export function StatusRail({
  items,
}: {
  items: Array<{ label: string; value: string; note: string; tone?: "good" | "warn" | "bad" | "neutral" }>;
}) {
  return (
    <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg }}>
      {items.map((item) => (
        <PaletteCard
          key={item.label}
          borderRadius={radius.lg}
          padding={spacing.lg}
          style={{ flex: 1, minHeight: 112, borderColor: colors.borderStrong }}
        >
          <Pill tone={item.tone ?? "neutral"}>{item.label}</Pill>
          <Text style={{ color: colors.text, fontSize: typography.title, fontWeight: "600", letterSpacing: -0.5, marginTop: spacing.md }}>
            {item.value}
          </Text>
          <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 17, marginTop: spacing.sm }}>{item.note}</Text>
        </PaletteCard>
      ))}
    </View>
  );
}

function FinancierActivityCard({ activity }: { activity: string[] }) {
  return (
    <GlassCard>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <Text style={{ color: colors.text, fontSize: typography.heading, fontWeight: "600", letterSpacing: -0.25 }}>Financier activity</Text>
        <Pill tone="neutral">latest</Pill>
      </View>
      {activity.map((item, index) => (
        <View
          key={item}
          style={{ flexDirection: "row", gap: 10, paddingVertical: 12, borderTopColor: index === 0 ? "transparent" : colors.border, borderTopWidth: 1 }}
        >
          <View
            style={{
              height: 8,
              width: 8,
              borderRadius: 999,
              marginTop: 6,
              backgroundColor: `${officialPalette.furCream}55`,
              borderWidth: 1,
              borderColor: `${officialPalette.plushCaramel}50`,
            }}
          />
          <Text style={{ color: colors.muted, flex: 1, fontSize: typography.small, lineHeight: 20 }}>{item}</Text>
        </View>
      ))}
    </GlassCard>
  );
}

function decisionTone(decision: DeploymentDecision): FinancierTone {
  return decision === "approve" ? "good" : decision === "review" ? "warn" : "bad";
}

function toneColor(tone: FinancierTone = "neutral") {
  if (tone === "good") {
    return colors.green;
  }
  if (tone === "warn") {
    return colors.amber;
  }
  if (tone === "bad") {
    return colors.red;
  }
  return colors.text;
}

