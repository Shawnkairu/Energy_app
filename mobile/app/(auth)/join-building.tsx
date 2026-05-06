import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { GlassCard, Label, PrimaryButton, colors, typography } from "@emappa/ui";

/** Step 1 handoff — join before verify (`shared-screens` flow: join → OTP → role). */
export default function JoinBuilding() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <Text style={styles.kicker}>Join</Text>
      <Text style={styles.title}>Join your building</Text>
      <Text style={styles.subtitle}>
        Scan the building's QR code or enter the join code your owner shared. One household, one resident session.
      </Text>
      <GlassCard>
        <Label>Step 1 of 3</Label>
        <Text style={styles.cardTitle}>Scan or enter code</Text>
        <View style={styles.viewfinder}>
          <Text style={styles.viewfinderLabel}>QR scanner viewfinder</Text>
        </View>
        <Text style={styles.or}>or</Text>
        <Label>Building join code</Label>
        <View style={styles.codeWell}>
          <Text style={{ color: colors.muted, fontSize: typography.small }}>6 digits</Text>
        </View>
        <Text style={styles.hint}>Provided by your building owner or property manager.</Text>
        <View style={{ marginTop: 14 }}>
          <PrimaryButton onPress={() => router.push("/(auth)/verify-phone")}>Continue</PrimaryButton>
        </View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  kicker: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "600",
    letterSpacing: 0.75,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: typography.hero,
    fontWeight: "600",
    letterSpacing: -0.85,
    lineHeight: 34,
    marginTop: 8,
  },
  subtitle: { color: colors.muted, fontSize: typography.body, lineHeight: 22, marginTop: 8, marginBottom: 8 },
  cardTitle: { color: colors.text, fontSize: typography.heading, fontWeight: "600", marginTop: 6 },
  viewfinder: {
    marginTop: 12,
    height: 160,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  viewfinderLabel: { color: colors.dim, fontSize: typography.micro, letterSpacing: 0.6, textTransform: "uppercase" },
  or: { color: colors.muted, fontSize: typography.micro, textAlign: "center", marginVertical: 10 },
  codeWell: {
    marginTop: 6,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  hint: { color: colors.muted, fontSize: typography.micro, marginTop: 6, lineHeight: 18 },
});
