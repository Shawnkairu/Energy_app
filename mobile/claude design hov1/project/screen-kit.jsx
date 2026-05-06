// ─────────────────────────────────────────────────────────────
// screen-kit.jsx
//
// Faithful HTML/CSS port of the e.mappa @emappa/ui primitives so the canvas
// can render every screen with the same content, hierarchy, and copy as the
// React Native source in components/. Every value here is taken literally
// from the .tsx files; we only fix a single mock building so conditional
// labels render deterministically.
// ─────────────────────────────────────────────────────────────

// Tokens — cool neutral whites + warm accents (Tesla-ish but warmer)
const KIT = {
  bg: '#FFFFFF',
  panel: '#FFFFFF',
  panelSoft: '#F6F6F7',
  sky: '#FAFAFB',
  white: '#FFFFFF',
  text: '#0E1011',
  textSub: '#26282B',
  muted: '#7A7E84',
  border: '#E6E7E9',
  borderStrong: '#C7CACD',
  green: '#2F7A48',
  amber: '#9C6B1E',
  red: '#A23A1F',
  orange: '#965A35',
  orangeDeep: '#693719',
  graphite: '#0E1011',
  // legacy palette names mapped to neutral surfaces so older
  // components don't paint cream backgrounds
  furCream: '#F4F4F5',
  scarfOat: '#ECECEE',
  guitarMaple: '#C99E72',
  toastedClay: '#A87349',
  plushCaramel: '#9D6B3D',
  softCinnamon: '#7E4F2A',
  studioCocoa: '#5A3A20',
  warmUmbar: '#3E2814',
  deepWood: '#0E1011',
  foxOrange: '#D27A3A',
};

const tone = {
  good: { bg: KIT.green + '14', fg: KIT.green },
  warn: { bg: KIT.amber + '14', fg: KIT.amber },
  bad:  { bg: KIT.red + '14',   fg: KIT.red },
  neutral: { bg: '#F1E8DA', fg: KIT.text },
};

const toneFg = (t = 'neutral') =>
  t === 'good' ? KIT.green : t === 'warn' ? KIT.amber : t === 'bad' ? KIT.red : KIT.text;

// ── Atoms ────────────────────────────────────────────────────
function Pill({ tone: t = 'neutral', children, style }) {
  const c = tone[t] || tone.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      borderRadius: 999, padding: '4px 10px',
      fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em',
      background: c.bg, color: c.fg, border: `1px solid ${c.fg}30`,
      whiteSpace: 'nowrap', textTransform: 'uppercase',
      ...style,
    }}>{children}</span>
  );
}

function Label({ children }) {
  return <div style={{
    color: KIT.muted, fontSize: 10, fontWeight: 700,
    letterSpacing: '0.14em', textTransform: 'uppercase',
  }}>{children}</div>;
}

function GlassCard({ children, style }) {
  return <div style={{
    background: KIT.panel,
    borderRadius: 22,
    padding: 14,
    border: `1px solid ${KIT.border}`,
    boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 18px -16px rgba(71,23,8,0.18)',
    marginBottom: 12,
    ...style,
  }}>{children}</div>;
}

function PaletteCard({ children, style, padding = 14, borderRadius = 22, accent = false }) {
  return <div style={{
    background: `linear-gradient(135deg, ${KIT.panel} 0%, ${KIT.scarfOat}50 100%)`,
    borderRadius, padding, border: `1px solid ${KIT.border}`,
    marginBottom: 12,
    ...(accent ? { borderLeft: `3px solid ${KIT.foxOrange}88`, paddingLeft: padding + 5 } : {}),
    ...style,
  }}>{children}</div>;
}

function AppMark({ size = 22 }) {
  return <div style={{
    width: size, height: size, borderRadius: 7,
    background: `linear-gradient(135deg, ${KIT.foxOrange} 0%, ${KIT.studioCocoa} 100%)`,
    color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    letterSpacing: '-0.02em', fontWeight: 600, fontSize: size * 0.55,
  }}>e</div>;
}

// ── Header (section pill, role workspace label, AppMark, title, subtitle) ──
function ScreenHeader({ section, roleLabel, title, subtitle }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Pill>{section}</Pill>
          <div style={{
            color: KIT.muted, fontSize: 10, fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 9,
          }}>{roleLabel}</div>
        </div>
        <AppMark size={22} />
      </div>
      <h1 style={{
        margin: '14px 0 6px',
        color: KIT.text, letterSpacing: '-0.02em',
        fontWeight: 600, fontSize: 26, letterSpacing: '-0.03em', lineHeight: 1.05,
      }}>{title}</h1>
      <p style={{
        margin: 0, color: KIT.muted, fontSize: 12, lineHeight: 1.5,
      }}>{subtitle}</p>
    </div>
  );
}

// ── Action rail (3 chips, first chip is the primary) ─────────
function ActionRail({ actions, primaryStyle = 'orange' }) {
  // RoleDashboardScaffold uses bordered orange first; OwnerScreenShell uses dark-fill.
  const isDark = primaryStyle === 'dark';
  return (
    <div style={{
      display: 'flex', gap: 8, marginTop: 14, marginBottom: 14,
      overflowX: 'auto', scrollbarWidth: 'none',
    }}>
      {actions.map((a, i) => {
        const primary = i === 0;
        return (
          <span key={a} style={{
            flex: '0 0 auto',
            borderRadius: 999, padding: '8px 13px',
            fontSize: 11, fontWeight: 600,
            border: `1px solid ${primary ? (isDark ? KIT.graphite : KIT.orangeDeep) : KIT.border}`,
            background: primary && isDark ? KIT.graphite : KIT.panel,
            color: primary ? (isDark ? '#fff' : KIT.orangeDeep) : KIT.text,
          }}>{a}</span>
        );
      })}
    </div>
  );
}

