import { PortalKpiBar } from "../../../components/PortalPrimitives";
import { EnergyTodayChart, GenerationPanel, kes, kwh } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function BuildingOwnerEnergy({ project, data }: PortalScreenProps) {
  return (
    <>
      <EnergyTodayChart project={project} today={data.energyToday} />
      <PortalKpiBar items={[
        { label: "Today generation", value: kwh(project.energy.E_gen / 30), detail: "whole building" },
        { label: "Today usage", value: kwh((project.energy.E_sold + project.energy.E_grid) / 30), detail: "aggregate load" },
        { label: "Today revenue", value: kes(project.settlement.revenue / 30), detail: "sold solar only" },
      ]} />
      <GenerationPanel project={project} alwaysVisible />
    </>
  );
}
