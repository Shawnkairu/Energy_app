import { PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { ProfileBlocks } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function FinancierProfile({ user }: PortalScreenProps) {
  return (
    <ProfileBlocks
      user={user}
      roleLabel="Financier"
      extra={(
        <PortalPanel eyebrow="Investor profile" title="Target deal shape">
          <PortalLedger rows={[
            { label: "Investor type", value: "Individual / institution", note: "pilot profile" },
            { label: "Target deal size", value: "KSh 250k-1.5m", note: "discover filter" },
            { label: "Target return", value: "Measured recovery", note: "DRS-gated" },
          ]} />
        </PortalPanel>
      )}
    />
  );
}
