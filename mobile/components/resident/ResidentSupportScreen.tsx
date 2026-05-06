import { RoleDashboardScaffold } from "../roles/RoleDashboardScaffold";
import {
  ResidentSupportTriage,
  formatKes,
  residentView,
} from "./ResidentShared";

export function ResidentSupportScreen() {
  return (
    <RoleDashboardScaffold
      role="resident"
      cohesionRole="resident"
      section="Support"
      title="Support Triage"
      subtitle="A simple resident help surface: choose the issue type, then keep the answer inside this household app."
      actions={["Wallet issue", "Power issue", "Share question"]}
      renderHero={(building) => {
        const view = residentView(building);

        return {
          label: "Support status",
          value: "Start here",
          sub: `${formatKes(view.prepaidBalanceKes)} token balance is available for wallet-related context.`,
        };
      }}
      renderPanels={(building) => {
        const hasBlocker = building.drs.reasons.length > 0;

        return (
          <>
            <ResidentSupportTriage
              hasBlocker={hasBlocker}
              blocker={building.drs.reasons[0]}
            />
          </>
        );
      }}
    />
  );
}
