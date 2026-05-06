import { PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { ProfileBlocks } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ProviderProfile({ user }: PortalScreenProps) {
  return (
    <ProfileBlocks
      user={user}
      roleLabel="Provider"
      extra={(
        <PortalPanel eyebrow="Business profile" title="Panels / infrastructure / both">
          <PortalLedger rows={[
            { label: "Business type", value: user.businessType ?? "both", note: "provider segment" },
            { label: "Quote interface", value: "Strict procurement", note: "pilot" },
            { label: "Warranty docs", value: "Required", note: "inventory proof" },
          ]} />
        </PortalPanel>
      )}
    />
  );
}
