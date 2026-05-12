import { PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { ProfileBlocks } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ResidentProfile({ project, user }: PortalScreenProps) {
  const view = project.roleViews.resident;

  return (
    <ProfileBlocks
      user={user}
      roleLabel="Resident"
      extra={(
        <PortalPanel eyebrow="Resident setup" title="Energy and wallet permissions">
          <PortalLedger rows={[
            { label: "Home assignment", value: project.project.name, note: project.project.locationBand },
            { label: "Solar allocation", value: view.monthlySolarKwh > 0 ? "Enabled" : "Pending pledge", note: "requires confirmed prepaid balance" },
            { label: "Generation view", value: view.ownedProviderShare > 0 ? "Unlocked" : "Share-gated", note: "ownership controls array detail" },
          ]} />
        </PortalPanel>
      )}
    />
  );
}
