import { PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { EnergyTodayChart, GenerationPanel, kwh, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function HomeownerEnergy({ project, data }: PortalScreenProps) {
  return (
    <>
      <EnergyTodayChart project={project} today={data.energyToday} />
      <div className="portal-two-col">
        <GenerationPanel project={project} alwaysVisible />
        <PortalPanel eyebrow="Share split" title="Retained rooftop economics">
          <PortalLedger rows={[
            { label: "Retained share", value: pct(project.roleViews.provider.retainedOwnership), note: "visible to homeowner" },
            { label: "Sold share", value: pct(project.roleViews.provider.soldOwnership), note: "provider/financier/resident positions" },
            { label: "Monetized generation", value: kwh(project.energy.E_sold), note: "settlement basis" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
