import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, ReferenceLine } from "recharts";
import { calculateEnergy, calculatePayback, calculateSettlement } from "@emappa/shared";

const COLORS = {
  bg: "#0B1622",
  card: "#111E2E",
  cardHover: "#162638",
  border: "#1E3148",
  accent: "#E07856",
  accentLight: "#F4A582",
  green: "#4ADE80",
  greenDark: "#166534",
  red: "#EF4444",
  redDark: "#991B1B",
  yellow: "#FACC15",
  blue: "#60A5FA",
  purple: "#A78BFA",
  cyan: "#22D3EE",
  text: "#E8EDF3",
  textMuted: "#8899AA",
  textDim: "#5A6B7C",
  navy: "#1B3A4B",
  reserve: "#FACC15",
  provider: "#4ADE80",
  financier: "#60A5FA",
  owner: "#A78BFA",
  emappa: "#E07856",
  waste: "#EF4444",
  grid: "#5A6B7C",
  solar: "#F4A582",
  battery: "#22D3EE",
};

const KPLC_PRICE = 28;

function compute(cfg) {
  const { arrayKw, apartments, consumption, batteryKwh, solarPrice, reserveRate, providerRate, financierRate, ownerRate, emappaRate, peakSunHours, systemEff, batteryDod, batteryRtEff, daytimeFraction, financierInvestment, buildingOwnerInvestment, perAptCost, providerPanelCost, providerKw, autoInvestMonthly } = cfg;

  const monthlyDemand = apartments * consumption;
  const energy = calculateEnergy({
    arrayKw,
    peakSunHours,
    systemEfficiency: systemEff,
    batteryKwh,
    batteryDepthOfDischarge: batteryDod,
    batteryRoundTripEfficiency: batteryRtEff,
    monthlyDemandKwh: monthlyDemand,
    daytimeDemandFraction: daytimeFraction,
  });
  const totalWaterfall = reserveRate + providerRate + financierRate + ownerRate + emappaRate;
  const toSettlementRate = (rate) => solarPrice > 0 ? rate / solarPrice : 0;
  const settlement = calculateSettlement(energy.E_sold, solarPrice, {
    reserve: toSettlementRate(reserveRate),
    providers: toSettlementRate(providerRate),
    financiers: toSettlementRate(financierRate),
    owner: toSettlementRate(ownerRate),
    emappa: toSettlementRate(emappaRate),
  });

  const monthlyGen = energy.E_gen;
  const eSold = energy.E_sold;
  const eWaste = energy.E_waste;
  const eGrid = energy.E_grid;
  const util = energy.utilization;
  const coverage = energy.coverage;
  const wasteRate = monthlyGen > 0 ? eWaste / monthlyGen : 0;
  const kwhPerApt = apartments > 0 ? eSold / apartments : 0;
  const revenue = settlement.revenue;

  const rsvPayout = settlement.reserve;
  const provPayout = settlement.providerPool;
  const finPayout = settlement.financierPool;
  const ownPayout = settlement.ownerRoyalty;
  const emPayout = settlement.emappaFee;

  const totalBuildingOwnerCost = buildingOwnerInvestment + (apartments * perAptCost);
  const totalFinancierCost = financierInvestment;
  const financierPayback = calculatePayback({ investment: totalFinancierCost, monthlyPayout: finPayout });
  const ownerPayback = calculatePayback({ investment: totalBuildingOwnerCost, monthlyPayout: ownPayout, targetMultiple: 1 });

  const providerShare = arrayKw > 0 ? providerKw / arrayKw : 0;
  const providerMonthlyPayout = provPayout * providerShare;
  const providerPayback = calculatePayback({ investment: providerPanelCost, monthlyPayout: providerMonthlyPayout, targetMultiple: 1 });

  const residentMonthlySolarBill = kwhPerApt * solarPrice;
  const residentMonthlyKplcEquiv = kwhPerApt * KPLC_PRICE;
  const residentMonthlySavings = residentMonthlyKplcEquiv - residentMonthlySolarBill;

  const providerPoolTotal = eSold * providerRate;
  const ownershipForBreakeven = providerPoolTotal > 0 ? residentMonthlySolarBill / providerPoolTotal : Infinity;
  const ownershipCostForBreakeven = ownershipForBreakeven * providerPanelCost * (arrayKw / providerKw);
  const monthsToBreakeven = autoInvestMonthly > 0 ? ownershipCostForBreakeven / autoInvestMonthly : Infinity;

  const ownershipJourney = [];
  let cumInvest = 0;
  let ownPct = 0;
  const totalArrayCost = providerPanelCost * (arrayKw / providerKw);
  for (let m = 0; m <= 180; m += 6) {
    cumInvest = Math.min(m * autoInvestMonthly, totalArrayCost);
    ownPct = totalArrayCost > 0 ? cumInvest / totalArrayCost : 0;
    const monthlyIncome = ownPct * providerPoolTotal;
    const netBill = residentMonthlySolarBill - monthlyIncome;
    ownershipJourney.push({
      month: m,
      year: (m / 12).toFixed(1),
      ownership: +(ownPct * 100).toFixed(1),
      monthlyIncome: +monthlyIncome.toFixed(0),
      netBill: +Math.max(0, netBill).toFixed(0),
      grossBill: +residentMonthlySolarBill.toFixed(0),
      netPositive: netBill < 0 ? +Math.abs(netBill).toFixed(0) : 0,
    });
  }

  return {
    monthlyGen, eSold, eWaste, eGrid, util, coverage, wasteRate, kwhPerApt,
    revenue, monthlyDemand,
    direct: energy.E_direct, battDischarge: energy.E_battery_used, battCharge: energy.E_charge,
    rsvPayout, provPayout, finPayout, ownPayout, emPayout, totalWaterfall,
    totalBuildingOwnerCost, totalFinancierCost,
    finPrincipalMonths: financierPayback.principalMonths, fin15xMonths: financierPayback.targetMonths,
    ownerPaybackMonths: ownerPayback.principalMonths,
    providerShare, providerMonthlyPayout, providerPaybackMonths: providerPayback.principalMonths,
    residentMonthlySolarBill, residentMonthlyKplcEquiv, residentMonthlySavings,
    ownershipForBreakeven, monthsToBreakeven, ownershipJourney,
    providerPoolTotal,
  };
}

