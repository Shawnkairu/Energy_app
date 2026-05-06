import { RoleDashboardScaffold } from "../roles/RoleDashboardScaffold";
import { SupplierBar, SupplierCard, SupplierMetricGrid, SupplierProofTable, SupplierRow, supplierView } from "./SupplierShared";

export function SupplierCatalogScreen() {
  return (
    <RoleDashboardScaffold
      role="supplier"
      cohesionRole="supplier"
      section="Catalog"
      title="Component Catalog"
      subtitle="The maintained component and warranty catalogue. No RFQ or dispatch noise here."
      actions={["Edit component", "Add warranty", "Set substitute"]}
      renderHero={(building) => {
        const view = supplierView(building);
        return {
          label: "Listed components",
          value: `${view.catalogItems}`,
          sub: `${view.warrantyDocuments} warranty document${view.warrantyDocuments === 1 ? "" : "s"} available for catalogue lines.`,
        };
      }}
      renderPanels={(building) => {
        const view = supplierView(building);
        return (
          <>
            <SupplierMetricGrid
              metrics={[
                { label: "Standard parts", value: `${view.catalogItems}`, detail: "Available components" },
                { label: "Warranty docs", value: `${view.warrantyDocuments}`, detail: "Attached to component lines" },
                { label: "Alternates", value: view.verifiedBom ? "Mapped" : "Review", detail: "Approved substitutions" },
                { label: "Serial rule", value: "On", detail: "Capture required" },
              ]}
            />

            <SupplierCard
              eyebrow="Component lines"
              title="Catalogue entries stay simple and auditable."
              body="Each line describes the component, approved alternate, serial expectation, and warranty file. Pricing and dispatch belong in other lanes."
            >
              <SupplierProofTable
                rows={[
                  {
                    label: "PV module pack",
                    primary: "Tier-1 540W mono panels",
                    secondary: "Warranty file attached; serial capture required at delivery.",
                    status: view.verifiedBom ? "active" : "check",
                    tone: view.verifiedBom ? "good" : "warn",
                  },
                  {
                    label: "Hybrid inverter",
                    primary: "Three-phase hybrid inverter",
                    secondary: "Approved alternate must preserve meter and monitoring compatibility.",
                    status: "alternate",
                  },
                  {
                    label: "Mounting and protection",
                    primary: "Roof rail, isolators, breakers",
                    secondary: "Warranty terms and serial policy are visible before RFQ response.",
                    status: "warranty",
                  },
                ]}
              />
            </SupplierCard>

            <SupplierCard eyebrow="Warranty policy" title="Proof belongs on the catalogue line.">
              <SupplierRow
                label="Warranty parity"
                detail="Alternate components need warranty terms equal to or better than the awarded line."
                value="required"
              />
              <SupplierRow
                label="Serial expectation"
                detail="Components that affect settlement data must carry serial capture rules."
                value="tracked"
              />
              <SupplierRow
                label="Compatibility notes"
                detail="Inverter, meter, and protection gear alternates must include compatibility notes."
                value="mapped"
                tone={view.verifiedBom ? "good" : "warn"}
              />
            </SupplierCard>

            <SupplierCard eyebrow="Catalogue health" title="Coverage by line">
              <SupplierBar label="Warranty attachment" value={view.verifiedBom ? 92 : 54} note="Share of active catalog lines with attached warranty evidence." />
              <SupplierBar label="Substitution clarity" value={view.verifiedBom ? 88 : 61} note="Share of lines with approved alternates and compatibility notes." />
            </SupplierCard>
          </>
        );
      }}
    />
  );
}
