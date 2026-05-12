import { Linking, StyleSheet, Text, View } from "react-native";
import { PaletteCard, Pill, colors, officialPalette, spacing, typography } from "@emappa/ui";
import { ResidentInfoCard, ResidentMetricGrid, ResidentPrimaryButton, ResidentScreenFrame } from "./ResidentScaffold";
import { ROLE_TINT } from "./residentTint";

export function ResidentProfileScreen() {
  return (
    <ResidentScreenFrame
      section="Profile"
      title="Profile"
      subtitle="Resident access, trust, and support."
    >
      {(building, refetch) => {
        const trustReady = building.project.prepaidCommittedKes > 0 && building.drs.reasons.length === 0;

        return (
          <>
            <PaletteCard borderRadius={34} padding={20} style={{ ...styles.trustCard, backgroundColor: ROLE_TINT.bg }}>
              <View style={styles.profileRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(building.project.name.trim().slice(0, 1) || "?").toUpperCase()}
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>V</Text>
                  </View>
                </View>
                <View style={styles.profileStats}>
                  <ProfileStat value={`${building.project.units}`} label="Homes" />
                  <ProfileStat value={building.project.stage} label="Stage" />
                  <ProfileStat value={trustReady ? "Verified" : "Review"} label="Access" />
                </View>
              </View>
              <Text style={styles.name}>{building.project.name}</Text>
              <Text style={styles.location}>{building.project.locationBand}</Text>
            </PaletteCard>

            <ResidentMetricGrid
              items={[
                {
                  label: "Access",
                  value: "Scoped",
                  detail: "Resident-only.",
                  tone: "good",
                },
                {
                  label: "Privacy",
                  value: "Averaged",
                  detail: "No private counterparty finance.",
                  tone: "good",
                },
                {
                  label: "Settlement",
                  value: building.drs.reasons.length === 0 ? "Trusted" : "Review",
                  detail: building.drs.reasons[0] ?? "No visible blocker.",
                  tone: building.drs.reasons.length === 0 ? "good" : "warn",
                },
                {
                  label: "Building",
                  value: `${building.project.units}`,
                  detail: "Resident building.",
                },
              ]}
            />

            <ResidentInfoCard
              eyebrow="Account"
              title="Need help?"
              detail="Support receives the building name and resident role."
            >
              <View style={{ gap: spacing.sm }}>
                <ResidentPrimaryButton
                  onPress={() =>
                    Linking.openURL(
                      `mailto:support@emappa.test?subject=${encodeURIComponent(`Resident support - ${building.project.name}`)}`,
                    )
                  }
                  accessibilityLabel="Email support about this building"
                >
                  Email support
                </ResidentPrimaryButton>
                <ResidentPrimaryButton onPress={refetch} accessibilityLabel="Refresh resident profile">
                  Refresh profile
                </ResidentPrimaryButton>
              </View>
            </ResidentInfoCard>
          </>
        );
      }}
    </ResidentScreenFrame>
  );
}

function ProfileStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  trustCard: {
    marginBottom: spacing.lg,
  },
  profileRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: officialPalette.furCream,
    borderColor: "rgba(118, 73, 39, 0.12)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth * 2,
    height: 108,
    justifyContent: "center",
    width: 108,
  },
  avatarText: {
    color: officialPalette.burntChestnut,
    fontSize: 42,
    fontWeight: "800",
  },
  badge: {
    alignItems: "center",
    backgroundColor: officialPalette.foxOrange,
    borderColor: colors.white,
    borderRadius: 999,
    borderWidth: 3,
    bottom: 4,
    height: 34,
    justifyContent: "center",
    position: "absolute",
    right: 4,
    width: 34,
  },
  badgeText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  profileStats: {
    flex: 1,
    justifyContent: "center",
  },
  stat: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
  },
  statValue: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "800",
    letterSpacing: -0.45,
  },
  statLabel: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "700",
    marginTop: 2,
  },
  name: {
    color: colors.text,
    fontSize: typography.title + 4,
    fontWeight: "800",
    letterSpacing: -0.65,
    marginTop: 18,
  },
  location: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "700",
    marginTop: 4,
  },
});
