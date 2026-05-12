import { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ProjectedBuilding } from "@emappa/shared";
import { PaletteCard, Pill, colors, officialPalette, spacing, typography } from "@emappa/ui";
import { useApi } from "../../lib/api";
import { useApiData } from "../../lib/useApiData";
import { commitResidentPrepaid, getResidentPrepaidBalance, getResidentPrepaidHistory } from "./ResidentApi";
import { CenteredState, ResidentInfoCard, ResidentMetricGrid, ResidentPrimaryButton, ResidentScreenFrame } from "./ResidentScaffold";
import { ROLE_TINT } from "./residentTint";
import { formatKes } from "./residentUtils";

export function ResidentWalletScreen() {
  return (
    <ResidentScreenFrame
      section="Wallet"
      title="Wallet"
      subtitle="Prepaid balance, top-up, and history."
    >
      {(building, refetchHome) => <ResidentWalletPanels building={building} refetchHome={refetchHome} />}
    </ResidentScreenFrame>
  );
}

function ResidentWalletPanels({ building, refetchHome }: { building: ProjectedBuilding; refetchHome: () => void }) {
  const api = useApi();
  const apiRef = useRef(api);
  apiRef.current = api;
  const [pledgeError, setPledgeError] = useState<string | null>(null);
  const [pledgeStatus, setPledgeStatus] = useState<string | null>(null);
  const [isPledging, setIsPledging] = useState(false);
  const load = useCallback(async () => {
    const [balance, history] = await Promise.all([
      getResidentPrepaidBalance(apiRef.current, building.project.id),
      getResidentPrepaidHistory(apiRef.current, building.project.id),
    ]);
    return { balance, history };
  }, [building.project.id]);
  const { data, error, isLoading, refetch } = useApiData(load, [building.project.id]);
  const fallbackBalanceKes = Math.round((building.project.prepaidCommittedKes ?? 0) / Math.max(1, building.project.units));
  const confirmedKes = data?.balance.confirmedTotalKes ?? fallbackBalanceKes;
  const history = data?.history ?? [];
  const pendingKes = history.filter((item) => item.status === "pending").reduce((sum, item) => sum + item.amountKes, 0);
  const confirmedCount = history.filter((item) => item.status === "confirmed").length;
  const lastPledge = history[0];

  async function pledge() {
    setIsPledging(true);
    setPledgeError(null);
    setPledgeStatus(null);
    try {
      const result = await commitResidentPrepaid(apiRef.current, building.project.id, 1000);
      setPledgeStatus(`${formatKes(result.commitment.amountKes)} pledge ${result.commitment.status}.`);
      refetch();
      refetchHome();
    } catch (cause) {
      setPledgeError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setIsPledging(false);
    }
  }

  if (isLoading) {
    return <CenteredState title="Loading wallet" detail="Fetching prepaid balance and pledge history." />;
  }

  if (error) {
    return <CenteredState title="Wallet unavailable" detail={error.message} actionLabel="Retry" onAction={refetch} />;
  }

  return (
    <>
      <PaletteCard borderRadius={32} padding={20} style={{ ...styles.balanceCard, backgroundColor: ROLE_TINT.bg }}>
        <View style={styles.balanceTop}>
          <Text style={styles.eyebrow}>Confirmed balance</Text>
          <Pill tone={confirmedKes > 0 ? "good" : "warn"}>{confirmedKes > 0 ? "funded" : "empty"}</Pill>
        </View>
        <Text style={styles.balance}>{formatKes(confirmedKes)}</Text>
        <View style={styles.walletGraphic}>
          <View style={styles.walletPocket}>
            <View style={styles.walletSlot} />
            <Text style={styles.walletText}>Prepaid</Text>
          </View>
        </View>
      </PaletteCard>

      <ResidentMetricGrid
        items={[
          {
            label: "Confirmed",
            value: formatKes(confirmedKes),
            detail: "Cash-cleared tokens.",
            tone: confirmedKes > 0 ? "good" : "warn",
          },
          {
            label: "Pending",
            value: formatKes(pendingKes),
            detail: "Waiting to clear.",
            tone: pendingKes > 0 ? "warn" : "neutral",
          },
          {
            label: "Receipts",
            value: `${confirmedCount}`,
            detail: "Confirmed pledges.",
            tone: confirmedCount > 0 ? "good" : "neutral",
          },
          {
            label: "Last",
            value: lastPledge ? formatKes(lastPledge.amountKes) : "None",
            detail: lastPledge ? lastPledge.status : "No pledge yet.",
          },
        ]}
      />

      <ResidentInfoCard
        eyebrow="Top up"
        title="Add KSh 1,000 prepaid solar tokens"
        detail="Solar allocation opens only after payment confirms."
      >
        <View style={{ gap: spacing.sm }}>
          <ResidentPrimaryButton
            onPress={pledge}
            disabled={isPledging}
            accessibilityLabel={isPledging ? "Pledge in progress" : "Pledge one thousand Kenyan shillings prepaid"}
          >
            {isPledging ? "Pledging KSh 1,000..." : "Pledge KSh 1,000"}
          </ResidentPrimaryButton>
          {pledgeStatus ? <Text style={{ color: colors.green, fontSize: typography.small, lineHeight: 19 }}>{pledgeStatus}</Text> : null}
          {pledgeError ? (
            <>
              <Text style={{ color: colors.red, fontSize: typography.small, lineHeight: 19 }}>{pledgeError}</Text>
              <ResidentPrimaryButton onPress={pledge} accessibilityLabel="Retry prepaid pledge">
                Retry pledge
              </ResidentPrimaryButton>
            </>
          ) : null}
        </View>
      </ResidentInfoCard>

      <PaletteCard style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>
            Prepaid history
          </Text>
          <Pill tone="good">prepaid</Pill>
        </View>
        <View style={{ marginTop: spacing.sm }}>
          {history.map((item) => (
            <View key={item.id} style={styles.historyRow}>
              <View>
                <Text style={styles.historyAmount}>{formatKes(item.amountKes)}</Text>
                <Text style={styles.historyDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <Pill tone={item.status === "confirmed" ? "good" : item.status === "failed" ? "bad" : "warn"}>{item.status}</Pill>
            </View>
          ))}
          {history.length === 0 ? (
            <Text style={styles.emptyHistory}>
              No pledges yet.
            </Text>
          ) : null}
        </View>
      </PaletteCard>
    </>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    marginBottom: spacing.lg,
  },
  balanceTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: typography.micro,
    fontWeight: "800",
    letterSpacing: 0.75,
    textTransform: "uppercase",
  },
  balance: {
    color: colors.text,
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: -1.35,
    lineHeight: 50,
    marginTop: 18,
  },
  walletGraphic: {
    alignItems: "flex-end",
    marginTop: 18,
  },
  walletPocket: {
    borderColor: "rgba(118, 73, 39, 0.16)",
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth * 2,
    height: 86,
    justifyContent: "flex-end",
    padding: 12,
    width: 132,
  },
  walletSlot: {
    backgroundColor: officialPalette.foxOrange,
    borderRadius: 999,
    height: 6,
    marginBottom: 12,
    width: 52,
  },
  walletText: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800",
  },
  historyCard: {
    marginBottom: spacing.lg,
  },
  historyHeader: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  historyTitle: {
    color: colors.text,
    flex: 1,
    fontSize: typography.title,
    fontWeight: "800",
    letterSpacing: -0.45,
  },
  historyRow: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: 11,
  },
  historyAmount: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800",
  },
  historyDate: {
    color: colors.muted,
    fontSize: typography.micro,
    marginTop: 3,
  },
  emptyHistory: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 20,
  },
});
