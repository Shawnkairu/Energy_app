import { PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { ProfileBlocks } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";
import { ProviderCallout } from "./providerUi";

export default function ProviderProfile({ project, user }: PortalScreenProps) {
  const view = project.roleViews.provider;

  return (
    <ProfileBlocks
      user={user}
      roleLabel="Provider"
      extra={(
        <PortalPanel eyebrow="Business profile" title="Provider readiness and proof">
          <PortalLedger rows={[
            { label: "Business type", value: user.businessType ?? "both", note: "provider segment" },
            { label: "Quote interface", value: "Strict procurement", note: "pilot workflow" },
            { label: "Warranty docs", value: String(view.warrantyDocuments), note: "inventory proof attached" },
            { label: "Monitoring status", value: view.monitoringStatus, note: "generation evidence" },
            { label: "Maintenance tickets", value: String(view.openMaintenanceTickets), note: "post-install visibility" },
          ]} />
          <ProviderCallout label="Trust surface" title="Proof is what makes provider payouts demo-ready.">
            <span>Profile evidence connects stock, warranty documents, monitoring status, and settlement visibility so buyers can see why a provider is qualified for a project.</span>
          </ProviderCallout>
        </PortalPanel>
      )}
    />
  );
}
