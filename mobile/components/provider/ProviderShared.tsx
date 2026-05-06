import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View, type DimensionValue } from "react-native";
import { getRoleHome } from "@emappa/api-client";
import { getMobileSections, type ProjectedBuilding } from "@emappa/shared";
import {
  AppMark,
  officialPalette,
  PaletteCard,
  Pill,
  radius,
  shadows,
  spacing,
  Surface,
  typography,
} from "@emappa/ui";
import { ActionList, GlassCard, Label, SectionBrief, Value, colors } from "../roles/RoleCards";
import { BuildingPulse, KillSwitchBanner } from "../design-handoff";

export type ProviderSection = "Home" | "Assets" | "Performance" | "Shares" | "Earnings" | "Maintenance" | "Deployment";

type Tone = "good" | "warn" | "bad" | "neutral";

type BarAccent = "primary" | "secondary" | "tertiary" | "warn";

const dividerLine = `${officialPalette.scarfOat}2E`;

const barFillByAccent: Record<BarAccent, string> = {
  primary: officialPalette.foxOrange,
  secondary: officialPalette.guitarMaple,
  tertiary: officialPalette.toastedClay,
  warn: officialPalette.rustBrown,
};

export function formatKes(value: number) {
  return `KSh ${Math.round(value).toLocaleString()}`;
}

export function formatKwh(value: number) {
  return `${Math.round(value).toLocaleString()} kWh`;
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function getProviderBriefFactRow(
  section: ProviderSection,
  building: ProjectedBuilding,
): { label: string; value: string; note: string } {
  const view = building.roleViews.provider;
  switch (section) {
    case "Home":
      return {
        label: "Active asset",
        value: building.project.name,
        note: `${building.project.units} units · ${building.project.locationBand}`,
      };
    case "Assets":
      return {
        label: "Generation",
        value: formatKwh(view.generatedKwh),
        note: `${formatKwh(view.monetizedKwh)} became prepaid solar this month.`,
      };
    case "Performance":
      return {
        label: "Utilization",
        value: formatPercent(view.utilization),
        note: `${formatKwh(view.monetizedKwh)} sold of ${formatKwh(view.generatedKwh)} generated.`,
      };
    case "Earnings":
      return {
        label: "Monthly payout",
        value: formatKes(view.monthlyPayoutKes),
        note: "Projected from monetized solar and retained ownership.",
      };
    case "Shares":
      return {
        label: "Retained rights",
        value: formatPercent(view.retainedOwnership),
        note: `${formatPercent(view.soldOwnership)} sold to residents.`,
      };
    case "Deployment":
      return {
        label: "DRS decision",
        value: building.drs.label,
        note: `Score ${Math.round(building.drs.score)}/100 · ${view.deploymentGates.filter((g) => g.complete).length}/${view.deploymentGates.length} gates ready.`,
      };
    case "Maintenance":
      return {
        label: "Monitoring",
        value: view.monitoringStatus,
        note: `${view.openMaintenanceTickets} open tickets · ${view.warrantyDocuments} warranty files.`,
      };
    default:
      return { label: "Building", value: building.project.name, note: building.project.locationBand };
  }
}

export function ProviderDashboard({
  section,
  title,
  subtitle,
  actions,
  renderPanels,
}: {
  section: ProviderSection;
  title: string;
  subtitle: string;
  actions: string[];
  renderPanels: (building: ProjectedBuilding) => ReactNode;
}) {
  const [building, setBuilding] = useState<ProjectedBuilding | null>(null);

  useEffect(() => {
    getRoleHome("provider").then((home) => setBuilding(home.primary));
  }, []);

  if (!building) {
    return (
      <Surface>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <AppMark size={48} />
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: "700", letterSpacing: -0.7, marginTop: 18 }}>
            Preparing provider desk
          </Text>
          <Text style={{ color: colors.muted, lineHeight: 21, marginTop: 8 }}>Loading asset, payout, and gate context.</Text>
        </View>
      </Surface>
    );
  }

  const sections = getMobileSections("provider");
  const sectionIndex = Math.max(0, sections.findIndex((item) => item.label === section));
  const hero = getProviderHero(section, building);

  return (
    <Surface>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 34 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 22 }}>
          <View>
            <Pill>{section}</Pill>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600", letterSpacing: 0.7, marginTop: 10, textTransform: "uppercase" }}>
              Provider workspace · {sectionIndex + 1}/{sections.length}
            </Text>
          </View>
          <AppMark />
        </View>
        <Text style={{ color: colors.text, fontSize: 34, fontWeight: "700", letterSpacing: -1.3, lineHeight: 38, marginTop: 18 }}>
          {title}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 22, marginTop: 9, marginBottom: 16 }}>
          {subtitle}
        </Text>

        <ProviderActionRail actions={actions} />
        <ProviderHeroCard hero={hero} />
        <BuildingPulse role="provider" building={building} />
        <KillSwitchBanner building={building} />
        {renderPanels(building)}
      </ScrollView>
    </Surface>
  );
}

