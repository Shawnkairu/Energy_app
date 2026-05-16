import { ImmersiveProjectHero } from "@emappa/web-immersive";
import { PortalKpiBar, PortalLedger, PortalPanel, PortalWorkflow } from "../../../components/PortalPrimitives";
import { PilotBanner, kes, kwh, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function BuildingOwnerHome({ project }: PortalScreenProps) {
  const view = project.roleViews.owner;
  const provider = project.roleViews.provider;

  return (
    <>
      <PilotBanner>Building owner pilot view — resident participation is aggregated and private finances stay hidden.</PilotBanner>
      <ImmersiveProjectHero project={project} mode="building_owner" />
      <PortalKpiBar items={[
        { label: "Pledged demand", value: kes(project.project.prepaidCommittedKes), detail: "resident commitments" },
        { label: "Resident participation", value: pct(view.residentParticipation), detail: "demand signal" },
        { label: "Projected royalty", value: kes(view.monthlyRoyaltyKes), detail: "host stream" },
        { label: "Solar utilization", value: pct(provider.utilization), detail: "array productivity" },
      ]} />
      <div className="portal-two-col">
        <PortalPanel eyebrow="Owner command rail" title="Resolve the lease-to-rooftop path">
          <p>Use this screen to move from demand proof to terms approval while keeping resident-level data aggregated.</p>
          <PortalWorkflow steps={[
            { label: "View blockers", detail: "Open DRS detail with all six components.", status: project.drs.decision },
            { label: "Compare to bill", detail: "Grid bill vs projected e.mappa building cost.", status: "embedded" },
            { label: "Resident roster", detail: "View pledge participation without private finances.", status: "embedded" },
            { label: "Approve terms", detail: "Confirm owner royalty terms.", status: "embedded" },
          ]} />
        </PortalPanel>
        <PortalPanel eyebrow="Building" title="Operating profile">
          <PortalLedger rows={[
            { label: "Name", value: project.project.name, note: project.project.locationBand },
            { label: "Units", value: String(project.project.units), note: "apartment building" },
            { label: "Stage", value: project.project.stage, note: "deployment progress" },
            { label: "Monthly generation", value: kwh(project.energy.E_gen), note: "projected output" },
            { label: "Verification docs", value: view.verificationDocuments?.status.replace(/_/g, " ") ?? "in review", note: view.verificationDocuments?.detail ?? "owner authority packet" },
            { label: "Launch signoff", value: view.launchSignoff?.status.replace(/_/g, " ") ?? "pending", note: view.launchSignoff?.detail ?? "LBRS launch packet" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
