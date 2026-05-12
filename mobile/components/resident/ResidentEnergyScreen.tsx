import { useCallback, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ProjectedBuilding } from "@emappa/shared";
import { PaletteCard, Pill, colors, officialPalette, spacing, typography } from "@emappa/ui";
import { useApi } from "../../lib/api";
import { useApiData } from "../../lib/useApiData";
import { getResidentEnergyToday } from "./ResidentApi";
import { CenteredState, ResidentInfoCard, ResidentMetricGrid, ResidentPrimaryButton, ResidentScreenFrame } from "./ResidentScaffold";
import { ROLE_TINT } from "./residentTint";
import { formatKwh, formatPercent, residentView } from "./residentUtils";

export function ResidentEnergyScreen() {
  return (
    <ResidentScreenFrame
      section="Energy"
      title="Energy flow"
      subtitle="Sold solar, battery support, and grid fallback."
    >
      {(building) => <ResidentEnergyPanels building={building} />}
    </ResidentScreenFrame>
  );
}

function ResidentEnergyPanels({ building }: { building: ProjectedBuilding }) {
  const api = useApi();
  const apiRef = useRef(api);
  apiRef.current = api;
  const load = useCallback(() => getResidentEnergyToday(apiRef.current, building.project.id), [building.project.id]);
  const { data, error, isLoading, refetch } = useApiData(load, [building.project.id]);
  const view = residentView(building);
  const householdGridKwh = building.energy.E_grid / building.project.units;
  const householdBatteryKwh = building.energy.E_battery_used / building.project.units;

  if (isLoading) {
    return <CenteredState title="Loading energy data" detail="Fetching today's generation and load from the API." />;
  }

  if (error) {
    return <CenteredState title="Energy data unavailable" detail={error.message} actionLabel="Retry" onAction={refetch} />;
  }

  const points = (data?.generation_kwh ?? []).map((value, index) => ({
    label: formatHour(index),
    value,
  }));
  const todaySolarKwh = sum(data?.generation_kwh ?? []);
  const todayLoadKwh = sum(data?.load_kwh ?? []);

  return (
    <>
      <EnergyFlowCard
        coverage={view.solarCoverage}
        soldSolar={formatKwh(view.monthlySolarKwh)}
        battery={formatKwh(householdBatteryKwh)}
        grid={formatKwh(householdGridKwh)}
      />

      <SolarTodayCard points={points} total={formatKwh(todaySolarKwh)} load={formatKwh(todayLoadKwh)} />

      <ResidentMetricGrid
        items={[
          {
            label: "Solar",
            value: formatKwh(view.monthlySolarKwh),
            detail: "Sold this month.",
            tone: view.monthlySolarKwh > 0 ? "good" : "warn",
          },
          {
            label: "Coverage",
            value: formatPercent(view.solarCoverage),
            detail: "Prepaid solar share.",
            tone: view.solarCoverage > 0 ? "good" : "neutral",
          },
          {
            label: "Battery",
            value: formatKwh(householdBatteryKwh),
            detail: "Stored support.",
          },
          {
            label: "Grid",
            value: formatKwh(householdGridKwh),
            detail: "Fallback only.",
            tone: householdGridKwh > 0 ? "warn" : "good",
          },
        ]}
      />

      <ResidentInfoCard
        eyebrow="Truth"
        title="Generated is not always allocated."
        detail="Resident credit follows sold prepaid solar only."
        synthetic
      >
        <ResidentPrimaryButton onPress={refetch} accessibilityLabel="Refresh today's energy data">
          Refresh energy
        </ResidentPrimaryButton>
      </ResidentInfoCard>
    </>
  );
}

