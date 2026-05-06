import { useEffect, useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { getRoleHome } from "@emappa/api-client";
import type { ProjectedBuilding, StakeholderRole } from "@emappa/shared";
import { AppMark, colors, PaletteCard, Pill, Surface, typography } from "@emappa/ui";
import { BuildingPulse, KillSwitchBanner } from "../design-handoff";

export function RoleDashboardScaffold({
  role,
  section,
  title,
  subtitle,
  actions,
  renderHero,
  renderPanels,
  cohesionRole,
}: {
  role: StakeholderRole;
  section: string;
  title: string;
  subtitle: string;
  actions: string[];
  renderHero: (building: ProjectedBuilding) => HeroMetric;
  renderPanels: (building: ProjectedBuilding) => ReactNode;
  /** When set, renders BuildingPulse + KillSwitchBanner after the hero (design handoff). */
  cohesionRole?: StakeholderRole;
}) {
  const [building, setBuilding] = useState<ProjectedBuilding | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    getRoleHome(role)
      .then((home) => {
        setBuilding(home.primary);
      })
      .catch(() => {
        setError("We could not load this role workspace. Check the API connection or retry in mock mode.");
      });
  }, [role]);

  if (error) {
    return (
      <Surface>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <AppMark size={52} />
          <Text style={{ color: colors.text, fontSize: typography.title, fontWeight: "600", letterSpacing: -0.45, marginTop: 18 }}>
            Role view unavailable
          </Text>
          <Text style={{ color: colors.muted, fontSize: typography.small, marginTop: 8, lineHeight: 20 }}>{error}</Text>
        </View>
      </Surface>
    );
  }

  if (!building) {
    return (
      <Surface>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <AppMark size={52} />
          <Text
            style={{
              color: colors.text,
              fontSize: typography.title,
              fontWeight: "600",
              letterSpacing: -0.45,
              marginTop: 18,
              lineHeight: typography.title + 6,
            }}
          >
            Preparing your role view
          </Text>
          <Text style={{ color: colors.muted, fontSize: typography.small, marginTop: 8, lineHeight: 20 }}>
            Loading e.mappa…
          </Text>
        </View>
      </Surface>
    );
  }

  const hero = renderHero(building);

  return (
    <Surface>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 34 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 22 }}>
          <View>
            <Pill>{section}</Pill>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "500", letterSpacing: 0.7, marginTop: 10, textTransform: "uppercase" }}>
              {role} workspace
            </Text>
          </View>
          <AppMark />
        </View>
        <Text
          style={{
            color: colors.text,
            fontSize: typography.hero,
            fontWeight: "600",
            letterSpacing: -0.9,
            lineHeight: typography.hero + 8,
            marginTop: 20,
          }}
        >
          {title}
        </Text>
        <Text style={{ color: colors.muted, fontSize: typography.body, lineHeight: 22, marginTop: 9, marginBottom: 16 }}>
          {subtitle}
        </Text>

        <ActionRail role={role} actions={actions} />
        <HeroMetricCard hero={hero} />
        {cohesionRole ? (
          <>
            <BuildingPulse role={cohesionRole} building={building} />
            <KillSwitchBanner building={building} />
          </>
        ) : null}
        {renderPanels(building)}
      </ScrollView>
    </Surface>
  );
}

export interface HeroMetric {
  label: string;
  value: string;
  sub: string;
}

function HeroMetricCard({ hero }: { hero: HeroMetric }) {
  return (
    <PaletteCard borderRadius={30} padding={20} style={{ marginBottom: 16 }}>
      <Text
        style={{
          color: colors.muted,
          fontSize: typography.micro,
          fontWeight: "500",
          textTransform: "uppercase",
          letterSpacing: 0.65,
        }}
      >
        {hero.label}
      </Text>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.hero + 4,
          fontWeight: "600",
          letterSpacing: -1,
          marginTop: 9,
          lineHeight: typography.hero + 10,
        }}
      >
        {hero.value}
      </Text>
      <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 20, marginTop: 6 }}>{hero.sub}</Text>
    </PaletteCard>
  );
}

