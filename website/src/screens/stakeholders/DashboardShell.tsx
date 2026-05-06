import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { ProjectedBuilding, StakeholderSection } from "@emappa/shared";
import { Brand } from "../../components/Brand";
import { getRoleConfig } from "../../data/roles";
import type { WebRole } from "../../types";

const roleCommandMeta = {
  resident: {
    mode: "Prepaid household command",
    primary: "KWh, balance, fallback, and ownership education in one household view.",
    signal: "Wallet protected",
    rail: ["Top up", "Solar allocation", "Fallback", "Savings", "Ownership"],
  },
  owner: {
    mode: "Building readiness room",
    primary: "DRS, resident demand, host royalty, and go-live gates without tenant private data.",
    signal: "Deployment gated",
    rail: ["Demand", "DRS", "Install", "Royalty", "Compliance"],
  },
  provider: {
    mode: "Provider yield desk",
    primary: "Generated output, monetized kWh, retained ownership, and maintenance proof.",
    signal: "Yield measured",
    rail: ["Assets", "Metering", "Monetized", "Payout", "Warranty"],
  },
  financier: {
    mode: "Deal underwriting room",
    primary: "Named building exposure, DRS evidence, recovery curve, and risk bands.",
    signal: "Deal scoped",
    rail: ["Pipeline", "Diligence", "Milestones", "Recovery", "Risk"],
  },
  installer: {
    mode: "Go-live certification bay",
    primary: "Checklist gates, site evidence, readings, connectivity, and maintenance work.",
    signal: "Proof required",
    rail: ["Site", "Photos", "Readings", "Connectivity", "Go-live"],
  },
  supplier: {
    mode: "Hardware fulfillment desk",
    primary: "RFQs, BOMs, lead times, dispatch proof, warranty documents, and reliability.",
    signal: "BOM controlled",
    rail: ["RFQ", "Quote", "Dispatch", "Delivery", "Warranty"],
  },
} satisfies Record<WebRole, { mode: string; primary: string; signal: string; rail: string[] }>;

export function DashboardShell({
  role,
  project,
  children,
  navItems,
  onLogout,
}: {
  role: WebRole;
  project: ProjectedBuilding;
  children: ReactNode | ((activeSectionId: string) => ReactNode);
  navItems: readonly StakeholderSection[];
  onLogout: () => void;
}) {
  const active = getRoleConfig(role);
  const command = roleCommandMeta[role];
  const [activeSectionId, setActiveSectionId] = useState(() => {
    const hash = typeof window === "undefined" ? "" : window.location.hash.replace("#", "");
    return navItems.some((item) => item.id === hash) ? hash : navItems[0]?.id ?? "home";
  });
  const activeSection = useMemo(
    () => navItems.find((item) => item.id === activeSectionId) ?? navItems[0],
    [activeSectionId, navItems],
  );
  const renderedChildren = typeof children === "function" ? children(activeSection?.id ?? activeSectionId) : children;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [activeSectionId]);

  function openSection(sectionId: string) {
    setActiveSectionId(sectionId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${sectionId}`);
    }
  }

  return (
    <main className={`portal-shell role-${role}`}>
      <aside className="portal-sidebar">
        <Brand />
        <div className="project-chip">
          <span>Active building</span>
          <strong>{project.project.name}</strong>
          <small>{project.project.locationBand}</small>
        </div>
        <nav className="role-nav local-nav" aria-label={`${active.label} portal sections`}>
          {navItems.map((item) => (
            <button key={item.id} className={item.id === activeSectionId ? "active" : ""} type="button" onClick={() => openSection(item.id)}>
              <span>{item.label}</span>
              <small>{item.detail}</small>
            </button>
          ))}
        </nav>
        <button className="logout-button" onClick={onLogout}>Public site</button>
      </aside>

      <section className="portal-workspace">
        <header className="portal-command-deck">
          <div className="command-copy">
            <p className="eyebrow">{active.label} layer</p>
            <h1>{command.mode}</h1>
            <p>{command.primary}</p>
            <div className="command-rail" aria-label={`${active.label} operating sequence`}>
              {command.rail.map((item, index) => (
                <span key={item}>
                  <em>{String(index + 1).padStart(2, "0")}</em>
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="command-status-card" aria-label={`${active.label} command status`}>
            <div className={`drs-badge ${project.drs.decision}`}>
              <span>DRS</span>
              <strong>{project.drs.score}</strong>
              <small>{project.drs.label}</small>
            </div>
            <div>
              <span>Signal</span>
              <strong>{command.signal}</strong>
              <small>{project.project.name}</small>
            </div>
          </div>
        </header>
        <div className="portal-ops-strip" aria-label="Portal operating context">
          <article>
            <span>Scope</span>
            <strong>{active.label} only</strong>
            <small>No cross-role portal access</small>
          </article>
          <article>
            <span>Signal</span>
            <strong>{command.signal}</strong>
            <small>Current role-specific operating state</small>
          </article>
          <article>
            <span>Building</span>
            <strong>{project.project.name}</strong>
            <small>{project.project.locationBand}</small>
          </article>
          <article>
            <span>Active screen</span>
            <strong>{activeSection?.label ?? "Home"}</strong>
            <small>{activeSection?.detail ?? "Role-specific operating view"}</small>
          </article>
          <article>
            <span>Truth rule</span>
            <strong>Monetized solar only</strong>
            <small>Generated but unsold kWh does not pay out</small>
          </article>
        </div>
        {renderedChildren}
      </section>
    </main>
  );
}
