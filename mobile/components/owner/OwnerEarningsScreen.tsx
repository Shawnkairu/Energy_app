import { SettlementWaterfall, SoldVsWaste } from "../design-handoff";
import {
  OwnerBriefCard,
  OwnerMetricGrid,
  OwnerRoyaltyCard,
  OwnerScreenShell,
  OwnerWorkflowCard,
  formatKes,
  formatPercent,
} from "./OwnerShared";

export function OwnerEarningsScreen() {
  return (
    <OwnerScreenShell
      section="Earnings"
      title="Host Royalty"
      subtitle="A finance-light owner royalty view based only on monetized solar, anonymous benchmarks, and utilization risk."
      actions={["Review royalty", "Compare benchmark", "Check utilization"]}
      hero={(building) => ({
        label: "Projected host royalty",
        value: formatKes(building.roleViews.owner.monthlyRoyaltyKes),
        sub: "Royalty follows prepaid, monetized solar only. Gross generation is not payout.",
        tone: "neutral",
        status: "sold solar",
      })}
    >
      {(building) => {
        const view = building.roleViews.owner;
        const energy = building.energy;

        return (
          <>
            <SettlementWaterfall role="owner" building={building} />
            <SoldVsWaste building={building} headline="Sold solar drives owner royalty" />
            <OwnerRoyaltyCard
              royaltyKes={view.monthlyRoyaltyKes}
              benchmarkKes={view.comparableMedianRoyaltyKes}
              monetizedKwh={energy.E_sold}
              utilization={energy.utilization}
              wasteKwh={energy.E_waste}
            />
            <OwnerMetricGrid
              metrics={[
                {
                  label: "Monetized solar",
                  value: `${Math.round(energy.E_sold).toLocaleString()} kWh`,
                  detail: "Sold through prepaid demand.",
                  tone: "good",
                },
                {
                  label: "Generated solar",
                  value: `${Math.round(energy.E_gen).toLocaleString()} kWh`,
                  detail: "Operational context, not payout.",
                },
                {
                  label: "Utilization",
                  value: formatPercent(energy.utilization),
                  detail: "Royalty depends on absorbed solar demand.",
                  tone: energy.utilization >= 0.75 ? "good" : "warn",
                },
                {
                  label: "Waste/curtailed",
                  value: `${Math.round(energy.E_waste).toLocaleString()} kWh`,
                  detail: "Does not create owner payout.",
                  tone: energy.E_waste > 0 ? "warn" : "good",
                },
              ]}
            />
            <OwnerBriefCard
              eyebrow="Royalty truth"
              title="Royalty is a settlement outcome, not a generation claim."
              body="This screen separates sold solar from generated solar and frames the owner's payout against anonymous comparables without exposing private counterparty terms."
              rows={[
                {
                  label: "Payout basis",
                  value: "sold solar",
                  note: "Only monetized solar settlement creates owner royalty.",
                  tone: "good",
                },
                {
                  label: "Benchmark",
                  value: formatKes(view.comparableMedianRoyaltyKes),
                  note: "Comparable median is anonymized and should be read as context, not a guarantee.",
                  tone: "neutral",
                },
                {
                  label: "Grid fallback",
                  value: `${Math.round(energy.E_grid).toLocaleString()} kWh`,
                  note: "Grid fallback keeps residents served but does not expand host royalty.",
                  tone: "warn",
                },
              ]}
            />
            <OwnerWorkflowCard
              title="How to read the royalty"
              items={[
                {
                  label: "Start with sold kWh",
                  detail: "Generated, wasted, curtailed, or free-exported energy does not create owner payout.",
                  status: "truth",
                  tone: "good",
                },
                {
                  label: "Compare anonymously",
                  detail: "Benchmarks show distributions without revealing private building or counterparty finances.",
                  status: "private",
                },
                {
                  label: "Improve participation",
                  detail: "Royalty grows only when prepaid resident demand absorbs more solar.",
                  status: "demand",
                  tone: view.residentParticipation >= 0.8 ? "good" : "warn",
                },
              ]}
            />
          </>
        );
      }}
    </OwnerScreenShell>
  );
}