function formatHour(index: number) {
  return `${String(index).padStart(2, "0")}:00`;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function EnergyFlowCard({
  coverage,
  soldSolar,
  battery,
  grid,
}: {
  coverage: number;
  soldSolar: string;
  battery: string;
  grid: string;
}) {
  return (
    <PaletteCard borderRadius={34} padding={20} style={{ ...styles.flowCard, backgroundColor: ROLE_TINT.bg }}>
      <View style={styles.flowHeader}>
        <View>
          <Text style={styles.eyebrow}>Monthly source map</Text>
          <Text style={styles.coverage}>{formatPercent(coverage)}</Text>
          <Text style={styles.caption}>solar cover</Text>
        </View>
        <Pill tone={coverage > 0 ? "good" : "warn"}>{coverage > 0 ? "active" : "prepaid needed"}</Pill>
      </View>

      <View style={styles.flowGraphic}>
        <FlowNode label="Solar" value={soldSolar} accent={officialPalette.foxOrange} />
        <View style={styles.flowLine} />
        <View style={styles.homeNode}>
          <Text style={styles.homeIcon}>H</Text>
          <Text style={styles.homeLabel}>Home</Text>
        </View>
        <View style={styles.flowLine} />
        <View style={styles.bottomNodes}>
          <FlowNode label="Battery" value={battery} accent={colors.green} />
          <FlowNode label="Grid" value={grid} accent={colors.amber} />
        </View>
      </View>
    </PaletteCard>
  );
}

function FlowNode({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={styles.nodeWrap}>
      <View style={[styles.node, { borderColor: accent }]}>
        <View style={[styles.nodeDot, { backgroundColor: accent }]} />
      </View>
      <Text style={styles.nodeLabel}>{label}</Text>
      <Text style={styles.nodeValue}>{value}</Text>
    </View>
  );
}

function SolarTodayCard({ points, total, load }: { points: Array<{ label: string; value: number }>; total: string; load: string }) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <PaletteCard borderRadius={28} padding={18} style={styles.chartCard}>
      <View style={styles.chartTop}>
        <View>
          <Text style={styles.eyebrow}>Today</Text>
          <Text style={styles.chartTitle}>{total}</Text>
          <Text style={styles.caption}>solar generated</Text>
        </View>
        <View style={styles.loadPill}>
          <Text style={styles.loadLabel}>Load</Text>
          <Text style={styles.loadValue}>{load}</Text>
        </View>
      </View>
      <View style={styles.chart}>
        {points.map((point) => (
          <View key={point.label} style={styles.barColumn}>
            <View style={[styles.bar, { height: Math.max(10, (point.value / maxValue) * 96) }]} />
            <Text style={styles.axis}>{point.label}</Text>
          </View>
        ))}
      </View>
    </PaletteCard>
  );
}

const styles = StyleSheet.create({
  flowCard: {
    marginBottom: spacing.lg,
  },
  flowHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "800",
    letterSpacing: 0.75,
    textTransform: "uppercase",
  },
  coverage: {
    color: colors.text,
    fontSize: 46,
    fontWeight: "800",
    letterSpacing: -1.35,
    lineHeight: 52,
    marginTop: 4,
  },
  caption: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "700",
    marginTop: 2,
  },
  flowGraphic: {
    alignItems: "center",
    marginTop: 18,
  },
  flowLine: {
    backgroundColor: "rgba(150, 90, 53, 0.22)",
    height: 26,
    width: 2,
  },
  bottomNodes: {
    flexDirection: "row",
    gap: 40,
  },
  nodeWrap: {
    alignItems: "center",
    minWidth: 96,
  },
  node: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 999,
    borderWidth: 2,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  nodeDot: {
    borderRadius: 999,
    height: 18,
    width: 18,
  },
  nodeLabel: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800",
    marginTop: 8,
  },
  nodeValue: {
    color: colors.muted,
    fontSize: typography.micro,
    marginTop: 2,
  },
  homeNode: {
    alignItems: "center",
    backgroundColor: officialPalette.foxOrange,
    borderRadius: 999,
    height: 92,
    justifyContent: "center",
    width: 92,
  },
  homeIcon: {
    color: colors.white,
    fontSize: 31,
    fontWeight: "800",
    lineHeight: 34,
  },
  homeLabel: {
    color: colors.white,
    fontSize: typography.micro,
    fontWeight: "800",
    marginTop: 2,
    textTransform: "uppercase",
  },
  chartCard: {
    marginBottom: spacing.lg,
  },
  chartTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  chartTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginTop: 4,
  },
  loadPill: {
    alignItems: "flex-end",
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  loadLabel: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  loadValue: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800",
    marginTop: 3,
  },
  chart: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    minHeight: 132,
    marginTop: 14,
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
    gap: 7,
  },
  bar: {
    backgroundColor: "rgba(150, 90, 53, 0.34)",
    borderRadius: 999,
    maxWidth: 28,
    width: "100%",
  },
  axis: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "700",
  },
});
