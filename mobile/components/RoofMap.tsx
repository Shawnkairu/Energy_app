import { StyleSheet, Text, View } from "react-native";
import { colors, shadows } from "@emappa/ui";

export interface RoofMapProps {
  title?: string;
  usableAreaSqm?: number;
  panelCount?: number;
}

export function RoofMap({ title = "Roof map", usableAreaSqm = 0, panelCount = 0 }: RoofMapProps) {
  return (
    <View style={styles.card}>
      <View style={styles.roof}>
        <View style={styles.roofInset} />
        <View style={styles.panelGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} style={styles.panel} />
          ))}
        </View>
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.detail}>
          {usableAreaSqm.toLocaleString()} sqm usable area · {panelCount.toLocaleString()} panels
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...shadows.card,
    gap: 14,
    borderRadius: 24,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.white,
    padding: 18,
  },
  roof: {
    minHeight: 150,
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: "rgba(103, 64, 34, 0.08)",
  },
  roofInset: {
    position: "absolute",
    top: 20,
    right: 24,
    bottom: 20,
    left: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(103, 64, 34, 0.12)",
  },
  panelGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignContent: "center",
    justifyContent: "center",
    padding: 28,
  },
  panel: {
    width: 42,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(216, 119, 56, 0.3)",
  },
  copy: {
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  detail: {
    color: colors.muted,
    fontSize: 13,
  },
});
