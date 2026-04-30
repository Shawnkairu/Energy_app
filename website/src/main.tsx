import React from "react";
import ReactDOM from "react-dom/client";
import { useEffect, useMemo, useState } from "react";
import { getProjects } from "@emappa/api-client";
import type { ProjectedBuilding, StakeholderRole } from "@emappa/shared";
import MarketingPage from "./MarketingPage";
import "./marketing-base.css";
import "./styles.css";

type WebRole = Exclude<StakeholderRole, "admin">;

const roles: Array<{ id: WebRole; label: string; kicker: string }> = [
  { id: "resident", label: "Residents", kicker: "Prepaid solar + optional ownership" },
  { id: "owner", label: "Building Owners", kicker: "DRS, deployment, host royalty" },
  { id: "provider", label: "Providers", kicker: "Panels as yield assets" },
  { id: "financier", label: "Financiers", kicker: "Named transparent deals" },
  { id: "installer", label: "Electricians", kicker: "Certified install workflows" },
  { id: "supplier", label: "Suppliers", kicker: "BOMs, quotes, fulfillment" },
];

function StakeholderPortal() {
  const [projects, setProjects] = useState<ProjectedBuilding[]>([]);
  const [role, setRole] = useState<WebRole>("resident");

  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  const project = projects[0];
  const content = useMemo(() => project ? roleContent(role, project) : null, [project, role]);

  if (!project || !content) return <main className="loading">Loading stakeholder dashboards...</main>;

  return (
    <main className="site-shell">
      <nav className="topbar">
        <div className="brand">
          <span className="brand-mark">e</span>
          <strong>e.mappa</strong>
        </div>
        <a href="#dashboards">Stakeholder dashboards</a>
      </nav>

      <section className="hero">
        <div>
          <p className="eyebrow">Energy economy portal</p>
          <h1>One verified building. Six stakeholder views. Zero hidden settlement logic.</h1>
          <p className="hero-copy">
            Residents, owners, providers, financiers, electricians, and suppliers each see the truth they need.
            e.mappa's internal controls live separately in the ops cockpit.
          </p>
        </div>

        <PhonePreview role={role} project={project} content={content} />
      </section>

      <section id="dashboards" className="role-tabs">
        {roles.map((item) => (
          <button
            key={item.id}
            className={item.id === role ? "active" : ""}
            onClick={() => setRole(item.id)}
          >
            <strong>{item.label}</strong>
            <span>{item.kicker}</span>
          </button>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="large-card">
          <p className="eyebrow">{content.label}</p>
          <h2>{content.title}</h2>
          <p>{content.body}</p>
          <div className="action-row">
            {content.actions.map((action) => <button key={action}>{action}</button>)}
          </div>
        </article>

        {content.metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </article>
        ))}
      </section>

      <section className="flow-section">
        <article className="energy-map">
          <div className="node solar">Solar<br /><strong>{Math.round(project.energy.E_gen).toLocaleString()} kWh</strong></div>
          <div className="line" />
          <div className="home-node">{Math.round(project.energy.coverage * 100)}%<span>solar coverage</span></div>
          <div className="line muted" />
          <div className="node grid">Grid fallback<br /><strong>{Math.round(project.energy.E_grid).toLocaleString()} kWh</strong></div>
        </article>
        <article className="truth-card">
          <p className="eyebrow">Transparency rule</p>
          <h2>{project.transparency.utilizationBand}</h2>
          <p>{project.transparency.privacyNote}</p>
          <div className="risk-band">{project.transparency.roiRange}</div>
        </article>
      </section>
    </main>
  );
}

function PhonePreview({ role, project, content }: { role: WebRole; project: ProjectedBuilding; content: ReturnType<typeof roleContent> }) {
  return (
    <aside className="phone">
      <div className="phone-status"><span>01:26</span><span>5G 64</span></div>
      <div className="phone-title">{content.label}</div>
      <div className="phone-value">{content.metrics[0].value}</div>
      <div className="chart">
        <span style={{ height: `${42 + project.energy.coverage * 42}%` }} />
        <span style={{ height: "52%" }} />
        <span style={{ height: `${32 + project.energy.utilization * 50}%` }} />
        <span style={{ height: "36%" }} />
        <span style={{ height: "68%" }} />
      </div>
      <div className="phone-card">
        <strong>{role === "resident" ? "Morning - Sunny" : project.project.name}</strong>
        <span>{content.body}</span>
      </div>
    </aside>
  );
}

function roleContent(role: WebRole, project: ProjectedBuilding) {
  const money = (value: number) => `KSh ${Math.round(value).toLocaleString()}`;

  const map = {
    resident: {
      label: "Resident dashboard",
      title: "Cheaper prepaid solar first, grid fallback second.",
      body: "A clean utility experience: balance, solar used, savings, fallback, and ownership when trust is earned.",
      actions: ["Top up", "View usage", "Buy shares"],
      metrics: [
        { label: "Avg prepaid balance", value: money(project.roleViews.resident.averagePrepaidBalanceKes), detail: "Mock average per resident" },
        { label: "Solar used", value: `${project.roleViews.resident.monthlySolarKwh} kWh`, detail: "This month" },
        { label: "Savings", value: money(project.roleViews.resident.savingsKes), detail: "Vs grid equivalent" },
      ],
    },
    owner: {
      label: "Owner dashboard",
      title: "Your building becomes a verified energy site.",
      body: "Owners see DRS, comparable buildings, resident pre-commitment, deployment gates, and host royalties.",
      actions: ["Start deployment", "Invite residents", "View DRS"],
      metrics: [
        { label: "DRS", value: `${project.drs.score}`, detail: project.drs.label },
        { label: "Host royalty", value: money(project.roleViews.owner.monthlyRoyaltyKes), detail: "Monthly projection" },
        { label: "Prepaid coverage", value: `${Math.round(project.roleViews.owner.prepaidCoverage * 100)}%`, detail: `${project.roleViews.owner.prepaidMonthsCovered} months covered` },
      ],
    },
    provider: {
      label: "Provider dashboard",
      title: "Panels become liquid, yield-generating assets.",
      body: "Providers see generated vs monetized kWh, retained ownership, sold shares, and payout drift.",
      actions: ["Commit panels", "Sell shares", "Track payout"],
      metrics: [
        { label: "Retained ownership", value: `${Math.round(project.roleViews.provider.retainedOwnership * 100)}%`, detail: "Future provider pool" },
        { label: "Payout", value: money(project.roleViews.provider.monthlyPayoutKes), detail: "Monetized kWh only" },
        { label: "Sold shares", value: `${Math.round(project.roleViews.provider.soldOwnership * 100)}%`, detail: "Resident-owned" },
      ],
    },
    financier: {
      label: "Financier dashboard",
      title: "Fund named deals, not an opaque pool.",
      body: "Financiers see project risk, DRS, utilization, downside cases, and projected recovery curves.",
      actions: ["Open deal room", "Stress test", "Commit capital"],
      metrics: [
        { label: "Committed capital", value: money(project.roleViews.financier.committedCapitalKes), detail: `${money(project.roleViews.financier.remainingCapitalKes)} left to raise` },
        { label: "Monthly recovery", value: money(project.roleViews.financier.monthlyRecoveryKes), detail: "Base case" },
        { label: "Payback", value: `${project.financierPayback.yearsToPrincipal.toFixed(1)} yrs`, detail: "Not guaranteed" },
      ],
    },
    installer: {
      label: "Electrician dashboard",
      title: "Certified execution with proof at every step.",
      body: "Electricians see jobs, checklists, photo requirements, readings, and go-live verification blockers.",
      actions: ["Open checklist", "Upload photos", "Request parts"],
      metrics: [
        { label: "Checklist", value: `${project.roleViews.installer.checklistComplete}/${project.roleViews.installer.checklistTotal}`, detail: "Gate completion" },
        { label: "DRS", value: `${project.drs.score}`, detail: "Site readiness" },
        { label: "Status", value: project.drs.decision, detail: "Deployment gate" },
      ],
    },
    supplier: {
      label: "Supplier dashboard",
      title: "Standardized BOMs and verified fulfillment.",
      body: "Suppliers see RFQs, substitutions, lead times, purchase orders, serials, and warranty evidence.",
      actions: ["Submit quote", "Confirm delivery", "Upload warranty"],
      metrics: [
        { label: "Open RFQs", value: `${project.roleViews.supplier.openRequests}`, detail: "Project BOMs" },
        { label: "Lead time", value: `${project.roleViews.supplier.leadTimeDays} days`, detail: "Current estimate" },
        { label: "BOM", value: project.roleViews.supplier.verifiedBom ? "Verified" : "Pending", detail: "Critical gate" },
      ],
    },
  } satisfies Record<WebRole, {
    label: string;
    title: string;
    body: string;
    actions: string[];
    metrics: Array<{ label: string; value: string; detail: string }>;
  }>;

  return map[role];
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <>
      <MarketingPage />
      <StakeholderPortal />
    </>
  </React.StrictMode>,
);
