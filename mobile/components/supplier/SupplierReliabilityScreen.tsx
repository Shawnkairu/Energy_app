import { RoleDashboardScaffold } from "../roles/RoleDashboardScaffold";
import { SupplierBar, SupplierCard, SupplierMetricGrid, SupplierProofTable, SupplierRow, supplierView } from "./SupplierShared";

export function SupplierReliabilityScreen() {
  return (
    <RoleDashboardScaffold
      role="supplier"
      cohesionRole="supplier"
      section="Reliability"
      title="Reliability Score"
      subtitle="Fulfillment history, proof gaps, and schedule confidence. No catalog or RFQ work here."
      actions={["Review score", "Lead history", "Close proof gaps"]}
      renderHero={(building) => {
        const view = supplierView(building);
        return {
          label: "Fulfillment score",
          value: `${view.reliabilityScore}%`,
          sub: `${view.leadTimeDays} day lead-time signal with ${view.warrantyDocuments} proof files contributing.`,
        };
      }}
      renderPanels={(building) => {
        const view = supplierView(building);
        const proofScore = view.warrantyDocuments >= 4 ? 94 : 58;
        const leadTimeScore = view.leadTimeDays <= 7 ? 91 : 64;

        return (
          <>
            <SupplierMetricGrid
              metrics={[
                { label: "Fulfillment", value: `${view.reliabilityScore}%`, detail: "Scheduling signal" },
                { label: "Lead history", value: `${leadTimeScore}%`, detail: "On-time confidence" },
                { label: "Proof", value: `${proofScore}%`, detail: "Evidence coverage" },
                { label: "Proof gaps", value: view.warrantyDocuments >= 4 ? "Low" : "Open", detail: "Missing attachment risk" },
              ]}
            />

            <SupplierCard
              eyebrow="Reliability model"
              title="The score is a scheduling signal, not a promise."
              body="Reliability summarizes fulfillment history, lead-time variance, delivery proof, and open exceptions so deployments are scheduled honestly."
            >
              <SupplierBar label="Fulfillment score" value={view.reliabilityScore} note="Current supplier reliability for active deployment lanes." />
              <SupplierBar label="Lead-time history" value={leadTimeScore} note="Recent ability to meet quoted delivery windows." />
              <SupplierBar label="Proof completeness" value={proofScore} note="Warranty, serial, and delivery documents attached before closeout." />
            </SupplierCard>

            <SupplierCard eyebrow="Proof gaps" title="Close the gaps that weaken fulfillment trust.">
              <SupplierRow
                label="Warranty attachment"
                detail="Missing warranty files lower confidence in future order closeout."
                value={view.warrantyDocuments >= 4 ? "covered" : "gap"}
                tone={view.warrantyDocuments >= 4 ? "good" : "warn"}
              />
              <SupplierRow
                label="Lead-time variance"
                detail="Longer lead times require earlier installer coordination."
                value={`${view.leadTimeDays}d`}
                tone={view.leadTimeDays <= 7 ? "good" : "warn"}
              />
              <SupplierRow
                label="BOM verification"
                detail="Unverified supplier proof creates a historical exception."
                value={view.verifiedBom ? "verified" : "blocked"}
                tone={view.verifiedBom ? "good" : "bad"}
              />
            </SupplierCard>

            <SupplierCard eyebrow="Fulfillment history" title="Recent delivery pattern">
              <SupplierProofTable
                rows={[
                  {
                    label: "Last verified lane",
                    primary: view.leadTimeDays <= 7 ? "Delivered inside quoted window" : "Delivery risk exceeded target",
                    secondary: "Feeds the next scheduling confidence score.",
                    status: view.leadTimeDays <= 7 ? "on time" : "watch",
                    tone: view.leadTimeDays <= 7 ? "good" : "warn",
                  },
                  {
                    label: "Proof package",
                    primary: `${view.warrantyDocuments} documents available`,
                    secondary: "Warranty, serial, and delivery-note coverage are tracked together.",
                    status: "docs",
                  },
                  {
                    label: "Open exceptions",
                    primary: view.verifiedBom ? "No critical fulfillment exception" : "Critical proof exception open",
                    secondary: "Exceptions remain visible until closeout evidence is attached.",
                    status: view.verifiedBom ? "clear" : "block",
                    tone: view.verifiedBom ? "good" : "bad",
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
