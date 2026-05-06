import { PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { EnergyTodayChart, GenerationPanel, kwh, kes } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ResidentEnergy({ project, data }: PortalScreenProps) {
  const view = project.roleViews.resident;
  const hasShares = view.ownedProviderShare > 0;

  return (
    <>
      <EnergyTodayChart project={project} today={data.energyToday} />
      <div className="portal-two-col">
        <PortalPanel eyebrow="Today summary" title="What your household used">
          <PortalLedger rows={[
            { label: "Consumed", value: kwh(view.monthlySolarKwh + project.energy.E_grid / project.project.units), note: "solar + fallback" },
            { label: "From solar", value: kwh(view.monthlySolarKwh), note: "your allocation" },
            { label: "Saved", value: kes(view.savingsKes), note: "against grid-only" },
          ]} />
        </PortalPanel>
        <GenerationPanel project={project} hasShares={hasShares} />
      </div>
    </>
  );
}
