import { PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { ProfileBlocks } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ElectricianProfile({ user }: PortalScreenProps) {
  return (
    <ProfileBlocks
      user={user}
      roleLabel="Electrician"
      extra={(
        <PortalPanel eyebrow="Field profile" title="Dispatch, proof, and compliance">
          <PortalLedger rows={[
            { label: "Compliance tab", value: "Primary", note: "certifications + training" },
            { label: "Scope", value: "Install / inspect / maintain", note: "discover filters" },
            { label: "Payout trigger", value: "Signed proof", note: "wallet milestones" },
          ]} />
        </PortalPanel>
      )}
    />
  );
}
