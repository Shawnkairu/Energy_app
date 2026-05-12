import { useEffect, useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type DimensionValue } from "react-native";
import { getRoleHome } from "@emappa/api-client";
import { getMobileSections, type ProjectedBuilding } from "@emappa/shared";
import {
  AppMark,
  colors,
  officialPalette,
  Pill,
  radius,
  shadows,
  spacing,
  Surface,
  typography,
} from "@emappa/ui";
import { PilotBanner } from "../PilotBanner";

export type ProviderSection =
  | "Discover"
  | "Assets"
  | "Generation"
  | "Performance"
  | "Wallet"
  | "Shares"
  | "Earnings"
  | "Maintenance"
  | "Deployment"
  | "Profile";

type Tone = "good" | "warn" | "bad" | "neutral";

type BarAccent = "primary" | "secondary" | "tertiary" | "warn";

const dividerLine = `${officialPalette.scarfOat}42`;
const orange = officialPalette.foxOrange;
const softOrange = `${officialPalette.foxOrange}14`;
const softBorder = `${officialPalette.scarfOat}72`;
const providerShadow = {
  boxShadow: "0 10px 18px rgba(87, 54, 27, 0.05)",
  elevation: 1,
};

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
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: spacing.xl }}>
          <AppMark size={48} />
          <Text
            style={{
              color: colors.text,
              fontSize: typography.hero,
              fontWeight: "700",
              letterSpacing: -0.6,
              marginTop: spacing.lg,
              textAlign: "center",
            }}
          >
            Preparing provider desk
          </Text>
          <Text style={{ color: colors.muted, lineHeight: 21, marginTop: spacing.sm, textAlign: "center" }}>
            Loading asset, payout, and gate context.
          </Text>
        </View>
      </Surface>
    );
  }

  const sections = getMobileSections("provider");
  const sectionIndex = Math.max(0, sections.findIndex((item) => item.label === section));
  const hero = getProviderHero(section, building);

  return (
    <Surface>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 34, paddingHorizontal: spacing.lg }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.md }}>
          <View>
            <Text style={styles.overline}>Provider</Text>
            <Text
              style={{
                color: colors.muted,
                fontSize: typography.micro,
                fontWeight: "600",
                letterSpacing: 0.7,
                marginTop: 10,
                textTransform: "uppercase",
              }}
            >
              {sectionIndex + 1}/{sections.length} · {section}
            </Text>
          </View>
          <View style={styles.markShell}>
            <AppMark size={36} />
          </View>
        </View>
        <Text
          style={{
            color: colors.text,
            fontSize: 36,
            fontWeight: "700",
            letterSpacing: -1.5,
            lineHeight: 39,
            marginTop: spacing.lg,
          }}
        >
          {title}
        </Text>
        <Text style={{ color: colors.muted, fontSize: typography.body, lineHeight: 21, marginTop: spacing.sm, marginBottom: 0 }}>
          {subtitle}
        </Text>

        <View style={{ marginTop: spacing.md, marginBottom: spacing.sm }}>
          <PilotBanner
            title="Pilot mode"
            message="Projected figures use synthetic building data until a named asset is fully live in settlement."
          />
        </View>

        <ProviderActionRail actions={actions} />
        <ProviderHeroCard hero={hero} />
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
    <ProviderCard>
      <ProviderLabel>{section}</ProviderLabel>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <ProviderTinyFact building={building} section={section} />
    </ProviderCard>
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
    <ProviderCard>
      <ProviderLabel>{label}</ProviderLabel>
      <Text style={styles.bigValue}>{value}</Text>
      {detail ? <Text style={styles.body}>{detail}</Text> : null}
    </ProviderCard>
  );
}

export function ProviderAssetSplit({ building }: { building: ProjectedBuilding }) {
  const view = building.roleViews.provider;
  const monetizedShare = view.generatedKwh > 0 ? view.monetizedKwh / view.generatedKwh : 0;
  const wasteShare = view.generatedKwh > 0 ? view.wasteKwh / view.generatedKwh : 0;

  return (
    <ProviderCard>
      <ProviderLabel>Array output</ProviderLabel>
      <Text style={styles.cardTitle}>Generated versus sold</Text>
      <View style={{ marginTop: 16, gap: 13 }}>
        <ProviderBar label="Generated" value={formatKwh(view.generatedKwh)} percent={1} />
        <ProviderBar label="Monetized" value={formatKwh(view.monetizedKwh)} percent={monetizedShare} />
        <ProviderBar label="Unpaid output" value={formatKwh(view.wasteKwh)} percent={wasteShare} />
      </View>
    </ProviderCard>
  );
}

