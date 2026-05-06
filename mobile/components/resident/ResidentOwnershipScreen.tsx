import { RoleDashboardScaffold } from "../roles/RoleDashboardScaffold";
import {
  OwnershipLedgerEntry,
  ResidentOwnershipPrimer,
  ResidentRuleCard,
  formatKes,
  formatPercent,
  residentView,
} from "./ResidentShared";

export function ResidentOwnershipScreen() {
  return (
    <RoleDashboardScaffold
      role="resident"
      cohesionRole="resident"
      section="Ownership"
      title="Ownership Lessons"
      subtitle="Future cashflow education with caveats up front. Residents can use prepaid solar without buying shares."
      actions={["Learn shares", "Read caveat", "Decide later"]}
      renderHero={(building) => {
        const view = residentView(building);

        return {
          label: "Resident-owned share",
          value: formatPercent(view.ownedProviderShare),
          sub: "Optional resident pool share of future provider-side cashflows in this demo building.",
        };
      }}
      renderPanels={(building) => {
        const view = residentView(building);
        const residentPayout = building.providerPayouts
          .filter((payout) => payout.ownerRole === "resident")
          .reduce((sum, payout) => sum + payout.payout, 0);

        return (
          <>
            <OwnershipLedgerEntry lens="resident" />
            <ResidentOwnershipPrimer
              share={formatPercent(view.ownedProviderShare)}
              payout={formatKes(residentPayout)}
            />

            <ResidentRuleCard
              eyebrow="Payout truth"
              title="Payout only follows monetized solar."
              body="This screen avoids guaranteed-return language and keeps ownership separate from usage or wallet views."
              rows={[
                {
                  label: "Future cashflows",
                  value: "after buy",
                  note: "Share changes apply to future payout periods after payment clears.",
                  tone: "good",
                },
                {
                  label: "No payout from waste",
                  value: "blocked",
                  note: "Generated, wasted, curtailed, or free-exported energy does not create payout.",
                  tone: "warn",
                },
                {
                  label: "Ownership transfer",
                  value: "proportional",
                  note: "A seller's future payout reduces by the share they sell.",
                },
              ]}
            />
          </>
        );
      }}
    />
  );
}
