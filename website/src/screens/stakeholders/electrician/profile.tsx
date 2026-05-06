import { PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { ProfileBlocks } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ElectricianProfile({ user }: PortalScreenProps) {
  return (
    <ProfileBlocks
      user={user}
      roleLabel="Electrician"
      extra={(
        <PortalPanel eyebrow="Compliance link" title="Certification lives as a primary tab">
          <PortalLedger rows={[
            { label: "Compliance tab", value: "Open", note: "certifications + training" },
            { label: "Scope", value: "Install / inspection / maintenance", note: "discover filter" },
          ]} />
        </PortalPanel>
      )}
    />
  );
}
