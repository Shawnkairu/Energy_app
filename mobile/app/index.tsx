import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { colors, GlassCard, Pill, Surface } from "@emappa/ui";

export default function Index() {
  return (
    <Surface>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ color: colors.text, fontSize: 44, fontWeight: "900", marginTop: 48 }}>
          e.mappa
        </Text>
        <Text style={{ color: colors.muted, fontSize: 17, lineHeight: 25, marginTop: 12, marginBottom: 24 }}>
          A prepaid operating system for building-level energy economies.
        </Text>
        <Pill>Monetized kWh only</Pill>
        <View style={{ height: 24 }} />
        <Link href="/(auth)/login" asChild>
          <Text
            style={{
              color: colors.ink,
              backgroundColor: colors.orange,
              borderRadius: 18,
              padding: 18,
              marginBottom: 12,
              fontWeight: "900",
              overflow: "hidden",
              textAlign: "center",
            }}
          >
            Sign in to choose your role
          </Text>
        </Link>
        <GlassCard accent={colors.orange}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "900" }}>Build order</Text>
          <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 21 }}>
            Qualify demand, lock prepaid commitment, fund named deals, verify installation, then activate settlement.
          </Text>
        </GlassCard>
      </ScrollView>
    </Surface>
  );
}
