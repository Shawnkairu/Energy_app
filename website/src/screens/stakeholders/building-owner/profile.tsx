import { PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { ProfileBlocks } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function BuildingOwnerProfile({ project, user }: PortalScreenProps) {
  return (
    <ProfileBlocks
      user={user}
      roleLabel="Building Owner"
      extra={(
        <PortalPanel eyebrow="Building profile" title={project.project.name}>
          <PortalLedger rows={[
            { label: "Address", value: project.project.locationBand, note: "building record" },
            { label: "Units", value: String(project.project.units), note: "resident membership" },
            { label: "Roof source", value: "footprint / owner trace", note: "confidence feeds DRS" },
          ]} />
        </PortalPanel>
      )}
    />
  );
}
