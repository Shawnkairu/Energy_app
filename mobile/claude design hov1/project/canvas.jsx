// canvas.jsx — Pan/zoom world with absolutely-placed phone screens
// and an SVG wire layer connecting screens to common screens.
//
// Exposes:  <WorldCanvas world={{w,h}} bg=...>{children}</WorldCanvas>
//           <Phone id label x y w h roleColor>{children}</Phone>
//           <Wire from={'id'} to={'id'} dashed?  color? label? />
//           <SwimLane x y w h title color />
//           <Annotation x y title body />
//
// All screens register their bbox (in world coords) into a context so the
// wire layer can draw curved connectors between them automatically.

const WorldCtx = React.createContext(null);

const PHONE_W = 320;
const PHONE_H = 700;
const BEZEL = 10;

function WorldCanvas({ world = { w: 6400, h: 4400 }, bg, children }) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({ x: 0, y: 0, scale: 1 });

  // registry of phone bboxes (in world coords) — ref-based to avoid feedback loops.
  // Bump `boxesVersion` once per microtask after register/unregister so the wire
  // layer rerenders, but child Phones don't see ctx identity flip.
  const boxesRef = React.useRef({});
  const [boxesVersion, setBoxesVersion] = React.useState(0);
  const bumpQueued = React.useRef(false);
  const queueBump = React.useCallback(() => {
    if (bumpQueued.current) return;
    bumpQueued.current = true;
    queueMicrotask(() => { bumpQueued.current = false; setBoxesVersion(v => v + 1); });
  }, []);
  const register = React.useCallback((id, box) => {
    const prev = boxesRef.current[id];
    if (prev && prev.x === box.x && prev.y === box.y && prev.w === box.w && prev.h === box.h) return;
    boxesRef.current = { ...boxesRef.current, [id]: box };
    queueBump();
  }, [queueBump]);
  const unregister = React.useCallback((id) => {
    if (!(id in boxesRef.current)) return;
    const n = { ...boxesRef.current }; delete n[id];
    boxesRef.current = n;
    queueBump();
  }, [queueBump]);
  const boxes = boxesRef.current; // read-only view; identity changes only via version bump

  const apply = React.useCallback(() => {
    const { x, y, scale } = tf.current;
    if (worldRef.current) worldRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);

  // Initial fit: center horizontally, top-aligned with margin
  React.useEffect(() => {
    const vp = vpRef.current; if (!vp) return;
    const r = vp.getBoundingClientRect();
    const fit = Math.min(r.width / world.w, r.height / world.h) * 0.92;
    tf.current = { scale: fit, x: (r.width - world.w * fit) / 2, y: 60 };
    apply();
  }, [world.w, world.h, apply]);

  React.useEffect(() => {
    const vp = vpRef.current; if (!vp) return;

    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left, py = cy - r.top;
      const t = tf.current;
      const ns = Math.min(2.5, Math.max(0.08, t.scale * factor));
      const k = ns / t.scale;
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = ns;
      apply();
    };

    const onWheel = (e) => {
      e.preventDefault();
      // Trackpad pinch (ctrlKey) → zoom; mouse wheel → zoom; 2-finger scroll → pan
      if (e.ctrlKey || e.metaKey) {
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else {
        // pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    let dragging = false; let last = { x: 0, y: 0 };
    const onPointerDown = (e) => {
      // start pan only on background or middle button
      const onBg = e.target === vp || e.target === worldRef.current;
      if (!onBg && e.button !== 1) return;
      dragging = true; last = { x: e.clientX, y: e.clientY };
      vp.setPointerCapture(e.pointerId);
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = (e) => {
      if (!dragging) return;
      tf.current.x += e.clientX - last.x;
      tf.current.y += e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      apply();
    };
    const onPointerUp = () => { dragging = false; vp.style.cursor = 'grab'; };

    vp.addEventListener('wheel', onWheel, { passive: false });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply]);

  // Reset / fit handler exposed via key
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === '0' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const vp = vpRef.current; if (!vp) return;
        const r = vp.getBoundingClientRect();
        const fit = Math.min(r.width / world.w, r.height / world.h) * 0.92;
        tf.current = { scale: fit, x: (r.width - world.w * fit) / 2, y: 60 };
        apply();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [apply, world.w, world.h]);

  return (
    <WorldCtx.Provider value={{ register, unregister, boxes, world }}>
      <div ref={vpRef} style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        background: bg || TOKENS.canvas,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${TOKENS.canvasGrid} 1px, transparent 0)`,
        backgroundSize: '32px 32px',
        cursor: 'grab', touchAction: 'none',
      }}>
        <div ref={worldRef} style={{
          position: 'absolute', top: 0, left: 0,
          width: world.w, height: world.h,
          transformOrigin: '0 0',
        }}>
          {/* Wires layer (drawn first so it sits behind screens) */}
          <WireLayer />
          {children}
        </div>
      </div>
    </WorldCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// Wires
// ─────────────────────────────────────────────────────────────
const WiresCtx = React.createContext(null);

function WireLayer() {
  const { boxes, world } = React.useContext(WorldCtx);
  const [wires, setWires] = React.useState([]);
  const ctx = React.useMemo(() => ({
    add: (w) => setWires((ws) => [...ws.filter(x => x.key !== w.key), w]),
    remove: (key) => setWires((ws) => ws.filter(x => x.key !== key)),
  }), []);
  // expose via window so wires registered later can find the layer
  React.useEffect(() => { window.__wireLayer = ctx; }, [ctx]);

  return (
    <svg width={world.w} height={world.h} style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible',
    }}>
      <defs>
        {/* arrow markers per role color */}
        {Object.values(ROLES).map((r) => (
          <marker key={r.wire} id={`arrow-${r.wire.replace('#','')}`}
            viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7"
            orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={r.wire} />
          </marker>
        ))}
        <marker id="arrow-shared" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={TOKENS.cocoa} />
        </marker>
      </defs>
      {wires.map((w) => {
        const a = boxes[w.from]; const b = boxes[w.to];
        if (!a || !b) return null;
        return <WirePath key={w.key} a={a} b={b} {...w} />;
      })}
    </svg>
  );
}

function WirePath({ a, b, color = TOKENS.cocoa, dashed, label, side = 'auto' }) {
  // pick best edge mid-points based on relative positions
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  let p1, p2;
  const dx = bc.x - ac.x, dy = bc.y - ac.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) { p1 = { x: a.x + a.w, y: ac.y }; p2 = { x: b.x, y: bc.y }; }
    else        { p1 = { x: a.x, y: ac.y };       p2 = { x: b.x + b.w, y: bc.y }; }
  } else {
    if (dy > 0) { p1 = { x: ac.x, y: a.y + a.h }; p2 = { x: bc.x, y: b.y }; }
    else        { p1 = { x: ac.x, y: a.y };       p2 = { x: bc.x, y: b.y + b.h }; }
  }
  // Curved Bézier — push control points along the exit/entry direction
  const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const k = Math.min(220, len * 0.45);
  const horizontal = Math.abs(dx) > Math.abs(dy);
  const c1 = horizontal ? { x: p1.x + (dx > 0 ? k : -k), y: p1.y } : { x: p1.x, y: p1.y + (dy > 0 ? k : -k) };
  const c2 = horizontal ? { x: p2.x + (dx > 0 ? -k : k), y: p2.y } : { x: p2.x, y: p2.y + (dy > 0 ? -k : k) };
  const d = `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`;
  const mark = `arrow-${color.replace('#','')}`;
  // midpoint of cubic at t=0.5
  const mid = {
    x: 0.125 * p1.x + 0.375 * c1.x + 0.375 * c2.x + 0.125 * p2.x,
    y: 0.125 * p1.y + 0.375 * c1.y + 0.375 * c2.y + 0.125 * p2.y,
  };

  return (
    <g>
      {/* halo */}
      <path d={d} fill="none" stroke={TOKENS.canvas} strokeWidth="8" opacity="0.9" />
      <path d={d} fill="none" stroke={color} strokeWidth="2.2"
            strokeDasharray={dashed ? '6 6' : 'none'}
            markerEnd={`url(#${mark})`}
            opacity="0.9" />
      {label && (
        <g transform={`translate(${mid.x}, ${mid.y})`}>
          <rect x="-44" y="-12" width="88" height="22" rx="11"
                fill={TOKENS.canvas} stroke={color} strokeOpacity="0.35" />
          <text x="0" y="3" textAnchor="middle"
                fontFamily="Inter, system-ui" fontSize="11" fontWeight="600"
                fill={color}>{label}</text>
        </g>
      )}
    </g>
  );
}

// Declarative wire registration — children of WorldCanvas
function Wire({ from, to, color, dashed, label }) {
  const key = `${from}->${to}`;
  React.useEffect(() => {
    const layer = window.__wireLayer; if (!layer) return;
    layer.add({ key, from, to, color, dashed, label });
    return () => layer.remove(key);
  }, [key, from, to, color, dashed, label]);
  return null;
}

// ─────────────────────────────────────────────────────────────
// SwimLane — labeled colored band
// ─────────────────────────────────────────────────────────────
function SwimLane({ x, y, w, h, title, subtitle, color = TOKENS.cocoa, soft }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      pointerEvents: 'none',
    }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 28,
        background: soft || 'rgba(255,255,255,0.45)',
        border: `1.5px dashed ${color}33`,
      }} />
      <div style={{
        position: 'absolute', left: 32, top: 24,
        display: 'flex', alignItems: 'baseline', gap: 16,
      }}>
        <div style={{
          fontWeight: 700, fontSize: 44, letterSpacing: '-0.03em',
          color, lineHeight: 1,
        }}>{title}</div>
        {subtitle && <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12, color: TOKENS.inkSoft, letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>{subtitle}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Phone — iOS-ish rounded device frame placed at world (x,y)
// Children render inside the screen viewport. Registers its bbox
// for the wire layer.
// ─────────────────────────────────────────────────────────────
function Phone({ id, x, y, label, sublabel, role = 'shared', children, dark = false, w = PHONE_W, h = PHONE_H, frameColor }) {
  const ref = React.useRef(null);
  const ctx = React.useContext(WorldCtx);
  const fullW = w + BEZEL * 2;
  const fullH = h + BEZEL * 2 + 36; // +label area below

  React.useEffect(() => {
    if (!ctx) return;
    ctx.register(id, { x, y, w: fullW, h: fullH - 36 }); // box around device only (excl. label)
    return () => ctx.unregister(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, x, y, fullW, fullH]);

  const roleSpec = ROLES[role] || ROLES.shared;

  return (
    <div ref={ref} data-screen-label={`${roleSpec.name} · ${label}`} style={{
      position: 'absolute', left: x, top: y, width: fullW,
      pointerEvents: 'auto',
    }}>
      {/* Device frame */}
      <div style={{
        width: fullW, height: h + BEZEL * 2,
        borderRadius: 44,
        background: dark ? '#1a0e04' : '#FFFFFF',
        boxShadow: `
          0 1px 0 rgba(255,255,255,0.6) inset,
          0 24px 60px -28px rgba(71,23,8,0.45),
          0 6px 18px -10px rgba(71,23,8,0.25),
          0 0 0 1.5px ${frameColor || roleSpec.color}22
        `,
        padding: BEZEL,
      }}>
        <div style={{
          width: w, height: h, borderRadius: 36,
          background: dark ? '#0F0700' : TOKENS.screenBg,
          overflow: 'auto', position: 'relative',
          scrollbarWidth: 'thin',
        }}>
          {children}
        </div>
      </div>
      {/* Label tag below */}
      <div style={{
        marginTop: 12, display: 'flex', alignItems: 'center', gap: 10,
        paddingLeft: 8,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: 999,
          background: roleSpec.color,
        }} />
        <div style={{
          fontFamily: 'Inter, system-ui', fontSize: 13, fontWeight: 600,
          color: TOKENS.ink, letterSpacing: '-0.005em',
        }}>{label}</div>
        {sublabel && <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5,
          color: TOKENS.inkMute, letterSpacing: '0.08em', textTransform: 'uppercase',
          marginLeft: 'auto', paddingRight: 8,
        }}>{sublabel}</div>}
      </div>
    </div>
  );
}

