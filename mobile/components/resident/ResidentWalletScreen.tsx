import { useCallback, useRef, useState } from "react";
import { Text, View } from "react-native";
import type { ProjectedBuilding } from "@emappa/shared";
import { GlassCard, Pill, PrimaryButton, colors, spacing, typography } from "@emappa/ui";
import { TokenHero } from "../TokenHero";
import { useApi } from "../../lib/api";
import { useApiData } from "../../lib/useApiData";
import { commitResidentPrepaid, getResidentPrepaidBalance, getResidentPrepaidHistory } from "./ResidentApi";
import { CenteredState, ResidentInfoCard, ResidentMetricGrid, ResidentScreenFrame } from "./ResidentScaffold";
import { formatKes, residentView } from "./residentUtils";

export function ResidentWalletScreen() {
  return (
    <ResidentScreenFrame
      section="Wallet"
      title="Token wallet"
      subtitle="Prepaid pledges, resident share earnings, and savings without hidden debt."
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
  const view = residentView(building);
  const residentPayout = building.providerPayouts
    .filter((payout) => payout.ownerRole === "resident")
    .reduce((sum, payout) => sum + payout.payout, 0);
  const confirmedKes = data?.balance.confirmedTotalKes ?? view.prepaidBalanceKes;

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
      <TokenHero
        eyebrow="Prepaid wallet"
        title="Cash-cleared tokens gate solar"
        subtitle="The contract pledge endpoint confirms resident prepaid cash before allocation can open."
        tokenLabel="Confirmed balance"
        tokenValue={formatKes(confirmedKes)}
      />

      <ResidentMetricGrid
        items={[
          {
            label: "Pledged",
            value: formatKes(confirmedKes),
            detail: "Confirmed prepaid total returned by the wallet API.",
            tone: confirmedKes > 0 ? "good" : "warn",
          },
          {
            label: "Savings",
            value: formatKes(view.savingsKes),
            detail: "Resident savings from monetized solar versus grid-only energy.",
            tone: view.savingsKes > 0 ? "good" : "neutral",
          },
          {
            label: "Earnings",
            value: formatKes(residentPayout),
            detail: "Resident-owned provider share payout, only from sold prepaid solar.",
            tone: residentPayout > 0 ? "good" : "neutral",
          },
          {
            label: "History",
            value: `${data?.history.length ?? 0}`,
            detail: "Pledge records returned by the prepaid history endpoint.",
          },
        ]}
      />

      <ResidentInfoCard
        eyebrow="Pledge"
        title="Add KSh 1,000 prepaid solar tokens"
        detail="This posts to /prepaid/commit. Failed pledges stay visible here so the resident can retry."
      >
        <View style={{ gap: spacing.sm }}>
          <PrimaryButton onPress={pledge}>{isPledging ? "Pledging KSh 1,000..." : "Pledge KSh 1,000"}</PrimaryButton>
          {pledgeStatus ? <Text style={{ color: colors.green, fontSize: typography.small, lineHeight: 19 }}>{pledgeStatus}</Text> : null}
          {pledgeError ? (
            <>
              <Text style={{ color: colors.red, fontSize: typography.small, lineHeight: 19 }}>{pledgeError}</Text>
              <PrimaryButton onPress={pledge}>Retry pledge</PrimaryButton>
            </>
          ) : null}
        </View>
      </ResidentInfoCard>

      <GlassCard>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
          <Text style={{ color: colors.text, flex: 1, fontSize: typography.title, fontWeight: "700", letterSpacing: -0.45 }}>
            Recent prepaid history
          </Text>
          <Pill tone="good">prepaid</Pill>
        </View>
        <View style={{ marginTop: spacing.sm }}>
          {(data?.history ?? []).map((item) => (
            <View key={item.id} style={{ borderTopColor: colors.border, borderTopWidth: 1, paddingVertical: 10 }}>
              <Text style={{ color: colors.text, fontSize: typography.small, fontWeight: "700" }}>{formatKes(item.amountKes)}</Text>
              <Text style={{ color: colors.muted, fontSize: typography.micro, lineHeight: 16, marginTop: 3 }}>
                {item.status} pledge - {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
          {data?.history.length === 0 ? (
            <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 20 }}>
              No pledges returned yet. Use the pledge button above to create the first prepaid commitment.
            </Text>
          ) : null}
        </View>
      </GlassCard>
    </>
  );
}
