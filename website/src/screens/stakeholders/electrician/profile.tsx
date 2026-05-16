import { PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { ProfileBlocks } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";
import { ElectricianComplianceContent } from "./compliance";

export default function ElectricianProfile({ user, project, data }: PortalScreenProps) {
  return (
    <ProfileBlocks
      user={user}
      roleLabel="Electrician"
      extra={(
        <>
          <PortalPanel eyebrow="Field profile" title="Dispatch, proof, and compliance">
            <PortalLedger rows={[
              { label: "Scope", value: "Install / inspect / maintain", note: "discover filters" },
              { label: "Payout trigger", value: "Signed proof", note: "wallet milestones" },
              { label: "Certification center", value: "On this page", note: "below — primary entry" },
            ]} />
          </PortalPanel>
          <ElectricianComplianceContent project={project} user={user} data={data} />
        </>
      )}
    />
  );
}