// ── Hero metric card (label / big value / sub) ───────────────
function HeroCard({ label, value, sub, status, statusTone = 'neutral', ownerStyle = false }) {
  return (
    <PaletteCard padding={18} borderRadius={28} accent={ownerStyle}>
      <div style={{ color: KIT.muted, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{
        color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600,
        fontSize: ownerStyle ? 30 : 28, letterSpacing: '-0.04em', marginTop: 7, lineHeight: 1.02,
      }}>{value}</div>
      <div style={{ color: KIT.muted, fontSize: 12, lineHeight: 1.45, marginTop: 6 }}>{sub}</div>
      {status ? <div style={{ marginTop: 10 }}><Pill tone={statusTone}>{status}</Pill></div> : null}
    </PaletteCard>
  );
}

// ── Brief card with rows (eyebrow + title + body + striped row table) ──
function BriefCard({ eyebrow, title, body, rows, framed = true }) {
  return (
    <GlassCard>
      <Label>{eyebrow}</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em', marginTop: 5 }}>{title}</div>
      {body && <div style={{ color: KIT.muted, fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>{body}</div>}
      {rows && (
        <div style={{
          marginTop: 12,
          border: framed ? `1px solid ${KIT.border}` : 'none',
          borderRadius: 16, overflow: 'hidden',
        }}>
          {rows.map((r, i) => (
            <div key={i} style={{
              padding: 10,
              background: i % 2 === 0 ? KIT.panel : KIT.sky,
              borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ color: KIT.muted, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{r.label}</div>
                <div style={{ color: toneFg(r.tone), fontSize: 11.5, fontWeight: 600, flexShrink: 0 }}>{r.value}</div>
              </div>
              <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 4 }}>{r.note}</div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

// ── KPI Row (compact, 3-up) ──────────────────────────────────
function KpiRow({ items }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      {items.map((it) => (
        <PaletteCard key={it.label} padding={11} borderRadius={20} style={{ flex: 1, marginBottom: 0 }}>
          <div style={{ height: 2, background: KIT.scarfOat + '88', borderRadius: 2, marginBottom: 8 }} />
          <div style={{ color: KIT.muted, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{it.label}</div>
          <div style={{ color: KIT.text, fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>{it.value}</div>
          <div style={{ color: KIT.muted, fontSize: 10, lineHeight: 1.35, marginTop: 4 }}>{it.note}</div>
        </PaletteCard>
      ))}
    </div>
  );
}

// ── Mini grid (2-up) ─────────────────────────────────────────
function MiniGrid({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
      {items.map((it) => (
        <div key={it.label} style={{
          background: KIT.panel,
          border: `1px solid ${it.tone ? toneFg(it.tone) + '50' : KIT.border}`,
          borderRadius: 18, padding: 12,
        }}>
          <Label>{it.label}</Label>
          <div style={{ color: KIT.text, fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>{it.value}</div>
          {it.detail && <div style={{ color: KIT.muted, fontSize: 10.5, lineHeight: 1.4, marginTop: 5 }}>{it.detail}</div>}
        </div>
      ))}
    </div>
  );
}

// ── Workflow / Action list ───────────────────────────────────
function WorkflowCard({ eyebrow = 'Owner workflow', title, items }) {
  return (
    <GlassCard>
      <Label>{eyebrow}</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em', marginTop: 5 }}>{title}</div>
      <div style={{ marginTop: 8 }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: KIT.text, fontSize: 12, fontWeight: 600 }}>{it.label}</div>
              <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 3 }}>{it.detail}</div>
            </div>
            <Pill tone={it.tone || 'neutral'}>{it.status}</Pill>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Progress bar card (multiple rows) ────────────────────────
function ProgressCard({ title, rows, eyebrow = 'Readiness inputs' }) {
  return (
    <GlassCard>
      <Label>{eyebrow}</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em', marginTop: 5 }}>{title}</div>
      <div style={{ marginTop: 10 }}>
        {rows.map((r) => (
          <div key={r.label} style={{ marginBottom: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ color: KIT.text, fontSize: 11.5, fontWeight: 600 }}>{r.label}</div>
              <div style={{ color: toneFg(r.tone), fontSize: 11.5, fontWeight: 600 }}>{Math.round(r.value)}%</div>
            </div>
            <div style={{ height: 7, borderRadius: 999, background: KIT.panelSoft, marginTop: 6 }}>
              <div style={{ height: 7, width: `${Math.max(0, Math.min(100, r.value))}%`, borderRadius: 999, background: toneFg(r.tone) }} />
            </div>
            <div style={{ color: KIT.muted, fontSize: 10.5, lineHeight: 1.4, marginTop: 4 }}>{r.detail}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Single 1-up progress bar (resident) ──────────────────────
function ProgressBar({ label, value, caption }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ color: KIT.text, fontSize: 12, fontWeight: 600 }}>{label}</div>
        <div style={{ color: KIT.text, fontSize: 12, fontWeight: 600 }}>{Math.round(value * 100)}%</div>
      </div>
      <div style={{ height: 10, borderRadius: 999, background: KIT.sky, marginTop: 6, border: `1px solid ${KIT.border}`, overflow: 'hidden' }}>
        <div style={{ height: 10, width: `${value * 100}%`, background: KIT.borderStrong, borderRadius: 999 }} />
      </div>
      <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 6 }}>{caption}</div>
    </div>
  );
}

// ── Gate list / Activation gates / Readiness gates ───────────
function GateList({ gates, title = 'Deployment Gates' }) {
  const completeCount = gates.filter((g) => g.complete).length;
  return (
    <GlassCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Label>Readiness</Label>
          <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>{title}</div>
        </div>
        <Pill tone={completeCount === gates.length ? 'good' : 'warn'}>{completeCount}/{gates.length}</Pill>
      </div>
      <div style={{ marginTop: 10 }}>
        {gates.map((g, i) => (
          <div key={g.label} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 999,
              border: `1px solid ${g.complete ? KIT.green : KIT.red}`,
              background: g.complete ? KIT.green + '18' : KIT.red + '12',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: 999, background: g.complete ? KIT.green : KIT.red }} />
            </div>
            <div style={{ flex: 1, color: KIT.text, fontSize: 11.5, fontWeight: 600 }}>{g.label}</div>
            <div style={{ color: g.complete ? KIT.green : KIT.red, fontSize: 11, fontWeight: 600 }}>
              {g.complete ? 'Ready' : 'Blocked'}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Score artifact (DRS dial) ────────────────────────────────
function ScoreArtifact({ score, label, decision, components, blockers, decisionTone = 'good' }) {
  return (
    <GlassCard>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0 10px' }}>
        <div style={{
          width: 130, height: 130, borderRadius: 999,
          border: `2px solid ${KIT.deepWood}33`,
          background: KIT.furCream + '40',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ color: KIT.text, fontSize: 36, letterSpacing: '-0.02em', fontWeight: 600, letterSpacing: '-0.05em' }}>{score}</div>
          <div style={{ color: KIT.muted, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>/ 100 DRS</div>
        </div>
        <div style={{ marginTop: 10 }}><Pill tone={decisionTone}>{decision}</Pill></div>
        <div style={{ color: KIT.text, fontSize: 14, fontWeight: 600, marginTop: 8 }}>{label}</div>
        <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.45, marginTop: 5, textAlign: 'center' }}>
          DRS gates capital release, supplier lock, installer scheduling, and go-live.
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 8 }}>
        {components.map((c) => (
          <div key={c.label} style={{
            background: KIT.scarfOat + '20',
            border: `1px solid ${KIT.toastedClay}40`,
            borderRadius: 14, padding: 8,
          }}>
            <div style={{ color: KIT.muted, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.label}</div>
            <div style={{ color: toneFg(c.tone), fontSize: 14, fontWeight: 600, marginTop: 4 }}>{Math.round(c.value)}%</div>
          </div>
        ))}
      </div>
      {blockers && (
        <div style={{ marginTop: 10 }}>
          {blockers.map((b) => (
            <div key={b} style={{
              background: KIT.red + '10', border: `1px solid ${KIT.red}30`,
              borderRadius: 12, padding: 8, marginTop: 6,
              color: KIT.red, fontSize: 11, fontWeight: 600,
            }}>{b}</div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

// ── Royalty card (big payout + delta dial + 4 stat tiles) ────
function RoyaltyCard({ royalty, benchmark, sold, utilization, waste }) {
  const delta = (royalty / benchmark - 1) * 100;
  const positive = delta >= 0;
  return (
    <GlassCard>
      <Label>Projected monthly royalty</Label>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontSize: 28, fontWeight: 600, letterSpacing: '-0.04em' }}>{royalty}</div>
          <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 5 }}>Paid only from prepaid solar that is sold and settled.</div>
        </div>
        <div style={{
          width: 70, height: 70, borderRadius: 999,
          background: KIT.guitarMaple + '24',
          border: `1px solid ${KIT.softCinnamon}55`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ color: positive ? KIT.green : KIT.red, fontSize: 16, fontWeight: 600 }}>{positive ? '+' : ''}{Math.round(delta)}%</div>
          <div style={{ color: KIT.muted, fontSize: 8.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>vs median</div>
        </div>
      </div>
      <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.45, marginTop: 8 }}>
        Generated-but-unused, curtailed, or free-exported energy is excluded from owner payout.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 12 }}>
        {[
          { label: 'Median', value: benchmark },
          { label: 'Sold kWh', value: sold },
          { label: 'Utilization', value: utilization, tone: 'good' },
          { label: 'Waste', value: waste, tone: 'warn' },
        ].map((s) => (
          <div key={s.label} style={{
            background: KIT.furCream + '24',
            border: `1px solid ${KIT.plushCaramel}3A`,
            borderRadius: 14, padding: 9,
          }}>
            <div style={{ color: KIT.muted, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            <div style={{ color: s.tone ? toneFg(s.tone) : KIT.text, fontSize: 12, fontWeight: 600, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Token artifact (resident wallet) ─────────────────────────
function TokenArtifact({ balance, topUp, fundedRatio }) {
  return (
    <GlassCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <Label>Prepaid token</Label>
          <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontSize: 21, fontWeight: 600, letterSpacing: '-0.03em', marginTop: 5 }}>Solar allocation pass</div>
        </div>
        <Pill tone="good">cash first</Pill>
      </div>
      <div style={{
        marginTop: 12, borderRadius: 18, padding: 12,
        background: `linear-gradient(135deg, ${KIT.panelSoft} 0%, ${KIT.furCream}40 100%)`,
        border: `1px solid ${KIT.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: KIT.muted, fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Balance</div>
            <div style={{ color: KIT.text, fontSize: 24, letterSpacing: '-0.02em', fontWeight: 600, letterSpacing: '-0.04em', marginTop: 4 }}>{balance}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: KIT.muted, fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Suggested</div>
            <div style={{ color: KIT.text, fontSize: 14, fontWeight: 600, marginTop: 5 }}>{topUp}</div>
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: KIT.sky, marginTop: 14, border: `1px solid ${KIT.border}`, overflow: 'hidden' }}>
          <div style={{ height: 8, width: `${fundedRatio * 100}%`, background: KIT.borderStrong, borderRadius: 999 }} />
        </div>
        <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 6 }}>
          Allocation opens only after top-up cash clears and local solar is sold.
        </div>
      </div>
    </GlassCard>
  );
}

// ── Energy flow circle + 3 sources (resident usage) ──────────
function EnergyFlowGraphic({ coverage, solar, battery, grid }) {
  return (
    <GlassCard>
      <Label>Monthly source map</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 21, letterSpacing: '-0.03em', marginTop: 5, lineHeight: 1.15 }}>
        {Math.round(coverage * 100)}% of the home ran on sold solar
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
        <div style={{
          width: 110, height: 110, borderRadius: 999,
          border: `2px solid ${KIT.borderStrong}`,
          background: `radial-gradient(${KIT.sky} 50%, ${KIT.plushCaramel}44 100%)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ color: KIT.text, fontSize: 26, letterSpacing: '-0.02em', fontWeight: 600, letterSpacing: '-0.05em' }}>{Math.round(coverage * 100)}%</div>
          <div style={{ color: KIT.muted, fontSize: 10, fontWeight: 600, marginTop: 2 }}>solar cover</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        {[
          { label: 'Solar', value: solar }, { label: 'Battery', value: battery }, { label: 'Grid', value: grid },
        ].map((it) => (
          <div key={it.label} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: 2, width: 22, background: KIT.guitarMaple + '88', borderRadius: 2, margin: '0 auto 6px' }} />
            <div style={{ color: KIT.text, fontSize: 11, fontWeight: 600 }}>{it.label}</div>
            <div style={{ color: KIT.muted, fontSize: 10.5, marginTop: 3 }}>{it.value}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Numbered flow lane (resident usage) ──────────────────────
function FlowLane({ steps }) {
  return (
    <GlassCard>
      <Label>Energy flow</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5, lineHeight: 1.15 }}>Solar first, fallback clearly labeled</div>
      <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.45, marginTop: 6 }}>A simple source map for household power, not a wallet or ownership summary.</div>
      <div style={{
        marginTop: 12, borderRadius: 20, padding: 10,
        background: `linear-gradient(135deg, ${KIT.panelSoft} 0%, ${KIT.furCream}30 100%)`,
        border: `1px solid ${KIT.border}`,
      }}>
        {steps.map((s, i) => (
          <div key={s.label} style={{
            display: 'flex', gap: 10, padding: '10px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 999,
              background: KIT.sky,
              border: `1px solid ${s.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.color, fontSize: 12, fontWeight: 600, flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: KIT.text, fontSize: 12, fontWeight: 600 }}>{s.label}</div>
                <div style={{ color: KIT.text, fontSize: 12, fontWeight: 600 }}>{s.value}</div>
              </div>
              <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 3 }}>{s.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Ownership primer (resident ownership) ────────────────────
function OwnershipPrimer({ share, payout }) {
  return (
    <GlassCard>
      <Label>Future cashflow education</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 21, letterSpacing: '-0.03em', marginTop: 5, lineHeight: 1.15 }}>
        Optional ownership, never required for solar use
      </div>
      <div style={{
        marginTop: 12, paddingLeft: 11, paddingTop: 4, paddingBottom: 4, borderRadius: 4,
        borderLeft: `3px solid ${KIT.foxOrange}99`, background: KIT.furCream + '20',
      }}>
        {[
          { label: 'Current resident pool', value: share, note: 'Share of future provider-side cashflows in this demo.' },
          { label: 'Projected pool payout', value: payout, note: 'Only from monetized solar, not wasted or free-exported energy.' },
          { label: 'Transfer caveat', value: 'future only', note: 'Buying or selling changes future payout periods after payment clears.' },
        ].map((it) => (
          <div key={it.label} style={{ padding: '9px 0' }}>
            <div style={{ color: KIT.muted, fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{it.label}</div>
            <div style={{ color: KIT.text, fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 3 }}>{it.value}</div>
            <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 3 }}>{it.note}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Resident identity card / privacy boundary ────────────────
function IdentityCard({ buildingName, location, units, trustReady, privacyNote }) {
  return (
    <GlassCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Label>Resident membership</Label>
          <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontSize: 21, fontWeight: 600, letterSpacing: '-0.03em', marginTop: 5 }}>{buildingName}</div>
          <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.45, marginTop: 6 }}>{location} · {units} homes · one verified resident session.</div>
        </div>
        <Pill tone={trustReady ? 'good' : 'warn'}>{trustReady ? 'verified' : 'review'}</Pill>
      </div>
      <div style={{
        marginTop: 12, borderRadius: 18, padding: 10,
        border: `1px solid ${KIT.border}`,
        background: `linear-gradient(135deg, ${KIT.panelSoft} 0%, ${KIT.furCream}30 100%)`,
      }}>
        <div style={{ color: KIT.text, fontSize: 12, fontWeight: 600 }}>Privacy boundary</div>
        <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.45, marginTop: 5 }}>{privacyNote}</div>
      </div>
    </GlassCard>
  );
}

// ── Trust list (resident profile) ────────────────────────────
function TrustList({ title, items }) {
  return (
    <GlassCard>
      <Label>Trust checklist</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>{title}</div>
      <div style={{ marginTop: 8 }}>
        {items.map((it, i) => (
          <div key={it.label} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: KIT.text, fontSize: 12, fontWeight: 600 }}>{it.label}</div>
              <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 3 }}>{it.detail}</div>
            </div>
            <Pill tone={it.tone || 'neutral'}>{it.status}</Pill>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Support triage (resident support) ────────────────────────
function SupportTriage({ items, hasBlocker, blocker }) {
  return (
    <GlassCard>
      <Label>Simple triage</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 21, letterSpacing: '-0.03em', marginTop: 5, lineHeight: 1.15 }}>Pick one issue type</div>
      <div style={{ marginTop: 10 }}>
        {items.map((it, i) => (
          <div key={it.label} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 999, background: KIT.white,
              border: `1px solid ${KIT.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: KIT.text, fontSize: 11, fontWeight: 600,
            }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: KIT.text, fontSize: 12, fontWeight: 600 }}>{it.label}</div>
              <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 3 }}>{it.detail}</div>
            </div>
            <Pill>{it.status}</Pill>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 8, borderRadius: 16, padding: 10,
        border: `1px solid ${KIT.border}`,
        background: `linear-gradient(135deg, ${KIT.panelSoft} 0%, ${KIT.furCream}30 100%)`,
      }}>
        <div style={{ color: KIT.text, fontSize: 12, fontWeight: 600 }}>{hasBlocker ? 'Building readiness note' : 'No building blocker visible'}</div>
        <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 4 }}>{hasBlocker ? blocker : 'Support can stay focused on the household issue.'}</div>
      </div>
    </GlassCard>
  );
}

// ── Owner command card (snapshot with stage / progress / stats) ──
function CommandCard({ buildingName, units, locationBand, stage, decisionStatus, decisionTone, participation, prepaidMonths, gateText, royaltyText }) {
  return (
    <GlassCard>
      <Label>Building command snapshot</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>{buildingName}</div>
      <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.45, marginTop: 5 }}>{units} units in {locationBand}. Owner decisions focus on access, resident trust, and the next deployment handoff.</div>
      <div style={{
        marginTop: 12, borderRadius: 18, padding: 12,
        background: KIT.furCream + '2A',
        border: `1px solid ${KIT.plushCaramel}45`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ color: KIT.muted, fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current lane</div>
            <div style={{ color: KIT.text, fontSize: 18, letterSpacing: '-0.02em', fontWeight: 600, letterSpacing: '-0.03em', marginTop: 4 }}>{stage}</div>
          </div>
          <Pill tone={decisionTone}>{decisionStatus}</Pill>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: KIT.panelSoft, marginTop: 12 }}>
          <div style={{ height: 6, width: `${participation * 100}%`, background: participation >= 0.8 ? KIT.green : KIT.amber, borderRadius: 999 }} />
        </div>
        <div style={{ color: KIT.muted, fontSize: 10.5, lineHeight: 1.45, marginTop: 6 }}>{Math.round(participation * 100)}% resident participation, {prepaidMonths} prepaid month(s) covered.</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        {[{ label: 'Gates', value: gateText, tone: 'good' }, { label: 'Royalty', value: royaltyText, tone: 'neutral' }].map((s) => (
          <div key={s.label} style={{
            flex: 1, background: KIT.guitarMaple + '16',
            border: `1px solid ${KIT.warmUmbar}2E`,
            borderRadius: 14, padding: 10,
          }}>
            <div style={{ color: KIT.muted, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
            <div style={{ color: toneFg(s.tone), fontSize: 13, fontWeight: 600, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Owner journey card (stepper) ─────────────────────────────
function JourneyCard({ title, items }) {
  return (
    <GlassCard>
      <Label>Deployment journey</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>{title}</div>
      <div style={{ marginTop: 12 }}>
        {items.map((it, i) => (
          <div key={it.label} style={{ display: 'flex', gap: 10, paddingBottom: i === items.length - 1 ? 0 : 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 22, height: 22, borderRadius: 999,
                border: `1px solid ${toneFg(it.tone)}`, background: toneFg(it.tone) + '14',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 7, height: 7, borderRadius: 999, background: toneFg(it.tone) }} />
              </div>
              {i < items.length - 1 && <div style={{ flex: 1, width: 1, background: KIT.border, marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ color: KIT.text, fontSize: 12, fontWeight: 600, flex: 1 }}>{it.label}</div>
                <Pill tone={it.tone || 'neutral'}>{it.status}</Pill>
              </div>
              <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 4 }}>{it.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Generic single big metric tile ───────────────────────────
function BigMetric({ label, value, detail }) {
  return (
    <GlassCard>
      <Label>{label}</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 24, letterSpacing: '-0.03em', marginTop: 6 }}>{value}</div>
      {detail && <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 6 }}>{detail}</div>}
    </GlassCard>
  );
}

// ── Generic rows card ────────────────────────────────────────
function RowsCard({ title, eyebrow, rows }) {
  return (
    <GlassCard>
      <Label>{eyebrow || 'Detail'}</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>{title}</div>
      <div style={{ marginTop: 8 }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: KIT.text, fontSize: 11.5, fontWeight: 600 }}>{r.label}</div>
              <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 3 }}>{r.note}</div>
            </div>
            <Pill tone={r.tone}>{r.value}</Pill>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Truth card (single eyebrow + title + body) ───────────────
function TruthCard({ eyebrow = 'Truth', title, body, tone: t }) {
  return (
    <GlassCard style={t === 'warn' ? { borderColor: KIT.amber + '40' } : t === 'good' ? { borderColor: KIT.green + '30' } : undefined}>
      <Label>{eyebrow}</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>{title}</div>
      <div style={{ color: KIT.muted, fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>{body}</div>
    </GlassCard>
  );
}

// ── Section brief (eyebrow + title + body, no rows) ──────────
function SectionBriefCard({ eyebrow, title, body }) {
  return (
    <GlassCard>
      <Label>{eyebrow}</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em', marginTop: 5 }}>{title}</div>
      <div style={{ color: KIT.muted, fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>{body}</div>
    </GlassCard>
  );
}

// ── Provider asset split (generated vs monetized vs waste) ───
function ProviderAssetSplit({ generated, monetized, waste }) {
  // generated = 100%, monetized + waste are slices
  const monPct = (parseFloat(monetized) / parseFloat(generated)) * 100;
  const wastePct = (parseFloat(waste) / parseFloat(generated)) * 100;
  return (
    <GlassCard>
      <Label>Asset split</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>Generated → monetized → waste</div>
      <div style={{ marginTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ color: KIT.text, fontSize: 11, fontWeight: 600 }}>Generated</div>
          <div style={{ color: KIT.text, fontSize: 11, fontWeight: 600 }}>{generated}</div>
        </div>
        <div style={{ height: 18, background: KIT.panelSoft, borderRadius: 999, overflow: 'hidden', display: 'flex', marginTop: 6, border: `1px solid ${KIT.border}` }}>
          <div style={{ width: `${monPct}%`, background: KIT.green, height: '100%' }} />
          <div style={{ width: `${wastePct}%`, background: KIT.amber, height: '100%' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <div style={{ color: KIT.green, fontSize: 10.5, fontWeight: 600 }}>Monetized {monetized}</div>
          <div style={{ color: KIT.amber, fontSize: 10.5, fontWeight: 600 }}>Waste {waste}</div>
        </div>
      </div>
    </GlassCard>
  );
}

// ── Provider performance flow (sold/waste/grid bars) ─────────
function ProviderPerformanceFlow({ sold, waste, grid }) {
  return (
    <GlassCard>
      <Label>Energy flow split</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>Where the kWh went</div>
      <div style={{ marginTop: 10 }}>
        {[
          { label: 'Sold solar', value: sold, color: KIT.green },
          { label: 'Waste', value: waste, color: KIT.amber },
          { label: 'Grid fallback', value: grid, color: KIT.red },
        ].map((s) => (
          <div key={s.label} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ color: KIT.text, fontSize: 11, fontWeight: 600 }}>{s.label}</div>
              <div style={{ color: s.color, fontSize: 11, fontWeight: 600 }}>{s.value}</div>
            </div>
            <div style={{ height: 6, background: KIT.panelSoft, borderRadius: 999, marginTop: 4 }}>
              <div style={{ height: 6, background: s.color, width: '70%', borderRadius: 999 }} />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Provider ownership impact (retained vs sold donut-ish) ───
function OwnershipImpact({ retained, sold }) {
  const r = parseFloat(retained); const s = parseFloat(sold);
  return (
    <GlassCard>
      <Label>Ownership impact</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>Retained vs sold rights</div>
      <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 999,
          background: `conic-gradient(${KIT.green} 0% ${r}%, ${KIT.amber} ${r}% 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 50, height: 50, borderRadius: 999, background: KIT.panel,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: KIT.text, fontSize: 13, fontWeight: 600,
          }}>{r}%</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: KIT.text, fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, background: KIT.green, borderRadius: 2 }} /> Retained {retained}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: KIT.text, fontWeight: 600, marginTop: 6 }}>
            <span style={{ width: 8, height: 8, background: KIT.amber, borderRadius: 2 }} /> Sold {sold}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ── Status strip / status rail (financier) ───────────────────
function StatusRail({ items }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      {items.map((it) => (
        <PaletteCard key={it.label} padding={11} borderRadius={20} style={{ flex: 1, marginBottom: 0 }}>
          <Pill tone={it.tone || 'neutral'}>{it.label}</Pill>
          <div style={{ color: KIT.text, fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 8 }}>{it.value}</div>
          <div style={{ color: KIT.muted, fontSize: 10.5, lineHeight: 1.4, marginTop: 4 }}>{it.note}</div>
        </PaletteCard>
      ))}
    </div>
  );
}

// ── Financier deal pipeline ──────────────────────────────────
function DealPipeline({ projects }) {
  return (
    <GlassCard>
      <Label>Pipeline</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>Named deals in screening</div>
      <div style={{ marginTop: 10 }}>
        {projects.map((p, i) => (
          <div key={i} style={{
            padding: '11px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ color: KIT.text, fontSize: 12, fontWeight: 600, flex: 1 }}>{p.name}</div>
              <Pill tone={p.tone}>{p.score}/100</Pill>
            </div>
            <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 3 }}>{p.location} · {p.units} units · {p.remaining} remaining</div>
            <div style={{ height: 5, background: KIT.panelSoft, borderRadius: 999, marginTop: 6 }}>
              <div style={{ height: 5, width: `${p.fundingProgress * 100}%`, background: KIT.green, borderRadius: 999 }} />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Diligence evidence card ──────────────────────────────────
function DiligenceCard({ items }) {
  return (
    <GlassCard>
      <Label>Diligence evidence</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>What's been verified</div>
      <div style={{ marginTop: 10 }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10, padding: '10px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
          }}>
            <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, background: toneFg(it.tone) }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: KIT.text, fontSize: 12, fontWeight: 600 }}>{it.label}</div>
              <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 3 }}>{it.detail}</div>
            </div>
            <Pill tone={it.tone}>{it.status}</Pill>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Risk case card (low/base/high) ───────────────────────────
function RiskCaseCard({ cases }) {
  return (
    <GlassCard>
      <Label>Risk cases</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>Recovery range under scenarios</div>
      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {cases.map((c) => (
          <div key={c.label} style={{
            background: toneFg(c.tone) + '14',
            border: `1px solid ${toneFg(c.tone)}40`,
            borderRadius: 14, padding: 10, textAlign: 'center',
          }}>
            <div style={{ color: KIT.muted, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.label}</div>
            <div style={{ color: toneFg(c.tone), fontSize: 14, fontWeight: 600, marginTop: 5 }}>{c.value}</div>
            <div style={{ color: KIT.muted, fontSize: 10, lineHeight: 1.35, marginTop: 4 }}>{c.note}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Site map card (installer job detail) ─────────────────────
function SiteMapCard({ access, meter, inverter, mapped }) {
  return (
    <GlassCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Label>Site map</Label>
          <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>Physical install packet</div>
          <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 5 }}>Keep field proof minimal: access, meter path, roof works, and readings.</div>
        </div>
        <Pill tone={mapped ? 'good' : 'bad'}>{mapped ? 'mapped' : 'review'}</Pill>
      </div>
      <div style={{
        position: 'relative', height: 130, marginTop: 10,
        border: `1px solid ${KIT.border}`, borderRadius: 18, background: KIT.panelSoft,
        overflow: 'hidden',
      }}>
        {/* grid lines */}
        {[20, 60, 100].map((t) => (
          <div key={t} style={{ position: 'absolute', left: 16, right: 16, top: t, height: 1, background: KIT.borderStrong + '60' }} />
        ))}
        {[60, 'right'].map((p, i) => (
          <div key={i} style={{ position: 'absolute', top: 14, bottom: 14, left: typeof p === 'number' ? p : 'auto', right: p === 'right' ? 60 : 'auto', width: 1, background: KIT.borderStrong + '60' }} />
        ))}
        {[
          { label: 'Access', value: access, x: 10, y: 14 },
          { label: 'Meter', value: meter, x: 102, y: 46 },
          { label: 'Inverter', value: inverter, x: 38, y: 86 },
        ].map((p) => (
          <div key={p.label} style={{
            position: 'absolute', left: p.x, top: p.y,
            background: KIT.white, border: `1px solid ${KIT.border}`,
            borderRadius: 8, padding: '5px 8px',
            boxShadow: '0 4px 10px -8px rgba(71,23,8,0.3)',
          }}>
            <div style={{ color: KIT.text, fontSize: 10, fontWeight: 600 }}>{p.label}</div>
            <div style={{ color: KIT.muted, fontSize: 9 }}>{p.value}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Field row ────────────────────────────────────────────────
function FieldRow({ label, value, note, valueTone }) {
  return (
    <div style={{
      borderRadius: 14, background: KIT.panelSoft + '99',
      border: `1px solid ${KIT.border}`, padding: 10, marginBottom: 6,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ color: KIT.muted, fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
        <div style={{ color: valueTone ? toneFg(valueTone) : KIT.text, fontSize: 11.5, fontWeight: 600 }}>{value}</div>
      </div>
      <div style={{ color: KIT.muted, fontSize: 10.5, lineHeight: 1.4, marginTop: 4 }}>{note}</div>
    </div>
  );
}

// ── Crew board / Service ledger / Credential packet wrapper ──
function FieldCard({ eyebrow, title, body, statusTone, statusLabel, fields }) {
  return (
    <GlassCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Label>{eyebrow}</Label>
          <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 16, marginTop: 5 }}>{title}</div>
          {body && <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 5 }}>{body}</div>}
        </div>
        {statusLabel && <Pill tone={statusTone}>{statusLabel}</Pill>}
      </div>
      <div style={{ marginTop: 10 }}>
        {fields.map((f, i) => <FieldRow key={i} {...f} />)}
      </div>
    </GlassCard>
  );
}

// ── Evidence list (commissioning checklist) ──────────────────
function EvidenceList({ title, items }) {
  return (
    <GlassCard>
      <Label>Commissioning</Label>
      <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 17, marginTop: 5 }}>{title}</div>
      <div style={{ marginTop: 10 }}>
        {items.map((it, i) => (
          <div key={it.label} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5,
              border: `1px solid ${it.complete ? KIT.green : KIT.borderStrong}`,
              background: it.complete ? KIT.green : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 11, fontWeight: 700,
            }}>{it.complete ? '✓' : ''}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: KIT.text, fontSize: 12, fontWeight: 600 }}>{it.label}</div>
              <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, marginTop: 3 }}>{it.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Supplier proof table ─────────────────────────────────────
function ProofTable({ rows }) {
  return (
    <div style={{ marginTop: 10, border: `1px solid ${KIT.border}`, borderRadius: 14, overflow: 'hidden' }}>
      {rows.map((r, i) => (
        <div key={i} style={{
          padding: 10,
          background: i % 2 === 0 ? KIT.panel : KIT.sky,
          borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ color: KIT.text, fontSize: 12, fontWeight: 600, flex: 1 }}>{r.label}</div>
            <Pill tone={r.tone}>{r.status}</Pill>
          </div>
          <div style={{ color: KIT.text, fontSize: 11, marginTop: 4 }}>{r.primary}</div>
          <div style={{ color: KIT.muted, fontSize: 10.5, lineHeight: 1.4, marginTop: 3 }}>{r.secondary}</div>
        </div>
      ))}
    </div>
  );
}

// ── Supplier bar (single progress) ───────────────────────────
function SupplierBar({ label, value, note }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ color: KIT.text, fontSize: 11.5, fontWeight: 600 }}>{label}</div>
        <div style={{ color: KIT.text, fontSize: 11.5, fontWeight: 600 }}>{value}%</div>
      </div>
      <div style={{ height: 6, background: KIT.panelSoft, borderRadius: 999, marginTop: 5 }}>
        <div style={{ height: 6, width: `${value}%`, background: value >= 80 ? KIT.green : KIT.amber, borderRadius: 999 }} />
      </div>
      <div style={{ color: KIT.muted, fontSize: 10.5, lineHeight: 1.4, marginTop: 4 }}>{note}</div>
    </div>
  );
}

// ── Supplier row (label / detail / value pill) ───────────────
function SupplierRow({ label, detail, value, tone: t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: `1px solid ${KIT.border}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: KIT.text, fontSize: 11.5, fontWeight: 600 }}>{label}</div>
        <div style={{ color: KIT.muted, fontSize: 10.5, lineHeight: 1.4, marginTop: 3 }}>{detail}</div>
      </div>
      <Pill tone={t}>{value}</Pill>
    </div>
  );
}

// Activity card (small list of strings)
function ActivityCard({ items, eyebrow = 'Activity' }) {
  return (
    <GlassCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ color: KIT.text, letterSpacing: '-0.02em', fontWeight: 600, fontSize: 15 }}>{eyebrow}</div>
        <Pill>latest</Pill>
      </div>
      {items.map((it, i) => (
        <div key={i} style={{
          display: 'flex', gap: 8, padding: '9px 0',
          borderTop: i === 0 ? 'none' : `1px solid ${KIT.border}`,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: 999, marginTop: 6, background: KIT.foxOrange + '70', border: `1px solid ${KIT.foxOrange}90`, flexShrink: 0 }} />
          <div style={{ color: KIT.muted, fontSize: 11, lineHeight: 1.4, flex: 1 }}>{it}</div>
        </div>
      ))}
    </GlassCard>
  );
}

// ── ScreenShell (container that lays it all out inside a phone) ──
function ScreenShell({ section, roleLabel, title, subtitle, actions, hero, children, dark = false, ownerStyle = false, activity }) {
  // Let content flow at its natural height — the Phone's outer device <div>
  // has overflow:auto, so the whole screen scrolls vertically when content
  // is taller than the bezel. Don't clip here.
  return (
    <div style={{
      background: KIT.bg, padding: '0 14px 24px',
      minHeight: '100%',
    }}>
      <ScreenHeader section={section} roleLabel={roleLabel} title={title} subtitle={subtitle} />
      <ActionRail actions={actions} primaryStyle={ownerStyle ? 'dark' : 'orange'} />
      <div>
        <HeroCard {...hero} ownerStyle={ownerStyle} />
        {children}
        {activity && <ActivityCard items={activity} eyebrow={`${roleLabel.split(' ')[0]} activity`} />}
      </div>
    </div>
  );
}

Object.assign(window, {
  KIT, tone, toneFg,
  Pill, Label, GlassCard, PaletteCard, AppMark,
  ScreenHeader, ActionRail, HeroCard,
  BriefCard, KpiRow, MiniGrid, WorkflowCard, ProgressCard, ProgressBar,
  GateList, ScoreArtifact, RoyaltyCard,
  TokenArtifact, EnergyFlowGraphic, FlowLane, OwnershipPrimer,
  IdentityCard, TrustList, SupportTriage,
  CommandCard, JourneyCard,
  BigMetric, RowsCard, TruthCard, SectionBriefCard,
  ProviderAssetSplit, ProviderPerformanceFlow, OwnershipImpact,
  StatusRail, DealPipeline, DiligenceCard, RiskCaseCard,
  SiteMapCard, FieldRow, FieldCard, EvidenceList,
  ProofTable, SupplierBar, SupplierRow, ActivityCard,
  ScreenShell,
});
