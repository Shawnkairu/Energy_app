import { PortalLedger, PortalPanel, PortalTable } from "../../../components/PortalPrimitives";
import { ProfileBlocks } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";
import { ProviderCallout } from "./providerUi";

export default function ProviderProfile({ project, user, data }: PortalScreenProps) {
  const view = project.roleViews.provider;
  const rows = data.inventory.length ? data.inventory : [
    { sku: "PV-550W", kind: "panel", stock: Math.round(project.project.energy.arrayKw * 2), unitPriceKes: 18500, reliabilityScore: 0.94 },
    { sku: "INV-HYB-8K", kind: "infra", stock: 2, unitPriceKes: 142000, reliabilityScore: 0.91 },
  ];

  return (
    <ProfileBlocks
      user={user}
      roleLabel="Provider"
      extra={(
        <>
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
          <PortalPanel eyebrow="Inventory and catalog" title="Supply records live in Profile">
            <PortalTable
              columns={["SKU", "Type", "Stock", "Unit price", "Reliability"]}
              rows={rows.map((item) => [
                item.sku,
                item.kind === "panel" ? "Panel" : "Infrastructure",
                String(item.stock),
                `KSh ${Math.round(item.unitPriceKes).toLocaleString()}`,
                `${Math.round(item.reliabilityScore * 100)}%`,
              ])}
            />
            <ProviderCallout label="Profile scope" title="Catalog, warranties, and supply proof belong here.">
              <span>The Projects tab tracks active project status. Provider supply records stay attached to the business profile and evidence library.</span>
            </ProviderCallout>
          </PortalPanel>
        </>
      )}
    />
  );
}
