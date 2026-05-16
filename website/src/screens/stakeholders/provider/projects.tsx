import { ImmersiveProjectHero } from "@emappa/web-immersive";
import { PortalKpiBar, PortalLedger, PortalPanel, PortalTable, PortalWorkflow } from "../../../components/PortalPrimitives";
import { kes, pct, PilotBanner } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";
import { ProviderCallout } from "./providerUi";

export default function ProviderProjects({ project, data }: PortalScreenProps) {
  const view = project.roleViews.provider;
  const completeGates = view.deploymentGates.filter((gate) => gate.complete).length;
  const openGates = view.deploymentGates.filter((gate) => !gate.complete);
  const requestedPanels = data.discover.reduce((sum, card) => sum + (card.equipmentAsk?.panels ?? 0), 0);
  const inventoryUnits = data.inventory.reduce((sum, item) => sum + item.stock, 0);
  const quoteCoverage = requestedPanels > 0 ? Math.min(1, inventoryUnits / requestedPanels) : 1;

  return (
    <>
      <PilotBanner>
        Pilot mode — project status uses synthetic building data until quote, delivery, and go-live proof are live.
      </PilotBanner>
      <ImmersiveProjectHero project={project} mode="provider" />
      <PortalKpiBar items={[
        { label: "DRS", value: project.drs.label, detail: `${Math.round(project.drs.score)} / 100` },
        { label: "Gates ready", value: `${completeGates}/${view.deploymentGates.length}`, detail: openGates[0]?.label ?? "ready for next proof" },
        { label: "Quote coverage", value: pct(quoteCoverage), detail: requestedPanels ? `${requestedPanels} panels in active asks` : "no panel shortfall flagged" },
      ]} />
      <div className="portal-two-col">
        <PortalPanel eyebrow="Projects" title="Current project status">
          <PortalLedger rows={[
            { label: "Building", value: project.project.name, note: project.project.locationBand },
            { label: "Stage", value: project.project.stage, note: "provider-facing project state" },
            { label: "Capital required", value: kes(project.project.capitalRequiredKes), note: "named building funding basis" },
            { label: "Supplier quote", value: project.project.drs.hasVerifiedSupplierQuote ? "locked" : "open", note: "verified BOM and quote gate" },
            { label: "Lead electrician", value: project.project.drs.hasCertifiedLeadElectrician ? "assigned" : "open", note: "required before scheduling" },
          ]} />
          <ProviderCallout label="Navigation" title="Inventory is not a primary tab.">
            <span>Project commitments, readiness gates, and live status stay here. Catalog, supply, warranty, and SKU records live in Profile.</span>
          </ProviderCallout>
        </PortalPanel>
        <PortalPanel eyebrow="Readiness path" title="From provider lock to go-live">
          <PortalWorkflow steps={[
            { label: "DRS gate", detail: `${project.drs.label} with ${completeGates}/${view.deploymentGates.length} provider gates ready.`, status: project.drs.decision },
            { label: "Quote reservation", detail: view.quoteReservation?.detail ?? "Supplier quote still needed.", status: view.quoteReservation?.status ?? "needed" },
            { label: "Delivery proof", detail: view.deliveryEvidence?.detail ?? "Attach serials, warranty docs, and delivery evidence before go-live.", status: view.deliveryEvidence?.status ?? "pilot" },
          ]} />
        </PortalPanel>
      </div>
      <PortalPanel eyebrow="Gate detail" title="Provider project checklist">
        <PortalTable
          columns={["Gate", "Status", "Why it matters"]}
          rows={view.deploymentGates.map((gate) => [
            gate.label,
            gate.complete ? "Ready" : "Open",
            gate.complete ? "Proof accepted for this pilot snapshot" : "Blocks scheduling, funding release, or go-live proof",
          ])}
        />
      </PortalPanel>
    </>
  );
}
