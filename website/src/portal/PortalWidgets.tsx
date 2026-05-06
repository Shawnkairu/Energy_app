import type { ProjectCard, ProjectedBuilding, User, WalletTransaction } from "@emappa/shared";
import { EnergyFlow } from "../components/EnergyFlow";
import { GateList } from "../components/GateList";
import { PortalKpiBar, PortalLedger, PortalPanel, PortalTable, PortalWorkflow } from "../components/PortalPrimitives";
import { ProgressBar } from "../components/ProgressBar";
import type { EnergyToday } from "../lib/api";

export const kes = (value: number | undefined | null) => value == null ? "—" : `KSh ${Math.round(value).toLocaleString()}`;
export const kwh = (value: number | undefined | null) => value == null ? "—" : `${Number(value.toFixed(1)).toLocaleString()} kWh`;
export const pct = (value: number | undefined | null) => value == null ? "—" : `${Math.round(value * 100)}%`;

export function PilotBanner({ children = "Pilot mode — pledges are non-binding, energy data may be synthesized, and no money is charged." }: { children?: string }) {
  return <div className="pilot-banner">{children}</div>;
}

export function SyntheticBadge({ source = "synthetic" }: { source?: string }) {
  return <span className={`synthetic-badge source-${source}`}>{source} data</span>;
}

export function TokenHero({ project, title = "Pledged token balance", disabled = false }: { project: ProjectedBuilding; title?: string; disabled?: boolean }) {
  const view = project.roleViews.resident;
  return (
    <PortalPanel className={disabled ? "is-disabled" : ""} eyebrow="Tokens" title={title}>
      <PortalKpiBar
        items={[
          { label: "Pledged balance", value: disabled ? "Activates at go-live" : kes(view.prepaidBalanceKes), detail: "confirmed pledges" },
          { label: "Forecast solar", value: disabled ? "—" : kwh(view.monthlySolarKwh), detail: "today coverage estimate" },
          { label: "Savings", value: disabled ? "—" : kes(view.savingsKes), detail: "vs grid-only" },
        ]}
      />
      <PortalWorkflow
        steps={[
          { label: "Pledge tokens", detail: disabled ? "Available after project goes live." : "Open pledge entry with amount presets.", status: disabled ? "locked" : "ready" },
          { label: "Allocate solar", detail: "Solar-first allocation only happens against confirmed pledges.", status: "pilot" },
          { label: "Fallback", detail: "Grid usage stays separate from the pledge wallet.", status: "protected" },
        ]}
      />
    </PortalPanel>
  );
}

export function ProjectHero({ project, compact = false }: { project: ProjectedBuilding; compact?: boolean }) {
  return (
    <PortalPanel eyebrow="Project readiness" title={compact ? "Project status" : `${project.project.name} readiness`}>
      <div className="hero-split">
        <div className={`drs-badge ${project.drs.decision}`}>
          <span>DRS</span>
          <strong>{project.drs.score}</strong>
          <small>{project.drs.decision}</small>
        </div>
        <div>
          <ProgressBar value={Math.min(1, project.drs.score / 100)} label="Deployment readiness" />
          <GateList gates={project.roleViews.owner.gates.slice(0, compact ? 2 : 3)} />
        </div>
      </div>
    </PortalPanel>
  );
}

export function EnergyTodayChart({ project, today }: { project: ProjectedBuilding; today: EnergyToday | null }) {
  const generation = today?.generation_kwh.reduce((sum, value) => sum + value, 0) ?? project.energy.E_gen / 30;
  const load = today?.load_kwh.reduce((sum, value) => sum + value, 0) ?? project.energy.E_sold / 30 + project.energy.E_grid / 30;
  const battery = Math.max(0, project.energy.E_battery_used / 30);
  const grid = Math.max(0, load - generation);

  return (
    <PortalPanel eyebrow="Energy today" title="Solar, battery, and grid fallback">
      <div className="chart-head"><SyntheticBadge /><span>24-hour stacked view</span></div>
      <div className="energy-bars" aria-label="24 hour energy chart">
        {Array.from({ length: 24 }).map((_, index) => {
          const sun = Math.max(8, Math.sin((index / 24) * Math.PI) * 72);
          const demand = 35 + ((index * 7) % 30);
          return (
            <span key={index}>
              <i className="solar" style={{ height: `${sun}%` }} />
              <i className="battery" style={{ height: `${Math.min(28, battery + (index % 4) * 3)}%` }} />
              <i className="grid" style={{ height: `${Math.min(42, demand + grid)}%` }} />
            </span>
          );
        })}
      </div>
      <PortalKpiBar
        items={[
          { label: "Consumed", value: kwh(load), detail: "today" },
          { label: "From solar", value: kwh(generation), detail: "building share" },
          { label: "Grid fallback", value: kwh(grid), detail: "outside pledge wallet" },
        ]}
      />
    </PortalPanel>
  );
}

