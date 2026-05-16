import { RoleDashboardScaffold } from "../roles/RoleDashboardScaffold";
import { SupplierCard, SupplierMetricGrid, SupplierProofTable, SupplierRow, supplierView } from "./SupplierShared";

export function SupplierQuoteRequestsScreen() {
  return (
    <RoleDashboardScaffold
      role="provider"
      cohesionRole="provider"
      section="Quote Requests"
      title="RFQ Inbox"
      subtitle="Response quality only: complete quotes, explicit assumptions, and clean proof attachments."
      actions={["Answer RFQ", "Add assumption", "Attach proof"]}
      renderHero={(building) => {
        const view = supplierView(building);
        return {
          label: "Open RFQs",
          value: `${view.openRequests}`,
          sub: `${view.verifiedBom ? "Responses are complete enough for review" : "Responses need clearer availability or proof"}.`,
        };
      }}
      renderPanels={(building) => {
        const view = supplierView(building);
        return (
          <>
            <SupplierMetricGrid
              metrics={[
                { label: "Requests", value: `${view.openRequests}`, detail: "RFQs in supplier inbox" },
                { label: "Completeness", value: view.verifiedBom ? "High" : "Partial", detail: "Answer quality" },
                { label: "Assumptions", value: "Visible", detail: "No hidden caveats" },
                { label: "Proof", value: `${view.warrantyDocuments}`, detail: "Attachments referenced" },
              ]}
            />

            <SupplierCard
              eyebrow="RFQ response table"
              title="A quote is useful only when its quality is legible."
              body="Keep responses low-noise: price range, availability confidence, warranty reference, and any substitution rule."
            >
              <SupplierProofTable
                rows={[
                  {
                    label: "RFQ-1042 inverter and meter pack",
                    primary: `KSh 684k range · ${view.leadTimeDays} day estimated lead time`,
                    secondary: "Availability confidence, delivery assumption, and warranty file are referenced in the response.",
                    status: view.verifiedBom ? "complete" : "proof gap",
                    tone: view.verifiedBom ? "good" : "warn",
                  },
                  {
                    label: "RFQ-1045 mounting hardware",
                    primary: "KSh 218k range · 4 day dispatch window",
                    secondary: "Substitution note is explicit and requires electrician roof rail confirmation.",
                    status: "qualified",
                  },
                  {
                    label: "RFQ-1047 protection gear",
                    primary: "KSh 96k range · stock held for 48h",
                    secondary: "Hold window and serial evidence requirement are visible before award.",
                    status: "held",
                  },
                ]}
              />
            </SupplierCard>

            <SupplierCard eyebrow="Quality rubric" title="Every answer should close one uncertainty.">
              <SupplierRow
                label="Availability"
                detail="State whether stock is held, incoming, or needs a substitution."
                value={view.verifiedBom ? "confirmed" : "partial"}
                tone={view.verifiedBom ? "good" : "warn"}
              />
              <SupplierRow
                label="Price"
                detail="Use a clear range or fixed quote without exposing private counterpart finances."
                value="range"
              />
              <SupplierRow
                label="Warranty proof"
                detail="Reference the exact catalogue warranty file that supports the quote."
                value={`${view.warrantyDocuments} docs`}
              />
              <SupplierRow
                label="Assumptions"
                detail="Call out exchange-rate, substitution, or delivery-window assumptions directly."
                value={`${view.leadTimeDays}d`}
              />
            </SupplierCard>
          </>
        );
      }}
    />
  );
}
