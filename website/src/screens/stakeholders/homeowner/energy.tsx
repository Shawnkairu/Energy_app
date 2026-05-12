import { PortalKpiBar, PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { EnergyTodayChart, GenerationPanel, kes, kwh, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function HomeownerEnergy({ project, data }: PortalScreenProps) {
  const resident = project.roleViews.resident;
  const provider = project.roleViews.provider;

  return (
    <>
      <PortalKpiBar items={[
        { label: "Home solar coverage", value: pct(resident.solarCoverage), detail: "solar-first share" },
        { label: "Monthly savings", value: kes(resident.savingsKes), detail: "vs grid-only" },
        { label: "Grid fallback", value: kwh(provider.gridFallbackKwh), detail: "kept outside pledge wallet" },
      ]} />
      <EnergyTodayChart project={project} today={data.energyToday} />
      <div className="portal-two-col">
        <GenerationPanel project={project} alwaysVisible />
        <PortalPanel eyebrow="Share split" title="Rooftop economics at a glance">
          <p>Homeowners see the physical array and the cash position together, so a live demo can connect production to payout without changing screens.</p>
          <PortalLedger rows={[
            { label: "Retained share", value: pct(provider.retainedOwnership), note: "visible to homeowner" },
            { label: "Sold share", value: pct(provider.soldOwnership), note: "provider/financier/resident positions" },
            { label: "Monetized generation", value: kwh(project.energy.E_sold), note: "settlement basis" },
            { label: "Unused generation", value: kwh(provider.wasteKwh), note: "optimization signal" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
