// ─────────────────────────────────────────────────────────────
// cohesion.jsx — components every role uses, so the canvas
// reads as a single operating system rather than 6 silos.
//
// Components:
//   <BuildingPulse role="..." />     — name + DRS + activation badge
//   <KillSwitchBanner />             — top alert when DRS.reasons.length > 0
//   <SettlementWaterfall role="..." /> — Reserve / Providers / Financiers / Owner / e.mappa
//   <SoldVsWaste />                  — canonical Generated → Sold → Waste bar
//   <OwnershipLedgerEntry/>          — the same transfer rendered from any role's POV
// ─────────────────────────────────────────────────────────────

const ROLE_TINT = {
  resident:  { fg: '#965A35', bg: '#FFF4E8', label: 'Resident' },
  owner:    { fg: '#764927', bg: '#FBEFDF', label: 'Owner' },
  provider: { fg: '#7D5734', bg: '#F8EDDD', label: 'Provider' },
  financier:{ fg: '#693719', bg: '#FAEDDC', label: 'Financier' },
  installer:{ fg: '#856444', bg: '#F7EFE0', label: 'Electrician' },
  supplier: { fg: '#997757', bg: '#F5EEDF', label: 'Supplier' },
};

// ─────────────────────────────────────────────────────────────
// BuildingPulse — top-of-page identity strip
// Says: which building, what DRS state, is it live yet?
// Same shape on every role; only the role-tinted dot changes.
// ─────────────────────────────────────────────────────────────
function BuildingPulse({ role = 'resident', compact = false }) {
  const b = window.MOCK;
  const tint = ROLE_TINT[role] || ROLE_TINT.resident;
  const drs = b.drs;
  const activated = drs.decision === 'deployment_ready' && b.project.drs.monitoringConnectivityResolved && b.project.drs.settlementDataTrusted;
  const statePill = activated
    ? { tone: 'good', label: 'Live · settling' }
    : drs.decision === 'deployment_ready'
      ? { tone: 'good', label: 'Approved · pre-go-live' }
      : drs.decision === 'review'
        ? { tone: 'warn', label: 'In review' }
        : { tone: 'bad',  label: 'Blocked' };

  return (
    <div style={{
      background: KIT.white,
      border: `1px solid ${KIT.border}`,
      borderRadius: 18,
      padding: compact ? 10 : 12,
      marginBottom: 12,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 999,
        background: tint.bg, color: tint.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700,
        border: `1px solid ${tint.fg}30`, flexShrink: 0,
      }}>{b.project.name.slice(0, 1)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ color: KIT.text, fontSize: 12.5, fontWeight: 700, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {b.project.name}
          </div>
          <div style={{ color: KIT.muted, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            · {tint.label}
          </div>
        </div>
        <div style={{ color: KIT.muted, fontSize: 10.5, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {b.project.units} units · {b.project.locationBand} · DRS {drs.score}/100
        </div>
      </div>
      <Pill tone={statePill.tone}>{statePill.label}</Pill>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// KillSwitchBanner — only renders when a deployment-blocker is open.
// On a healthy building, this is a no-op so the page stays calm.
// ─────────────────────────────────────────────────────────────
function KillSwitchBanner() {
  const b = window.MOCK;
  const drs = b.project.drs;
  const reasons = b.drs.reasons || [];
  // Synthesize machine reasons from the gate flags so missing toggles surface here too
  const synth = [];
  if (!drs.ownerPermissionsComplete)        synth.push('Owner permission incomplete · Owner must confirm building access.');
  if (!drs.hasVerifiedSupplierQuote)        synth.push('Supplier quote/BOM missing · Supplier must lock the BOM.');
  if (!drs.hasCertifiedLeadElectrician)     synth.push('No certified lead electrician · Electrician must assign a certified lead.');
  if (!drs.solarApartmentCapacityFitVerified || !drs.apartmentAtsMeterMappingVerified || !drs.atsKplcSwitchingVerified)
    synth.push('Apartment supply path · Capacity, ATS map, or switching verification still open for electrician.');
  if (!drs.monitoringConnectivityResolved)  synth.push('Monitoring offline · Restore connectivity before go-live.');
  if (!drs.settlementDataTrusted)           synth.push('Settlement data not trusted · Recheck telemetry before payout.');
  const all = [...reasons, ...synth];
  if (all.length === 0) return null;

  return (
    <div style={{
      background: KIT.red + '0E',
      border: `1px solid ${KIT.red}40`,
      borderRadius: 14,
      padding: 11,
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: 999, background: KIT.red }} />
        <div style={{ color: KIT.red, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Kill switch active · deployment paused
        </div>
      </div>
      {all.slice(0, 3).map((r, i) => (
        <div key={i} style={{
          color: KIT.text, fontSize: 11, lineHeight: 1.45,
          paddingTop: 6, marginTop: i === 0 ? 0 : 6,
          borderTop: i === 0 ? 'none' : `1px solid ${KIT.red}20`,
        }}>
          {r}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SettlementWaterfall — the central truth: revenue is allocated
// in order Reserve → Providers → Financiers → Owner → e.mappa.
// Every role sees the same waterfall, their slice highlighted.
// ─────────────────────────────────────────────────────────────
function SettlementWaterfall({ role, compact = false }) {
  const b = window.MOCK;
  // Total settlement period revenue from monetized solar (mock)
  const total = 240000; // KSh
  const slices = [
    { key: 'reserve',   label: 'Reserve',     value: 24000,  desc: 'Risk buffer · 10%' },
    { key: 'provider',  label: 'Providers',   value: 96000,  desc: 'Asset payout pool' },
    { key: 'financier', label: 'Financiers',  value: 60000,  desc: 'Recovery tranche' },
    { key: 'owner',     label: 'Owner',       value: 36000,  desc: 'Host royalty' },
    { key: 'emappa',    label: 'e.mappa',     value: 24000,  desc: 'Platform' },
  ];
  // map role → which slice to highlight
  const highlightKey = role === 'owner' ? 'owner'
    : role === 'provider' ? 'provider'
    : role === 'financier' ? 'financier'
    : role === 'resident' ? null     // resident sees the building's whole pie, no slice
    : null;

  return (
    <GlassCard>
      <Label>Settlement waterfall · this period</Label>
      <div style={{ color: KIT.text, fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 5 }}>
        Where the building's KSh {total.toLocaleString()} goes
      </div>
      <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.45, marginTop: 5 }}>
        From monetized prepaid solar only · Reserve · Providers · Financiers · Owner · e.mappa.
      </div>
      <div style={{
        display: 'flex', height: 24, marginTop: 14, borderRadius: 999,
        overflow: 'hidden', border: `1px solid ${KIT.border}`,
      }}>
        {slices.map((s) => {
          const w = (s.value / total) * 100;
          const isMine = s.key === highlightKey;
          const fill = isMine ? KIT.text : ({
            reserve: '#C7CACD', provider: '#9D6B3D', financier: '#7E4F2A', owner: '#5A3A20', emappa: '#3E2814',
          })[s.key];
          return (
            <div key={s.key} title={`${s.label}: KSh ${s.value.toLocaleString()}`} style={{
              width: `${w}%`, background: fill, position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isMine && (
                <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, borderRadius: 999, background: KIT.text, border: `2px solid ${KIT.white}` }}/>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginTop: 10 }}>
        {slices.map((s) => {
          const isMine = s.key === highlightKey;
          return (
            <div key={s.key} style={{
              padding: '6px 6px',
              borderRadius: 8,
              background: isMine ? KIT.text + '08' : 'transparent',
              border: isMine ? `1px solid ${KIT.text}` : `1px solid transparent`,
            }}>
              <div style={{ color: isMine ? KIT.text : KIT.muted, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ color: KIT.text, fontSize: 11, fontWeight: 600, marginTop: 2 }}>{(s.value / 1000).toFixed(0)}k</div>
              <div style={{ color: KIT.muted, fontSize: 8.5, marginTop: 1, lineHeight: 1.3 }}>{Math.round((s.value / total) * 100)}%</div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────
// SoldVsWaste — canonical Generated/Sold/Waste/Grid bar.
// Used by Provider Assets, Provider Performance, Owner Earnings,
// Financier Deal Detail to show the same shape everywhere.
// ─────────────────────────────────────────────────────────────
function SoldVsWaste({ headline = 'Generated → Sold → Waste' }) {
  const b = window.MOCK;
  const e = b.energy;
  const total = e.E_gen;
  const soldPct = (e.E_sold / total) * 100;
  const wastePct = (e.E_waste / total) * 100;
  const otherPct = 100 - soldPct - wastePct; // direct + battery + grid (= the rest of generation that wasn't waste)
  return (
    <GlassCard>
      <Label>Asset truth</Label>
      <div style={{ color: KIT.text, fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 5 }}>{headline}</div>
      <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.45, marginTop: 5 }}>
        Only the green slice creates payout. Wasted, curtailed, or free-exported energy stays unpaid.
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: KIT.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <span>Generated</span><span>{Math.round(e.E_gen).toLocaleString()} kWh</span>
        </div>
        <div style={{
          height: 14, marginTop: 6, borderRadius: 999,
          overflow: 'hidden', border: `1px solid ${KIT.border}`, display: 'flex',
        }}>
          <div style={{ width: `${soldPct}%`,  background: KIT.green }}/>
          <div style={{ width: `${otherPct}%`, background: KIT.borderStrong }}/>
          <div style={{ width: `${wastePct}%`, background: KIT.amber }}/>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 10 }}>
        {[
          { label: 'Sold',       value: `${Math.round(e.E_sold).toLocaleString()} kWh`,  fg: KIT.green,  desc: 'Prepaid demand · creates payout' },
          { label: 'Battery + grid', value: `${Math.round(e.E_battery_used + e.E_direct || e.E_battery_used).toLocaleString()} kWh`, fg: KIT.text, desc: 'Operational, not payout' },
          { label: 'Waste',     value: `${Math.round(e.E_waste).toLocaleString()} kWh`, fg: KIT.amber,  desc: 'Curtailed · no payout' },
        ].map((s) => (
          <div key={s.label} style={{ borderRadius: 10, border: `1px solid ${KIT.border}`, padding: 8 }}>
            <div style={{ color: s.fg, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            <div style={{ color: KIT.text, fontSize: 12, fontWeight: 700, marginTop: 3 }}>{s.value}</div>
            <div style={{ color: KIT.muted, fontSize: 9.5, lineHeight: 1.3, marginTop: 3 }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────
// OwnershipLedgerEntry — same transfer, different role lens.
// Resident sees the buy side; Provider sees the sell side.
// Compliance status is identical on both: pending until cleared.
// ─────────────────────────────────────────────────────────────
function OwnershipLedgerEntry({ lens = 'resident' }) {
  // One canonical pending transfer
  const tx = {
    asset: 'Riverside Apartments · provider asset',
    pct: 8,
    priceKes: 96000,
    submitted: 'Apr 18',
    compliance: 'pending',
    effectivePeriod: 'May settlement',
  };
  const isResident = lens === 'resident';
  return (
    <GlassCard>
      <Label>Ownership ledger</Label>
      <div style={{ color: KIT.text, fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 5 }}>
        {isResident ? 'Your pending purchase' : 'Pending share sale'}
      </div>
      <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.45, marginTop: 5 }}>
        Transfers affect future settlement periods only after payment clears and compliance checks pass.
      </div>
      <div style={{ marginTop: 12, border: `1px solid ${KIT.border}`, borderRadius: 14, overflow: 'hidden' }}>
        {[
          { label: 'Asset',     value: tx.asset },
          { label: isResident ? 'Buying' : 'Selling', value: `${tx.pct}% of provider-side cashflows` },
          { label: 'Price',     value: `KSh ${tx.priceKes.toLocaleString()}` },
          { label: 'Submitted', value: tx.submitted },
          { label: 'Compliance', value: tx.compliance, tone: 'warn' },
          { label: 'Effective',  value: tx.effectivePeriod },
        ].map((r, i) => (
          <div key={r.label} style={{
            padding: '9px 11px',
            background: i % 2 === 0 ? KIT.white : KIT.sky,
            borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
            display: 'flex', justifyContent: 'space-between', gap: 10,
          }}>
            <div style={{ color: KIT.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{r.label}</div>
            <div style={{ color: r.tone ? toneFg(r.tone) : KIT.text, fontSize: 11, fontWeight: 600, textAlign: 'right' }}>{r.value}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────
// TariffComparison — resident-side: "you would have paid X on grid,
// you paid Y here." Pulled into Resident Usage.
// ─────────────────────────────────────────────────────────────
function TariffComparison() {
  const b = window.MOCK; const view = b.roleViews.resident;
  const gridOnly = Math.round(view.savingsKes + view.averagePrepaidBalanceKes);
  const here = view.averagePrepaidBalanceKes;
  return (
    <GlassCard>
      <Label>Tariff comparison · this month</Label>
      <div style={{ color: KIT.text, fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 5 }}>
        You paid less by buying solar first
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
        <div style={{ borderRadius: 14, border: `1px solid ${KIT.border}`, padding: 12, background: KIT.sky }}>
          <div style={{ color: KIT.muted, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Grid-only</div>
          <div style={{ color: KIT.text, fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginTop: 4 }}>KSh {gridOnly.toLocaleString()}</div>
          <div style={{ color: KIT.muted, fontSize: 10.5, lineHeight: 1.4, marginTop: 4 }}>What you'd have paid at grid rates.</div>
        </div>
        <div style={{ borderRadius: 14, border: `1px solid ${KIT.green}40`, padding: 12, background: KIT.green + '08' }}>
          <div style={{ color: KIT.green, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>With e.mappa</div>
          <div style={{ color: KIT.green, fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginTop: 4 }}>KSh {here.toLocaleString()}</div>
          <div style={{ color: KIT.muted, fontSize: 10.5, lineHeight: 1.4, marginTop: 4 }}>Solar-first · grid covers the rest.</div>
        </div>
      </div>
      <div style={{
        marginTop: 10, borderRadius: 12, padding: 10,
        background: KIT.green + '0A', border: `1px solid ${KIT.green}25`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ color: KIT.muted, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>You saved</div>
        <div style={{ color: KIT.green, fontSize: 16, fontWeight: 700 }}>KSh {view.savingsKes.toLocaleString()}</div>
      </div>
    </GlassCard>
  );
}

Object.assign(window, {
  BuildingPulse, KillSwitchBanner, SettlementWaterfall,
  SoldVsWaste, OwnershipLedgerEntry, TariffComparison,
  ROLE_TINT,
});