export function ProviderSectionBrief({
  section,
  title,
  body,
  building,
}: {
  section: ProviderSection;
  title: string;
  body: string;
  building: ProjectedBuilding;
}) {
  return (
    <SectionBrief eyebrow={`Provider · ${section}`} title={title} body={body} rows={[getProviderBriefFactRow(section, building)]} />
  );
}

export function ProviderMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <GlassCard>
      <Label>{label}</Label>
      <Value>{value}</Value>
      {detail ? <Text style={{ color: colors.muted, lineHeight: 20, marginTop: 7 }}>{detail}</Text> : null}
    </GlassCard>
  );
}

export function ProviderAssetSplit({ building }: { building: ProjectedBuilding }) {
  const view = building.roleViews.provider;
  const monetizedShare = view.generatedKwh > 0 ? view.monetizedKwh / view.generatedKwh : 0;
  const wasteShare = view.generatedKwh > 0 ? view.wasteKwh / view.generatedKwh : 0;

  return (
    <GlassCard>
      <Label>Physical asset</Label>
      <Text style={{ color: colors.text, fontSize: 19, fontWeight: "700", letterSpacing: -0.4, marginTop: 6 }}>
        Generated vs monetized output
      </Text>
      <Text style={{ color: colors.muted, lineHeight: 21, marginTop: 7 }}>
        The array can produce more energy than prepaid demand converts into provider revenue.
      </Text>
      <View style={{ marginTop: 16, gap: 13 }}>
        <ProviderBar label="Generated" value={formatKwh(view.generatedKwh)} percent={1} />
        <ProviderBar label="Monetized" value={formatKwh(view.monetizedKwh)} percent={monetizedShare} />
        <ProviderBar label="Unpaid output" value={formatKwh(view.wasteKwh)} percent={wasteShare} />
      </View>
    </GlassCard>
  );
}

export function ProviderPerformanceFlow({ building }: { building: ProjectedBuilding }) {
  const view = building.roleViews.provider;
  const generated = Math.max(view.generatedKwh, 1);

  return (
    <GlassCard>
      <Label>Utilization path</Label>
      <Text style={{ color: colors.text, fontSize: 19, fontWeight: "700", letterSpacing: -0.4, marginTop: 6 }}>
        Demand turns output into value
      </Text>
      <View style={{ marginTop: 16, gap: 13 }}>
        <ProviderBar label="Sold solar" value={formatKwh(view.monetizedKwh)} percent={view.monetizedKwh / generated} accent="primary" />
        <ProviderBar label="Waste / curtailment" value={formatKwh(view.wasteKwh)} percent={view.wasteKwh / generated} accent="warn" />
        <ProviderBar label="Grid fallback" value={formatKwh(view.gridFallbackKwh)} percent={Math.min(1, view.gridFallbackKwh / generated)} accent="secondary" />
      </View>
    </GlassCard>
  );
}

export function ProviderOwnershipImpact({ building }: { building: ProjectedBuilding }) {
  const view = building.roleViews.provider;
  const transferredPayout = building.providerPayouts
    .filter((position) => position.ownerRole !== "provider")
    .reduce((sum, position) => sum + position.payout, 0);

  return (
    <GlassCard>
      <Label>Ownership impact</Label>
      <Text style={{ color: colors.text, fontSize: 25, fontWeight: "700", letterSpacing: -0.8, marginTop: 5 }}>
        {formatPercent(view.retainedOwnership)} retained · {formatPercent(view.soldOwnership)} sold
      </Text>
      <Text style={{ color: colors.muted, lineHeight: 21, marginTop: 8 }}>
        Future payout follows the current ledger. Sold provider shares redirect {formatKes(transferredPayout)} of projected monthly provider-pool payout
        away from the provider.
      </Text>
      <View style={{ marginTop: 14, gap: 10 }}>
        <ProviderRow label="Retained payout" value={formatKes(view.monthlyPayoutKes)} tone="good" />
        <ProviderRow label="Transferred payout" value={formatKes(transferredPayout)} tone={transferredPayout > 0 ? "warn" : "neutral"} />
      </View>
    </GlassCard>
  );
}

