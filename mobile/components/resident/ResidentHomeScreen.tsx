import { useRouter } from "expo-router";
import { PrimaryButton } from "@emappa/ui";
import { TokenHero } from "../TokenHero";
import { ResidentInfoCard, ResidentMetricGrid, ResidentScreenFrame } from "./ResidentScaffold";
import { formatKes, formatKwh, formatPercent, residentView } from "./residentUtils";

export function ResidentHomeScreen() {
  const router = useRouter();

  return (
    <ResidentScreenFrame
      section="Home"
      title="Today at home"
      subtitle="Token balance, prepaid readiness, and the clearest next action for this household."
    >
      {(building) => {
        const view = residentView(building);
        const hasBalance = view.prepaidBalanceKes > 0;

        return (
          <>
            <TokenHero
              eyebrow="Resident token"
              title={hasBalance ? "Prepaid solar can allocate" : "Top up before solar allocates"}
              subtitle={`${building.project.name} uses prepaid cash as the gate for sold local solar. Grid fallback stays separate.`}
              tokenLabel="Available balance"
              tokenValue={formatKes(view.prepaidBalanceKes)}
            />

            <ResidentMetricGrid
              items={[
                {
                  label: "Coverage",
                  value: formatPercent(view.solarCoverage),
                  detail: `${formatKwh(view.monthlySolarKwh)} sold solar available to this resident account.`,
                  tone: view.solarCoverage > 0 ? "good" : "warn",
                },
                {
                  label: "Savings",
                  value: formatKes(view.savingsKes),
                  detail: "Difference between sold prepaid solar and grid-only energy for this household.",
                  tone: view.savingsKes > 0 ? "good" : "neutral",
                },
                {
                  label: "DRS",
                  value: building.drs.label,
                  detail: building.drs.reasons[0] ?? "No readiness blocker visible for resident allocation.",
                  tone: building.drs.reasons.length === 0 ? "good" : "warn",
                },
                {
                  label: "Stage",
                  value: building.project.stage,
                  detail: `${building.project.units} homes in ${building.project.locationBand}.`,
                  tone: "neutral",
                },
              ]}
            />

            <ResidentInfoCard
              eyebrow="Prepaid rule"
              title="No prepaid cash, no solar allocation."
              detail="Residents only receive solar that has been monetized through prepaid tokens. Wasted, curtailed, or free-exported energy creates no resident credit."
            >
              <PrimaryButton onPress={() => router.push("/(resident)/wallet")}>
                {hasBalance ? "Review wallet" : "Pledge KSh 1,000"}
              </PrimaryButton>
            </ResidentInfoCard>
          </>
        );
      }}
    </ResidentScreenFrame>
  );
}
