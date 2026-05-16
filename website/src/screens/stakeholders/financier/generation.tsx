import { ImmersiveEnergyHero } from "@emappa/web-immersive";
import { PortalKpiBar, PortalPanel, PortalTable } from "../../../components/PortalPrimitives";
import { kes, kwh, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function FinancierGeneration({ project, data }: PortalScreenProps) {
  const e = project.energy;
  const monetizedNote = "Payout pools settle from prepaid, delivered kWh (E_sold), not raw generation (E_gen).";
  return (
    <>
      <ImmersiveEnergyHero project={project} energyToday={data.energyToday} variant="building" />
      <PortalKpiBar items={[
        { label: "E_gen (operational)", value: kwh(e.E_gen), detail: "Solar produced — not the economic base alone" },
        { label: "E_sold (monetized)", value: kwh(e.E_sold), detail: "Prepaid solar actually served to eligible load" },
        { label: "Utilization", value: pct(e.utilization), detail: "E_sold / E_gen — key payback driver" },
        { label: "Waste / curtailed", value: kwh(e.E_waste), detail: "No stakeholder payout unless separately monetized" },
      ]} />
      <div className="portal-main-grid">
        <PortalPanel eyebrow="Physics vs economics" title="Energy generation view">
          <p className="portal-muted" style={{ marginBottom: 12 }}>{monetizedNote}</p>
          <PortalTable
            columns={["Metric", "kWh", "Notes"]}
            rows={[
              ["Direct solar to load", kwh(e.E_direct), "Daytime match"],
              ["Battery charged", kwh(e.E_charge), "Excess solar stored"],
              ["Battery discharged to load", kwh(e.E_battery_used), "After round-trip losses"],
              ["Grid fallback", kwh(e.E_grid), "KPLC serves shortfall; e.mappa settles only its prepaid path"],
              ["LBRS gate", project.lbrs.decision, project.lbrs.label],
            ]}
          />
        </PortalPanel>
      </div>
    </>
  );
}
