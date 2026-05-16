import { useId } from "react";
import type { ProjectedBuilding } from "@emappa/shared";
import type { ImmersiveEnergyToday } from "./types";
import { kes, kwh, pct } from "./format";

function peakFromSeries(arr: number[]): number {
  return arr.length ? Math.max(...arr) : 0;
}

const RING_R = 32;
const RING_CIRC = 2 * Math.PI * RING_R;

export type ImmersiveEnergyVariant = "household" | "building";

export type ImmersiveEnergyHeroProps = {
  project: ProjectedBuilding;
  energyToday: ImmersiveEnergyToday | null | undefined;
  variant?: ImmersiveEnergyVariant;
};

/** Tesla / Enphase system-overview for web (portals + cockpit). */
export function ImmersiveEnergyHero({ project, energyToday, variant = "household" }: ImmersiveEnergyHeroProps) {
  const flowGradId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gen = energyToday?.generation_kwh ?? [];
  const load = energyToday?.load_kwh ?? [];
  const peakGen = peakFromSeries(gen);
  const peakLoad = peakFromSeries(load);
  const gridKw = Math.max(0, peakLoad - peakGen * 0.82);
  const batKw = Math.max(0, peakGen - peakLoad * 0.88);
  const todayGen = gen.reduce((a, b) => a + b, 0);
  const todayLoad = load.reduce((a, b) => a + b, 0);
  const util = todayLoad > 0 ? Math.min(1, todayGen / todayLoad) : 0;

  const view = project.roleViews.resident;
  const drs01 = Math.min(1, Math.max(0, project.drs.score / 100));

  const soc =
    variant === "building"
      ? Math.min(96, Math.max(8, Math.round(drs01 * 55 + util * 40)))
      : Math.min(96, Math.max(8, Math.round(20 + project.energy.utilization * 62)));

  let batteryStatus: "charging" | "discharging" | "idle" = "idle";
  if (peakGen > peakLoad * 1.08) batteryStatus = "charging";
  else if (peakLoad > peakGen * 1.08) batteryStatus = "discharging";

  const statusLine =
    batteryStatus === "charging"
      ? "Charging"
      : batteryStatus === "discharging"
        ? "Supporting load"
        : "Balanced";

  const ringDash = `${(soc / 100) * RING_CIRC} ${RING_CIRC}`;

  const savingEstimate = Math.round(Math.min(todayGen, todayLoad) * 14);
  const meta =
    variant === "building"
      ? `DRS ${Math.round(project.drs.score)} · ${project.project.stage}`
      : "Pilot · synthetic";

  const kpi3: { ic: string; small: string; strong: string; hint: string }[] =
    variant === "building"
      ? [
          { ic: "⌂", small: "Used today", strong: kwh(todayLoad), hint: "Aggregate load" },
          { ic: "☀", small: "Produced", strong: kwh(todayGen), hint: "Dedicated path" },
          { ic: "◉", small: "Utilization", strong: todayLoad > 0 ? pct(util) : "—", hint: "Ops view" },
        ]
      : [
          { ic: "⌂", small: "Used today", strong: kwh(todayLoad), hint: "" },
          { ic: "☀", small: "Produced", strong: kwh(todayGen), hint: "" },
          { ic: "¤", small: "Coverage", strong: pct(view.solarCoverage), hint: "" },
        ];

  const savingsValue = variant === "building" ? kes(savingEstimate) : kes(view.savingsKes);

  return (
    <div className="immersive-hero">
      <div className="immersive-hero__bg" aria-hidden />
      <header className="immersive-hero__top">
        <div className="immersive-hero__site">
          <span className="immersive-hero__site-name">{project.project.name}</span>
          <span className="immersive-hero__chev" aria-hidden>
            ▾
          </span>
        </div>
        <div className="immersive-hero__meta">
          <span aria-hidden>☀</span>
          <span>{meta}</span>
        </div>
      </header>

      <div className="immersive-hero__diagram" aria-label="Energy flow schematic">
        <svg className="immersive-hero__svg" viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={flowGradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(203,171,132,0.35)" />
              <stop offset="50%" stopColor="#F5C65B" />
              <stop offset="100%" stopColor="rgba(203,171,132,0.4)" />
            </linearGradient>
          </defs>
          <line x1="318" y1="50" x2="318" y2="175" stroke="rgba(247,242,236,0.2)" strokeWidth="3" />
          <path
            d="M 137 150 L 155 92 L 210 92 L 228 150 Z"
            fill="rgba(247,242,236,0.07)"
            stroke="rgba(247,242,236,0.18)"
          />
          <rect x="145" y="80" width="72" height="14" rx="4" fill="rgba(245,198,91,0.35)" stroke="#F5C65B" strokeWidth="0.8" />
          <rect x="188" y="155" width="40" height="38" rx="8" fill="rgba(47,159,107,0.25)" stroke="#2F9F6B" strokeWidth="1.4" />
          <path d="M 185 100 Q 180 70 180 100" stroke={`url(#${flowGradId})`} strokeWidth="2.5" fill="none" />
          <path d="M 180 120 L 180 135" stroke={`url(#${flowGradId})`} strokeWidth="2.2" fill="none" />
          <path d="M 228 120 Q 270 115 312 125" stroke={`url(#${flowGradId})`} strokeWidth="2" fill="none" opacity="0.85" />
        </svg>
        <ul className="immersive-hero__callouts">
          <li>
            <small>Producing</small>
            <strong>{peakGen.toFixed(1)} kW</strong>
          </li>
          <li>
            <small>Consuming</small>
            <strong>{peakLoad.toFixed(1)} kW</strong>
          </li>
          <li>
            <small>Grid</small>
            <strong>{gridKw.toFixed(1)} kW</strong>
          </li>
          <li>
            <small>Battery</small>
            <strong>{batKw.toFixed(1)} kW</strong>
          </li>
        </ul>
      </div>

      <div className="immersive-hero__sheet">
        <div className="immersive-hero__sheet-handle" aria-hidden />
        <div className="immersive-hero__sheet-top">
          <div>
            <div className="immersive-hero__pill">
              <span className="immersive-hero__dot" />
              {statusLine}
            </div>
            <p className="immersive-hero__tou">
              Solar-first allocation <span aria-hidden>›</span>
            </p>
          </div>
          <div className="immersive-hero__ring">
            <svg viewBox="0 0 80 80" aria-hidden>
              <circle cx="40" cy="40" r={RING_R} fill="none" stroke="rgba(47,159,107,0.3)" strokeWidth="7" />
              <circle
                cx="40"
                cy="40"
                r={RING_R}
                fill="none"
                stroke="#2F9F6B"
                strokeWidth="7"
                strokeDasharray={ringDash}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
              />
            </svg>
            <div className="immersive-hero__ring-label">
              <span>⚡</span>
              <strong>{soc}%</strong>
              <small>SOC</small>
            </div>
          </div>
        </div>
        <div className="immersive-hero__kpis">
          {kpi3.map((k) => (
            <div key={k.small}>
              <span className="immersive-hero__kpi-ic" aria-hidden>
                {k.ic}
              </span>
              <small>{k.small}</small>
              <strong>{k.strong}</strong>
              {k.hint ? <span className="immersive-hero__kpi-hint">{k.hint}</span> : null}
            </div>
          ))}
        </div>
        <p className="immersive-hero__save">
          <span>Savings vs grid-only</span>
          <strong>{savingsValue}</strong>
        </p>
      </div>
    </div>
  );
}
