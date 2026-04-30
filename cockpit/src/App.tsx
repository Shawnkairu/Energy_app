import { lazy, Suspense, useEffect, useState } from "react";
import { getProjects } from "@emappa/api-client";
import type { ProjectedBuilding } from "@emappa/shared";

const StressTest = lazy(() => import("./stress-test/StressTest.jsx"));

export function App() {
  const [projects, setProjects] = useState<ProjectedBuilding[]>([]);
  const [view, setView] = useState<"command" | "stress">("command");

  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  const totals = projects.reduce(
    (acc, item) => ({
      revenue: acc.revenue + item.settlement.revenue,
      sold: acc.sold + item.energy.E_sold,
      alerts: acc.alerts + item.roleViews.admin.alertCount,
      capital: acc.capital + item.project.capitalRequiredKes,
      funded: acc.funded + item.project.fundedKes,
    }),
    { revenue: 0, sold: 0, alerts: 0, capital: 0, funded: 0 },
  );

  return (
    <main className="ops-shell">
      <aside className="sidebar">
        <div className="logo">e</div>
        <strong>e.mappa internal</strong>
        <nav>
          <button className={view === "command" ? "active" : ""} onClick={() => setView("command")}>
            Command
          </button>
          <button className={view === "stress" ? "active" : ""} onClick={() => setView("stress")}>
            Stress Test
          </button>
          <span>DRS Queue</span>
          <span>Settlement</span>
          <span>Counterparties</span>
          <span>Alerts</span>
        </nav>
      </aside>

      <section className="workspace">
        {view === "stress" ? (
          <Suspense fallback={<div className="panel loading-panel">Loading stress-test cockpit...</div>}>
            <StressTest />
          </Suspense>
        ) : (
          <>
        <section className="hero">
          <div>
            <p className="eyebrow">Internal ops cockpit</p>
            <h1>Gate deployments before trust breaks.</h1>
            <p className="lede">
              This cockpit is only for e.mappa operators: DRS controls, settlement integrity,
              deployment blockers, and stakeholder health.
            </p>
          </div>
          <div className="hero-card">
            <span>Governance action</span>
            <strong>Pause go-live if settlement data is untrusted</strong>
            <small>No hidden overrides. No payout from unused energy.</small>
          </div>
        </section>

        <section className="command-strip">
          <Metric label="Monetized solar" value={`${Math.round(totals.sold).toLocaleString()} kWh`} />
          <Metric label="Monthly revenue" value={`KSh ${Math.round(totals.revenue).toLocaleString()}`} />
          <Metric label="Funding progress" value={`${Math.round((totals.funded / Math.max(1, totals.capital)) * 100)}%`} />
          <Metric label="Active alerts" value={totals.alerts.toString()} />
        </section>

        <section className="ops-board">
          <article className="panel wide">
            <p className="eyebrow">Pipeline command</p>
            <h2>Buildings by deployment risk</h2>
            <div className="project-list">
              {projects.map((item) => (
                <div className="project-row" key={item.project.id}>
                  <div>
                    <strong>{item.project.name}</strong>
                    <span>{item.project.stage} · {item.project.locationBand}</span>
                  </div>
                  <div className="score-ring">{item.drs.score}</div>
                  <span className={`pill ${item.drs.decision}`}>{item.drs.decision}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <p className="eyebrow">Alert inbox</p>
            <h2>Blockers</h2>
            {projects.flatMap((item) =>
              item.drs.reasons.length
                ? item.drs.reasons.map((reason) => ({ project: item.project.name, reason }))
                : [{ project: item.project.name, reason: "No active DRS blocker." }],
            ).map((alert) => (
              <div className="alert" key={`${alert.project}-${alert.reason}`}>
                <strong>{alert.project}</strong>
                <span>{alert.reason}</span>
              </div>
            ))}
          </article>
        </section>

        <section className="ops-grid">
          <article className="panel">
            <p className="eyebrow">Settlement Monitor</p>
            <h2>Waterfall integrity</h2>
            {projects.map((item) => (
              <div className="settlement-row" key={item.project.id}>
                <span>{item.project.name}</span>
                <strong>KSh {item.settlement.revenue.toLocaleString()}</strong>
                <small>{item.roleViews.admin.settlementHealth}</small>
              </div>
            ))}
          </article>

          <article className="panel">
            <p className="eyebrow">Deployment Gates</p>
            <h2>Do not release capital early.</h2>
            {projects.map((item) => (
              <div className="gate-list" key={item.project.id}>
                <strong>{item.project.name}</strong>
                {item.roleViews.admin.gates.map((gate) => (
                  <span key={gate.label} className={gate.complete ? "gate ready" : "gate blocked"}>
                    {gate.label}
                  </span>
                ))}
              </div>
            ))}
          </article>
        </section>
          </>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