function Slider({ label, value, onChange, min, max, step, unit, color }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: COLORS.textMuted, fontSize: 12, fontWeight: 500, letterSpacing: 0.5 }}>{label}</span>
        <span style={{ color: color || COLORS.accent, fontSize: 14, fontWeight: 700 }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)}
        style={{ width: "100%", accentColor: color || COLORS.accent, height: 6, cursor: "pointer" }} />
    </div>
  );
}

function Card({ title, children, accent, span }) {
  return (
    <div style={{
      background: COLORS.card, borderRadius: 16, padding: 24,
      border: `1px solid ${COLORS.border}`,
      gridColumn: span ? `span ${span}` : undefined,
      position: "relative", overflow: "hidden",
    }}>
      {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }} />}
      {title && <h3 style={{ color: COLORS.text, fontSize: 15, fontWeight: 700, marginBottom: 16, letterSpacing: 0.3 }}>{title}</h3>}
      {children}
    </div>
  );
}

function Metric({ label, value, sub, color, small }) {
  return (
    <div style={{ textAlign: "center", padding: small ? "8px 4px" : "12px 8px" }}>
      <div style={{ color: color || COLORS.accent, fontSize: small ? 20 : 28, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
      <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 4, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ color: COLORS.textDim, fontSize: 10, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function StatusBadge({ good, text }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: good ? "rgba(74,222,128,0.12)" : "rgba(239,68,68,0.12)",
      color: good ? COLORS.green : COLORS.red,
      border: `1px solid ${good ? "rgba(74,222,128,0.25)" : "rgba(239,68,68,0.25)"}`,
    }}>{text}</span>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 12, fontSize: 12 }}>
      <div style={{ color: COLORS.text, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
}

export default function StressTest() {
  const [arrayKw, setArrayKw] = useState(5);
  const [apartments, setApartments] = useState(12);
  const [consumption, setConsumption] = useState(80);
  const [batteryKwh, setBatteryKwh] = useState(5);
  const [solarPrice, setSolarPrice] = useState(20);
  const [reserveRate, setReserveRate] = useState(1);
  const [providerRate, setProviderRate] = useState(6);
  const [financierRate, setFinancierRate] = useState(10);
  const [ownerRate, setOwnerRate] = useState(1);
  const [emappaRate, setEmappaRate] = useState(2);
  const [autoInvest, setAutoInvest] = useState(400);
  const [financierInv, setFinancierInv] = useState(235);
  const [ownerInv, setOwnerInv] = useState(100);
  const [tab, setTab] = useState("energy");

  const cfg = {
    arrayKw, apartments, consumption, batteryKwh, solarPrice,
    reserveRate, providerRate, financierRate, ownerRate, emappaRate,
    peakSunHours: 5, systemEff: 0.85, batteryDod: 0.9, batteryRtEff: 0.9,
    daytimeFraction: 0.4, financierInvestment: financierInv * 1000,
    buildingOwnerInvestment: ownerInv * 1000, perAptCost: 9000,
    providerPanelCost: 32000, providerKw: 0.9, autoInvestMonthly: autoInvest,
  };

  const r = useMemo(() => compute(cfg), [arrayKw, apartments, consumption, batteryKwh, solarPrice, reserveRate, providerRate, financierRate, ownerRate, emappaRate, autoInvest, financierInv, ownerInv]);

  const waterfallCheck = r.totalWaterfall;
  const priceBalanced = Math.abs(waterfallCheck - solarPrice) < 0.01;

  // Apartment sweep data
  const aptSweep = useMemo(() => {
    return [4, 6, 8, 10, 12, 15, 20, 25, 30].map(n => {
      const c = { ...cfg, apartments: n };
      const res = compute(c);
      return { apts: n, util: +(res.util * 100).toFixed(0), eSold: +res.eSold.toFixed(0), waste: +res.eWaste.toFixed(0), revenue: +res.revenue.toFixed(0), kwhPerApt: +res.kwhPerApt.toFixed(1), finMonths: +(res.finPrincipalMonths).toFixed(0), savings: +res.residentMonthlySavings.toFixed(0) };
    });
  }, [arrayKw, consumption, batteryKwh, solarPrice, reserveRate, providerRate, financierRate, ownerRate, emappaRate, financierInv, ownerInv]);

  // Price sweep data
  const priceSweep = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => i + 15).map(p => {
      const c = { ...cfg, solarPrice: p, emappaRate: Math.max(0, p - reserveRate - providerRate - financierRate - ownerRate) };
      const res = compute(c);
      return {
        price: p,
        emappaMargin: Math.max(0, p - reserveRate - providerRate - financierRate - ownerRate),
        savings: +(KPLC_PRICE - p).toFixed(0),
        savingsPct: +(((KPLC_PRICE - p) / KPLC_PRICE) * 100).toFixed(0),
        revenue: +res.revenue.toFixed(0),
        finMonths: +(res.finPrincipalMonths).toFixed(1),
        viable: p >= (reserveRate + providerRate + financierRate + ownerRate),
      };
    });
  }, [arrayKw, apartments, consumption, batteryKwh, reserveRate, providerRate, financierRate, ownerRate, financierInv, ownerInv]);

  // Array size sweep
  const arraySweep = useMemo(() => {
    return [3, 5, 7, 10, 12, 15, 20].map(kw => {
      const c = { ...cfg, arrayKw: kw };
      const res = compute(c);
      return { kw, util: +(res.util * 100).toFixed(0), eSold: +res.eSold.toFixed(0), kwhPerApt: +res.kwhPerApt.toFixed(1), revenue: +res.revenue.toFixed(0), coverage: +(res.coverage * 100).toFixed(0) };
    });
  }, [apartments, consumption, batteryKwh, solarPrice, reserveRate, providerRate, financierRate, ownerRate, emappaRate, financierInv, ownerInv]);

  const tabs = [
    { id: "energy", label: "Energy" },
    { id: "waterfall", label: "Waterfall" },
    { id: "stakeholders", label: "Stakeholders" },
    { id: "pricing", label: "Pricing" },
    { id: "ownership", label: "Ownership" },
    { id: "scenarios", label: "Scenarios" },
  ];

  const energyFlowData = [
    { name: "Direct Solar", value: +r.direct.toFixed(0), fill: COLORS.solar },
    { name: "Battery", value: +r.battDischarge.toFixed(0), fill: COLORS.battery },
    { name: "Wasted", value: +r.eWaste.toFixed(0), fill: COLORS.waste },
  ];

  const waterfallData = [
    { name: "Reserve", perKwh: reserveRate, monthly: +r.rsvPayout.toFixed(0), fill: COLORS.reserve },
    { name: "Providers", perKwh: providerRate, monthly: +r.provPayout.toFixed(0), fill: COLORS.provider },
    { name: "Financiers", perKwh: financierRate, monthly: +r.finPayout.toFixed(0), fill: COLORS.financier },
    { name: "Owner", perKwh: ownerRate, monthly: +r.ownPayout.toFixed(0), fill: COLORS.owner },
    { name: "e.mappa", perKwh: emappaRate, monthly: +r.emPayout.toFixed(0), fill: COLORS.emappa },
  ];

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "24px 32px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ color: COLORS.accent, fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>e.mappa</span>
          <span style={{ color: COLORS.textMuted, fontSize: 14, marginLeft: 12, fontWeight: 500 }}>Settlement & Payback Stress Test</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusBadge good={r.util >= 0.6} text={`${(r.util * 100).toFixed(0)}% util`} />
          <StatusBadge good={priceBalanced} text={priceBalanced ? "Balanced" : `∆ KSh ${(waterfallCheck - solarPrice).toFixed(0)}`} />
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 73px)" }}>
        {/* Sidebar Controls */}
        <div style={{ width: 300, padding: 20, borderRight: `1px solid ${COLORS.border}`, overflowY: "auto", flexShrink: 0 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: COLORS.accent, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>System</div>
            <Slider label="Solar Array" value={arrayKw} onChange={setArrayKw} min={2} max={25} step={0.5} unit=" kW" color={COLORS.solar} />
            <Slider label="Battery" value={batteryKwh} onChange={setBatteryKwh} min={0} max={20} step={1} unit=" kWh" color={COLORS.battery} />
            <Slider label="Apartments" value={apartments} onChange={setApartments} min={2} max={40} step={1} unit="" color={COLORS.blue} />
            <Slider label="Consumption / Apt" value={consumption} onChange={setConsumption} min={30} max={200} step={5} unit=" kWh" color={COLORS.cyan} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ color: COLORS.accent, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Pricing (KSh/kWh)</div>
            <Slider label="Solar Token Price" value={solarPrice} onChange={setSolarPrice} min={12} max={28} step={1} unit="" color={COLORS.accent} />
            <div style={{ background: COLORS.cardHover, borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: COLORS.textMuted, marginBottom: 4 }}>
                <span>KPLC benchmark</span><span style={{ color: COLORS.text }}>KSh {KPLC_PRICE}/kWh</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: COLORS.textMuted }}>
                <span>Resident saving</span><span style={{ color: solarPrice < KPLC_PRICE ? COLORS.green : COLORS.red }}>{((1 - solarPrice / KPLC_PRICE) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ color: COLORS.accent, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Waterfall Split (KSh/kWh)</div>
            <Slider label="Reserve" value={reserveRate} onChange={setReserveRate} min={0} max={6} step={0.5} unit="" color={COLORS.reserve} />
            <Slider label="Providers" value={providerRate} onChange={setProviderRate} min={0} max={12} step={0.5} unit="" color={COLORS.provider} />
            <Slider label="Financiers" value={financierRate} onChange={setFinancierRate} min={0} max={14} step={0.5} unit="" color={COLORS.financier} />
            <Slider label="Owner" value={ownerRate} onChange={setOwnerRate} min={0} max={5} step={0.5} unit="" color={COLORS.owner} />
            <Slider label="e.mappa" value={emappaRate} onChange={setEmappaRate} min={0} max={10} step={0.5} unit="" color={COLORS.emappa} />
            <div style={{
              background: priceBalanced ? "rgba(74,222,128,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${priceBalanced ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)"}`,
              borderRadius: 8, padding: 10, fontSize: 11, textAlign: "center",
              color: priceBalanced ? COLORS.green : COLORS.red,
            }}>
              Total: KSh {waterfallCheck.toFixed(1)}/kWh {priceBalanced ? "= ✓" : `≠ ${solarPrice} ⚠`}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ color: COLORS.accent, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Investment (KSh '000)</div>
            <Slider label="Financier (Inv+Batt)" value={financierInv} onChange={setFinancierInv} min={100} max={500} step={5} unit="k" color={COLORS.financier} />
            <Slider label="Owner (Infra)" value={ownerInv} onChange={setOwnerInv} min={50} max={250} step={5} unit="k" color={COLORS.owner} />
            <Slider label="Auto-Invest/mo" value={autoInvest} onChange={setAutoInvest} min={100} max={2000} step={50} unit="" color={COLORS.green} />
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24, background: COLORS.card, borderRadius: 12, padding: 4 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: tab === t.id ? COLORS.accent : "transparent",
                color: tab === t.id ? "#fff" : COLORS.textMuted,
                fontSize: 13, fontWeight: 600, fontFamily: "inherit", transition: "all 0.15s",
              }}>{t.label}</button>
            ))}
          </div>

          {/* Top Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 24 }}>
            <Card accent={COLORS.solar}><Metric label="Generated" value={`${r.monthlyGen.toFixed(0)}`} sub="kWh/mo" color={COLORS.solar} small /></Card>
            <Card accent={COLORS.green}><Metric label="Monetized" value={`${r.eSold.toFixed(0)}`} sub="kWh/mo" color={COLORS.green} small /></Card>
            <Card accent={COLORS.waste}><Metric label="Wasted" value={`${r.eWaste.toFixed(0)}`} sub="kWh/mo" color={r.wasteRate > 0.3 ? COLORS.red : COLORS.textMuted} small /></Card>
            <Card accent={COLORS.accent}><Metric label="Revenue" value={`${(r.revenue / 1000).toFixed(1)}k`} sub="KSh/mo" color={COLORS.accent} small /></Card>
            <Card accent={r.util >= 0.75 ? COLORS.green : r.util >= 0.6 ? COLORS.yellow : COLORS.red}>
              <Metric label="Utilization" value={`${(r.util * 100).toFixed(0)}%`} sub={r.util >= 0.75 ? "Healthy" : r.util >= 0.6 ? "Warning" : "Danger"} color={r.util >= 0.75 ? COLORS.green : r.util >= 0.6 ? COLORS.yellow : COLORS.red} small />
            </Card>
            <Card accent={COLORS.blue}><Metric label="Per Apartment" value={`${r.kwhPerApt.toFixed(0)}`} sub="solar kWh/mo" color={COLORS.blue} small /></Card>
          </div>

          {/* Tab Content */}
          {tab === "energy" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card title="Energy Flow (Monthly kWh)" span={1}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={[{ name: "Flow", direct: +r.direct.toFixed(0), battery: +r.battDischarge.toFixed(0), waste: +r.eWaste.toFixed(0), grid: +r.eGrid.toFixed(0) }]} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis dataKey="name" tick={{ fill: COLORS.textMuted, fontSize: 11 }} />
                    <YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: COLORS.textMuted }} />
                    <Bar dataKey="direct" name="Direct Solar" fill={COLORS.solar} stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="battery" name="From Battery" fill={COLORS.battery} stackId="a" />
                    <Bar dataKey="waste" name="Wasted" fill={COLORS.waste} stackId="a" />
                    <Bar dataKey="grid" name="Grid Fallback" fill={COLORS.grid} stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Utilization by Apartment Count" span={1}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={aptSweep}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis dataKey="apts" tick={{ fill: COLORS.textMuted, fontSize: 11 }} label={{ value: "Apartments", position: "bottom", fill: COLORS.textDim, fontSize: 10, dy: 0 }} />
                    <YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} domain={[0, 100]} label={{ value: "%", position: "insideTopLeft", fill: COLORS.textDim, fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={75} stroke={COLORS.green} strokeDasharray="4 4" label={{ value: "75% healthy", fill: COLORS.green, fontSize: 10, position: "right" }} />
                    <ReferenceLine y={60} stroke={COLORS.yellow} strokeDasharray="4 4" label={{ value: "60% warning", fill: COLORS.yellow, fontSize: 10, position: "right" }} />
                    <Bar dataKey="util" name="Utilization %" radius={[4, 4, 0, 0]}>
                      {aptSweep.map((d, i) => (
                        <Cell key={i} fill={d.util >= 75 ? COLORS.green : d.util >= 60 ? COLORS.yellow : COLORS.red} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Solar per Apartment vs Total Demand" span={1}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={aptSweep}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis dataKey="apts" tick={{ fill: COLORS.textMuted, fontSize: 11 }} />
                    <YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="kwhPerApt" name="Solar kWh/apt" fill={COLORS.solar} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ color: COLORS.textDim, fontSize: 11, textAlign: "center", marginTop: 8 }}>
                  Total consumption per apt: {consumption} kWh/mo — solar covers {(r.coverage * 100).toFixed(0)}%
                </div>
              </Card>

              <Card title="Array Size Impact" span={1}>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={arraySweep}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis dataKey="kw" tick={{ fill: COLORS.textMuted, fontSize: 11 }} label={{ value: "kW", position: "bottom", fill: COLORS.textDim, fontSize: 10, dy: 0 }} />
                    <YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="util" name="Utilization %" stroke={COLORS.green} strokeWidth={2} dot={{ fill: COLORS.green, r: 4 }} />
                    <Line type="monotone" dataKey="coverage" name="Demand Coverage %" stroke={COLORS.solar} strokeWidth={2} dot={{ fill: COLORS.solar, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}

          {tab === "waterfall" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card title="Per-kWh Waterfall Split" span={1}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={waterfallData} layout="vertical" barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis type="number" tick={{ fill: COLORS.textMuted, fontSize: 11 }} label={{ value: "KSh/kWh", position: "bottom", fill: COLORS.textDim, fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fill: COLORS.textMuted, fontSize: 11 }} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="perKwh" name="KSh/kWh" radius={[0, 4, 4, 0]}>
                      {waterfallData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Monthly Payout (KSh)" span={1}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={waterfallData} layout="vertical" barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis type="number" tick={{ fill: COLORS.textMuted, fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fill: COLORS.textMuted, fontSize: 11 }} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="monthly" name="KSh/month" radius={[0, 4, 4, 0]}>
                      {waterfallData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Revenue Distribution" span={2}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40 }}>
                  <ResponsiveContainer width="40%" height={240}>
                    <PieChart>
                      <Pie data={waterfallData} dataKey="monthly" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                        {waterfallData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div>
                    {waterfallData.map(d => (
                      <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 13 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: d.fill, flexShrink: 0 }} />
                        <span style={{ color: COLORS.textMuted, width: 70 }}>{d.name}</span>
                        <span style={{ color: COLORS.text, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>KSh {d.monthly.toLocaleString()}</span>
                        <span style={{ color: COLORS.textDim, fontSize: 11 }}>({r.revenue > 0 ? ((d.monthly / r.revenue) * 100).toFixed(0) : 0}%)</span>
                      </div>
                    ))}
                    <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 8, marginTop: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                        <div style={{ width: 12 }} />
                        <span style={{ color: COLORS.text, width: 70, fontWeight: 600 }}>Total</span>
                        <span style={{ color: COLORS.accent, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>KSh {r.revenue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {tab === "stakeholders" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Financier */}
              <Card title="💰 External Financier" accent={COLORS.financier}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                  <Metric label="Investment" value={`${(r.totalFinancierCost / 1000).toFixed(0)}k`} sub="KSh" color={COLORS.financier} small />
                  <Metric label="Monthly" value={`${(r.finPayout / 1000).toFixed(1)}k`} sub="KSh" color={COLORS.financier} small />
                  <Metric label="Principal" value={r.finPrincipalMonths < 999 ? `${(r.finPrincipalMonths / 12).toFixed(1)}yr` : "∞"} sub={r.finPrincipalMonths < 999 ? `${r.finPrincipalMonths.toFixed(0)} months` : ""} color={r.finPrincipalMonths < 84 ? COLORS.green : COLORS.red} small />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{ background: COLORS.cardHover, borderRadius: 8, padding: 10, textAlign: "center" }}>
                    <div style={{ color: COLORS.financier, fontSize: 18, fontWeight: 700 }}>{r.fin15xMonths < 999 ? `${(r.fin15xMonths / 12).toFixed(1)} yr` : "N/A"}</div>
                    <div style={{ color: COLORS.textDim, fontSize: 10 }}>1.5× target return</div>
                  </div>
                  <div style={{ background: COLORS.cardHover, borderRadius: 8, padding: 10, textAlign: "center" }}>
                    <div style={{ color: r.finPrincipalMonths < 84 ? COLORS.green : COLORS.yellow, fontSize: 18, fontWeight: 700 }}>
                      {r.finPayout > 0 ? `${((r.totalFinancierCost * 1.5 - r.totalFinancierCost) / (r.fin15xMonths > 0 ? r.fin15xMonths : 1) / (r.totalFinancierCost) * 1200).toFixed(1)}%` : "0%"}
                    </div>
                    <div style={{ color: COLORS.textDim, fontSize: 10 }}>Effective annual yield</div>
                  </div>
                </div>
              </Card>

              {/* Building Owner */}
              <Card title="🏢 Building Owner" accent={COLORS.owner}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                  <Metric label="Investment" value={`${(r.totalBuildingOwnerCost / 1000).toFixed(0)}k`} sub="KSh" color={COLORS.owner} small />
                  <Metric label="Monthly" value={`${r.ownPayout.toFixed(0)}`} sub="KSh" color={COLORS.owner} small />
                  <Metric label="Payback" value={r.ownerPaybackMonths < 999 ? `${(r.ownerPaybackMonths / 12).toFixed(1)}yr` : "∞"} color={r.ownerPaybackMonths < 120 ? COLORS.green : COLORS.red} small />
                </div>
                <div style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: 8, padding: 10, fontSize: 11, color: COLORS.textMuted }}>
                  At KSh {ownerRate}/kWh, direct payback is {(r.ownerPaybackMonths / 12).toFixed(1)} years. Consider: property value improvement, tenant retention, and competitive differentiation are not captured in this number.
                </div>
              </Card>

              {/* Provider */}
              <Card title="☀️ Solar Provider" accent={COLORS.provider}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                  <Metric label="Investment" value={`${(cfg.providerPanelCost / 1000).toFixed(0)}k`} sub={`KSh (${cfg.providerKw}kW)`} color={COLORS.provider} small />
                  <Metric label="Monthly" value={`${r.providerMonthlyPayout.toFixed(0)}`} sub="KSh" color={COLORS.provider} small />
                  <Metric label="Payback" value={r.providerPaybackMonths < 999 ? `${(r.providerPaybackMonths / 12).toFixed(1)}yr` : "∞"} color={r.providerPaybackMonths < 72 ? COLORS.green : COLORS.red} small />
                </div>
                <div style={{ background: COLORS.cardHover, borderRadius: 8, padding: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>
                    <span>Share of array</span><span style={{ color: COLORS.text }}>{(r.providerShare * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>
                    <span>Monetized kWh/mo</span><span style={{ color: COLORS.text }}>{(r.eSold * r.providerShare).toFixed(0)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.textMuted }}>
                    <span>Annual return</span><span style={{ color: COLORS.green }}>{((r.providerMonthlyPayout * 12 / cfg.providerPanelCost) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </Card>

              {/* Resident */}
              <Card title="👤 Resident" accent={COLORS.cyan}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                  <Metric label="Solar Bill" value={`${r.residentMonthlySolarBill.toFixed(0)}`} sub="KSh/mo" color={COLORS.cyan} small />
                  <Metric label="KPLC Would Be" value={`${r.residentMonthlyKplcEquiv.toFixed(0)}`} sub="KSh/mo" color={COLORS.textMuted} small />
                  <Metric label="Monthly Savings" value={`${r.residentMonthlySavings.toFixed(0)}`} sub="KSh" color={COLORS.green} small />
                </div>
                <div style={{ background: COLORS.cardHover, borderRadius: 8, padding: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>
                    <span>Solar kWh received</span><span style={{ color: COLORS.text }}>{r.kwhPerApt.toFixed(1)}/mo</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>
                    <span>Remaining on KPLC</span><span style={{ color: COLORS.text }}>{(consumption - r.kwhPerApt).toFixed(1)} kWh</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.textMuted }}>
                    <span>Total monthly cost</span><span style={{ color: COLORS.text }}>KSh {(r.residentMonthlySolarBill + (consumption - r.kwhPerApt) * KPLC_PRICE).toFixed(0)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.textMuted, borderTop: `1px solid ${COLORS.border}`, paddingTop: 4, marginTop: 4 }}>
                    <span>vs all-KPLC</span><span style={{ color: COLORS.green }}>Save KSh {r.residentMonthlySavings.toFixed(0)}/mo</span>
                  </div>
                </div>
              </Card>

              {/* e.mappa */}
              <Card title="e.mappa Platform" accent={COLORS.emappa} span={2}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                  <Metric label="Monthly/bldg" value={`${r.emPayout.toFixed(0)}`} sub="KSh" color={COLORS.emappa} small />
                  <Metric label="Annual/bldg" value={`${(r.emPayout * 12 / 1000).toFixed(1)}k`} sub="KSh" color={COLORS.emappa} small />
                  <Metric label="10 buildings" value={`${(r.emPayout * 10 / 1000).toFixed(1)}k`} sub="KSh/mo" color={COLORS.accentLight} small />
                  <Metric label="50 buildings" value={`${(r.emPayout * 50 / 1000).toFixed(0)}k`} sub="KSh/mo" color={COLORS.accentLight} small />
                  <Metric label="100 buildings" value={`${(r.emPayout * 100 / 1000).toFixed(0)}k`} sub="KSh/mo" color={COLORS.accentLight} small />
                </div>
                <div style={{ color: COLORS.textDim, fontSize: 11, textAlign: "center", marginTop: 12 }}>
                  At {apartments} apartments × KSh {emappaRate}/kWh — asset-light scaling: software only, local capital funds hardware
                </div>
              </Card>
            </div>
          )}

          {tab === "pricing" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card title="e.mappa Margin vs Resident Savings" span={2}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={priceSweep}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis dataKey="price" tick={{ fill: COLORS.textMuted, fontSize: 11 }} label={{ value: "KSh/kWh", position: "bottom", fill: COLORS.textDim, fontSize: 10 }} />
                    <YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <ReferenceLine x={solarPrice} stroke={COLORS.accent} strokeWidth={2} strokeDasharray="4 4" label={{ value: "Current", fill: COLORS.accent, fontSize: 10, position: "top" }} />
                    <Bar dataKey="emappaMargin" name="e.mappa margin (KSh/kWh)" fill={COLORS.emappa} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="savings" name="Resident savings vs KPLC (KSh/kWh)" fill={COLORS.green} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Optimal Pricing Zone" span={1}>
                <div style={{ padding: 8 }}>
                  {priceSweep.filter(d => d.price >= 18 && d.price <= 25).map(d => (
                    <div key={d.price} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", marginBottom: 4,
                      borderRadius: 8, fontSize: 12,
                      background: d.price === solarPrice ? "rgba(224,120,86,0.12)" : "transparent",
                      border: d.price === solarPrice ? `1px solid rgba(224,120,86,0.3)` : "1px solid transparent",
                    }}>
                      <span style={{ color: COLORS.text, fontWeight: 600, width: 55, fontFamily: "'DM Mono', monospace" }}>KSh {d.price}</span>
                      <span style={{ color: COLORS.green, width: 55, fontSize: 11 }}>-{d.savingsPct}% KPLC</span>
                      <span style={{ color: d.emappaMargin > 0 ? COLORS.emappa : COLORS.red, width: 70, fontSize: 11 }}>e.m: KSh {d.emappaMargin}</span>
                      <span style={{ color: COLORS.textDim, fontSize: 11 }}>Fin: {d.finMonths < 999 ? `${(d.finMonths / 12).toFixed(1)}yr` : "∞"}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Price Sensitivity — Financier Payback" span={1}>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={priceSweep.filter(d => d.viable)}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis dataKey="price" tick={{ fill: COLORS.textMuted, fontSize: 11 }} />
                    <YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} label={{ value: "Years", position: "insideTopLeft", fill: COLORS.textDim, fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={5} stroke={COLORS.green} strokeDasharray="4 4" label={{ value: "5yr target", fill: COLORS.green, fontSize: 10 }} />
                    <Line type="monotone" dataKey="finMonths" name="Financier Payback (months)" stroke={COLORS.financier} strokeWidth={2} dot={{ fill: COLORS.financier, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}

          {tab === "ownership" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card title="Ownership Accumulation Journey" span={2}>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={r.ownershipJourney}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis dataKey="year" tick={{ fill: COLORS.textMuted, fontSize: 11 }} label={{ value: "Years", position: "bottom", fill: COLORS.textDim, fontSize: 10 }} />
                    <YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} label={{ value: "KSh/mo", position: "insideTopLeft", fill: COLORS.textDim, fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="grossBill" name="Gross Solar Bill" stroke={COLORS.textMuted} fill="rgba(90,107,124,0.1)" strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="netBill" name="Net Bill (after ownership income)" stroke={COLORS.accent} fill="rgba(224,120,86,0.15)" strokeWidth={2} />
                    <Area type="monotone" dataKey="monthlyIncome" name="Ownership Income" stroke={COLORS.green} fill="rgba(74,222,128,0.15)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Ownership Milestones" span={1}>
                <div style={{ padding: 8 }}>
                  {[
                    { pct: 5, label: "First stake" },
                    { pct: 10, label: "10% owner" },
                    { pct: 18, label: "1 provider share" },
                    { pct: 28, label: "Break-even" },
                    { pct: 50, label: "Half owner" },
                    { pct: 100, label: "Full owner" },
                  ].map(m => {
                    const totalCost = cfg.providerPanelCost * (arrayKw / cfg.providerKw);
                    const cost = totalCost * (m.pct / 100);
                    const months = autoInvest > 0 ? cost / autoInvest : Infinity;
                    const income = (m.pct / 100) * r.providerPoolTotal;
                    return (
                      <div key={m.pct} style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "8px 0",
                        borderBottom: `1px solid ${COLORS.border}`, fontSize: 12,
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                          background: `rgba(224,120,86,${Math.min(0.1 + m.pct / 200, 0.5)})`,
                          color: COLORS.accent, fontWeight: 700, fontSize: 11, flexShrink: 0,
                        }}>{m.pct}%</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: COLORS.text, fontWeight: 500 }}>{m.label}</div>
                          <div style={{ color: COLORS.textDim, fontSize: 10 }}>
                            KSh {(cost / 1000).toFixed(0)}k invest • {months < 999 ? `${(months / 12).toFixed(1)} yr` : "∞"} • earns KSh {income.toFixed(0)}/mo
                          </div>
                        </div>
                        <div style={{ color: income >= r.residentMonthlySolarBill ? COLORS.green : COLORS.textMuted, fontSize: 11, fontWeight: 600 }}>
                          {income >= r.residentMonthlySolarBill ? "NET +" : `${((income / Math.max(r.residentMonthlySolarBill, 1)) * 100).toFixed(0)}% offset`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card title="How Ownership + Tokens Work" span={1}>
                <div style={{ fontSize: 12, lineHeight: 1.8, color: COLORS.textMuted, padding: 8 }}>
                  <div style={{ color: COLORS.text, fontWeight: 600, marginBottom: 8 }}>The resident wears two hats:</div>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ color: COLORS.cyan, fontWeight: 600 }}>As consumer:</span> Buy solar tokens at KSh {solarPrice}/kWh. Uses {r.kwhPerApt.toFixed(0)} kWh solar/month. Pays KSh {r.residentMonthlySolarBill.toFixed(0)}/month.
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ color: COLORS.green, fontWeight: 600 }}>As owner:</span> Earns from ALL {apartments} apartments' consumption, proportional to ownership %. Not just their own usage — everyone's.
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ color: COLORS.accent, fontWeight: 600 }}>Net effect:</span> Bill KSh {r.residentMonthlySolarBill.toFixed(0)} minus ownership income. At {(r.ownershipForBreakeven * 100).toFixed(0)}% ownership, income ≥ bill. Beyond that: profit.
                  </div>
                  <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 8, padding: 10, color: COLORS.green, fontSize: 11, textAlign: "center" }}>
                    Their neighbors' energy spending becomes their income stream.
                  </div>
                </div>
              </Card>
            </div>
          )}

          {tab === "scenarios" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {[
                {
                  name: "🟢 Best Case", color: COLORS.green,
                  desc: "High demand, high utilization, fast payback",
                  cfg: { ...cfg, apartments: 15, consumption: 100, arrayKw: 5 },
                },
                {
                  name: "🟡 Base Case", color: COLORS.yellow,
                  desc: "Current configuration",
                  cfg: cfg,
                },
                {
                  name: "🔴 Worst Case", color: COLORS.red,
                  desc: "Low demand, low utilization, stretched payback",
                  cfg: { ...cfg, apartments: 6, consumption: 50, arrayKw: 5 },
                },
              ].map(s => {
                const res = compute(s.cfg);
                return (
                  <Card key={s.name} accent={s.color}>
                    <div style={{ textAlign: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 4 }}>{s.desc}</div>
                      <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 2 }}>
                        {s.cfg.apartments} apts × {s.cfg.consumption} kWh × {s.cfg.arrayKw}kW
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                      <Metric label="Utilization" value={`${(res.util * 100).toFixed(0)}%`} color={res.util >= 0.75 ? COLORS.green : res.util >= 0.6 ? COLORS.yellow : COLORS.red} small />
                      <Metric label="Revenue" value={`${(res.revenue / 1000).toFixed(1)}k`} sub="KSh/mo" color={COLORS.accent} small />
                      <Metric label="Fin. Payback" value={res.finPrincipalMonths < 999 ? `${(res.finPrincipalMonths / 12).toFixed(1)}yr` : "∞"} color={res.finPrincipalMonths < 84 ? COLORS.green : COLORS.red} small />
                      <Metric label="Prov. Payback" value={res.providerPaybackMonths < 999 ? `${(res.providerPaybackMonths / 12).toFixed(1)}yr` : "∞"} color={res.providerPaybackMonths < 72 ? COLORS.green : COLORS.red} small />
                      <Metric label="Savings/apt" value={`${res.residentMonthlySavings.toFixed(0)}`} sub="KSh/mo" color={COLORS.green} small />
                      <Metric label="e.mappa" value={`${res.emPayout.toFixed(0)}`} sub="KSh/mo" color={COLORS.emappa} small />
                      <Metric label="Solar/apt" value={`${res.kwhPerApt.toFixed(0)}`} sub="kWh" color={COLORS.blue} small />
                      <Metric label="Waste" value={`${res.eWaste.toFixed(0)}`} sub="kWh" color={res.wasteRate > 0.3 ? COLORS.red : COLORS.textMuted} small />
                    </div>
                    <div style={{
                      marginTop: 12, padding: 8, borderRadius: 8, fontSize: 11, textAlign: "center",
                      background: res.util >= 0.6 && res.finPrincipalMonths < 120 ? "rgba(74,222,128,0.08)" : "rgba(239,68,68,0.08)",
                      color: res.util >= 0.6 && res.finPrincipalMonths < 120 ? COLORS.green : COLORS.red,
                      border: `1px solid ${res.util >= 0.6 && res.finPrincipalMonths < 120 ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)"}`,
                    }}>
                      {res.util >= 0.75 ? "Economics are strong" : res.util >= 0.6 ? "Viable but tight" : "Economics fail — too much waste"}
                    </div>
                  </Card>
                );
              })}

              {/* Financier payback sweep */}
              <Card title="Financier Principal Recovery by Configuration" span={3}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={aptSweep}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis dataKey="apts" tick={{ fill: COLORS.textMuted, fontSize: 11 }} label={{ value: "Apartments", position: "bottom", fill: COLORS.textDim, fontSize: 10 }} />
                    <YAxis tick={{ fill: COLORS.textMuted, fontSize: 11 }} label={{ value: "Months", position: "insideTopLeft", fill: COLORS.textDim, fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={60} stroke={COLORS.green} strokeDasharray="4 4" label={{ value: "5yr target", fill: COLORS.green, fontSize: 10 }} />
                    <Bar dataKey="finMonths" name="Payback (months)" radius={[4, 4, 0, 0]}>
                      {aptSweep.map((d, i) => (
                        <Cell key={i} fill={d.finMonths <= 60 ? COLORS.green : d.finMonths <= 84 ? COLORS.yellow : COLORS.red} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Bottom line */}
              <Card span={3} accent={COLORS.accent}>
                <div style={{ textAlign: "center", padding: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>The Brutal Truth</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, fontSize: 12, color: COLORS.textMuted }}>
                    <div>
                      <div style={{ color: COLORS.green, fontWeight: 600, marginBottom: 4 }}>What works</div>
                      <div>12+ apartments reach healthy utilization</div>
                      <div>Split financing keeps payback under 5 years</div>
                      <div>Residents save immediately — no lock-in needed</div>
                      <div>Asset-light scaling after pilot proof</div>
                    </div>
                    <div>
                      <div style={{ color: COLORS.red, fontWeight: 600, marginBottom: 4 }}>What doesn't</div>
                      <div>6 apartments wastes 50%+ of solar</div>
                      <div>KSh 1/kWh reserve won't fund battery replacement</div>
                      <div>Owner payback at KSh 1/kWh takes 15+ years</div>
                      <div>Full ownership break-even exceeds most tenancies</div>
                    </div>
                    <div>
                      <div style={{ color: COLORS.yellow, fontWeight: 600, marginBottom: 4 }}>Key decisions</div>
                      <div>Aim for 12–15 apartments per 5kW array</div>
                      <div>Recovery-phase reserve KSh 1–2, royalty-phase KSh 4–5</div>
                      <div>Owner share must increase or be property-value justified</div>
                      <div>Ownership is powerful but needs honest timelines</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
