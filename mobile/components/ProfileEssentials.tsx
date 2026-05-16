import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { colors, spacing, typography } from "@emappa/ui";
import { useAuth } from "./AuthContext";

type ProfileRow = {
  label: string;
  value: string;
  note?: string;
};

export function ProfileEssentials({
  roleLabel,
  accountRows = [],
  settingsRows = DEFAULT_SETTINGS,
  supportSubject,
}: {
  roleLabel: string;
  accountRows?: ProfileRow[];
  settingsRows?: ProfileRow[];
  supportSubject?: string;
}) {
  const { session, clearSession } = useAuth();
  const router = useRouter();
  const user = session?.user;
  const email = user?.email ?? session?.email ?? "Unavailable";
  const phone = user?.phone ?? session?.phone ?? "Optional";
  const subject = encodeURIComponent(supportSubject ?? `${roleLabel} support`);

  function logout() {
    clearSession();
    router.replace("/(auth)/login");
  }

  return (
    <View style={styles.stack}>
      <ProfileSection
        eyebrow="Account"
        rows={[
          { label: "Email", value: email, note: "OTP login" },
          { label: "Phone", value: phone, note: "optional secondary contact" },
          { label: "Role", value: roleLabel, note: "active workspace" },
          ...accountRows,
        ]}
      />
      <ProfileSection eyebrow="Settings" rows={settingsRows} />
      <ProfileSection
        eyebrow="Support"
        rows={[
          { label: "Help", value: "support@emappa.test", note: "includes role and current workspace" },
          { label: "Availability", value: "Pilot support", note: "email-first during pilot" },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Email ${roleLabel} support`}
          onPress={() => Linking.openURL(`mailto:support@emappa.test?subject=${subject}`)}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Email support</Text>
        </Pressable>
      </ProfileSection>
      <Pressable accessibilityRole="button" accessibilityLabel="Log out" onPress={logout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </View>
  );
}

function ProfileSection({ eyebrow, rows, children }: { eyebrow: string; rows: ProfileRow[]; children?: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <View style={styles.rows}>
        {rows.map((row, index) => (
          <View key={`${eyebrow}-${row.label}`} style={[styles.row, index > 0 && styles.divider]}>
            <View style={styles.rowCopy}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              {row.note ? <Text style={styles.rowNote}>{row.note}</Text> : null}
            </View>
            <Text style={styles.rowValue}>{row.value}</Text>
          </View>
        ))}
      </View>
      {children ? <View style={styles.children}>{children}</View> : null}
    </View>
  );
}

const DEFAULT_SETTINGS: ProfileRow[] = [
  { label: "Notifications", value: "Email", note: "pilot default" },
  { label: "Units", value: "KES / kWh", note: "Kenya pilot" },
  { label: "Language", value: "English", note: "more languages later" },
];

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  rows: {
    marginTop: spacing.sm,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  divider: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowCopy: {
    flex: 1,
  },
  rowLabel: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700",
  },
  rowNote: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 19,
    marginTop: 2,
  },
  rowValue: {
    color: colors.text,
    flexShrink: 1,
    fontSize: typography.small,
    fontWeight: "800",
    textAlign: "right",
  },
  children: {
    marginTop: spacing.sm,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "rgba(216, 119, 56, 0.1)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: colors.orangeDeep,
    fontSize: typography.small,
    fontWeight: "800",
  },
  logoutButton: {
    alignItems: "center",
    borderColor: `${colors.red}55`,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
  },
  logoutText: {
    color: colors.red,
    fontSize: typography.small,
    fontWeight: "800",
  },
});
