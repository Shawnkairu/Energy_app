import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { StakeholderRole } from "@emappa/shared";
import { AppMark, colors, PaletteCard, typography } from "@emappa/ui";
import { saveSelectedRole } from "../../components/session";

/** shared-screens `ScreenRolePicker`: stacked role cards, first row emphasized, subtitle per row. */
const roles = [
  { label: "Resident", sub: "I live in a building", role: "resident" as const, href: "/(resident)/home" },
  { label: "Owner", sub: "I own a building", role: "owner" as const, href: "/(owner)/home" },
  { label: "Provider", sub: "I deploy solar capacity", role: "provider" as const, href: "/(provider)/home" },
  { label: "Financier", sub: "I fund deal-level capital", role: "financier" as const, href: "/(financier)/home" },
  { label: "Electrician", sub: "I install and verify", role: "installer" as const, href: "/(installer)/home" },
  { label: "Supplier", sub: "I supply hardware & BOM", role: "supplier" as const, href: "/(supplier)/home" },
  { label: "Admin", sub: "Internal ops & cockpit", role: "admin" as const, href: "/(admin)/home" },
] as const;

export default function RoleSelect() {
  const router = useRouter();

  function chooseRole(role: StakeholderRole, href: string) {
    saveSelectedRole(role);
    router.replace(href);
  }

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>Continue as</Text>
            <Text style={styles.title}>Pick your role</Text>
            <Text style={styles.subtitle}>One account, seven workspaces</Text>
          </View>
          <AppMark size={40} />
        </View>
        <View style={{ height: 18 }} />
        <View style={{ gap: 8 }}>
          {roles.map((r, index) => {
            const selected = index === 0;
            return (
              <Pressable
                key={r.role}
                onPress={() => chooseRole(r.role, r.href)}
                style={({ pressed }) => [{ opacity: pressed ? 0.94 : 1 }]}
              >
                <PaletteCard
                  borderRadius={16}
                  padding={12}
                  style={{
                    borderWidth: selected ? 2 : StyleSheet.hairlineWidth * 2,
                    borderColor: selected ? colors.orangeDeep : colors.border,
                  }}
                  contentStyle={{ flexDirection: "row", alignItems: "center", gap: 12 }}
                >
                  <View style={styles.glyphWell}>
                    <Text style={styles.glyph}>{r.label[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontSize: typography.body, fontWeight: "600", letterSpacing: -0.2 }}>
                      {r.label}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: typography.micro, marginTop: 2, lineHeight: 16 }}>{r.sub}</Text>
                  </View>
                  {selected ? <View style={styles.dot} /> : null}
                </PaletteCard>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  topRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
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
    marginTop: 6,
  },
  subtitle: { color: colors.muted, fontSize: typography.small, lineHeight: 20, marginTop: 6, maxWidth: 280 },
  glyphWell: {
    height: 34,
    width: 34,
    borderRadius: 10,
    backgroundColor: `${colors.orangeDeep}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  glyph: { color: colors.orangeDeep, fontWeight: "700", fontSize: 14 },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 999,
    backgroundColor: colors.orangeDeep,
  },
});
