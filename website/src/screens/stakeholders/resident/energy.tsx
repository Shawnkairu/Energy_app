import { ImmersiveEnergyHero } from "@emappa/web-immersive";
import { PortalKpiBar, PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { EnergyTodayChart, GenerationPanel, kwh, kes, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ResidentEnergy({ project, data }: PortalScreenProps) {
  const view = project.roleViews.resident;
  const hasShares = view.ownedProviderShare > 0;
  const householdGridKwh = project.energy.E_grid / project.project.units;
  const householdBatteryKwh = project.energy.E_battery_used / project.project.units;
  const householdConsumedKwh = view.monthlySolarKwh + householdGridKwh;
  const gridShare = householdConsumedKwh > 0 ? householdGridKwh / householdConsumedKwh : 0;

  return (
    <>
      <ImmersiveEnergyHero project={project} energyToday={data.energyToday} />
      <EnergyTodayChart project={project} today={data.energyToday} />
      <PortalKpiBar items={[
        { label: "Resident solar", value: kwh(view.monthlySolarKwh), detail: "prepaid monthly allocation" },
        { label: "Coverage", value: pct(view.solarCoverage), detail: "solar-first household share" },
        { label: "Fallback", value: pct(gridShare), detail: `${kwh(householdGridKwh)} grid support` },
      ]} />
      <div className="portal-two-col">
        <PortalPanel eyebrow="Source mix" title="What your household used">
          <PortalLedger rows={[
            { label: "Consumed", value: kwh(householdConsumedKwh), note: "solar + grid fallback" },
            { label: "From prepaid solar", value: kwh(view.monthlySolarKwh), note: "wallet-backed allocation" },
            { label: "Battery support", value: kwh(householdBatteryKwh), note: "stored project energy" },
            { label: "Grid fallback", value: kwh(householdGridKwh), note: "kept outside pledge wallet" },
            { label: "Saved", value: kes(view.savingsKes), note: "against grid-only" },
          ]} />
        </PortalPanel>
        <GenerationPanel project={project} hasShares={hasShares} />
      </div>
    </>
  );
}
