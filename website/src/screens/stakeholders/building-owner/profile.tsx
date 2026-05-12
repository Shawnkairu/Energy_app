import { PortalKpiBar, PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { ProfileBlocks, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function BuildingOwnerProfile({ project, user }: PortalScreenProps) {
  return (
    <ProfileBlocks
      user={user}
      roleLabel="Building Owner"
      extra={(
        <>
          <PortalKpiBar items={[
            { label: "Resident participation", value: pct(project.roleViews.owner.residentParticipation), detail: "aggregated demand" },
            { label: "Units", value: String(project.project.units), detail: "resident membership" },
            { label: "DRS status", value: project.drs.label, detail: `${project.drs.score}/100` },
          ]} />
          <PortalPanel eyebrow="Building profile" title={project.project.name}>
            <PortalLedger rows={[
              { label: "Address", value: project.project.locationBand, note: "building record" },
              { label: "Units", value: String(project.project.units), note: "resident membership" },
              { label: "Roof source", value: "footprint / owner trace", note: "confidence feeds DRS" },
              { label: "Privacy posture", value: "Aggregated", note: "resident finances hidden" },
            ]} />
          </PortalPanel>
        </>
      )}
    />
  );
}
