import { ImmersiveProjectHero } from "@emappa/web-immersive";
import { PortalKpiBar, PortalLedger, PortalPanel, PortalWorkflow } from "../../../components/PortalPrimitives";
import { PilotBanner, TokenHero, kes, kwh, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function HomeownerHome({ project }: PortalScreenProps) {
  const isLive = project.project.stage === "live";
  const resident = project.roleViews.resident;
  const owner = project.roleViews.owner;
  const provider = project.roleViews.provider;
  const workflowSteps = isLive ? [
    { label: "Pledge", detail: "Add demand against your live home solar allocation.", status: "ready" },
    { label: "View energy", detail: "Open the always-on generation and usage screen.", status: "live" },
    { label: "Wallet detail", detail: "Track pledges, royalties, and share earnings.", status: "three-stream" },
    { label: "Roof detail", detail: "Review the captured polygon and confidence.", status: "embedded" },
  ] : [
    { label: "View blockers", detail: "Open DRS detail and top readiness gaps.", status: project.drs.decision },
    { label: "Approve terms", detail: "Review homeowner terms before deployment.", status: "embedded" },
    { label: "Compare bill", detail: "Compare current bill against projected e.mappa cost.", status: "embedded" },
    { label: "Deployment timeline", detail: "Track qualifying, funding, installing, and go-live.", status: "pre-live" },
    { label: "Roof detail", detail: "Inspect the satellite roof capture.", status: "embedded" },
  ];

  return (
    <>
      <PilotBanner />
      <ImmersiveProjectHero project={project} mode="building_owner" />
      <PortalKpiBar items={[
        { label: isLive ? "Live pledge balance" : "Activation balance", value: isLive ? kes(resident.prepaidBalanceKes) : "Pending go-live", detail: "home solar demand" },
        { label: "Monthly solar view", value: kwh(resident.monthlySolarKwh), detail: "forecast share" },
        { label: "Retained rooftop share", value: pct(provider.retainedOwnership), detail: "homeowner economics" },
      ]} />
      {isLive ? (
        <div className="portal-two-col">
          <TokenHero project={project} />
          <PortalPanel eyebrow="Next best action" title="Keep the live account moving">
            <p>Your pledge, energy, and wallet views are separated so the demo can show money movement without blurring grid fallback.</p>
            <PortalWorkflow steps={workflowSteps} />
          </PortalPanel>
        </div>
      ) : (
        <div className="portal-two-col">
          <TokenHero project={project} title="Pledges activate once your project goes live" disabled />
          <PortalPanel eyebrow="Readiness brief" title="What unlocks the home project">
            <PortalLedger rows={[
              { label: "Decision", value: project.drs.label, note: `${project.drs.score}/100 DRS` },
              { label: "Resident-style coverage", value: pct(owner.prepaidCoverage), note: `${owner.prepaidMonthsCovered} months signaled` },
              { label: "Current blocker count", value: String(project.drs.reasons.length), note: "from readiness gates" },
            ]} />
          </PortalPanel>
        </div>
      )}
      {!isLive ? <PortalWorkflow steps={workflowSteps} /> : null}
    </>
  );
}
