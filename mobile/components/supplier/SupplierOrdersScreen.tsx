import { RoleDashboardScaffold } from "../roles/RoleDashboardScaffold";
import { SupplierCard, SupplierMetricGrid, SupplierProofTable, SupplierTimeline, supplierView } from "./SupplierShared";

export function SupplierOrdersScreen() {
  return (
    <RoleDashboardScaffold
      role="provider"
      cohesionRole="provider"
      section="Orders"
      title="Awards & Proof"
      subtitle="Purchase orders only: award state, dispatch window, delivery proof, serials, and warranty closeout."
      actions={["Confirm award", "Log dispatch", "Upload proof"]}
      renderHero={(building) => {
        const view = supplierView(building);
        return {
          label: "Proof path",
          value: `${view.leadTimeDays}d`,
          sub: `${view.verifiedBom ? "Award can move into dispatch" : "Award is paused until proof is clean"}.`,
        };
      }}
      renderPanels={(building) => {
        const view = supplierView(building);
        return (
          <>
            <SupplierMetricGrid
              metrics={[
                { label: "Award", value: view.verifiedBom ? "Ready" : "Paused", detail: "PO acceptance state" },
                { label: "Dispatch", value: `${view.leadTimeDays}d`, detail: "Quoted movement window" },
                { label: "Delivery note", value: "Needed", detail: "Proof at handoff" },
                { label: "Serials", value: "Open", detail: "Captured before closeout" },
              ]}
            />

            <SupplierCard
              eyebrow="Order progress"
              title="Orders move from award to dispatch to proof."
              body="This lane shows physical fulfillment artifacts only. Quote quality and catalogue policy stay elsewhere."
            >
              <SupplierTimeline
                listLabel="Order timeline"
                steps={[
                  {
                    label: "Award confirmed",
                    detail: "Supplier accepts the PO and locks price, stock, and substitution terms.",
                    complete: view.verifiedBom,
                  },
                  {
                    label: "Dispatch logged",
                    detail: `Movement window is ${view.leadTimeDays} days from award confirmation.`,
                    complete: view.verifiedBom && view.leadTimeDays <= 7,
                  },
                  {
                    label: "Delivery proof captured",
                    detail: "Delivery note, site handoff, and installer acknowledgement are attached to the project lane.",
                    complete: false,
                  },
                  {
                    label: "Serials and warranty attached",
                    detail: "Component serials and warranty documents close the supplier proof loop.",
                    complete: view.warrantyDocuments >= 4,
                  },
                ]}
              />
            </SupplierCard>

            <SupplierCard eyebrow="Active purchase orders" title="Minimal proof register">
              <SupplierProofTable
                rows={[
                  {
                    label: "PO-221 panels and mounting",
                    primary: view.verifiedBom ? "Award accepted, dispatch next" : "Award held for proof",
                    secondary: "Delivery note and serial capture required at site handoff.",
                    status: view.verifiedBom ? "award" : "blocked",
                    tone: view.verifiedBom ? "good" : "warn",
                  },
                  {
                    label: "PO-226 inverter pack",
                    primary: `${view.leadTimeDays} day estimated lead time`,
                    secondary: "Dispatch proof must include inverter and meter compatibility evidence.",
                    status: "dispatch",
                  },
                  {
                    label: "PO-229 protection gear",
                    primary: `${view.warrantyDocuments} warranty document${view.warrantyDocuments === 1 ? "" : "s"} attached`,
                    secondary: "Closeout waits for delivery note, serials, and installer acknowledgement.",
                    status: "proof",
                  },
                ]}
              />
            </SupplierCard>
          </>
        );
      }}
    />
  );
}
