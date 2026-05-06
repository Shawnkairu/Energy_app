import { PortalKpiBar, PortalPanel, PortalTable } from "../../../components/PortalPrimitives";
import { kes } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ProviderInventory({ project, data }: PortalScreenProps) {
  const rows = data.inventory.length ? data.inventory : [
    { sku: "PV-550W", kind: "panel", stock: Math.round(project.project.energy.arrayKw * 2), unitPriceKes: 18500, reliabilityScore: 0.94 },
    { sku: "INV-HYB-8K", kind: "infra", stock: 2, unitPriceKes: 142000, reliabilityScore: 0.91 },
  ];

  return (
    <>
      <PortalKpiBar items={[
        { label: "Open quote requests", value: "1", detail: "from discover feed" },
        { label: "Pending orders", value: "2", detail: "pilot fulfillment" },
        { label: "Reliability", value: "92%", detail: "proof-weighted" },
      ]} />
      <PortalPanel eyebrow="Inventory" title="All / Panels / Infrastructure">
        <PortalTable
          columns={["SKU", "Type", "Stock", "Unit price", "Reliability"]}
          rows={rows.map((item) => [item.sku, item.kind, String(item.stock), kes(item.unitPriceKes), `${Math.round(item.reliabilityScore * 100)}%`])}
        />
      </PortalPanel>
    </>
  );
}
