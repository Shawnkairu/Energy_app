import { useCallback, useRef, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ProjectedBuilding } from "@emappa/shared";
import { AppMark, PaletteCard, Pill, colors, officialPalette, radius, shadows, spacing, typography } from "@emappa/ui";
import { SyntheticBadge } from "../SyntheticBadge";
import { useApi } from "../../lib/api";
import { useApiData } from "../../lib/useApiData";
import { getResidentHome } from "./ResidentApi";
import { ROLE_TINT } from "./residentTint";

type ResidentCompatibleBuilding = Partial<ProjectedBuilding> & {
  id?: string;
  name?: string;
  address?: string;
  stage?: string;
  unitCount?: number;
  prepaidCommittedKes?: number;
  project?: Partial<ProjectedBuilding["project"]>;
  roleViews?: {
    resident?: Partial<ProjectedBuilding["roleViews"]["resident"]>;
  };
  energy?: Partial<ProjectedBuilding["energy"]>;
  drs?: Partial<ProjectedBuilding["drs"]>;
  providerPayouts?: ProjectedBuilding["providerPayouts"];
  transparency?: Partial<ProjectedBuilding["transparency"]>;
};

export function ResidentScreenFrame({
  section,
  title,
  subtitle,
  children,
}: {
  section: string;
  title: string;
  subtitle: string;
  children: (building: ProjectedBuilding, refetch: () => void) => ReactNode;
}) {
  const api = useApi();
  const apiRef = useRef(api);
  apiRef.current = api;
  const load = useCallback(async () => getResidentHome(apiRef.current), []);
  const { data, error, isLoading, refetch } = useApiData(load);

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <CenteredState title="Loading resident workspace" detail="Fetching your building from the e.mappa API." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screen}>
        <CenteredState title="Resident workspace unavailable" detail={error.message} actionLabel="Retry" onAction={refetch} />
      </View>
    );
  }

  if (!data?.primary) {
    return (
      <View style={styles.screen}>
        <CenteredState
          title="No resident building found"
          detail="This account is not attached to a building yet. Refresh after accepting a resident invite."
          actionLabel="Retry"
          onAction={refetch}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.section}>{section}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <AppMark />
        </View>
        {children(normalizeResidentBuilding(data.primary), refetch)}
      </ScrollView>
    </View>
  );
}

function normalizeResidentBuilding(input: ProjectedBuilding): ProjectedBuilding {
  const raw = input as ResidentCompatibleBuilding;
  if (raw.project && raw.roleViews?.resident) {
    return input;
  }

  const units = Number(raw.unitCount ?? raw.project?.units ?? 1) || 1;
  const prepaidCommittedKes = Number(raw.prepaidCommittedKes ?? raw.project?.prepaidCommittedKes ?? 0) || 0;
  const solarCoverage = prepaidCommittedKes > 0 ? 0.42 : 0;

  return {
    ...raw,
    project: {
      ...(raw.project ?? {}),
      id: String(raw.project?.id ?? raw.id ?? "resident-building"),
      name: raw.project?.name ?? raw.name ?? "Your building",
      stage: raw.project?.stage ?? raw.stage ?? "pilot",
      units,
      locationBand: raw.project?.locationBand ?? raw.address ?? "Pilot building",
      prepaidCommittedKes,
    },
    energy: {
      ...(raw.energy ?? {}),
      E_sold: Number(raw.energy?.E_sold ?? 0),
      E_grid: Number(raw.energy?.E_grid ?? 0),
      E_battery_used: Number(raw.energy?.E_battery_used ?? 0),
    },
    drs: {
      ...(raw.drs ?? {}),
      label: raw.drs?.label ?? (prepaidCommittedKes > 0 ? "Ready" : "Prepaid needed"),
      reasons: raw.drs?.reasons ?? (prepaidCommittedKes > 0 ? [] : ["Prepaid balance is not confirmed yet."]),
    },
    providerPayouts: raw.providerPayouts ?? [],
    roleViews: {
      ...(raw.roleViews ?? {}),
      resident: {
        prepaidBalanceKes: Math.round(prepaidCommittedKes / units),
        averagePrepaidBalanceKes: Math.round(prepaidCommittedKes / units),
        monthlySolarKwh: Number(raw.roleViews?.resident?.monthlySolarKwh ?? 0),
        savingsKes: Number(raw.roleViews?.resident?.savingsKes ?? 0),
        solarCoverage,
        ownedProviderShare: Number(raw.roleViews?.resident?.ownedProviderShare ?? 0),
        ...(raw.roleViews?.resident ?? {}),
      },
    },
    transparency: {
      privacyNote: "Resident views stay scoped to your building and hide private counterparty finances.",
      ...(raw.transparency ?? {}),
    },
  } as ProjectedBuilding;
}

