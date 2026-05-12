import { StyleSheet, Text, View } from "react-native";
import { colors } from "@emappa/ui";

export interface PilotBannerProps {
  title?: string;
  message?: string;
  /** Tighter vertical rhythm for stacking under navigation headers. */
  compact?: boolean;
}

export function PilotBanner({
  title = "Pilot mode",
  message = "Figures may use synthetic or gated data until a named building is fully ready.",
  compact = false,
}: PilotBannerProps) {
  return (
    <View style={[styles.banner, compact && styles.bannerCompact]} accessibilityLabel={`${title}. ${message}`}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    gap: 6,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${colors.orangeDeep}38`,
    backgroundColor: `${colors.orangeDeep}14`,
    padding: 16,
  },
  bannerCompact: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
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
