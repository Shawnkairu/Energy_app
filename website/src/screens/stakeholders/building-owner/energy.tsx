import { ImmersiveEnergyHero } from "@emappa/web-immersive";
import { PortalKpiBar, PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { EnergyTodayChart, GenerationPanel, kes, kwh, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function BuildingOwnerEnergy({ project, data }: PortalScreenProps) {
  const owner = project.roleViews.owner;
  const provider = project.roleViews.provider;

  return (
    <>
      <ImmersiveEnergyHero project={project} energyToday={data.energyToday} variant="building" />
      <EnergyTodayChart project={project} today={data.energyToday} />
      <PortalKpiBar items={[
        { label: "Today generation", value: kwh(project.energy.E_gen / 30), detail: "Solar plant on dedicated path" },
        { label: "Today usage", value: kwh((project.energy.E_sold + project.energy.E_grid) / 30), detail: "aggregate load" },
        { label: "Today revenue", value: kes(project.settlement.revenue / 30), detail: "sold solar only" },
      ]} />
      <div className="portal-two-col">
        <GenerationPanel project={project} alwaysVisible />
        <PortalPanel eyebrow="Building signal" title="Demand and operations quality">
          <p>Aggregated energy metrics show whether the building can absorb the array without exposing resident-level usage.</p>
          <PortalLedger rows={[
            { label: "Resident participation", value: pct(owner.residentParticipation), note: "pledged demand coverage" },
            { label: "Solar utilization", value: pct(provider.utilization), note: "sold generation ratio" },
            { label: "Grid fallback", value: kwh(provider.gridFallbackKwh), note: "continuity supply" },
            { label: "Monitoring", value: provider.monitoringStatus, note: "demo readiness" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