export function ProviderPerformanceFlow({ building }: { building: ProjectedBuilding }) {
  const view = building.roleViews.provider;
  const generated = Math.max(view.generatedKwh, 1);

  return (
    <ProviderCard>
      <ProviderLabel>Energy path</ProviderLabel>
      <ProviderFlowDiagram building={building} />
      <View style={{ marginTop: 18, gap: 13 }}>
        <ProviderBar label="Sold solar" value={formatKwh(view.monetizedKwh)} percent={view.monetizedKwh / generated} accent="primary" />
        <ProviderBar label="Unpaid output" value={formatKwh(view.wasteKwh)} percent={view.wasteKwh / generated} accent="warn" />
        <ProviderBar label="Grid fallback" value={formatKwh(view.gridFallbackKwh)} percent={Math.min(1, view.gridFallbackKwh / generated)} accent="secondary" />
      </View>
    </ProviderCard>
  );
}

export function ProviderOwnershipImpact({ building }: { building: ProjectedBuilding }) {
  const view = building.roleViews.provider;
  const transferredPayout = building.providerPayouts
    .filter((position) => position.ownerRole !== "provider")
    .reduce((sum, position) => sum + position.payout, 0);

  return (
    <ProviderCard>
      <ProviderLabel>Ownership</ProviderLabel>
      <Text style={styles.bigValue}>{formatPercent(view.retainedOwnership)} retained</Text>
      <Text style={styles.body}>{formatPercent(view.soldOwnership)} sold · {formatKes(transferredPayout)} redirected</Text>
      <View style={{ marginTop: 14, gap: 10 }}>
        <ProviderRow label="Retained payout" value={formatKes(view.monthlyPayoutKes)} tone="good" />
        <ProviderRow label="Transferred payout" value={formatKes(transferredPayout)} tone={transferredPayout > 0 ? "warn" : "neutral"} />
      </View>
    </ProviderCard>
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
    <ProviderCard>
      <ProviderLabel>{eyebrow}</ProviderLabel>
      <Text style={styles.cardTitle}>{title}</Text>
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
            {row.note ? <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 5 }}>{row.note}</Text> : null}
          </View>
        ))}
      </View>
    </ProviderCard>
  );
}

export function ProviderTruthCard({ title, body, tone = "warn" }: { title: string; body: string; tone?: "good" | "warn" | "bad" | "neutral" }) {
  return (
    <ProviderCard>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
        <View style={{ flex: 1 }}>
          <ProviderLabel>Truth check</ProviderLabel>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </View>
        <Pill tone={tone}>no hype</Pill>
      </View>
    </ProviderCard>
  );
}

/** Next provider action — aligned to provider-screens-v2.jsx `PROVIDER_ACTIONS` (single focus item). */
const PROVIDER_NEXT_ACTION: Record<ProviderSection, { label: string; detail: string; status: string; tone?: Tone }> = {
  Discover: { label: "Review array status", detail: "Generation, revenue, maintenance, and gates.", status: "now", tone: "good" },
  Assets: { label: "Inspect asset proof", detail: "Generation and warranty evidence.", status: "asset", tone: "neutral" },
  Generation: { label: "Read generation", detail: "Array output and unused energy.", status: "array", tone: "good" },
  Performance: { label: "Read flow", detail: "Sold, unpaid, grid fallback.", status: "flow", tone: "neutral" },
  Wallet: { label: "Review transfers", detail: "Available cash and pending settlement.", status: "wallet", tone: "good" },
  Earnings: { label: "Track earnings", detail: "Only monetized solar payout.", status: "payout", tone: "good" },
  Shares: { label: "Review ledger", detail: "Retained versus sold rights.", status: "ledger", tone: "neutral" },
  Deployment: { label: "Watch gates", detail: "Readiness before go-live.", status: "gates", tone: "warn" },
  Maintenance: { label: "Clear tickets", detail: "Monitoring and warranty proof.", status: "service", tone: "warn" },
  Profile: { label: "Keep profile ready", detail: "Identity, proof, and support state.", status: "profile", tone: "neutral" },
};

