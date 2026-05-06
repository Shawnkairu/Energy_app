import { useState } from "react";
import { Text, View } from "react-native";
import { commitPrepaid, confirmPrepaid } from "@emappa/api-client";
import { GlassCard, Label, Pill, PrimaryButton, colors, typography } from "@emappa/ui";
import { RoleDashboardScaffold } from "../roles/RoleDashboardScaffold";
import {
  ResidentRuleCard,
  ResidentTokenArtifact,
  formatKes,
  residentView,
} from "./ResidentShared";

export function ResidentWalletScreen() {
  const [checkoutStatus, setCheckoutStatus] = useState("Ready for a KSh 1,000 pilot commitment.");
  const [isCommitting, setIsCommitting] = useState(false);

  async function topUp(buildingId: string) {
    setIsCommitting(true);
    try {
      const commitment = await commitPrepaid(buildingId, 1000);
      const confirmed = await confirmPrepaid(commitment.id);
      setCheckoutStatus(
        confirmed
          ? `KSh ${confirmed.amountKes.toLocaleString()} confirmed. Reopen home to refresh projected DRS and balance.`
          : `KSh ${commitment.amountKes.toLocaleString()} commitment saved locally.`,
      );
    } finally {
      setIsCommitting(false);
    }
  }

  return (
    <RoleDashboardScaffold
      role="resident"
      cohesionRole="resident"
      section="Wallet"
      title="Token Wallet"
      subtitle="A prepaid token artefact for top-ups and allocation guardrails. No credit, no hidden debt."
      actions={["Top up tokens", "See guard", "History"]}
      renderHero={(building) => {
        const view = residentView(building);

        return {
          label: "Available tokens",
          value: formatKes(view.prepaidBalanceKes),
          sub: "Cash-cleared tokens are the only way this resident session can receive sold solar.",
        };
      }}
      renderPanels={(building) => {
        const view = residentView(building);
        const expectedTopUp = Math.max(500, Math.round(view.savingsKes * 1.4));
        const fundedRatio = Math.min(1, view.prepaidBalanceKes / Math.max(1, view.averagePrepaidBalanceKes + expectedTopUp));

        return (
          <>
            <ResidentTokenArtifact
              balance={formatKes(view.prepaidBalanceKes)}
              topUp={formatKes(expectedTopUp)}
              fundedRatio={fundedRatio}
            />

            <GlassCard>
              <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Label>Token checkout</Label>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: typography.heading,
                      fontWeight: "600",
                      letterSpacing: -0.35,
                      marginTop: 5,
                      lineHeight: typography.heading + 4,
                    }}
                  >
                    Add prepaid solar tokens
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: typography.micro, lineHeight: 17, marginTop: 6 }}>
                    {checkoutStatus}
                  </Text>
                </View>
                <Pill tone="good">prepaid</Pill>
              </View>
              <View style={{ marginTop: 16 }}>
                <PrimaryButton onPress={() => topUp(building.project.id)}>
                  {isCommitting ? "Confirming..." : "Top up KSh 1,000"}
                </PrimaryButton>
              </View>
            </GlassCard>

            <ResidentRuleCard
              eyebrow="Prepaid-only rule"
              title="No prepaid cash, no solar allocation."
              body="The wallet protects the resident from hidden debt and protects the building economy from unpaid solar claims."
              rows={[
                {
                  label: "Cash clears first",
                  value: "required",
                  note: "Tokens are usable only after top-up confirmation.",
                  tone: "good",
                },
                {
                  label: "Solar must be sold",
                  value: "required",
                  note: "Unused, curtailed, or free-exported energy creates no claim.",
                },
                {
                  label: "Zero balance behavior",
                  value: "blocked",
                  note: "The app should show grid fallback instead of allocating unpaid solar.",
                  tone: "warn",
                },
              ]}
            />
          </>
        );
      }}
    />
  );
}
