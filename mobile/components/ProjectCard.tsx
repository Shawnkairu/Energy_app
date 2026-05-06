import { StyleSheet, Text, View } from "react-native";
import { colors } from "@emappa/ui";

export interface ProjectCardProps {
  title?: string;
  subtitle?: string;
  status?: string;
  metricLabel?: string;
  metricValue?: string;
}

export function ProjectCard({
  title = "Project",
  subtitle = "Deal-level funding not yet assigned",
  status = "Draft",
  metricLabel = "Readiness",
  metricValue = "0%",
}: ProjectCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.status}>{status}</Text>
        </View>
      </View>
      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>{metricLabel}</Text>
        <Text style={styles.metricValue}>{metricValue}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(103, 64, 34, 0.12)",
    backgroundColor: colors.surface,
    padding: 18,
  },
  header: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "rgba(216, 119, 56, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  status: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  metricValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
});