export function ProviderActionPlan({ section }: { section: ProviderSection }) {
  const item = PROVIDER_NEXT_ACTION[section];
  return (
    <ProviderCard>
      <ProviderLabel>Next</ProviderLabel>
      <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={styles.orangeDot} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700", letterSpacing: -0.4 }}>{item.label}</Text>
          <Text style={{ color: colors.muted, lineHeight: 19, marginTop: 3 }}>{item.detail}</Text>
        </View>
        <Pill tone={item.tone ?? "neutral"}>{item.status}</Pill>
      </View>
    </ProviderCard>
  );
}

export function ProviderHomeSummary({ building }: { building: ProjectedBuilding }) {
  const view = building.roleViews.provider;
  const completeGates = view.deploymentGates.filter((gate) => gate.complete).length;
  const maintenanceTone = view.openMaintenanceTickets > 0 ? "warn" : "good";

  return (
    <View style={{ gap: 12, marginBottom: spacing.lg }}>
      <ProviderSignalCard label="Array" value={view.monitoringStatus} detail={`${completeGates}/${view.deploymentGates.length} gates ready`} tone={maintenanceTone} />
      <ProviderSignalCard label="Generation" value={formatKwh(view.generatedKwh)} detail={`${formatPercent(view.utilization)} utilized`} tone="good" />
      <ProviderSignalCard label="Revenue" value={formatKes(view.monthlyPayoutKes)} detail="Projected provider payout" tone="good" />
      <ProviderSignalCard label="Maintenance" value={`${view.openMaintenanceTickets} open`} detail={`${view.warrantyDocuments} warranty files`} tone={maintenanceTone} />
    </View>
  );
}

export function ProviderFlowDiagram({ building }: { building: ProjectedBuilding }) {
  const view = building.roleViews.provider;
  const generated = Math.max(view.generatedKwh, 1);
  const sold = Math.max(8, Math.min(100, (view.monetizedKwh / generated) * 100));
  const waste = Math.max(8, Math.min(100, (view.wasteKwh / generated) * 100));
  const grid = Math.max(8, Math.min(100, (view.gridFallbackKwh / generated) * 100));

  return (
    <View style={styles.flowShell}>
      <View style={styles.sunDisc}>
        <Text style={styles.sunText}>PV</Text>
      </View>
      <View style={{ flex: 1, gap: 10 }}>
        <ProviderFlowLine label="Sold solar" value={formatKwh(view.monetizedKwh)} width={sold} color={orange} />
        <ProviderFlowLine label="Unpaid output" value={formatKwh(view.wasteKwh)} width={waste} color={officialPalette.rustBrown} />
        <ProviderFlowLine label="Grid fallback" value={formatKwh(view.gridFallbackKwh)} width={grid} color={officialPalette.guitarMaple} />
      </View>
    </View>
  );
}

