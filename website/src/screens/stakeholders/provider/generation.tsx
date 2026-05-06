import { PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { GenerationPanel, kes, kwh, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ProviderGeneration({ project }: PortalScreenProps) {
  const view = project.roleViews.provider;
  const hasShares = view.retainedOwnership > 0;

  return (
    <>
      <GenerationPanel project={project} hasShares={hasShares} />
      <PortalPanel eyebrow="Array performance" title="Monetized vs wasted output">
        <PortalLedger rows={[
          { label: "Retained shares", value: pct(view.retainedOwnership), note: "visibility gate" },
          { label: "Monetized kWh", value: kwh(view.monetizedKwh), note: "payout basis" },
          { label: "Wasted kWh", value: kwh(view.wasteKwh), note: "no payout" },
          { label: "Payout share", value: kes(view.monthlyPayoutKes), note: "projected" },
        ]} />
      </PortalPanel>
    </>
  );
}
