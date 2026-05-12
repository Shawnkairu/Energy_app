import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppMark, colors, PrimaryButton, radius, spacing, typography } from "@emappa/ui";
import { AuthFooterHint, SecondaryButton } from "./(auth)/authShell";

/** Welcome — centered mark, bottom primary + secondary + login hint. */
export default function Index() {
  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <AppMark size={72} />
        <Text style={styles.title}>e.mappa</Text>
        <Text style={styles.tagline}>Prepaid solar and fair grid fallback — building-level economics, role-by-role workspaces.</Text>
      </View>
      <View style={styles.footer}>
        <Link href="/(auth)/join-building" asChild>
          <PrimaryButton accessibilityLabel="Join my building">Join my building</PrimaryButton>
        </Link>
        <View style={styles.ctaGap} />
        <Link href="/(auth)/login" asChild>
          <SecondaryButton accessibilityLabel="I'm a partner: sign in for partner workspace">I'm a partner</SecondaryButton>
        </Link>
        <AuthFooterHint muted="Already a member?" accentLabel="Log in" accentHref="/(auth)/login" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: 46, paddingBottom: spacing.xl },
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: spacing.xl,
    backgroundColor: colors.panelSoft,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "600",
    letterSpacing: -1.1,
    lineHeight: 38,
    marginTop: spacing.md,
  },
  tagline: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.md,
    textAlign: "center",
    paddingHorizontal: spacing.md,
    maxWidth: 320,
  },
  footer: { paddingTop: spacing.sm },
  ctaGap: { height: spacing.sm + 2 },
});
