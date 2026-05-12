import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { PaletteCard, Pill, colors, spacing, typography } from "@emappa/ui";
import { ResidentInfoCard, ResidentMetricGrid, ResidentPrimaryButton, ResidentScreenFrame, residentStyles } from "./ResidentScaffold";
import { ROLE_TINT } from "./residentTint";
import { formatKes, formatKwh, formatPercent, residentView } from "./residentUtils";

export function ResidentHomeScreen() {
  const router = useRouter();

  return (
    <ResidentScreenFrame
      section="Home"
      title="Today"
      subtitle="Balance, solar access, and the next useful action."
    >
      {(building) => {
        const view = residentView(building);
        const hasBalance = view.prepaidBalanceKes > 0;

        return (
          <>
            <PaletteCard borderRadius={32} padding={20} style={{ ...styles.hero, backgroundColor: ROLE_TINT.bg }}>
              <View style={styles.heroTop}>
                <View style={styles.buildingPill}>
                  <View style={residentStyles.orangeDot} />
                  <Text style={styles.buildingName}>{building.project.name}</Text>
                </View>
                <Pill tone={hasBalance ? "good" : "warn"}>{hasBalance ? "ready" : "top up"}</Pill>
              </View>
              <Text style={styles.balance}>{formatKes(view.prepaidBalanceKes)}</Text>
              <Text style={styles.balanceLabel}>prepaid balance</Text>
              <View style={styles.actionRow}>
                <View style={styles.nextAction}>
                  <Text style={styles.nextLabel}>Next</Text>
                  <Text style={styles.nextText}>{hasBalance ? "Check energy flow" : "Add KSh 1,000"}</Text>
                </View>
                <ResidentPrimaryButton
                  onPress={() => router.push("/(resident)/wallet")}
                  accessibilityLabel="Open prepaid wallet"
                >
                  Open wallet
                </ResidentPrimaryButton>
              </View>
            </PaletteCard>

            <ResidentMetricGrid
              items={[
                {
                  label: "Coverage",
                  value: formatPercent(view.solarCoverage),
                  detail: `${formatKwh(view.monthlySolarKwh)} sold solar.`,
                  tone: view.solarCoverage > 0 ? "good" : "warn",
                },
                {
                  label: "Savings",
                  value: formatKes(view.savingsKes),
                  detail: "Against grid-only energy.",
                  tone: view.savingsKes > 0 ? "good" : "neutral",
                },
                {
                  label: "DRS",
                  value: building.drs.label,
                  detail: building.drs.reasons[0] ?? "No visible blocker.",
                  tone: building.drs.reasons.length === 0 ? "good" : "warn",
                },
                {
                  label: "Stage",
                  value: building.project.stage,
                  detail: `${building.project.units} homes.`,
                  tone: "neutral",
                },
              ]}
            />

            <ResidentInfoCard
              eyebrow="Rule"
              title="Cash first."
              detail="No prepaid cash means no resident solar allocation."
              synthetic
            />
          </>
        );
      }}
    </ResidentScreenFrame>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: spacing.lg,
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  buildingPill: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  buildingName: {
    color: colors.text,
    flex: 1,
    fontSize: typography.small,
    fontWeight: "800",
  },
  balance: {
    color: colors.text,
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: -1.25,
    lineHeight: 48,
    marginTop: 24,
  },
  balanceLabel: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginTop: 3,
    textTransform: "uppercase",
  },
  actionRow: {
    alignItems: "center",
    borderColor: "rgba(118, 73, 39, 0.12)",
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth * 2,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    marginTop: 24,
    padding: 12,
  },
  nextAction: {
    flex: 1,
  },
  nextLabel: {
    color: ROLE_TINT.fg,
    fontSize: typography.micro,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  nextText: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800",
    marginTop: 3,
  },
});