export function GenerationPanel({ project, alwaysVisible = false, hasShares = true }: { project: ProjectedBuilding; alwaysVisible?: boolean; hasShares?: boolean }) {
  if (!alwaysVisible && !hasShares) {
    return (
      <PortalPanel eyebrow="Generation" title="Buy a share to see live generation">
        <p>Generation visibility is gated by share ownership. This screen stays visible, but live generation is empty until shares exist.</p>
      </PortalPanel>
    );
  }

  return (
    <PortalPanel eyebrow="Generation" title="Array generation and retained share">
      <EnergyFlow project={project} compact />
      <PortalLedger
        rows={[
          { label: "Today generation", value: kwh(project.energy.E_gen / 30), note: "synthetic forecast" },
          { label: "30-day generation", value: kwh(project.energy.E_gen), note: "projected series" },
          { label: "Retained share", value: pct(project.roleViews.provider.retainedOwnership), note: alwaysVisible ? "homeowner rooftop visibility" : "share-gated view" },
        ]}
      />
    </PortalPanel>
  );
}

export function ProjectCardList({ cards, project, role }: { cards: ProjectCard[]; project: ProjectedBuilding; role: "provider" | "electrician" | "financier" }) {
  const fallback = [
    {
      buildingId: project.project.id,
      name: project.project.name,
      address: project.project.locationBand,
      photoUrl: null,
      drsScore: project.drs.score,
      drsDecision: project.drs.decision,
      stage: "funding" as const,
      gapSummary: role === "provider" ? "Needs panels + inverter + DB" : role === "electrician" ? "Inspection + install scope open" : "Capital stack open",
      capitalAskKes: project.roleViews.financier.remainingCapitalKes,
      equipmentAsk: { panels: Math.round(project.project.energy.arrayKw * 2), infrastructure: ["Inverter", "Smart meters"] },
      electricianAsk: { scope: "install" as const, payEstimateKes: 38000 },
    },
  ];
  const visible = cards.length ? cards : fallback;

  return (
    <div className="project-card-feed">
      {visible.map((card) => (
        <article className="project-card" key={card.buildingId}>
          <div className="project-photo"><span>{card.name.slice(0, 1)}</span></div>
          <div>
            <span className={`decision-pill ${card.drsDecision}`}>{card.drsDecision}</span>
            <h3>{card.name}</h3>
            <p>{card.address}</p>
            <strong>{card.gapSummary}</strong>
            <small>{card.capitalAskKes ? `${kes(card.capitalAskKes)} ask` : card.equipmentAsk?.panels ? `${card.equipmentAsk.panels} panels requested` : "Open project detail"}</small>
          </div>
        </article>
      ))}
    </div>
  );
}

export function WalletTransactions({ rows }: { rows: WalletTransaction[] }) {
  const visible = rows.length ? rows : [
    { id: "pledge", at: new Date().toISOString(), kind: "pledge" as const, amountKes: -2500, reference: "Pilot pledge" },
    { id: "return", at: new Date().toISOString(), kind: "royalty" as const, amountKes: 760, reference: "Projected solar return" },
  ];

  return (
    <PortalTable
      columns={["Date", "Type", "Amount", "Reference"]}
      rows={visible.map((row) => [
        new Date(row.at).toLocaleDateString(),
        row.kind.replace("_", " "),
        kes(row.amountKes),
        row.reference,
      ])}
    />
  );
}

export function ProfileBlocks({ user, roleLabel, extra }: { user: User; roleLabel: string; extra?: React.ReactNode }) {
  return (
    <>
      <PortalPanel eyebrow="Account" title={`${roleLabel} profile`}>
        <PortalLedger
          rows={[
            { label: "Email", value: user.email, note: "OTP login" },
            { label: "Phone", value: user.phone ?? "—", note: "optional" },
            { label: "Role", value: roleLabel, note: "public role" },
            { label: "Building", value: user.buildingId ?? "Assigned by backend", note: "membership" },
          ]}
        />
      </PortalPanel>
      {extra}
      <div className="portal-two-col">
        <PortalPanel eyebrow="Settings" title="Preferences">
          <PortalLedger rows={[
            { label: "Notifications", value: "Email", note: "pilot default" },
            { label: "Units", value: "KES / kWh", note: "Kenya pilot" },
            { label: "Language", value: "English", note: "more later" },
          ]} />
        </PortalPanel>
        <PortalPanel eyebrow="Support" title="Get help">
          <PortalLedger rows={[
            { label: "Help articles", value: "Pilot guide", note: "embedded" },
            { label: "Contact support", value: "support@emappa.test", note: "opens email" },
            { label: "Logout", value: "Top menu", note: "ends session" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
