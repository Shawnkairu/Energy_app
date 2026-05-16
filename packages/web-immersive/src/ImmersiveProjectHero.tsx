import { useId } from "react";
import type { FinancierPosition, ProjectedBuilding } from "@emappa/shared";
import { kes, kwh, pct } from "./format";

function drsProgress01(score: number): number {
  return score <= 1 ? score : score / 100;
}

export type ImmersiveProjectMode = "provider" | "financier" | "lbrs" | "building_owner" | "electrician";

export type ImmersiveProjectHeroProps = {
  project: ProjectedBuilding;
  mode: ImmersiveProjectMode;
  /** Financier portfolio rows; defaults to a single-position snapshot when empty. */
  portfolio?: FinancierPosition[];
};

/** DRS / deployment / LBRS pulse — same chrome as energy immersive hero. */
export function ImmersiveProjectHero({ project, mode, portfolio }: ImmersiveProjectHeroProps) {
  const gradId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const drs = project.drs;
  const lbrs = project.lbrs;
  const R = 32;
  const circ = 2 * Math.PI * R;

  const isLbrs = mode === "lbrs";
  const ringStroke = isLbrs ? "#2F9F6B" : "#965A35";
  const ringTrack = isLbrs ? "rgba(47, 159, 107, 0.28)" : "rgba(150, 90, 53, 0.28)";

  const ringPct = isLbrs
    ? Math.min(100, Math.max(0, Math.round(lbrs.score)))
    : Math.round(Math.min(1, Math.max(0, drsProgress01(drs.score))) * 100);
  const ringDash = `${(ringPct / 100) * circ} ${circ}`;
  const ringLabel = isLbrs ? "LBRS" : "DRS";
  const ringIcon = isLbrs ? "●" : "✓";

  const positions: FinancierPosition[] =
    mode === "financier" && portfolio?.length
      ? portfolio
      : mode === "financier"
        ? [
            {
              buildingId: project.project.id,
              committedKes: project.roleViews.financier.committedCapitalKes,
              deployedKes: project.project.fundedKes,
              returnsToDateKes: project.settlement.financierPool,
              irrPct: 13.8,
              milestonesHit: [project.drs.decision],
            },
          ]
        : [];

  const dealCount = positions.length || 1;
  const fv = project.roleViews.financier;
  const pv = project.roleViews.provider;
  const ov = project.roleViews.owner;

  let statusLine: string;
  let weatherHint: string;
  let primaryCta: string;
  let ringCaption: string;
  let callouts: { label: string; value: string }[];
  let kpis: { ic: string; small: string; strong: string; hint: string }[];
  const rootClass =
    mode === "lbrs" ? "immersive-hero immersive-hero--project immersive-hero--lbrs" : "immersive-hero immersive-hero--project";

  if (mode === "financier") {
    statusLine = drs.label ?? drs.decision;
    weatherHint = "Pilot · named deal · capital pulse";
    primaryCta = "Deal room & pledge gates";
    ringCaption = "Escrow and milestones follow DRS/LBRS until live monetized kWh backs recovery curves.";
    callouts = [
      { label: "DRS", value: String(Math.round(drsProgress01(drs.score) * 100)) },
      { label: "Funded", value: kes(fv.committedCapitalKes) },
      { label: "Gap", value: kes(fv.remainingCapitalKes) },
      { label: "Deals", value: String(dealCount) },
    ];
    kpis = [
      { ic: "◫", small: "Committed", strong: kes(fv.committedCapitalKes), hint: "Named building" },
      { ic: "↗", small: "Recovery", strong: kes(fv.monthlyRecoveryKes), hint: "Projected" },
      { ic: "◐", small: "Progress", strong: pct(fv.fundingProgress), hint: "Capital stack" },
    ];
  } else if (mode === "lbrs") {
    statusLine = lbrs.label ?? lbrs.decision;
    weatherHint = "Pilot · go-live readiness";
    primaryCta = "Launch readiness tests";
    ringCaption = "LBRS verifies installation and control-plane proof before residents settle on tokens.";
    const checklist = lbrs.checklist;
    const done = checklist.filter((c) => c.complete).length;
    const crit = checklist.filter((c) => c.critical);
    const critDone = crit.filter((c) => c.complete).length;
    callouts = [
      { label: "LBRS", value: String(Math.round(lbrs.score)) },
      { label: "Decision", value: lbrs.decision },
      { label: "Critical", value: `${critDone}/${Math.max(1, crit.length)}` },
      { label: "Tests", value: `${done}/${checklist.length}` },
    ];
    kpis = [
      { ic: "✓", small: "Checklist", strong: `${done}/${checklist.length}`, hint: "all tests" },
      { ic: "⚠", small: "Critical", strong: `${critDone}/${Math.max(1, crit.length)}`, hint: "blocking paths" },
      { ic: "◇", small: "LBRS score", strong: `${Math.round(lbrs.score)}`, hint: "display only" },
    ];
  } else if (mode === "electrician") {
    const ev = project.roleViews.electrician;
    statusLine = drs.label ?? drs.decision;
    weatherHint = "Pilot · field proof · crew queue";
    primaryCta = "Checklist & photo proof";
    ringCaption = "Job payments follow verified checklist evidence while DRS/LBRS gates still discipline go-live.";
    callouts = [
      { label: "DRS", value: String(Math.round(drsProgress01(drs.score) * 100)) },
      { label: "Checklist", value: `${ev.checklistComplete}/${ev.checklistTotal}` },
      { label: "Lead", value: ev.certified ? "Certified" : "Open" },
      { label: "Tickets", value: String(ev.maintenanceTickets) },
    ];
    kpis = [
      { ic: "▤", small: "Electrician", strong: String(project.drs.components.installerReadiness), hint: "DRS component" },
      { ic: "☑", small: "Proof rows", strong: `${ev.checklistComplete}/${ev.checklistTotal}`, hint: "Job checklist" },
      { ic: "⚑", small: "Tickets", strong: String(ev.maintenanceTickets), hint: "Service" },
    ];
  } else if (mode === "building_owner") {
    statusLine = drs.label ?? drs.decision;
    weatherHint = "Pilot · building command · readiness";
    primaryCta = "Resident roster & owner gates";
    ringCaption = "Owner view tracks DRS and pledged demand while keeping private resident finances off this rail.";
    const gates = ov.gates;
    const gateDone = gates.filter((g) => g.complete).length;
    callouts = [
      { label: "DRS", value: String(Math.round(drsProgress01(drs.score) * 100)) },
      { label: "Stage", value: project.project.stage },
      { label: "Gates", value: `${gateDone}/${gates.length}` },
      { label: "Prepaid", value: pct(ov.prepaidCoverage) },
    ];
    kpis = [
      { ic: "⌂", small: "Participation", strong: pct(ov.residentParticipation), hint: "demand signal" },
      { ic: "◐", small: "Prepaid cover", strong: pct(ov.prepaidCoverage), hint: "months-type signal" },
      { ic: "¤", small: "Host royalty", strong: kes(ov.monthlyRoyaltyKes), hint: "settlement stream" },
    ];
  } else {
    statusLine = drs.label ?? drs.decision;
    weatherHint = "Pilot · projects & fulfillment pulse";
    primaryCta = "Project status & open commitments";
    ringCaption = "Project readiness tracks DRS, then BOM proof, delivery evidence, and warranty attestations.";
    callouts = [
      { label: "DRS", value: String(Math.round(drsProgress01(drs.score) * 100)) },
      { label: "Sold solar", value: kwh(pv.monetizedKwh) },
      { label: "Waste", value: kwh(pv.wasteKwh) },
      {
        label: "Gates",
        value: `${pv.deploymentGates.filter((g) => g.complete).length}/${pv.deploymentGates.length}`,
      },
    ];
    kpis = [
      { ic: "⚡", small: "Generated", strong: kwh(pv.generatedKwh), hint: "Array output" },
      { ic: "¤", small: "Monetized", strong: kwh(pv.monetizedKwh), hint: "Payout basis" },
      { ic: "◉", small: "Utilization", strong: pct(pv.utilization), hint: "Load quality" },
    ];
  }

  return (
    <div className={rootClass}>
      <div className="immersive-hero__bg" aria-hidden />
      <header className="immersive-hero__top">
        <div className="immersive-hero__site">
          <span className="immersive-hero__site-name">{project.project.name}</span>
          <span className="immersive-hero__chev" aria-hidden>
            ▾
          </span>
        </div>
        <div className="immersive-hero__meta">
          <span aria-hidden>◇</span>
          <span>{weatherHint}</span>
        </div>
      </header>

      <div className="immersive-hero__diagram" aria-label={isLbrs ? "Launch readiness schematic" : "Deployment gate schematic"}>
        <svg className="immersive-hero__svg immersive-hero__svg--project" viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F5C65B" stopOpacity="0.95" />
              <stop offset="100%" stopColor="rgba(203,171,132,0.35)" />
            </linearGradient>
          </defs>
          <rect x="43" y="84" width="79" height="91" rx="14" fill="rgba(247,242,236,0.06)" stroke="rgba(247,242,236,0.2)" />
          <rect x="144" y="67" width="72" height="115" rx="16" fill="rgba(247,242,236,0.09)" stroke="#F5C65B" strokeWidth="1.2" opacity="0.95" />
          <rect x="237" y="91" width="72" height="77" rx="12" fill="rgba(247,242,236,0.06)" stroke="rgba(247,242,236,0.2)" />
          <path
            d="M 122 125 L 144 125 M 216 118 L 237 118"
            stroke={`url(#${gradId})`}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="180" cy="122" r="10" fill="#F5C65B" opacity="0.92" />
        </svg>
        <ul className="immersive-hero__callouts">
          {callouts.map((c) => (
            <li key={c.label}>
              <small>{c.label}</small>
              <strong>{c.value}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="immersive-hero__sheet">
        <div className="immersive-hero__sheet-handle" aria-hidden />
        <div className="immersive-hero__sheet-top">
          <div>
            <div className="immersive-hero__pill immersive-hero__pill--project">
              <span className="immersive-hero__dot immersive-hero__dot--project" />
              {statusLine}
            </div>
            <p className="immersive-hero__tou">
              {primaryCta}
              <span aria-hidden>›</span>
            </p>
          </div>
          <div className="immersive-hero__ring">
            <svg viewBox="0 0 80 80" aria-hidden>
              <circle cx="40" cy="40" r={R} fill="none" stroke={ringTrack} strokeWidth="7" />
              <circle
                cx="40"
                cy="40"
                r={R}
                fill="none"
                stroke={ringStroke}
                strokeWidth="7"
                strokeDasharray={ringDash}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
              />
            </svg>
            <div className="immersive-hero__ring-label">
              <span aria-hidden>{ringIcon}</span>
              <strong>{ringPct}%</strong>
              <small>{ringLabel}</small>
            </div>
          </div>
        </div>
        <p className="immersive-hero__ring-caption">{ringCaption}</p>
        <div className="immersive-hero__kpis">
          {kpis.map((k) => (
            <div key={k.small}>
              <span className="immersive-hero__kpi-ic" aria-hidden>
                {k.ic}
              </span>
              <small>{k.small}</small>
              <strong>{k.strong}</strong>
              <span className="immersive-hero__kpi-hint">{k.hint}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