export function ProviderGenerationGraphic({ building }: { building: ProjectedBuilding }) {
  const view = building.roleViews.provider;
  const generated = Math.max(view.generatedKwh, 1);

  return (
    <ProviderCard>
      <ProviderLabel>Live generation model</ProviderLabel>
      <View style={{ marginTop: 12 }}>
        <View style={styles.arrayGrid}>
          {Array.from({ length: 18 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.panelCell,
                {
                  opacity: index < Math.round(view.utilization * 18) ? 1 : 0.28,
                  borderColor: index < Math.round(view.utilization * 18) ? `${orange}88` : softBorder,
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.bigValue}>{formatKwh(view.generatedKwh)}</Text>
        <Text style={styles.body}>Generated this month</Text>
        <View style={{ marginTop: 16, gap: 12 }}>
          <ProviderBar label="Monetized" value={formatKwh(view.monetizedKwh)} percent={view.monetizedKwh / generated} />
          <ProviderBar label="Unused" value={formatKwh(view.wasteKwh)} percent={view.wasteKwh / generated} accent="warn" />
        </View>
      </View>
    </ProviderCard>
  );
}

export function ProviderWalletSummary({ building }: { building: ProjectedBuilding }) {
  const view = building.roleViews.provider;
  return (
    <ProviderCard>
      <ProviderLabel>Wallet</ProviderLabel>
      <Text style={styles.bigValue}>{formatKes(view.monthlyPayoutKes)}</Text>
      <Text style={styles.body}>Projected monthly cash-in from retained provider rights.</Text>
      <View style={{ marginTop: 16, gap: 10 }}>
        <ProviderRow label="Available" value={formatKes(Math.round(view.monthlyPayoutKes * 0.72))} tone="good" />
        <ProviderRow label="Pending settlement" value={formatKes(Math.round(view.monthlyPayoutKes * 0.28))} />
        <ProviderRow label="Last transfer" value={formatKes(Math.round(view.monthlyPayoutKes * 0.48))} />
      </View>
    </ProviderCard>
  );
}

export function ProviderProfileSummary({ building }: { building: ProjectedBuilding }) {
  const view = building.roleViews.provider;
  return (
    <ProviderCard>
      <View style={styles.profilePhoto}>
        <View style={styles.profileSun}>
          <Text style={styles.sunText}>e</Text>
        </View>
        <View style={styles.profileLine} />
      </View>
      <Text style={{ color: colors.text, fontSize: 27, fontWeight: "700", letterSpacing: -1, marginTop: 18 }}>
        {building.project.name} operator
      </Text>
      <Text style={styles.body}>{building.project.locationBand} · {building.project.units} units · provider verified</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        <Pill tone="good">monitoring</Pill>
        <Pill tone={view.openMaintenanceTickets > 0 ? "warn" : "good"}>{view.openMaintenanceTickets} tickets</Pill>
        <Pill>{view.warrantyDocuments} docs</Pill>
      </View>
    </ProviderCard>
  );
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
              backgroundColor: active ? orange : colors.white,
              borderColor: active ? orange : softBorder,
              borderWidth: 1,
              paddingHorizontal: spacing.md + 3,
              paddingVertical: 10,
              marginRight: 9,
              ...(active ? shadows.soft : {}),
            }}
          >
            <Text
              style={{
                color: active ? colors.white : officialPalette.espressoShadow,
                fontSize: typography.small,
                fontWeight: "700",
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
    <ProviderCard style={{ padding: 22 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
        <View style={{ flex: 1 }}>
          <ProviderLabel>{hero.eyebrow}</ProviderLabel>
          <Text style={{ color: officialPalette.espressoShadow, fontSize: 36, fontWeight: "700", letterSpacing: -1.6, marginTop: 7 }}>
            {hero.value}
          </Text>
          {hero.label ? (
            <Text style={{ color: officialPalette.deepWood, fontSize: 14, fontWeight: "600", marginTop: 4 }}>{hero.label}</Text>
          ) : null}
          <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 6 }}>{hero.detail}</Text>
        </View>
        <Pill tone={hero.tone ?? "neutral"}>projected</Pill>
      </View>
    </ProviderCard>
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
          height: 8,
          borderRadius: radius.pill,
          backgroundColor: `${officialPalette.scarfOat}34`,
          borderWidth: 1,
          borderColor: `${officialPalette.warmUmbar}18`,
          marginTop: 7,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 8,
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
    case "Generation":
      return {
        eyebrow: "Generated this month",
        value: formatKwh(view.generatedKwh),
        label: "",
        detail: `${formatPercent(view.utilization)} utilization across the array.`,
        tone: view.utilization >= 0.6 ? "good" : "warn",
      };
    case "Performance":
      return {
        eyebrow: "Array utilization",
        value: formatPercent(view.utilization),
        label: "",
        detail: `${formatKwh(view.monetizedKwh)} sold from ${formatKwh(view.generatedKwh)} generated.`,
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
        eyebrow: "Earnings",
        value: formatKes(view.monthlyPayoutKes),
        label: "",
        detail: "Projected from sold prepaid solar.",
        tone: "good",
      };
    case "Wallet":
      return {
        eyebrow: "Wallet",
        value: formatKes(Math.round(view.monthlyPayoutKes * 0.72)),
        label: "",
        detail: "Estimated available balance from provider payouts.",
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
    case "Profile":
      return {
        eyebrow: "Provider profile",
        value: building.project.name,
        label: "",
        detail: `${building.project.locationBand} · ${view.warrantyDocuments} proof files.`,
        tone: view.openMaintenanceTickets > 0 ? "warn" : "good",
      };
    case "Discover":
    default:
      return {
        eyebrow: "Array online",
        value: building.project.name,
        label: "",
        detail: `${view.monitoringStatus} · ${building.project.locationBand}.`,
        tone: "good",
      };
  }
}

function ProviderCard({ children, style }: { children: ReactNode; style?: object }) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.white,
          borderColor: softBorder,
          borderRadius: 28,
          borderWidth: StyleSheet.hairlineWidth * 2,
          marginBottom: spacing.lg,
          padding: 18,
          ...providerShadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function ProviderLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

function ProviderTinyFact({ building, section }: { building: ProjectedBuilding; section: ProviderSection }) {
  const view = building.roleViews.provider;
  const valueBySection: Record<ProviderSection, string> = {
    Discover: `${formatKwh(view.generatedKwh)} generated`,
    Assets: `${formatKwh(view.monetizedKwh)} sold`,
    Generation: `${formatKwh(view.generatedKwh)} generated`,
    Performance: `${formatPercent(view.utilization)} utilization`,
    Wallet: formatKes(view.monthlyPayoutKes),
    Shares: `${formatPercent(view.retainedOwnership)} retained`,
    Earnings: formatKes(view.monthlyPayoutKes),
    Maintenance: `${view.openMaintenanceTickets} tickets`,
    Deployment: building.drs.label,
    Profile: view.monitoringStatus,
  };

  return (
    <View style={styles.factPill}>
      <Text style={{ color: officialPalette.espressoShadow, fontWeight: "700" }}>{valueBySection[section]}</Text>
    </View>
  );
}

function ProviderSignalCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: Tone;
}) {
  const toneColor = tone === "good" ? colors.green : tone === "warn" ? orange : tone === "bad" ? colors.red : officialPalette.espressoShadow;

  return (
    <View style={styles.signalCard}>
      <View style={[styles.signalGlyph, { borderColor: `${toneColor}66` }]}>
        <View style={{ height: 8, width: 8, borderRadius: 999, backgroundColor: toneColor }} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700", letterSpacing: -0.6, marginTop: 3 }}>{value}</Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>{detail}</Text>
      </View>
    </View>
  );
}

function ProviderFlowLine({ label, value, width, color }: { label: string; value: string; width: number; color: string }) {
  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <Text style={{ color: colors.text, fontSize: 13, fontWeight: "700" }}>{label}</Text>
        <Text style={{ color: colors.muted, fontSize: 13, fontWeight: "600" }}>{value}</Text>
      </View>
      <View style={styles.flowTrack}>
        <View style={[styles.flowFill, { width: `${width}%` as DimensionValue, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  arrayGrid: {
    borderColor: softBorder,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 12,
  },
  bigValue: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -1.4,
    marginTop: 8,
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginTop: 6,
  },
  factPill: {
    alignSelf: "flex-start",
    backgroundColor: softOrange,
    borderColor: `${orange}2C`,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  flowFill: {
    borderRadius: radius.pill,
    height: 7,
  },
  flowShell: {
    alignItems: "center",
    borderColor: softBorder,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    padding: 14,
  },
  flowTrack: {
    backgroundColor: `${officialPalette.scarfOat}34`,
    borderRadius: radius.pill,
    height: 7,
    marginTop: 7,
    overflow: "hidden",
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.85,
    textTransform: "uppercase",
  },
  markShell: {
    backgroundColor: colors.white,
    borderColor: softBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    padding: 4,
  },
  orangeDot: {
    backgroundColor: orange,
    borderRadius: 999,
    height: 13,
    width: 13,
  },
  overline: {
    color: orange,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  panelCell: {
    backgroundColor: colors.white,
    borderRadius: 9,
    borderWidth: 1,
    height: 44,
    width: "30%",
  },
  profileLine: {
    backgroundColor: orange,
    borderRadius: radius.pill,
    bottom: 16,
    height: 5,
    left: 22,
    position: "absolute",
    right: 22,
  },
  profilePhoto: {
    backgroundColor: colors.white,
    borderColor: softBorder,
    borderRadius: 30,
    borderWidth: 1,
    height: 170,
    overflow: "hidden",
    position: "relative",
  },
  profileSun: {
    alignItems: "center",
    backgroundColor: softOrange,
    borderColor: `${orange}44`,
    borderRadius: 999,
    borderWidth: 1,
    height: 92,
    justifyContent: "center",
    left: 24,
    position: "absolute",
    top: 22,
    width: 92,
  },
  signalCard: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: softBorder,
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
    ...providerShadow,
  },
  signalGlyph: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  sunDisc: {
    alignItems: "center",
    backgroundColor: softOrange,
    borderColor: `${orange}44`,
    borderRadius: 999,
    borderWidth: 1,
    height: 78,
    justifyContent: "center",
    width: 78,
  },
  sunText: {
    color: orange,
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
});
