import { StyleSheet, Text, View } from "react-native";
import { colors, shadows } from "@emappa/ui";

export interface EnergyTodayPoint {
  label: string;
  value: number;
}

export interface EnergyTodayChartProps {
  title?: string;
  points?: EnergyTodayPoint[];
  unit?: string;
}

const DEFAULT_POINTS: EnergyTodayPoint[] = [
  { label: "6a", value: 0 },
  { label: "9a", value: 0 },
  { label: "12p", value: 0 },
  { label: "3p", value: 0 },
  { label: "6p", value: 0 },
];

export function EnergyTodayChart({ title = "Energy today", points = DEFAULT_POINTS, unit = "kWh" }: EnergyTodayChartProps) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chart}>
        {points.map((point) => (
          <View key={point.label} style={styles.barColumn}>
            <View style={[styles.bar, { height: Math.max(8, (point.value / maxValue) * 96) }]} />
            <Text style={styles.axisLabel}>{point.label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.caption}>Values shown in {unit}; updated from the active building feed.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...shadows.card,
    gap: 14,
    borderRadius: 26,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.white,
    padding: 18,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  chart: {
    minHeight: 130,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  bar: {
    width: "100%",
    maxWidth: 30,
    borderRadius: 999,
    backgroundColor: colors.orangeDeep,
  },
  axisLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  caption: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
});