export function ResidentMetricGrid({
  items,
}: {
  items: Array<{ label: string; value: string; detail: string; tone?: "good" | "warn" | "bad" | "neutral" }>;
}) {
  return (
    <View style={styles.metricGrid}>
      {items.map((item) => (
        <PaletteCard key={item.label} borderRadius={24} padding={14} style={styles.metricCard}>
          <View style={[styles.metricAccent, { backgroundColor: toneColor(item.tone) }]} />
          <Pill tone={item.tone ?? "neutral"}>{item.label}</Pill>
          <Text style={styles.metricValue}>{item.value}</Text>
          <Text style={styles.metricDetail}>{item.detail}</Text>
        </PaletteCard>
      ))}
    </View>
  );
}

export function ResidentInfoCard({
  eyebrow,
  title,
  detail,
  synthetic,
  children,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  synthetic?: boolean;
  children?: ReactNode;
}) {
  return (
    <PaletteCard>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.eyebrow}>
            {eyebrow}
          </Text>
          <Text style={styles.cardTitle}>
            {title}
          </Text>
        </View>
        {synthetic ? <SyntheticBadge /> : null}
      </View>
      <Text style={styles.cardDetail}>{detail}</Text>
      {children ? <View style={{ marginTop: spacing.md }}>{children}</View> : null}
    </PaletteCard>
  );
}

export function CenteredState({
  title,
  detail,
  actionLabel,
  onAction,
}: {
  title: string;
  detail: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.centered}>
      <AppMark size={52} />
      <Text style={styles.centeredTitle}>{title}</Text>
      <Text style={styles.centeredDetail}>{detail}</Text>
      {actionLabel && onAction ? (
        <ResidentPrimaryButton onPress={onAction} accessibilityLabel={actionLabel}>
          {actionLabel}
        </ResidentPrimaryButton>
      ) : null}
    </View>
  );
}

function toneColor(tone: "good" | "warn" | "bad" | "neutral" = "neutral") {
  if (tone === "good") return colors.green;
  if (tone === "warn") return colors.amber;
  if (tone === "bad") return colors.red;
  return ROLE_TINT.fg;
}

export function ResidentPrimaryButton({
  children,
  onPress,
  accessibilityLabel,
  disabled,
}: {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
}) {
  const label =
    accessibilityLabel ??
    (typeof children === "string" || typeof children === "number" ? String(children) : undefined);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.orangeDeep,
        borderRadius: radius.md,
        paddingVertical: 16,
        paddingHorizontal: 18,
        alignItems: "center",
        opacity: pressed || disabled ? 0.9 : 1,
        ...shadows.soft,
      })}
    >
      <Text style={{ color: colors.white, fontSize: 15, fontWeight: "600" }}>{children}</Text>
    </Pressable>
  );
}

export const residentStyles = StyleSheet.create({
  whiteCard: {
    borderColor: "rgba(118, 73, 39, 0.12)",
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.white,
    ...shadows.card,
  },
  orangeDot: {
    height: 10,
    width: 10,
    borderRadius: 999,
    backgroundColor: officialPalette.foxOrange,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: 34,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.lg,
    marginTop: 20,
  },
  headerCopy: {
    flex: 1,
    gap: 8,
  },
  section: {
    color: ROLE_TINT.fg,
    fontSize: typography.micro,
    fontWeight: "800",
    letterSpacing: 0.75,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: typography.hero + 3,
    fontWeight: "800",
    letterSpacing: -1,
    lineHeight: typography.hero + 9,
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 19,
    maxWidth: 290,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metricCard: {
    flexBasis: "48%",
    flexGrow: 1,
    maxWidth: "48%",
    minHeight: 122,
    minWidth: 0,
  },
  metricAccent: {
    height: 3,
    borderRadius: 999,
    marginBottom: 12,
    width: 34,
  },
  metricValue: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.65,
    marginTop: 11,
  },
  metricDetail: {
    color: colors.muted,
    fontSize: typography.micro,
    lineHeight: 15,
    marginTop: 5,
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  cardTitleBlock: {
    flex: 1,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.title + 1,
    fontWeight: "800",
    letterSpacing: -0.55,
    lineHeight: typography.title + 8,
    marginTop: 5,
  },
  cardDetail: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 19,
    marginTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.md,
  },
  centeredTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "800",
    letterSpacing: -0.45,
  },
  centeredDetail: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 20,
  },
});