function ActionRail({ role, actions }: { role: StakeholderRole; actions: string[] }) {
  const router = useRouter();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
      {actions.map((action, index) => (
        <Pressable
          key={action}
          onPress={() => {
            const target = getActionTarget(role, action);
            router.push(target);
          }}
          style={{
            borderRadius: 999,
            backgroundColor: colors.panel,
            borderColor: index === 0 ? colors.orangeDeep : colors.border,
            borderWidth: 1,
            paddingHorizontal: 14,
            paddingVertical: 9,
            marginRight: 8,
          }}
        >
          <Text style={{ color: index === 0 ? colors.orangeDeep : colors.text, fontSize: 12, fontWeight: "500" }}>{action}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function getActionTarget(role: StakeholderRole, action: string) {
  const normalized = action.toLowerCase();
  const fallback = `/${role === "resident" ? "(resident)" : `(${role})`}/home`;
  const targets: Record<StakeholderRole, Array<[string, string]>> = {
    resident: [
      ["top up", "/(resident)/wallet"],
      ["token", "/(resident)/wallet"],
      ["flow", "/(resident)/usage"],
      ["usage", "/(resident)/usage"],
      ["saving", "/(resident)/usage"],
      ["share", "/(resident)/ownership"],
      ["building", "/(resident)/profile"],
      ["issue", "/(resident)/support"],
      ["question", "/(resident)/support"],
    ],
    owner: [
      ["invite", "/(owner)/resident-roster"],
      ["resident", "/(owner)/resident-roster"],
      ["access", "/(owner)/approve-terms"],
      ["terms", "/(owner)/approve-terms"],
      ["drs", "/(owner)/drs"],
      ["gate", "/(owner)/drs"],
      ["blocker", "/(owner)/drs"],
      ["deploy", "/(owner)/deployment"],
      ["go-live", "/(owner)/deployment"],
      ["compare", "/(owner)/compare-today"],
      ["account", "/(owner)/owner-account"],
      ["draft", "/(owner)/list-building"],
    ],
    provider: [
      ["asset", "/(provider)/assets"],
      ["capacity", "/(provider)/commit-capacity"],
      ["qualified", "/(provider)/qualified-projects"],
      ["project", "/(provider)/qualified-projects"],
      ["payout", "/(provider)/earnings"],
      ["revenue", "/(provider)/earnings"],
      ["share", "/(provider)/shares"],
      ["ledger", "/(provider)/shares"],
      ["gate", "/(provider)/deployment"],
      ["supplier", "/(provider)/deployment"],
      ["maintenance", "/(provider)/maintenance"],
      ["warranty", "/(provider)/maintenance"],
      ["utilization", "/(provider)/performance"],
      ["waste", "/(provider)/performance"],
    ],
    financier: [
      ["deal", "/(financier)/deals"],
      ["drs", "/(financier)/deal-detail"],
      ["evidence", "/(financier)/deal-detail"],
      ["stress", "/(financier)/deal-detail"],
      ["recovery", "/(financier)/portfolio"],
      ["exposure", "/(financier)/portfolio"],
      ["tranche", "/(financier)/tranche-release"],
      ["release", "/(financier)/tranche-release"],
    ],
    installer: [
      ["site", "/(installer)/job-detail"],
      ["capture", "/(installer)/job-detail"],
      ["photo", "/(installer)/job-detail"],
      ["reading", "/(installer)/job-detail"],
      ["checklist", "/(installer)/checklist"],
      ["signoff", "/(installer)/checklist"],
      ["lead", "/(installer)/certification"],
      ["license", "/(installer)/certification"],
      ["ticket", "/(installer)/maintenance"],
      ["data", "/(installer)/maintenance"],
      ["crew", "/(installer)/jobs-inbox"],
      ["job", "/(installer)/jobs-inbox"],
    ],
    supplier: [
      ["inbox", "/(supplier)/quote-requests"],
      ["rfq", "/(supplier)/quote-requests"],
      ["quote", "/(supplier)/quote-requests"],
      ["stock", "/(supplier)/catalog"],
      ["component", "/(supplier)/catalog"],
      ["warranty", "/(supplier)/catalog"],
      ["dispatch", "/(supplier)/orders"],
      ["award", "/(supplier)/orders"],
      ["proof", "/(supplier)/orders"],
      ["score", "/(supplier)/reliability"],
      ["lead", "/(supplier)/reliability"],
    ],
    admin: [
      ["drs", "/(admin)/projects"],
      ["project", "/(admin)/projects"],
      ["stage", "/(admin)/projects"],
      ["alert", "/(admin)/alerts"],
      ["pause", "/(admin)/alerts"],
      ["audit", "/(admin)/alerts"],
      ["proof", "/(admin)/alerts"],
    ],
  };

  return targets[role].find(([keyword]) => normalized.includes(keyword))?.[1] ?? fallback;
}
