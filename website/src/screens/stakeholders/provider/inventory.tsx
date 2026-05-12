import { PortalKpiBar, PortalLedger, PortalPanel, PortalTable, PortalWorkflow } from "../../../components/PortalPrimitives";
import { kes } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";
import { ProviderCallout, ProviderMetricRail } from "./providerUi";

export default function ProviderInventory({ project, data }: PortalScreenProps) {
  const rows = data.inventory.length ? data.inventory : [
    { sku: "PV-550W", kind: "panel", stock: Math.round(project.project.energy.arrayKw * 2), unitPriceKes: 18500, reliabilityScore: 0.94 },
    { sku: "INV-HYB-8K", kind: "infra", stock: 2, unitPriceKes: 142000, reliabilityScore: 0.91 },
  ];
  const totalUnits = rows.reduce((sum, item) => sum + item.stock, 0);
  const inventoryValue = rows.reduce((sum, item) => sum + item.stock * item.unitPriceKes, 0);
  const panelUnits = rows.filter((item) => item.kind === "panel").reduce((sum, item) => sum + item.stock, 0);
  const infraUnits = totalUnits - panelUnits;
  const averageReliability = rows.length
    ? rows.reduce((sum, item) => sum + item.reliabilityScore, 0) / rows.length
    : 0;
  const requestedPanels = data.discover.reduce((sum, card) => sum + (card.equipmentAsk?.panels ?? 0), 0);
  const quoteCoverage = requestedPanels > 0 ? Math.min(1, panelUnits / requestedPanels) : 1;

  return (
    <>
      <PortalKpiBar items={[
        { label: "Quote coverage", value: `${Math.round(quoteCoverage * 100)}%`, detail: requestedPanels ? `${requestedPanels} panels in active asks` : "no panel shortfall flagged" },
        { label: "Sellable value", value: kes(inventoryValue), detail: `${totalUnits} units across ${rows.length} SKUs` },
        { label: "Reliability", value: `${Math.round(averageReliability * 100)}%`, detail: "proof-weighted supplier score" },
      ]} />
      <div className="portal-two-col">
        <PortalPanel eyebrow="Inventory command" title="What can be fulfilled now">
          <PortalLedger rows={[
            { label: "Panel units", value: String(panelUnits), note: requestedPanels ? `${requestedPanels} requested in feed` : "ready for new quotes" },
            { label: "Infrastructure units", value: String(infraUnits), note: "inverters, meters, protection gear" },
            { label: "Average unit price", value: kes(totalUnits ? inventoryValue / totalUnits : 0), note: "blended catalog" },
          ]} />
          <ProviderCallout label="Demo clarity" title="Inventory is treated as capacity, not a shopping cart.">
            <span>Providers see whether a project can be quoted with known stock, verified reliability, and clean warranty evidence before a settlement stream is modeled.</span>
          </ProviderCallout>
        </PortalPanel>
        <PortalPanel eyebrow="Fulfillment path" title="From quote to proof">
          <PortalWorkflow steps={[
            { label: "Match", detail: "Compare requested panels and infrastructure to live stock.", status: requestedPanels ? "active" : "ready" },
            { label: "Quote", detail: "Lock unit pricing and warranty docs for the project.", status: project.project.drs.hasVerifiedSupplierQuote ? "verified" : "needed" },
            { label: "Deliver", detail: "Release equipment sale into wallet once proof is attached.", status: "pilot" },
          ]} />
        </PortalPanel>
      </div>
      <PortalPanel eyebrow="Catalog" title="Panels and infrastructure stock">
        <ProviderMetricRail items={[
          { label: "Panels", value: String(panelUnits), detail: "PV modules available to quote" },
          { label: "Infrastructure", value: String(infraUnits), detail: "Balance-of-system and controls" },
          { label: "Warranty docs", value: String(project.roleViews.provider.warrantyDocuments), detail: "attached to provider profile" },
        ]} />
        <PortalTable
          columns={["SKU", "Type", "Stock", "Unit price", "Reliability", "Status"]}
          rows={rows.map((item) => [
            item.sku,
            item.kind === "panel" ? "Panel" : "Infrastructure",
            String(item.stock),
            kes(item.unitPriceKes),
            `${Math.round(item.reliabilityScore * 100)}%`,
            item.stock > 0 ? "Ready to quote" : "Restock",
          ])}
        />
      </PortalPanel>
    </>
  );
}
