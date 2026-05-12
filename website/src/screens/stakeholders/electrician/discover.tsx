import { PortalKpiBar, PortalPanel } from "../../../components/PortalPrimitives";
import { ProjectCardList } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ElectricianDiscover({ project, data }: PortalScreenProps) {
  const visibleCards = data.discover.length ? data.discover : [];
  const electricianCards = visibleCards.map((card) => ({
    ...card,
    capitalAskKes: undefined,
    equipmentAsk: undefined,
    gapSummary: card.electricianAsk
      ? `${card.gapSummary} | ${card.electricianAsk.scope} | KSh ${Math.round(card.electricianAsk.payEstimateKes).toLocaleString()}`
      : card.gapSummary,
  }));
  const openProjects = electricianCards.length || 1;
  const averagePay = electricianCards.length
    ? electricianCards.reduce((sum, card) => sum + (card.electricianAsk?.payEstimateKes ?? 0), 0) / electricianCards.length
    : 38000;
  const scopes = new Set(electricianCards.map((card) => card.electricianAsk?.scope).filter(Boolean));

  return (
    <>
      <PortalKpiBar items={[
        { label: "Open projects", value: String(openProjects), detail: "matched" },
        { label: "Avg. pay", value: `KSh ${Math.round(averagePay).toLocaleString()}`, detail: "visible scopes" },
        { label: "Scopes", value: String(Math.max(scopes.size, 3)), detail: "install + service" },
      ]} />
      <PortalPanel eyebrow="Discover projects" title="Install, inspection, and maintenance work">
        <div className="filter-bar">
          <span>{project.project.locationBand}</span>
          <span>Install</span>
          <span>Inspection</span>
          <span>Maintenance</span>
          <span>Proof-ready pay</span>
        </div>
        <ProjectCardList cards={electricianCards} project={project} role="electrician" />
      </PortalPanel>
    </>
  );
}
