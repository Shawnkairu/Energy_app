// screen-primitives.jsx — shared UI building blocks for mock screens
// Tiny, opinionated components matching the e.mappa warm palette.

const SCREEN_PAD = 18;

// Generic page chrome ────────────────────────────────────────
function Page({ children, bg, dark = false, time = '9:41', noStatus = false, scroll = false }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: bg || (dark ? '#0F0700' : TOKENS.screenBg),
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: dark ? TOKENS.cream : TOKENS.ink,
      overflow: 'hidden',
    }}>
      {!noStatus && <StatusBar dark={dark} time={time} />}
      <div style={{
        flex: 1, padding: `4px ${SCREEN_PAD}px ${SCREEN_PAD}px`,
        overflow: scroll ? 'auto' : 'hidden',
      }}>{children}</div>
    </div>
  );
}

function PageHeader({ title, sub, right, big = false, dark = false, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      paddingBottom: 14,
    }}>
      <div>
        {sub && <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: accent || TOKENS.accent,
          marginBottom: 4,
        }}>{sub}</div>}
        <div style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontWeight: 600,
          fontSize: big ? 30 : 22, letterSpacing: '-0.02em',
          color: dark ? TOKENS.cream : TOKENS.ink, lineHeight: 1.05,
        }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

function NavBar({ title, back = true, right, dark = false }) {
  const c = dark ? TOKENS.cream : TOKENS.ink;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 0 12px', minHeight: 30,
    }}>
      {back ? <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: c, fontWeight: 500 }}>
        <svg width="10" height="14" viewBox="0 0 10 14" fill="none"><path d="M8 2 L2 7 L8 12" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div> : <div />}
      <div style={{ fontWeight: 600, fontSize: 14, color: c }}>{title}</div>
      {right || <div style={{ width: 16 }} />}
    </div>
  );
}

// Cards & rows ──────────────────────────────────────────────
function Card({ children, style = {}, pad = 16, dark = false }) {
  return (
    <div style={{
      background: dark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
      border: dark ? '1px solid rgba(228,198,164,0.10)' : `1px solid ${TOKENS.hairline}`,
      borderRadius: 18,
      padding: pad,
      boxShadow: dark ? 'none' : '0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 22px -16px rgba(71,23,8,0.18)',
      ...style,
    }}>{children}</div>
  );
}

function Row({ children, style = {}, gap = 10 }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap, ...style }}>{children}</div>;
}

function Stack({ children, gap = 10, style = {} }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>{children}</div>;
}

// Pills, chips, dots ─────────────────────────────────────────
function Pill({ children, color = TOKENS.accent, soft, kind = 'soft' }) {
  const fg = color;
  const bg = soft || (kind === 'soft' ? color + '1A' : color);
  return <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em',
    color: kind === 'solid' ? '#fff' : fg,
    background: bg,
    padding: '4px 9px', borderRadius: 999,
  }}>{children}</span>;
}

function Dot({ color = TOKENS.accent, size = 7 }) {
  return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: 999, background: color }} />;
}

// Buttons ────────────────────────────────────────────────────
function Button({ children, primary, dark, full = false, small = false, color }) {
  const bg = primary ? (color || TOKENS.accent) : (dark ? 'rgba(255,255,255,0.06)' : '#FFFFFF');
  const fg = primary ? '#FFF8EC' : (dark ? TOKENS.cream : TOKENS.ink);
  const border = primary ? 'transparent' : (dark ? 'rgba(228,198,164,0.18)' : TOKENS.hairline);
  return <div style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: full ? '100%' : 'auto',
    padding: small ? '8px 14px' : '12px 18px',
    background: bg, color: fg,
    border: `1px solid ${border}`,
    borderRadius: 999,
    fontSize: small ? 12 : 13.5, fontWeight: 600,
    letterSpacing: '-0.005em',
  }}>{children}</div>;
}

// Stat + metric ──────────────────────────────────────────────
function Metric({ label, value, unit, sub, color, big = false }) {
  return (
    <div>
      {label && <div style={{
        fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: TOKENS.inkMute, marginBottom: 4,
      }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600,
          fontSize: big ? 32 : 22, letterSpacing: '-0.02em',
          color: color || TOKENS.ink,
        }}>{value}</span>
        {unit && <span style={{ fontSize: 12, color: TOKENS.inkSoft, fontWeight: 500 }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 11, color: TOKENS.inkSoft, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// Tab bar (bottom) ───────────────────────────────────────────
function TabBar({ tabs, active = 0, dark = false, accent = TOKENS.accent }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: dark ? 'rgba(15,7,0,0.92)' : 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderTop: dark ? '1px solid rgba(228,198,164,0.08)' : `1px solid ${TOKENS.hairlineSoft}`,
      padding: '8px 0 18px',
      display: 'flex', justifyContent: 'space-around',
    }}>
      {tabs.map((t, i) => (
        <div key={i} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          color: i === active ? accent : (dark ? '#7B6A55' : TOKENS.inkMute),
          fontSize: 10, fontWeight: 600,
        }}>
          <div style={{
            width: 22, height: 22, display: 'grid', placeItems: 'center',
          }}>{t.icon}</div>
          <div>{t.label}</div>
        </div>
      ))}
    </div>
  );
}

