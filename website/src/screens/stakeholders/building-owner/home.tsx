import { PortalKpiBar, PortalLedger, PortalPanel, PortalWorkflow } from "../../../components/PortalPrimitives";
import { ProjectHero, kes, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function BuildingOwnerHome({ project }: PortalScreenProps) {
  const view = project.roleViews.owner;

  return (
    <>
      <ProjectHero project={project} />
      <PortalKpiBar items={[
        { label: "Pledged demand", value: kes(project.project.prepaidCommittedKes), detail: "resident commitments" },
        { label: "Resident participation", value: pct(view.residentParticipation), detail: "demand signal" },
        { label: "Projected royalty", value: kes(view.monthlyRoyaltyKes), detail: "next month" },
      ]} />
      <div className="portal-two-col">
        <PortalPanel eyebrow="Top blockers" title="Owner action rail">
          <PortalWorkflow steps={[
            { label: "View blockers", detail: "Open DRS detail with all six components.", status: project.drs.decision },
            { label: "Compare to bill", detail: "Grid bill vs projected e.mappa building cost.", status: "embedded" },
            { label: "Resident roster", detail: "View pledge participation without private finances.", status: "embedded" },
            { label: "Approve terms", detail: "Confirm owner royalty terms.", status: "embedded" },
          ]} />
        </PortalPanel>
        <PortalPanel eyebrow="Building" title="Project profile">
          <PortalLedger rows={[
            { label: "Name", value: project.project.name, note: project.project.locationBand },
            { label: "Units", value: String(project.project.units), note: "apartment building" },
            { label: "Stage", value: project.project.stage, note: "deployment progress" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
