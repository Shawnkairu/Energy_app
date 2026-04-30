import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";
import { colors, GlassCard, Surface } from "@emappa/ui";
import { savePilotSession } from "../../components/session";

export default function Login() {
  const router = useRouter();

  function continueToRoleSelect() {
    savePilotSession({ phone: "+254 7XX XXX XXX" });
    router.push("/(auth)/role-select");
  }

  return (
    <Surface>
      <Text style={{ color: colors.text, fontSize: 36, fontWeight: "900", marginTop: 60 }}>Welcome back</Text>
      <Text style={{ color: colors.muted, marginTop: 10, lineHeight: 22 }}>
        Pilot phone login for the e.mappa demo. This creates a local session that can be swapped for OTP/KYC when the backend is connected.
      </Text>
      <GlassCard accent={colors.orange}>
        <Text style={{ color: colors.text, fontWeight: "800" }}>+254 7XX XXX XXX</Text>
      </GlassCard>
      <Pressable onPress={continueToRoleSelect}>
        <Text style={{ color: colors.orange, fontWeight: "900", fontSize: 18 }}>Continue</Text>
      </Pressable>
    </Surface>
  );
}
