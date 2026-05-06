import { StyleSheet, Text, View } from "react-native";
import { colors } from "@emappa/ui";

export interface PortfolioRowProps {
  label?: string;
  value?: string;
  detail?: string;
  trend?: string;
}

export function PortfolioRow({
  label = "Portfolio item",
  value = "KES 0",
  detail = "No monetized solar payout yet",
  trend = "Pending",
}: PortfolioRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
      <View style={styles.values}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.trend}>{trend}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 16,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  detail: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  values: {
    alignItems: "flex-end",
    gap: 4,
  },
  value: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  trend: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
});
