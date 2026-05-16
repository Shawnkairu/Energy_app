import { ImmersiveProjectHero } from "@emappa/web-immersive";
import { PortalKpiBar, PortalLedger, PortalPanel, PortalWorkflow } from "../../../components/PortalPrimitives";
import { GenerationPanel, kes, kwh, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";
import { ProviderCallout } from "./providerUi";

export default function ProviderGeneration({ project }: PortalScreenProps) {
  const view = project.roleViews.provider;
  const hasShares = view.retainedOwnership > 0;
  const soldRatio = view.generatedKwh > 0 ? view.monetizedKwh / view.generatedKwh : 0;
  const wasteRatio = view.generatedKwh > 0 ? view.wasteKwh / view.generatedKwh : 0;
  const payoutPerMonetizedKwh = view.monetizedKwh > 0 ? view.monthlyPayoutKes / view.monetizedKwh : 0;
  const completedGates = view.deploymentGates.filter((gate) => gate.complete).length;

  return (
    <>
      <ImmersiveProjectHero project={project} mode="provider" />
      <PortalKpiBar items={[
        { label: "Monetized output", value: kwh(view.monetizedKwh), detail: `${Math.round(soldRatio * 100)}% of generation sold` },
        { label: "Wasted output", value: kwh(view.wasteKwh), detail: `${Math.round(wasteRatio * 100)}% not paid out` },
        { label: "Payout density", value: kes(payoutPerMonetizedKwh), detail: "provider KES per sold kWh" },
      ]} />
      <GenerationPanel project={project} hasShares={hasShares} />
      <div className="portal-two-col">
        <PortalPanel eyebrow="Array performance" title="Monetized vs wasted output">
          <PortalLedger rows={[
            { label: "Retained shares", value: pct(view.retainedOwnership), note: hasShares ? "generation visible" : "buy shares to unlock" },
            { label: "Sold ownership", value: pct(view.soldOwnership), note: "resident/provider market position" },
            { label: "Monthly payout", value: kes(view.monthlyPayoutKes), note: "only sold solar pays" },
            { label: "Utilization", value: pct(view.utilization), note: "deployment quality signal" },
          ]} />
          <ProviderCallout label="Revenue rule" title="Generation does not equal payout.">
            <span>Provider returns are calculated from monetized solar, then split by retained ownership. Wasted kWh stay visible so the demo can explain why load quality matters.</span>
          </ProviderCallout>
        </PortalPanel>
        <PortalPanel eyebrow="Readiness gates" title={`${completedGates}/${view.deploymentGates.length} deployment checks complete`}>
          <PortalWorkflow steps={view.deploymentGates.slice(0, 3).map((gate) => ({
            label: gate.label,
            detail: gate.complete ? "Evidence complete for settlement modeling." : "Needs proof before go-live.",
            status: gate.complete ? "complete" : "open",
          }))} />
          <PortalLedger rows={[
            { label: "Monitoring", value: view.monitoringStatus, note: "generation data source" },
            { label: "Grid fallback", value: kwh(view.gridFallbackKwh), note: "not part of provider payout" },
            { label: "Warranty docs", value: String(view.warrantyDocuments), note: "proof attached" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