export function ProviderRows({
  title,
  eyebrow = "Provider controls",
  rows,
}: {
  title: string;
  eyebrow?: string;
  rows: Array<{ label: string; value: string; note?: string; tone?: "good" | "warn" | "bad" | "neutral" }>;
}) {
  return (
    <GlassCard>
      <Label>{eyebrow}</Label>
      <Text style={{ color: colors.text, fontSize: 19, fontWeight: "700", letterSpacing: -0.4, marginTop: 5 }}>
        {title}
      </Text>
      <View style={{ marginTop: 12 }}>
        {rows.map((row, index) => (
          <View
            key={row.label}
            style={{
              paddingVertical: 12,
              borderTopColor: index === 0 ? "transparent" : dividerLine,
              borderTopWidth: 1,
            }}
          >
            <ProviderRow label={row.label} value={row.value} tone={row.tone} />
            {row.note ? <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5 }}>{row.note}</Text> : null}
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

export function ProviderTruthCard({ title, body, tone = "warn" }: { title: string; body: string; tone?: "good" | "warn" | "bad" | "neutral" }) {
  return (
    <GlassCard>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
        <View style={{ flex: 1 }}>
          <Label>Truth check</Label>
          <Text style={{ color: colors.text, fontSize: 19, fontWeight: "700", letterSpacing: -0.4, marginTop: 6 }}>
            {title}
          </Text>
          <Text style={{ color: colors.muted, lineHeight: 21, marginTop: 8 }}>{body}</Text>
        </View>
        <Pill tone={tone}>no hype</Pill>
      </View>
    </GlassCard>
  );
}

/** Next provider action — aligned to provider-screens-v2.jsx `PROVIDER_ACTIONS` (single focus item). */
const PROVIDER_NEXT_ACTION: Record<ProviderSection, { label: string; detail: string; status: string; tone?: Tone }> = {
  Home: { label: "Open desk", detail: "Move to the desk for triage.", status: "desk", tone: "neutral" },
  Assets: { label: "Inspect proof", detail: "Walk the asset proof packet.", status: "asset", tone: "neutral" },
  Performance: { label: "Read flow", detail: "Confirm sold/waste/grid split.", status: "flow", tone: "neutral" },
  Earnings: { label: "Track payout", detail: "Reconcile pool and ownership against monetized solar.", status: "payout", tone: "neutral" },
  Shares: { label: "Review ledger", detail: "Check retained vs sold rights and future-only impact.", status: "ledger", tone: "neutral" },
  Deployment: { label: "Watch gates", detail: "Watch DRS, supplier lock, and monitoring before activation.", status: "gates", tone: "warn" },
  Maintenance: { label: "Open tickets", detail: "Service work that protects monitoring and warranty proof.", status: "service", tone: "warn" },
};

export function ProviderActionPlan({ section }: { section: ProviderSection }) {
  const item = PROVIDER_NEXT_ACTION[section];
  return <ActionList eyebrow="Provider plan" title="Next provider action" items={[item]} />;
}

function ProviderRow({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "good" | "warn" | "bad" | "neutral";
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <Text style={{ color: colors.text, flex: 1, fontWeight: "800" }}>{label}</Text>
      <Pill tone={tone}>{value}</Pill>
    </View>
  );
}

function ProviderActionRail({ actions }: { actions: string[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
      {actions.map((action, index) => {
        const active = index === 0;
        return (
          <Pressable
            key={action}
            style={{
              borderRadius: radius.pill,
              backgroundColor: active ? officialPalette.espressoShadow : colors.white,
              borderColor: active ? officialPalette.burntChestnut : `${officialPalette.scarfOat}55`,
              borderWidth: 1,
              paddingHorizontal: spacing.md + 3,
              paddingVertical: 10,
              marginRight: 9,
              ...(active ? shadows.card : shadows.soft),
            }}
          >
            <Text
              style={{
                color: active ? colors.white : officialPalette.espressoShadow,
                fontSize: typography.small,
                fontWeight: "600",
              }}
            >
              {action}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function ProviderHeroCard({
  hero,
}: {
  hero: {
    eyebrow: string;
    value: string;
    label: string;
    detail: string;
    tone?: Tone;
  };
}) {
  return (
    <PaletteCard
      padding={spacing.lg}
      borderRadius={radius.xl}
      contentStyle={{ position: "relative" }}
      style={{
        marginBottom: spacing.lg,
        borderColor: `${officialPalette.scarfOat}5C`,
        ...shadows.card,
      }}
    >
      <Fragment>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            borderTopLeftRadius: radius.md,
            borderTopRightRadius: radius.md,
            backgroundColor: `${officialPalette.furCream}55`,
          }}
        />
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
          <View style={{ flex: 1 }}>
            <Label>{hero.eyebrow}</Label>
            <Text style={{ color: officialPalette.espressoShadow, fontSize: 32, fontWeight: "700", letterSpacing: -1.3, marginTop: 7 }}>
              {hero.value}
            </Text>
            {hero.label ? (
              <Text style={{ color: officialPalette.deepWood, fontSize: 14, fontWeight: "600", marginTop: 4 }}>{hero.label}</Text>
            ) : null}
            <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 6 }}>{hero.detail}</Text>
          </View>
          <Pill tone={hero.tone ?? "neutral"}>projected</Pill>
        </View>
      </Fragment>
    </PaletteCard>
  );
}

function ProviderBar({
  label,
  value,
  percent,
  accent = "primary",
}: {
  label: string;
  value: string;
  percent: number;
  accent?: BarAccent;
}) {
  const fill = barFillByAccent[accent];
  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <Text style={{ color: colors.text, fontSize: typography.small, fontWeight: "600" }}>{label}</Text>
        <Text style={{ color: colors.muted, fontSize: typography.small, fontWeight: "500" }}>{value}</Text>
      </View>
      <View
        style={{
          height: 9,
          borderRadius: radius.pill,
          backgroundColor: `${officialPalette.plushCaramel}38`,
          borderWidth: 1,
          borderColor: `${officialPalette.warmUmbar}24`,
          marginTop: 7,
          overflow: "hidden",
          ...shadows.soft,
        }}
      >
        <View
          style={{
            height: 9,
            width: `${Math.max(3, Math.min(100, percent * 100))}%` as DimensionValue,
            borderRadius: radius.pill,
            backgroundColor: fill,
          }}
        />
      </View>
    </View>
  );
}

function getProviderHero(
  section: ProviderSection,
  building: ProjectedBuilding,
): {
  eyebrow: string;
  value: string;
  label: string;
  detail: string;
  tone?: Tone;
} {
  const view = building.roleViews.provider;
  const completeGates = view.deploymentGates.filter((gate) => gate.complete).length;

  switch (section) {
    case "Assets":
      return {
        eyebrow: "Generated this month",
        value: formatKwh(view.generatedKwh),
        label: "",
        detail: `${formatKwh(view.monetizedKwh)} of that became sold solar.`,
      };
    case "Performance":
      return {
        eyebrow: "Utilization",
        value: formatPercent(view.utilization),
        label: "",
        detail: `${formatKwh(view.monetizedKwh)} of ${formatKwh(view.generatedKwh)} generated solar was monetized.`,
        tone: view.utilization >= 0.6 ? "good" : "warn",
      };
    case "Shares":
      return {
        eyebrow: "Retained provider rights",
        value: formatPercent(view.retainedOwnership),
        label: "",
        detail: `${formatPercent(view.soldOwnership)} sold; future payout follows the current ledger.`,
        tone: view.soldOwnership > 0 ? "warn" : "neutral",
      };
    case "Earnings":
      return {
        eyebrow: "Monthly provider payout",
        value: formatKes(view.monthlyPayoutKes),
        label: "",
        detail: "Projected from monetized solar and retained provider ownership.",
        tone: "good",
      };
    case "Maintenance":
      return {
        eyebrow: "Monitoring",
        value: view.monitoringStatus,
        label: "",
        detail: "Connectivity must remain trusted before live settlement can continue.",
        tone: view.openMaintenanceTickets > 0 ? "warn" : "good",
      };
    case "Deployment":
      return {
        eyebrow: "DRS decision",
        value: building.drs.label,
        label: "",
        detail: `${completeGates}/${view.deploymentGates.length} gates ready · score ${building.drs.score}/100.`,
        tone: building.drs.decision === "approve" ? "good" : "warn",
      };
    case "Home":
    default:
      return {
        eyebrow: "Active provider asset",
        value: building.project.name,
        label: "",
        detail: `${building.project.units} units in ${building.project.locationBand}.`,
        tone: "good",
      };
    }
}
