import { PortalKpiBar, PortalLedger, PortalPanel, PortalTable, PortalWorkflow } from "../../../components/PortalPrimitives";
import { PrivacyNote } from "../../../components/PrivacyNote";
import { ProgressBar } from "../../../components/ProgressBar";
import type { StakeholderScreenProps } from "../../../types";

export function SupplierDashboard({ project, activeSectionId = "home" }: StakeholderScreenProps) {
  const view = project.roleViews.supplier;

  if (activeSectionId === "catalog") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Catalog items", value: `${view.catalogItems}`, detail: "BOM-ready parts" },
            { label: "Warranty docs", value: `${view.warrantyDocuments}`, detail: "attached proof" },
            { label: "BOM gate", value: view.verifiedBom ? "Verified" : "Pending", detail: "deployment dependency" },
            { label: "Lead time", value: `${view.leadTimeDays} days`, detail: "hardware estimate" },
          ]}
        />
        <PortalPanel eyebrow="Catalog and warranty" title="Available components must come with proof.">
          <PortalLedger
            rows={[
              { label: "Catalog items", value: `${view.catalogItems}`, note: "standardized BOM-ready parts" },
              { label: "Warranty docs", value: `${view.warrantyDocuments}`, note: "serial and claim evidence" },
              { label: "Verified BOM", value: view.verifiedBom ? "Yes" : "No", note: "deployment dependency" },
            ]}
          />
        </PortalPanel>
      </div>
    );
  }

  if (activeSectionId === "quote-requests") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Open RFQs", value: `${view.openRequests}`, detail: "project BOM" },
            { label: "BOM gate", value: view.verifiedBom ? "Verified" : "Pending", detail: "quote quality" },
            { label: "Project stage", value: project.project.stage, detail: "timing context" },
            { label: "Reliability", value: `${view.reliabilityScore}%`, detail: "fulfillment history" },
          ]}
        />
        <PortalPanel eyebrow="BOM request inbox" title="Quotes must be precise enough to unlock deployment.">
          <PortalTable
            columns={["Request", "Status", "Supplier action"]}
            rows={[
              ["Panels + mounting", view.verifiedBom ? "Verified" : "Quote needed", "confirm compatible quantity and rails"],
              ["Inverter + battery", view.verifiedBom ? "Matched" : "Substitution review", "attach spec sheet and warranty"],
              ["Meters + CTs", project.project.drs.settlementDataTrusted ? "Accepted" : "Needs proof", "support settlement-grade readings"],
              ["Delivery window", `${view.leadTimeDays} days`, "protect installer schedule"],
            ]}
          />
        </PortalPanel>
      </div>
    );
  }

  if (activeSectionId === "orders") {
    return (
      <div className="dashboard-stack">
        <PortalWorkflow
          steps={[
            { label: "RFQ", detail: "Receive BOM request with strict component requirements.", status: `${view.openRequests} open` },
            { label: "Quote", detail: "Submit price, availability, substitutions, and warranty evidence.", status: view.verifiedBom ? "verified" : "pending" },
            { label: "Dispatch", detail: "Attach delivery proof so installer scheduling can proceed.", status: `${view.leadTimeDays} days` },
            { label: "Warranty", detail: "Keep serials and documents bound to the project lane.", status: `${view.warrantyDocuments} docs` },
          ]}
        />
        <PortalPanel eyebrow="Order lane" title="Delivery proof and warranty flow">
          <PortalLedger
            rows={["RFQ", "Quote", "Award", "Dispatch", "Delivery", "Warranty"].map((item, index) => ({
              label: `${index + 1}. ${item}`,
              value: index < 2 || view.verifiedBom ? "Ready" : "Pending",
              note: "project lane",
            }))}
          />
        </PortalPanel>
      </div>
    );
  }

  if (activeSectionId === "reliability") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Reliability", value: `${view.reliabilityScore}%`, detail: "delivery and proof" },
            { label: "Lead time", value: `${view.leadTimeDays} days`, detail: "visible to partners" },
            { label: "Warranty docs", value: `${view.warrantyDocuments}`, detail: "proof completeness" },
            { label: "Pricing privacy", value: "Protected", detail: "supplier boundary" },
          ]}
        />
        <PortalPanel eyebrow="Reliability history" title="Fulfillment history and lead-time trust">
          <ProgressBar value={view.reliabilityScore / 100} label="Reliability score" />
          <PortalLedger
            rows={[
              { label: "Current score", value: `${view.reliabilityScore}%`, note: "delivery, proof, and warranty completeness" },
              { label: "Lead-time promise", value: `${view.leadTimeDays} days`, note: "visible to deployment partners" },
              { label: "Pricing privacy", value: "Protected", note: "other suppliers do not see private quotes" },
            ]}
          />
        </PortalPanel>
        <PrivacyNote>Suppliers see their own quotes, orders, and fulfillment history plus anonymized lead-time and price bands.</PrivacyNote>
      </div>
    );
  }

  return (
    <div className="dashboard-stack">
      <PortalKpiBar
        items={[
          { label: "Open RFQs", value: `${view.openRequests}`, detail: "project BOM" },
          { label: "BOM gate", value: view.verifiedBom ? "Verified" : "Pending", detail: "deployment dependency" },
          { label: "Lead time", value: `${view.leadTimeDays} days`, detail: "hardware estimate" },
          { label: "Project stage", value: project.project.stage, detail: "timing context" },
        ]}
      />

      <PortalWorkflow
        steps={[
          { label: "Triage", detail: "Open requests are sorted by BOM completeness and deployment urgency.", status: `${view.openRequests} open` },
          { label: "Quote", detail: "Responses include availability, substitution rules, warranty, and lead time.", status: view.verifiedBom ? "BOM verified" : "BOM pending" },
          { label: "Dispatch", detail: "Delivery proof protects installer scheduling and financing release.", status: `${view.leadTimeDays} days` },
          { label: "Warranty", detail: "Serials and warranty docs stay attached to the project lane.", status: `${view.warrantyDocuments} docs` },
        ]}
      />

      <section className="portal-two-column">
        <PortalPanel id="quote-requests" eyebrow="BOM request inbox" title="Quotes must be precise enough to unlock deployment.">
          <PortalTable
            columns={["Request", "Status", "Supplier action"]}
            rows={[
              ["Panels + mounting", view.verifiedBom ? "Verified" : "Quote needed", "confirm compatible quantity and rails"],
              ["Inverter + battery", view.verifiedBom ? "Matched" : "Substitution review", "attach spec sheet and warranty"],
              ["Meters + CTs", project.project.drs.settlementDataTrusted ? "Accepted" : "Needs proof", "support settlement-grade readings"],
              ["Delivery window", `${view.leadTimeDays} days`, "protect installer schedule"],
            ]}
          />
        </PortalPanel>
        <PortalPanel id="orders" eyebrow="Order lane">
          <PortalLedger
            rows={["RFQ", "Quote", "Award", "Dispatch", "Delivery", "Warranty"].map((item, index) => ({
              label: `${index + 1}. ${item}`,
              value: index < 2 || view.verifiedBom ? "Ready" : "Pending",
              note: "project lane",
            }))}
          />
        </PortalPanel>
      </section>

      <section className="portal-two-column">
        <PortalPanel id="catalog" eyebrow="Catalog and warranty" title="Available components must come with proof.">
          <PortalLedger
            rows={[
              { label: "Catalog items", value: `${view.catalogItems}`, note: "standardized BOM-ready parts" },
              { label: "Warranty docs", value: `${view.warrantyDocuments}`, note: "serial and claim evidence" },
              { label: "Verified BOM", value: view.verifiedBom ? "Yes" : "No", note: "deployment dependency" },
            ]}
          />
        </PortalPanel>
        <PortalPanel id="reliability" eyebrow="Reliability history" title="Fulfillment trust affects deployment timing.">
          <ProgressBar value={view.reliabilityScore / 100} label="Reliability score" />
          <PortalLedger
            rows={[
              { label: "Current score", value: `${view.reliabilityScore}%`, note: "delivery, proof, and warranty completeness" },
              { label: "Lead-time promise", value: `${view.leadTimeDays} days`, note: "visible to deployment partners" },
              { label: "Pricing privacy", value: "Protected", note: "other suppliers do not see private quotes" },
            ]}
          />
        </PortalPanel>
      </section>

      <PrivacyNote>Suppliers see their own quotes, orders, and fulfillment history plus anonymized lead-time and price bands.</PrivacyNote>
    </div>
  );
}
