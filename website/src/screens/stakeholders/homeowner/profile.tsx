import { PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { ProfileBlocks } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function HomeownerProfile({ project, user }: PortalScreenProps) {
  return (
    <ProfileBlocks
      user={user}
      roleLabel="Homeowner"
      extra={(
        <PortalPanel eyebrow="Building & roof" title="Single-family home profile">
          <PortalLedger rows={[
            { label: "Address", value: project.project.locationBand, note: "pilot fixture" },
            { label: "Roof source", value: "owner trace / footprint", note: "editable embedded screen" },
            { label: "Roof confidence", value: `${project.drs.components.installationReadiness}/100`, note: "deployment input" },
            { label: "Edit roof", value: "Roof detail", note: "embedded" },
          ]} />
        </PortalPanel>
      )}
    />
  );
}
