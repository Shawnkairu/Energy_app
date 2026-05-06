import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppMark, colors, PrimaryButton, typography } from "@emappa/ui";
import { AuthFooterHint, SecondaryButton } from "./(auth)/authShell";

/** Welcome — shared-screens `ScreenWelcome`: centered mark, bottom primary + secondary + login hint. Root layout supplies shell gradient. */
export default function Index() {
  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <AppMark size={72} />
        <Text style={styles.title}>e.mappa</Text>
        <Text style={styles.tagline}>
          Your building's energy economy. Prepaid solar, fair grid fallback, optional ownership.
        </Text>
      </View>
      <View style={styles.footer}>
        <Link href="/(auth)/join-building" asChild>
          <PrimaryButton>Join my building</PrimaryButton>
        </Link>
        <View style={{ height: 10 }} />
        <Link href="/(auth)/login" asChild>
          <SecondaryButton>I'm a partner</SecondaryButton>
        </Link>
        <AuthFooterHint muted="Already a member?" accentLabel="Log in" accentHref="/(auth)/login" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, paddingTop: 46, paddingBottom: 28 },
  hero: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 24 },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "600",
    letterSpacing: -1.1,
    lineHeight: 40,
    marginTop: 22,
  },
  tagline: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 21,
    marginTop: 12,
    textAlign: "center",
    paddingHorizontal: 12,
    maxWidth: 320,
  },
  footer: { paddingTop: 8 },
});
