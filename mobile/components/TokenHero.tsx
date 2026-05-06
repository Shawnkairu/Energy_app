import { StyleSheet, Text, View } from "react-native";
import { colors } from "@emappa/ui";

export interface TokenHeroProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tokenLabel?: string;
  tokenValue?: string;
}

export function TokenHero({
  eyebrow = "e.mappa token",
  title = "Prepaid solar allocation",
  subtitle = "Track readiness, ownership, and payout state before any allocation goes live.",
  tokenLabel = "Available allocation",
  tokenValue = "0 kWh",
}: TokenHeroProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.tokenPill}>
        <Text style={styles.tokenLabel}>{tokenLabel}</Text>
        <Text style={styles.tokenValue}>{tokenValue}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(103, 64, 34, 0.12)",
    backgroundColor: colors.surface,
    padding: 22,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  tokenPill: {
    alignSelf: "flex-start",
    borderRadius: 18,
    backgroundColor: "rgba(216, 119, 56, 0.12)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tokenLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  tokenValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
});
