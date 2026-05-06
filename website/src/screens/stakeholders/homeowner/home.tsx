import { PortalWorkflow } from "../../../components/PortalPrimitives";
import { PilotBanner, ProjectHero, TokenHero } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function HomeownerHome({ project }: PortalScreenProps) {
  const isLive = project.project.stage === "live";

  return (
    <>
      <PilotBanner />
      {isLive ? (
        <>
          <TokenHero project={project} />
          <ProjectHero project={project} compact />
        </>
      ) : (
        <>
          <ProjectHero project={project} />
          <TokenHero project={project} title="Tokens activate once your project goes live" disabled />
        </>
      )}
      <PortalWorkflow steps={(isLive ? [
        { label: "Pledge", detail: "Add tokens against your live home solar allocation.", status: "ready" },
        { label: "View energy", detail: "Open the always-on generation and usage screen.", status: "live" },
        { label: "Wallet detail", detail: "Track pledges, royalties, and share earnings.", status: "three-stream" },
        { label: "Roof detail", detail: "Review the captured polygon and confidence.", status: "embedded" },
      ] : [
        { label: "View blockers", detail: "Open DRS detail and top readiness gaps.", status: project.drs.decision },
        { label: "Approve terms", detail: "Review homeowner terms before deployment.", status: "embedded" },
        { label: "Compare bill", detail: "Compare current bill against projected e.mappa cost.", status: "embedded" },
        { label: "Deployment timeline", detail: "Track qualifying, funding, installing, and go-live.", status: "pre-live" },
        { label: "Roof detail", detail: "Inspect the satellite roof capture.", status: "embedded" },
      ])} />
    </>
  );
}
