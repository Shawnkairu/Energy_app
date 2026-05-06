import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Label, PrimaryButton, colors, typography } from "@emappa/ui";

/** `ScreenVerify` — Nav title set via route; body matches OTP + resend + primary. */
export default function VerifyPhone() {
  const router = useRouter();
  const masked = "+30 698 ••• 4421";

  return (
    <View style={styles.root}>
      <Label>Verify</Label>
      <Text style={styles.pageTitle}>Confirm it's you</Text>
      <Text style={styles.step}>Step 2 of 3</Text>
      <Text style={styles.lede}>
        We sent a 6-digit code to <Text style={{ color: colors.text, fontWeight: "600" }}>{masked}</Text>
      </Text>
      <View style={styles.otpRow}>
        {["4", "2", "9", "1", "•", "•"].map((d, i) => (
          <View
            key={`${i}-${d}`}
            style={[
              styles.otpCell,
              {
                backgroundColor: i < 4 ? colors.white : colors.panelSoft,
                borderColor: i === 4 ? colors.orangeDeep : colors.border,
              },
            ]}
          >
            <Text style={styles.otpDigit}>{d !== "•" ? d : ""}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.resend}>
        Resend code in <Text style={{ color: colors.text, fontWeight: "600" }}>0:23</Text>
      </Text>
      <View style={{ flex: 1, minHeight: 12 }} />
      <PrimaryButton onPress={() => router.push("/(auth)/role-select")}>Continue</PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28 },
  pageTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "600",
    letterSpacing: -0.4,
    marginTop: 4,
  },
  step: { color: colors.muted, fontSize: typography.small, marginTop: 6 },
  lede: { color: colors.muted, fontSize: typography.small, lineHeight: 21, marginTop: 16, marginBottom: 20 },
  otpRow: { flexDirection: "row", justifyContent: "space-between", gap: 6 },
  otpCell: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  otpDigit: { color: colors.text, fontSize: 24, fontWeight: "600", letterSpacing: -0.5 },
  resend: { color: colors.dim, fontSize: typography.micro, marginTop: 24 },
});