// Tiny icons (line, 18px box) ────────────────────────────────
const I = {
  home: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  bolt: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 2 4 14h7l-1 8 9-12h-7z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" fill="none"/></svg>,
  battery: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="16" height="10" rx="2" stroke={c} strokeWidth="1.5"/><rect x="20" y="11" width="2" height="4" rx="0.5" fill={c}/></svg>,
  sun: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke={c} strokeWidth="1.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  grid: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 21l3-12 4 12M19 21l-3-12-4 12M3 21h18M9 5h6l-2 4h-2z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  user: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.5"/><path d="M4 21c1-4 5-6 8-6s7 2 8 6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  bell: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 17h12l-1.5-2v-4a4.5 4.5 0 0 0-9 0v4z M10 20a2 2 0 0 0 4 0" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  wallet: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="3" stroke={c} strokeWidth="1.5"/><path d="M3 10h18M16 14h2" stroke={c} strokeWidth="1.5"/></svg>,
  chart: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 19h16M5 16l4-5 4 3 6-8" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bldg: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 21V5l8-3 8 3v16M9 21v-5h6v5M8 9h2M14 9h2M8 13h2M14 13h2" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  list: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  cog: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  search: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6" stroke={c} strokeWidth="1.5"/><path d="m20 20-4-4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  check: (c='currentColor') => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-11" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  briefcase: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="13" rx="2" stroke={c} strokeWidth="1.5"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" stroke={c} strokeWidth="1.5"/></svg>,
  truck: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  wrench: (c='currentColor') => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 7a4 4 0 0 1-5 5L4 17l3 3 5-5a4 4 0 0 1 5-5l-2-2 3-3 1 1-3 3z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/></svg>,
};

// Sparkline / chart helpers ──────────────────────────────────
// Simple line chart with optional area + dots
function MiniChart({ values, w = 280, h = 80, color = TOKENS.accent, fill, dashed, dotEnd = true, baseline = false }) {
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return [x, y];
  });
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = d + ` L ${w} ${h} L 0 ${h} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {fill && <path d={area} fill={fill} opacity="0.5" />}
      {baseline && <line x1="0" x2={w} y1={h - 4} y2={h - 4} stroke={TOKENS.hairline} strokeWidth="1"/>}
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"
            strokeDasharray={dashed ? '4 3' : 'none'} />
      {dotEnd && <circle cx={last[0]} cy={last[1]} r="3" fill={color} />}
    </svg>
  );
}

// Bars
function MiniBars({ values, w = 280, h = 60, color = TOKENS.accent, soft }) {
  const max = Math.max(...values) || 1;
  const bw = w / values.length - 4;
  return (
    <svg width={w} height={h}>
      {values.map((v, i) => {
        const bh = (v / max) * (h - 8);
        return <rect key={i} x={i * (bw + 4)} y={h - bh - 2} width={bw} height={bh} rx="2"
          fill={i === values.length - 1 ? color : (soft || color + '40')} />;
      })}
    </svg>
  );
}

// Avatar circle
function Avatar({ name = 'A', size = 36, color = TOKENS.caramel }) {
  return <div style={{
    width: size, height: size, borderRadius: 999, background: color,
    display: 'grid', placeItems: 'center',
    color: TOKENS.espresso, fontWeight: 700, fontSize: size * 0.42,
    fontFamily: 'Fraunces, Georgia, serif',
  }}>{name[0]}</div>;
}

// Progress bar
function Progress({ value = 0.5, color = TOKENS.accent, h = 6, label, right }) {
  return (
    <div>
      {(label || right) && <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
        {label && <span style={{ fontSize: 11.5, color: TOKENS.inkSoft, fontWeight: 500 }}>{label}</span>}
        {right && <span style={{ fontSize: 11.5, color: TOKENS.ink, fontWeight: 600 }}>{right}</span>}
      </Row>}
      <div style={{ height: h, background: TOKENS.screenSubtle, borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${Math.round(value * 100)}%`, height: '100%', background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
}

Object.assign(window, {
  Page, PageHeader, NavBar, Card, Row, Stack, Pill, Dot, Button, Metric,
  TabBar, I, MiniChart, MiniBars, Avatar, Progress,
});
