import { StyleSheet, Text, View } from "react-native";
import { colors } from "@emappa/ui";

export interface SyntheticBadgeProps {
  label?: string;
}

export function SyntheticBadge({ label = "Synthetic" }: SyntheticBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(103, 64, 34, 0.14)",
    backgroundColor: "rgba(255, 250, 242, 0.92)",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
