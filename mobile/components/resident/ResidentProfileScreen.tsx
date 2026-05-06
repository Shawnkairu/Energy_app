import { RoleDashboardScaffold } from "../roles/RoleDashboardScaffold";
import {
  ResidentIdentityCard,
  ResidentTrustList,
} from "./ResidentShared";

export function ResidentProfileScreen() {
  return (
    <RoleDashboardScaffold
      role="resident"
      cohesionRole="resident"
      section="Profile"
      title="Resident Pass"
      subtitle="A trust card for building membership, privacy boundaries, and resident-only access."
      actions={["Verify building", "Read privacy", "Trust status"]}
      renderHero={(building) => {
        return {
          label: "Verified building",
          value: building.project.name,
          sub: `${building.project.units} homes in ${building.project.locationBand}. Resident-only session.`,
        };
      }}
      renderPanels={(building) => {
        const trustReady = building.project.prepaidCommittedKes > 0 && building.drs.reasons.length === 0;

        return (
          <>
            <ResidentIdentityCard
              buildingName={building.project.name}
              location={building.project.locationBand}
              units={building.project.units}
              trustReady={trustReady}
              privacyNote={building.transparency.privacyNote}
            />

            <ResidentTrustList
              title="What is verified"
              items={[
                {
                  label: "Building access",
                  detail: "Access is scoped to this building and this resident session.",
                  status: "scoped",
                  tone: "good",
                },
                {
                  label: "Privacy averaging",
                  detail: `Resident benchmarks are described across ${building.project.units} homes without exposing neighbors.`,
                  status: "private",
                },
                {
                  label: "Settlement data",
                  detail: "Residents see household outcomes and benchmarks, not private counterparty finances.",
                  status: building.drs.reasons.length === 0 ? "trusted" : "review",
                  tone: building.drs.reasons.length === 0 ? "good" : "warn",
                },
              ]}
            />
          </>
        );
      }}
    />
  );
}
