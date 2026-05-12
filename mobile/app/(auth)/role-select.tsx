import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { BusinessType, StakeholderRole } from "@emappa/shared";
import { AppMark, colors, PaletteCard, spacing, typography } from "@emappa/ui";
import { useAuth } from "../../components/AuthContext";
import { useApi } from "../../lib/api";

/** shared-screens `ScreenRolePicker`: stacked role cards, first row emphasized, subtitle per row. */
const roles: Array<{ label: string; sub: string; role: StakeholderRole; href: string; businessType?: BusinessType }> = [
  { label: "Resident", sub: "I live in a building", role: "resident", href: "/(resident)/home" },
  { label: "Homeowner", sub: "I own and live in a single-family home", role: "homeowner", href: "/(homeowner)/home" },
  { label: "Building owner", sub: "I own a multi-unit building", role: "building_owner", href: "/(building-owner)/home" },
  { label: "Provider", sub: "I supply panels or infrastructure", role: "provider", href: "/(provider)/home", businessType: "both" },
  { label: "Financier", sub: "I fund deal-level capital", role: "financier", href: "/(financier)/portfolio" },
  { label: "Electrician", sub: "I install and verify", role: "electrician", href: "/(electrician)/jobs" },
];

export default function RoleSelect() {
  const router = useRouter();
  const api = useApi();
  const { completeProfile, refreshUser, session, setRole } = useAuth();
  const [displayName, setDisplayName] = useState(session?.user?.displayName ?? "");
  const [status, setStatus] = useState("Confirm your workspace to finish onboarding.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function chooseRole(role: StakeholderRole, href: string, businessType?: BusinessType) {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setStatus("Finishing onboarding...");

    try {
      const profile = {
        displayName: displayName.trim() || undefined,
        businessType: role === "provider" ? businessType : undefined,
      };
      await api.completeOnboarding(profile);
      const user = await api.me();
      completeProfile(profile);
      refreshUser(user);
      setRole(user.role ?? role);
      router.replace(roleHomeHref(user.role ?? role, href));
    } catch {
      setRole(role);
      setStatus("Saved locally, but the API could not complete onboarding yet.");
      router.replace(href);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>Continue as</Text>
            <Text style={styles.title}>Pick your role</Text>
            <Text style={styles.subtitle}>One sign-in — each role sees only its workspace.</Text>
          </View>
          <AppMark size={40} />
        </View>
        <View style={{ height: 18 }} />
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
          placeholder="Display name (optional)"
          placeholderTextColor={colors.dim}
          style={styles.input}
          accessibilityLabel="Display name"
        />
        <Text style={styles.status}>{status}</Text>
        <View style={{ gap: 8 }}>
          {roles.map((r, index) => {
            const selected = session?.user?.role ? session.user.role === r.role : index === 0;
            return (
              <Pressable
                key={r.role}
                accessibilityRole="button"
                accessibilityLabel={`Continue as ${r.label}`}
                accessibilityHint={r.sub}
                onPress={() => chooseRole(r.role, r.href, r.businessType)}
                disabled={isSubmitting}
                style={({ pressed }) => [{ opacity: isSubmitting ? 0.75 : pressed ? 0.94 : 1 }]}
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
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
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
  input: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.body,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  status: { color: colors.muted, fontSize: typography.micro, lineHeight: 18, marginBottom: 12 },
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

function roleHomeHref(role: StakeholderRole, fallback: string) {
  const routes: Record<StakeholderRole, string> = {
    resident: "/(resident)/home",
    homeowner: "/(homeowner)/home",
    building_owner: "/(building-owner)/home",
    provider: "/(provider)/home",
    financier: "/(financier)/portfolio",
    electrician: "/(electrician)/jobs",
    admin: "/(admin)/home",
  };

  return routes[role] ?? fallback;
}
