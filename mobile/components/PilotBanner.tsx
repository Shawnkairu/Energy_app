import { StyleSheet, Text, View } from "react-native";
import { colors } from "@emappa/ui";

export interface PilotBannerProps {
  title?: string;
  message?: string;
}

export function PilotBanner({
  title = "Pilot mode",
  message = "Figures may use synthetic or gated data until a named building is fully ready.",
}: PilotBannerProps) {
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(216, 119, 56, 0.22)",
    backgroundColor: "rgba(216, 119, 56, 0.08)",
    padding: 16,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  message: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});
