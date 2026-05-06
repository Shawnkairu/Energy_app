import {
  OwnerBriefCard,
  OwnerCommandCard,
  OwnerMetricGrid,
  OwnerScreenShell,
  OwnerWorkflowCard,
  decisionTone,
  formatKes,
  formatPercent,
  stageLabel,
} from "./OwnerShared";

export function OwnerHomeScreen() {
  return (
    <OwnerScreenShell
      section="Home"
      title="Building Command"
      subtitle="A calm owner snapshot for the building: current lane, resident trust, access obligations, and royalty context without DRS detail."
      actions={["Invite residents", "Confirm access", "Review handoff"]}
      hero={(building) => ({
        label: building.project.name,
        value: stageLabel(building.project.stage),
        sub: `${building.project.units} units in ${building.project.locationBand}. Owner focus stays on demand, access, and clean partner handoffs.`,
        tone: decisionTone(building.drs.decision),
        status: building.drs.decision,
      })}
    >
      {(building) => {
        const view = building.roleViews.owner;

        return (
          <>
            <OwnerCommandCard building={building} />
            <OwnerMetricGrid
              metrics={[
                {
                  label: "Participation",
                  value: formatPercent(view.residentParticipation),
                  detail: "Resident pre-onboarding signal.",
                  tone: view.residentParticipation >= 0.8 ? "good" : "warn",
                },
                {
                  label: "Prepaid cover",
                  value: `${view.prepaidMonthsCovered} mo`,
                  detail: "Cash-backed demand before allocation.",
                  tone: view.prepaidCoverage > 0 ? "good" : "bad",
                },
                {
                  label: "Royalty",
                  value: formatKes(view.monthlyRoyaltyKes),
                  detail: "Projected from monetized solar only.",
                },
                {
                  label: "Benchmark",
                  value: formatKes(view.comparableMedianRoyaltyKes),
                  detail: "Anonymous comparable median.",
                },
              ]}
            />
            <OwnerBriefCard
              eyebrow="Trust posture"
              title="Keep the owner lane focused and private."
              body="The home view avoids resident balances and detailed DRS math. It shows only the signals an owner can act on before the next handoff."
              rows={[
                {
                  label: "Resident trust",
                  value: formatPercent(view.residentParticipation),
                  note: "Use this snapshot to drive invitations and building communication before deployment.",
                  tone: view.prepaidCoverage >= 0.8 ? "good" : "warn",
                },
                {
                  label: "Owner access",
                  value: building.project.drs.ownerPermissionsComplete ? "ready" : "needed",
                  note: "Inspection, roof, and meter-room access stay visible without turning home into a checklist.",
                  tone: building.project.drs.ownerPermissionsComplete ? "good" : "bad",
                },
                {
                  label: "Private terms",
                  value: "hidden",
                  note: "Benchmarks and public statuses are shown without exposing resident or counterparty finances.",
                  tone: "neutral",
                },
              ]}
            />
            <OwnerWorkflowCard
              title="What needs owner attention"
              items={[
                {
                  label: "Invite the next resident cohort",
                  detail: "Participation is the cleanest owner-controlled signal before capital and installation move.",
                  status: "trust",
                  tone: view.residentParticipation >= 0.8 ? "good" : "warn",
                },
                {
                  label: "Confirm building access",
                  detail: "Keep inspection and installation access explicit so partner scheduling does not stall.",
                  status: building.project.drs.ownerPermissionsComplete ? "ready" : "needed",
                  tone: building.project.drs.ownerPermissionsComplete ? "good" : "bad",
                },
                {
                  label: "Review the deployment lane",
                  detail: "Use Deployment for the timeline and DRS for readiness gates when deeper review is needed.",
                  status: stageLabel(building.project.stage),
                },
              ]}
            />
          </>
        );
      }}
    </OwnerScreenShell>
  );
}
