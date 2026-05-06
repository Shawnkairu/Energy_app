import type { ProjectedBuilding } from "@emappa/shared";

export function EnergyFlow({ project, compact = false }: { project: ProjectedBuilding; compact?: boolean }) {
  const solar = Math.round(project.energy.E_gen).toLocaleString();
  const sold = Math.round(project.energy.E_sold).toLocaleString();
  const battery = Math.round(project.energy.E_battery_used).toLocaleString();
  const grid = Math.round(project.energy.E_grid).toLocaleString();
  const coverage = Math.round(project.energy.coverage * 100);

  return (
    <article className={`energy-flow ${compact ? "compact" : ""}`}>
      <div className="energy-flow-header">
        <span>Live allocation path</span>
        <strong>Solar first. Battery second. Grid fallback third.</strong>
      </div>
      <div className="energy-flow-track">
        <div className="flow-node solar">
          <span>Solar</span>
          <strong>{solar}</strong>
          <small>kWh generated</small>
        </div>
        <div className="flow-rail active"><i /></div>
        <div className="flow-node home">
          <span>Home load</span>
          <strong>{coverage}%</strong>
          <small>{sold} monetized kWh</small>
        </div>
        <div className="flow-rail"><i /></div>
        <div className="flow-node battery">
          <span>Battery</span>
          <strong>{battery}</strong>
          <small>kWh used after dark</small>
        </div>
        <div className="flow-rail muted"><i /></div>
        <div className="flow-node grid">
          <span>Grid</span>
          <strong>{grid}</strong>
          <small>fallback kWh</small>
        </div>
      </div>
    </article>
  );
}
