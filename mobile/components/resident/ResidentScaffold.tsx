import { useCallback, useRef, type ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import type { ProjectedBuilding } from "@emappa/shared";
import { AppMark, GlassCard, PaletteCard, Pill, PrimaryButton, Surface, colors, spacing, typography } from "@emappa/ui";
import { PilotBanner } from "../PilotBanner";
import { SyntheticBadge } from "../SyntheticBadge";
import { useApi } from "../../lib/api";
import { useApiData } from "../../lib/useApiData";
import { getResidentHome } from "./ResidentApi";

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
      <Surface>
        <CenteredState title="Loading resident workspace" detail="Fetching your building from the e.mappa API." />
      </Surface>
    );
  }

  if (error) {
    return (
      <Surface>
        <CenteredState title="Resident workspace unavailable" detail={error.message} actionLabel="Retry" onAction={refetch} />
      </Surface>
    );
  }

  if (!data?.primary) {
    return (
      <Surface>
        <CenteredState
          title="No resident building found"
          detail="This account is not attached to a building yet. Refresh after accepting a resident invite."
          actionLabel="Retry"
          onAction={refetch}
        />
      </Surface>
    );
  }

  return (
    <Surface>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.lg, paddingBottom: 34 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 22 }}>
          <View style={{ gap: 10 }}>
            <Pill>{section}</Pill>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600", letterSpacing: 0.7, textTransform: "uppercase" }}>
              resident workspace
            </Text>
          </View>
          <AppMark />
        </View>
        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text, fontSize: typography.hero, fontWeight: "700", letterSpacing: -0.9, lineHeight: typography.hero + 8 }}>
            {title}
          </Text>
          <Text style={{ color: colors.muted, fontSize: typography.body, lineHeight: 22 }}>{subtitle}</Text>
        </View>
        <PilotBanner
          title="Resident pilot"
          message="Every number on this screen is fetched from the mobile API; synthetic labels mark pilot data sources."
        />
        {children(data.primary, refetch)}
      </ScrollView>
    </Surface>
  );
}

export function ResidentMetricGrid({
  items,
}: {
  items: Array<{ label: string; value: string; detail: string; tone?: "good" | "warn" | "bad" | "neutral" }>;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
      {items.map((item) => (
        <PaletteCard key={item.label} borderRadius={22} padding={14} style={{ width: "48%", minHeight: 128 }}>
          <Pill tone={item.tone ?? "neutral"}>{item.label}</Pill>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700", letterSpacing: -0.55, marginTop: 12 }}>{item.value}</Text>
          <Text style={{ color: colors.muted, fontSize: typography.micro, lineHeight: 16, marginTop: 6 }}>{item.detail}</Text>
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
    <GlassCard>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.muted, fontSize: typography.micro, fontWeight: "700", letterSpacing: 0.7, textTransform: "uppercase" }}>
            {eyebrow}
          </Text>
          <Text style={{ color: colors.text, fontSize: typography.title, fontWeight: "700", letterSpacing: -0.45, lineHeight: typography.title + 7, marginTop: 6 }}>
            {title}
          </Text>
        </View>
        {synthetic ? <SyntheticBadge /> : null}
      </View>
      <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 20, marginTop: 8 }}>{detail}</Text>
      {children ? <View style={{ marginTop: spacing.md }}>{children}</View> : null}
    </GlassCard>
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
    <View style={{ flex: 1, justifyContent: "center", gap: spacing.md }}>
      <AppMark size={52} />
      <Text style={{ color: colors.text, fontSize: typography.title, fontWeight: "700", letterSpacing: -0.45 }}>{title}</Text>
      <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 20 }}>{detail}</Text>
      {actionLabel && onAction ? <PrimaryButton onPress={onAction}>{actionLabel}</PrimaryButton> : null}
    </View>
  );
}
