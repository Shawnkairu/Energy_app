import { useMemo, type ReactNode } from "react";
import type { PublicRole } from "@emappa/shared";
import { Brand } from "../components/Brand";
import { PilotBanner } from "./PortalWidgets";
import type { PortalShellProps } from "./types";

const roleLabels: Record<PublicRole, string> = {
  resident: "Resident",
  homeowner: "Homeowner",
  building_owner: "Building Owner",
  provider: "Provider",
  financier: "Financier",
  electrician: "Electrician",
};

export function PortalShell({
  role,
  user,
  project,
  sections,
  activeTab,
  onNavigate,
  onLogout,
  children,
}: PortalShellProps) {
  const active = useMemo(() => sections.find((section) => section.id === activeTab) ?? sections[0], [activeTab, sections]);

  return (
    <main className={`portal-shell ia-portal role-${role.replace("_", "-")}`}>
      <aside className="portal-sidebar">
        <Brand />
        <div className="project-chip">
          <span>{roleLabels[role]}</span>
          <strong>{project.project.name}</strong>
          <small>{project.project.locationBand}</small>
        </div>
        <nav className="role-nav local-nav" aria-label={`${roleLabels[role]} portal tabs`}>
          {sections.map((item, index) => (
            <button
              key={item.id}
              className={item.id === activeTab ? "active" : ""}
              type="button"
              onClick={() => onNavigate(item.id)}
            >
              <em>{String(index + 1).padStart(2, "0")}</em>
              <span>{item.label}</span>
              <small>{item.detail}</small>
            </button>
          ))}
        </nav>
        <button className="logout-button" onClick={onLogout}>Logout</button>
      </aside>

      <section className="portal-workspace">
        <header className="portal-topbar">
          <PilotBanner />
          <div className="avatar-menu">
            <span>{user.displayName?.slice(0, 1) ?? user.email.slice(0, 1)}</span>
            <div>
              <strong>{user.displayName ?? user.email}</strong>
              <small>{active?.label ?? "Portal"}</small>
            </div>
          </div>
        </header>
        <header className="portal-command-deck ia-command">
          <div className="command-copy">
            <p className="eyebrow">{roleLabels[role]} portal</p>
            <h1>{active?.label ?? "Home"}</h1>
            <p>{active?.detail ?? "Role-specific operating view."}</p>
          </div>
          <StatusCard role={role} projectName={project.project.name} value={project.drs.score} decision={project.drs.decision} />
        </header>
        {children}
        <nav className="mobile-tabbar" aria-label={`${roleLabels[role]} mobile web tabs`}>
          {sections.map((item) => (
            <button key={item.id} className={item.id === activeTab ? "active" : ""} type="button" onClick={() => onNavigate(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
      </section>
    </main>
  );
}

function StatusCard({
  role,
  projectName,
  value,
  decision,
}: {
  role: PublicRole;
  projectName: string;
  value: number;
  decision: string;
}) {
  return (
    <div className="command-status-card" aria-label="Portal status">
      <div className={`drs-badge ${decision}`}>
        <span>DRS</span>
        <strong>{value}</strong>
        <small>{decision}</small>
      </div>
      <div>
        <span>Source</span>
        <strong>{dataSourceLabel(role)}</strong>
        <small>{projectName}</small>
      </div>
    </div>
  );
}

function dataSourceLabel(role: PublicRole) {
  const labels: Record<PublicRole, ReactNode> = {
    resident: "projects + prepaid + energy + wallet",
    homeowner: "projects + roof + prepaid + energy",
    building_owner: "projects + DRS + energy + settlement",
    provider: "discover + inventory + generation + wallet",
    financier: "discover + portfolio + wallet",
    electrician: "discover + jobs + compliance + wallet",
  };
  return labels[role];
}