// Status bar (light by default, very small)
function StatusBar({ dark = false, time = '9:41' }) {
  const c = dark ? '#fff' : '#1A0E04';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 22px 6px', height: 36,
      fontFamily: '-apple-system, system-ui', fontWeight: 600, fontSize: 14,
      color: c,
    }}>
      <span>{time}</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <svg width="16" height="10" viewBox="0 0 18 12">
          <rect x="0" y="7" width="3" height="5" rx="0.6" fill={c}/>
          <rect x="5" y="4.5" width="3" height="7.5" rx="0.6" fill={c}/>
          <rect x="10" y="2" width="3" height="10" rx="0.6" fill={c}/>
          <rect x="15" y="0" width="3" height="12" rx="0.6" fill={c}/>
        </svg>
        <svg width="14" height="10" viewBox="0 0 16 12">
          <path d="M8 3.2c2.2 0 4.2.9 5.6 2.4l1.1-1.1A8.9 8.9 0 0 0 8 1.5c-2.6 0-5 1.2-6.7 3l1.1 1.1A7.7 7.7 0 0 1 8 3.2z" fill={c}/>
          <path d="M8 6.7c1.3 0 2.5.5 3.4 1.4l1.1-1.1A6.2 6.2 0 0 0 8 5.1c-1.6 0-3.1.7-4.4 1.9l1.1 1.1A4.7 4.7 0 0 1 8 6.7z" fill={c}/>
          <circle cx="8" cy="10.3" r="1.4" fill={c}/>
        </svg>
        <svg width="22" height="10" viewBox="0 0 26 12">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke={c} strokeOpacity="0.5" fill="none"/>
          <rect x="2" y="2" width="14" height="8" rx="1.6" fill={c}/>
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Annotation — small Postit / sticky note
// ─────────────────────────────────────────────────────────────
function Annotation({ x, y, w = 240, title, body, kind = 'note' }) {
  const colors = {
    note:    { bg: '#F1E0C5', text: TOKENS.ink, border: PALETTE.scarf_oat },
    insight: { bg: '#FBE8D8', text: PALETTE.rust_brown, border: PALETTE.fox_orange },
    rule:    { bg: '#FFFFFF', text: TOKENS.ink, border: PALETTE.deep_wood },
  }[kind];
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w,
      background: colors.bg, borderRadius: 14,
      padding: '14px 16px',
      border: `1px solid ${colors.border}33`,
      boxShadow: '0 6px 16px -10px rgba(71,23,8,0.3)',
      fontFamily: 'Inter, system-ui',
    }}>
      {title && <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: colors.border, marginBottom: 6,
      }}>{title}</div>}
      <div style={{
        fontSize: 13, lineHeight: 1.5, color: colors.text, fontWeight: 500,
      }}>{body}</div>
    </div>
  );
}

Object.assign(window, { WorldCanvas, Phone, Wire, SwimLane, Annotation, StatusBar, PHONE_W, PHONE_H });
