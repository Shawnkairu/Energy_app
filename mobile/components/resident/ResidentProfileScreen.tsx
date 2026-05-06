import { Linking, Text, View } from "react-native";
import { GlassCard, Pill, PrimaryButton, colors, spacing, typography } from "@emappa/ui";
import { ResidentInfoCard, ResidentMetricGrid, ResidentScreenFrame } from "./ResidentScaffold";

export function ResidentProfileScreen() {
  return (
    <ResidentScreenFrame
      section="Profile"
      title="Resident profile"
      subtitle="Building membership, privacy boundaries, support, and resident-only trust state."
    >
      {(building, refetch) => {
        const trustReady = building.project.prepaidCommittedKes > 0 && building.drs.reasons.length === 0;

        return (
          <>
            <ResidentInfoCard
              eyebrow="Resident membership"
              title={building.project.name}
              detail={`${building.project.units} homes in ${building.project.locationBand}. This session is scoped to resident access only.`}
            >
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <Pill tone={trustReady ? "good" : "warn"}>{trustReady ? "verified" : "review"}</Pill>
                <Pill>{building.project.stage}</Pill>
              </View>
            </ResidentInfoCard>

            <ResidentMetricGrid
              items={[
                {
                  label: "Access",
                  value: "Scoped",
                  detail: "Resident views show household outcomes without exposing counterparty finances.",
                  tone: "good",
                },
                {
                  label: "Privacy",
                  value: "Averaged",
                  detail: building.transparency.privacyNote,
                  tone: "good",
                },
                {
                  label: "Settlement",
                  value: building.drs.reasons.length === 0 ? "Trusted" : "Review",
                  detail: building.drs.reasons[0] ?? "No resident-visible settlement blocker.",
                  tone: building.drs.reasons.length === 0 ? "good" : "warn",
                },
                {
                  label: "Building",
                  value: `${building.project.units}`,
                  detail: "Homes attached to this resident building.",
                },
              ]}
            />

            <GlassCard>
              <Text style={{ color: colors.text, fontSize: typography.title, fontWeight: "700", letterSpacing: -0.45 }}>
                Support and account actions
              </Text>
              <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 20, marginTop: 8 }}>
                Support requests include this building name and resident role so the team can triage wallet, energy, or account issues.
              </Text>
              <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                <PrimaryButton onPress={() => Linking.openURL(`mailto:support@emappa.test?subject=${encodeURIComponent(`Resident support - ${building.project.name}`)}`)}>
                  Email support
                </PrimaryButton>
                <PrimaryButton onPress={refetch}>Refresh profile</PrimaryButton>
              </View>
            </GlassCard>
          </>
        );
      }}
    </ResidentScreenFrame>
  );
}
