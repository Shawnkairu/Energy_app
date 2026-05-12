import { StyleSheet, Text, View } from "react-native";
import { colors, shadows } from "@emappa/ui";

export interface ProjectHeroProps {
  name?: string;
  location?: string;
  readinessLabel?: string;
  summary?: string;
}

export function ProjectHero({
  name = "Building project",
  location = "Location pending",
  readinessLabel = "DRS not started",
  summary = "Funding, supplier lock, installer scheduling, and go-live remain gated until readiness is verified.",
}: ProjectHeroProps) {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{readinessLabel}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.location}>{location}</Text>
      <Text style={styles.summary}>{summary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...shadows.card,
    gap: 10,
    borderRadius: 28,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.white,
    padding: 22,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "rgba(103, 64, 34, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  name: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
  },
  location: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  summary: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});
