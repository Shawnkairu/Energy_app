import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  PanResponder,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
} from 'react-native';
import Svg, {
  Path,
  Polygon,
  Rect,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  G,
  Text as SvgText,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ProvidersStackParamList,
  MainTabParamList,
} from '../navigation/AppNavigator';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { repository } from '../api/repository';
import { ProviderInfo } from '../types';

// ── White background + terracotta accents ──
const O = {
  bg: '#FFFFFF',
  surface: '#F3F3F3',
  surfaceLift: '#FFFFFF',
  text: '#111111',
  textMuted: 'rgba(17,17,17,0.55)',
  textFaint: 'rgba(17,17,17,0.2)',
  accent: '#D4654A',
  accentMid: '#C4553A',
  accentDeep: '#8F3A28',
  accentGlow: 'rgba(212,101,74,0.18)',
  borderHair: 'rgba(0,0,0,0.08)',
};

const RELIABILITY_BY_NAME: Record<string, number> = {
  GreenLight: 83,
  BrightSolar: 79,
  SolarOne: 72,
  NovaEnergy: 94,
  SunStream: 92,
  RayPower: 78,
};

/** Orange family — 3D bar (highlight → body → depth) */
const BAR_COLORS = [
  { hi: '#FFD4C4', front: '#E0785C', deep: '#B85A42', side: '#8A3D2A', top: '#F8A890' },
  { hi: '#FFCABA', front: '#D4654A', deep: '#A84832', side: '#7A3224', top: '#E8886E' },
  { hi: '#FFC0B0', front: '#C4553A', deep: '#983828', side: '#6A2818', top: '#DC745C' },
  { hi: '#FFB6A6', front: '#B84A32', deep: '#883820', side: '#5C2214', top: '#D06850' },
  { hi: '#FFAC9C', front: '#A8432E', deep: '#783018', side: '#501C10', top: '#C45C44' },
  { hi: '#FFA292', front: '#983A28', deep: '#682818', side: '#44180C', top: '#B8503C' },
];

const CARD_W = 210;
const CARD_GAP = 14;
const KPLC_REF = 0.22;

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

type Weights = { cost: number; capacity: number; reliability: number };

type ProviderRow = {
  name: string;
  price: number;
  capacity: number;
  reliability: number;
};

function mapFromRepo(list: ProviderInfo[]): ProviderRow[] {
  return list.map((p) => ({
    name: p.provider,
    price: p.price_per_kwh,
    capacity: p.capacity_kwh,
    reliability: RELIABILITY_BY_NAME[p.provider] ?? 80,
  }));
}

function computeAllocations(providers: ProviderRow[], weights: Weights): number[] {
  if (providers.length === 0) return [];
  const prices = providers.map((p) => p.price);
  const caps = providers.map((p) => p.capacity);
  const rels = providers.map((p) => p.reliability);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const minC = Math.min(...caps);
  const maxC = Math.max(...caps);
  const minR = Math.min(...rels);
  const maxR = Math.max(...rels);

  const scores = providers.map((p) => {
    const cst = maxP === minP ? 0.5 : (maxP - p.price) / (maxP - minP);
    const cap = maxC === minC ? 0.5 : (p.capacity - minC) / (maxC - minC);
    const rel = maxR === minR ? 0.5 : (p.reliability - minR) / (maxR - minR);
    return (
      (weights.cost / 100) * cst +
      (weights.capacity / 100) * cap +
      (weights.reliability / 100) * rel
    );
  });
  const total = scores.reduce((a, b) => a + b, 0);
  if (total === 0) return providers.map(() => Math.floor(100 / providers.length));
  const raw = scores.map((s) => (s / total) * 100);
  const fl = raw.map(Math.floor);
  const rem = 100 - fl.reduce((a, b) => a + b, 0);
  raw
    .map((r, i) => [r - fl[i], i] as const)
    .sort((a, b) => b[0] - a[0])
    .slice(0, rem)
    .forEach(([, i]) => {
      fl[i]++;
    });
  return fl;
}

function sparkline(seed: number) {
  const pts: [number, number][] = [];
  for (let x = 0; x <= 200; x += 16) {
    const y = Math.max(
      4,
      Math.min(
        40,
        20 + Math.sin(x * 0.1 + seed) * 8 + Math.sin(x * 0.07 + seed * 0.3) * 5
      )
    );
    pts.push([x, y]);
  }
  const line = 'M ' + pts.map((p) => p.join(',')).join(' L ');
  const area = line + ` L ${pts[pts.length - 1][0]},44 L 0,44 Z`;
  return { line, area };
}

function shortName(name: string) {
  return name.replace('Solar', 'Sol').replace('Energy', 'Nrg');
}

function chartLabel(name: string) {
  const s = shortName(name);
  return s.length > 9 ? `${s.slice(0, 8)}…` : s;
}

type TriPt = { x: number; y: number };

function pointInTriangle(mx: number, my: number, a: TriPt, b: TriPt, c: TriPt): boolean {
  const sign = (p1: TriPt, p2: TriPt, p3: TriPt) =>
    (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  const p: TriPt = { x: mx, y: my };
  const d1 = sign(p, a, b);
  const d2 = sign(p, b, c);
  const d3 = sign(p, c, a);
  const hasNeg = d1 < -1e-6 || d2 < -1e-6 || d3 < -1e-6;
  const hasPos = d1 > 1e-6 || d2 > 1e-6 || d3 > 1e-6;
  return !(hasNeg && hasPos);
}

function closestOnSegment(p: TriPt, a: TriPt, b: TriPt): TriPt {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const lenSq = abx * abx + aby * aby;
  if (lenSq < 1e-9) return a;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq));
  return { x: a.x + t * abx, y: a.y + t * aby };
}

function closestPointInTriangle(p: TriPt, a: TriPt, b: TriPt, c: TriPt): TriPt {
  if (pointInTriangle(p.x, p.y, a, b, c)) return p;
  const pAB = closestOnSegment(p, a, b);
  const pBC = closestOnSegment(p, b, c);
  const pCA = closestOnSegment(p, c, a);
  const d2 = (q: TriPt) => (p.x - q.x) ** 2 + (p.y - q.y) ** 2;
  const dAB = d2(pAB);
  const dBC = d2(pBC);
  const dCA = d2(pCA);
  if (dAB <= dBC && dAB <= dCA) return pAB;
  if (dBC <= dCA) return pBC;
  return pCA;
}

function ProviderCard({
  provider,
  index,
  allocation,
  isActive,
  onBuyTokens,
}: {
  provider: ProviderRow;
  index: number;
  allocation: number;
  isActive: boolean;
  onBuyTokens: () => void;
}) {
  const savings = Math.round((1 - provider.price / KPLC_REF) * 100);
  const spark = useMemo(
    () => sparkline(provider.reliability * 17 + provider.price * 1000),
    [provider.reliability, provider.price]
  );

  return (
    <View style={[cardStyles.wrap, isActive && cardStyles.wrapActive]}>
      <View style={cardStyles.headerRow}>
        <Text style={cardStyles.providerTitle} numberOfLines={1}>
          {provider.name}
        </Text>
        <Text style={[cardStyles.allocPill, { fontFamily: mono }]}>{allocation}%</Text>
      </View>
      <View style={cardStyles.sparkWrap}>
        <Svg width="100%" height={48} viewBox="0 0 200 44" preserveAspectRatio="none">
          <Defs>
            <SvgLinearGradient id={`sg${index}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={O.accent} stopOpacity={0.22} />
              <Stop offset="100%" stopColor={O.accent} stopOpacity={0} />
            </SvgLinearGradient>
          </Defs>
          <Path d="M0,36 L200,36" stroke={O.textFaint} strokeWidth={0.5} strokeDasharray="3 5" />
          <Path d={spark.area} fill={`url(#sg${index})`} />
          <Path
            d={spark.line}
            fill="none"
            stroke={O.accent}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      <View style={cardStyles.priceRow}>
        <Text style={[cardStyles.priceNum, { fontFamily: mono }]}>KSh {provider.price.toFixed(2)}</Text>
        <Text style={cardStyles.priceUnit}>/kWh</Text>
      </View>
      <Text style={[cardStyles.savings, { fontFamily: mono }]}>▼ {savings}% vs grid</Text>
      <TouchableOpacity style={cardStyles.buyBtn} onPress={onBuyTokens} activeOpacity={0.88}>
        <Text style={cardStyles.buyBtnText}>Buy tokens</Text>
      </TouchableOpacity>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  wrap: {
    width: CARD_W,
    backgroundColor: O.surfaceLift,
    borderWidth: 1,
    borderColor: O.borderHair,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    marginRight: CARD_GAP,
  },
  wrapActive: {
    shadowColor: O.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  providerTitle: {
    flex: 1,
    fontWeight: '700',
    fontSize: 14,
    color: O.text,
    letterSpacing: -0.2,
  },
  allocPill: {
    fontSize: 11,
    fontWeight: '700',
    color: O.accent,
    backgroundColor: 'rgba(212,101,74,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sparkWrap: {
    marginHorizontal: -4,
    marginBottom: 8,
    height: 48,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceNum: {
    fontSize: 21,
    fontWeight: '600',
    color: O.text,
    letterSpacing: -0.5,
  },
  priceUnit: {
    fontSize: 11,
    color: O.textMuted,
    marginLeft: 4,
  },
  savings: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: O.accent,
  },
  buyBtn: {
    marginTop: 12,
    width: '100%',
    backgroundColor: O.accentMid,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buyBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.2,
  },
});

function BarChart({ allocations, providers }: { allocations: number[]; providers: ProviderRow[] }) {
  const { width: winW } = useWindowDimensions();
  const svgW = Math.min(400, Math.max(280, winW - 48));
  const padX = 14;
  const chartH = 118;
  const labelH = 30;
  const n = Math.max(providers.length, 1);
  const inner = svgW - padX * 2;
  const gap = 14;
  const barW = Math.max(22, Math.floor((inner - (n - 1) * gap) / n));
  const totalW = n * barW + (n - 1) * gap;
  const startX = padX + (inner - totalW) / 2;
  const baseY = chartH + 22;
  const svgH = baseY + labelH + 8;
  const maxA = Math.max(...allocations, 1);
  const depth = Math.min(9, Math.max(5, Math.round(barW * 0.26)));

  return (
    <Svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
      <Defs>
        {providers.map((_, i) => {
          const c = BAR_COLORS[i % BAR_COLORS.length];
          return (
            <SvgLinearGradient key={`f${i}`} id={`b${i}`} x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
              <Stop offset="0%" stopColor={c.hi} />
              <Stop offset="22%" stopColor={c.top} />
              <Stop offset="55%" stopColor={c.front} />
              <Stop offset="100%" stopColor={c.deep} />
            </SvgLinearGradient>
          );
        })}
      </Defs>
      <SvgText
        x={svgW / 2}
        y={14}
        textAnchor="middle"
        fontSize={10}
        fontWeight="600"
        fill={O.textFaint}
        letterSpacing={1.2}
      >
        ALLOCATION
      </SvgText>
      {providers.map((p, i) => {
        const h = Math.max(10, (allocations[i] / maxA) * chartH);
        const x = startX + i * (barW + gap);
        const y = baseY - h;
        const c = BAR_COLORS[i % BAR_COLORS.length];
        const nm = chartLabel(p.name);
        const cx = x + barW / 2;
        const skew = depth * 0.52;
        const ptsRight = `${x + barW},${y} ${x + barW + depth},${y - skew} ${x + barW + depth},${baseY - skew} ${x + barW},${baseY}`;
        const ptsTop = `${x},${y} ${x + depth},${y - skew} ${x + barW + depth},${y - skew} ${x + barW},${y}`;
        const floorShadow = `${x + 2},${baseY + 1} ${x + barW + depth - 1},${baseY + 1} ${x + barW + depth + 2},${baseY + 3} ${x},${baseY + 3}`;
        return (
          <G key={p.name}>
            <Polygon points={floorShadow} fill="#000" opacity={0.08} />
            <Polygon points={ptsRight} fill={c.side} opacity={0.92} />
            <Rect x={x} y={y} width={barW} height={h} fill={`url(#b${i})`} rx={2} ry={2} />
            <Polygon points={ptsTop} fill={c.top} opacity={0.98} />
            <SvgText
              x={cx}
              y={y - skew - 8}
              textAnchor="middle"
              fontFamily={mono}
              fontSize={12}
              fontWeight="700"
              fill={O.accentMid}
            >
              {allocations[i]}%
            </SvgText>
            <SvgText
              x={cx}
              y={baseY + 14}
              textAnchor="middle"
              fontSize={8.5}
              fontWeight="600"
              fill={O.textMuted}
            >
              {nm}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

const TRI_SZ = 288;
const TX = TRI_SZ / 2;
const TY = TRI_SZ / 2 + 6;
const TR = 94;

const VERTS = [
  { x: TX, y: TY - TR, key: 'cost' as const, label: 'Cost' },
  { x: TX - TR * 0.87, y: TY + TR * 0.5, key: 'capacity' as const, label: 'Capacity' },
  { x: TX + TR * 0.87, y: TY + TR * 0.5, key: 'reliability' as const, label: 'Uptime' },
];

const TRI_A: TriPt = { x: VERTS[0].x, y: VERTS[0].y };
const TRI_B: TriPt = { x: VERTS[1].x, y: VERTS[1].y };
const TRI_C: TriPt = { x: VERTS[2].x, y: VERTS[2].y };

const SUN_HIT = 22;

function bary(w: Weights) {
  return {
    x: VERTS[0].x * (w.cost / 100) + VERTS[1].x * (w.capacity / 100) + VERTS[2].x * (w.reliability / 100),
    y: VERTS[0].y * (w.cost / 100) + VERTS[1].y * (w.capacity / 100) + VERTS[2].y * (w.reliability / 100),
  };
}

function xyToW(mx: number, my: number): Weights {
  const [v0, v1, v2] = VERTS;
  const d = (v1.y - v2.y) * (v0.x - v2.x) + (v2.x - v1.x) * (v0.y - v2.y);
  let w0 = ((v1.y - v2.y) * (mx - v2.x) + (v2.x - v1.x) * (my - v2.y)) / d;
  let w1 = ((v2.y - v0.y) * (mx - v2.x) + (v0.x - v2.x) * (my - v2.y)) / d;
  let w2 = 1 - w0 - w1;
  w0 = Math.max(0.05, Math.min(0.9, w0));
  w1 = Math.max(0.05, Math.min(0.9, w1));
  w2 = Math.max(0.05, Math.min(0.9, w2));
  const sum = w0 + w1 + w2;
  const c = Math.round((w0 / sum) * 100);
  const ca = Math.round((w1 / sum) * 100);
  return { cost: c, capacity: ca, reliability: 100 - c - ca };
}

function Triangle({
  weights,
  onChange,
  onScrollLock,
}: {
  weights: Weights;
  onChange: (w: Weights) => void;
  onScrollLock?: (locked: boolean) => void;
}) {
  const pt = bary(weights);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onScrollLockRef = useRef(onScrollLock);
  onScrollLockRef.current = onScrollLock;

  const applyRef = useRef((x: number, y: number) => {
    const q = closestPointInTriangle({ x, y }, TRI_A, TRI_B, TRI_C);
    onChangeRef.current(xyToW(q.x, q.y));
  });

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        return pointInTriangle(locationX, locationY, TRI_A, TRI_B, TRI_C);
      },
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        onScrollLockRef.current?.(true);
        const { locationX, locationY } = e.nativeEvent;
        applyRef.current(locationX, locationY);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        applyRef.current(locationX, locationY);
      },
      onPanResponderRelease: () => {
        onScrollLockRef.current?.(false);
      },
      onPanResponderTerminate: () => {
        onScrollLockRef.current?.(false);
      },
    })
  ).current;

  const labelPos = [
    { top: 2 as number | undefined, left: 0, right: 0, alignItems: 'center' as const },
    { bottom: 4, left: 2 },
    { bottom: 4, right: 2, alignItems: 'flex-end' as const },
  ];

  return (
    <View style={triStyles.wrap} {...pan.panHandlers} collapsable={false}>
      <View
        pointerEvents="none"
        style={[
          triStyles.sunWrap,
          {
            left: pt.x - SUN_HIT,
            top: pt.y - SUN_HIT,
            width: SUN_HIT * 2,
            height: SUN_HIT * 2,
          },
        ]}
      >
        <View style={triStyles.sunDisc}>
          <Ionicons name="sunny" size={26} color={O.accentMid} />
        </View>
      </View>

      {VERTS.map((v, i) => (
        <View
          key={v.key}
          pointerEvents="none"
          style={[triStyles.vertexLabel, labelPos[i]]}
        >
          <Text style={triStyles.vertexTitle}>{v.label}</Text>
          <Text style={[triStyles.vertexPct, { fontFamily: mono }]}>{weights[v.key]}%</Text>
        </View>
      ))}
    </View>
  );
}

const triStyles = StyleSheet.create({
  wrap: {
    position: 'relative',
    width: TRI_SZ,
    height: TRI_SZ,
    alignSelf: 'center',
    marginTop: 8,
  },
  sunWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunDisc: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(196,85,58,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: O.accentMid,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  vertexLabel: {
    position: 'absolute',
    minWidth: 76,
  },
  vertexTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: O.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  vertexPct: {
    fontSize: 17,
    fontWeight: '700',
    color: O.text,
    marginTop: 3,
    letterSpacing: -0.4,
  },
});

export function ProvidersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<ProvidersStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [weights, setWeights] = useState<Weights>({ cost: 40, capacity: 30, reliability: 30 });
  const [activeCard, setActiveCard] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const list = repository.defaultProviders();
    const sorted = [...list].sort((a, b) => a.price_per_kwh - b.price_per_kwh);
    setProviders(mapFromRepo(sorted));
    setLoading(false);
  }, []);

  const allocations = useMemo(
    () => computeAllocations(providers, weights),
    [providers, weights]
  );

  const blended = useMemo(() => {
    if (providers.length === 0) return 0;
    return providers.reduce((s, p, i) => s + p.price * (allocations[i] / 100), 0);
  }, [providers, allocations]);

  const savingsPct = Math.round((1 - blended / KPLC_REF) * 100);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.min(
      Math.round(x / (CARD_W + CARD_GAP)),
      Math.max(0, providers.length - 1)
    );
    setActiveCard(idx);
  }, [providers.length]);

  const goBuyPower = useCallback(() => {
    const parent = navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
    parent?.navigate('HomeStack', { screen: 'BuyPower' });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={O.accent} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={scrollEnabled}
      >
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }} />
            <Text style={styles.h1}>Providers</Text>
            <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('Trading')}
                activeOpacity={0.75}
                accessibilityLabel="Trade energy"
              >
                <Ionicons name="swap-horizontal" size={20} color={O.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.blendedCard}>
          <View style={styles.blendedGlow} />
          <View style={{ flex: 1 }}>
            <Text style={styles.blendedLabel}>Blended rate</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={[styles.blendedNum, { fontFamily: mono }]}>KSh {blended.toFixed(2)}</Text>
              <Text style={styles.blendedUnit}>/kWh</Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Text style={[styles.badgeText, { fontFamily: mono }]}>↓ {savingsPct}% vs KPLC</Text>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Sources</Text>
          <Text style={styles.sectionHint}>Swipe</Text>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.hScroll}
          decelerationRate="fast"
          snapToInterval={CARD_W + CARD_GAP}
          snapToAlignment="start"
        >
          {providers.map((p, i) => (
            <ProviderCard
              key={p.name}
              provider={p}
              index={i}
              allocation={allocations[i] ?? 0}
              isActive={i === activeCard}
              onBuyTokens={goBuyPower}
            />
          ))}
          <View style={{ width: 8 }} />
        </ScrollView>

        <View style={styles.dots}>
          {providers.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                scrollRef.current?.scrollTo({ x: i * (CARD_W + CARD_GAP), animated: true });
                setActiveCard(i);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.dot, i === activeCard ? styles.dotActive : styles.dotIdle]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 28 }} />

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Your mix</Text>
          <Text style={styles.sectionHint}>From weights</Text>
        </View>

        <View style={styles.softBlock}>
          <BarChart allocations={allocations} providers={providers} />
          <View style={styles.legendRow}>
            {providers.map((p, i) => (
              <View key={p.name} style={styles.legendItem}>
                <View
                  style={[styles.legendSwatch, { backgroundColor: BAR_COLORS[i % BAR_COLORS.length].front }]}
                />
                <Text style={[styles.legendPrice, { fontFamily: mono }]}>KSh {p.price.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.sectionHead, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>Optimize</Text>
          <Text style={styles.sectionHint}>Sun</Text>
        </View>

        <View style={styles.softBlock}>
          <Text style={styles.optimizeHint}>Drag the sun between cost, capacity & uptime</Text>
          <Triangle weights={weights} onChange={setWeights} onScrollLock={(locked) => setScrollEnabled(!locked)} />
        </View>

        <TouchableOpacity
          style={styles.tradeBtn}
          onPress={() => navigation.navigate('Trading')}
          activeOpacity={0.88}
        >
          <Ionicons name="swap-horizontal" size={20} color="#FFF" />
          <Text style={styles.tradeBtnText}>Trade energy</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: O.bg,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: O.bg,
  },
  scrollView: {
    flex: 1,
    backgroundColor: O.bg,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: O.bg,
  },
  header: {
    paddingHorizontal: 22,
    paddingBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSide: {
    flex: 1,
  },
  h1: {
    fontSize: 17,
    fontWeight: '700',
    color: O.text,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: O.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blendedCard: {
    marginHorizontal: 22,
    marginTop: 10,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    backgroundColor: O.bg,
    borderWidth: 1,
    borderColor: O.borderHair,
  },
  blendedGlow: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: O.accentGlow,
    opacity: 0.5,
  },
  blendedLabel: {
    fontSize: 10,
    color: O.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '600',
    marginBottom: 6,
  },
  blendedNum: {
    fontSize: 28,
    fontWeight: '700',
    color: O.text,
    letterSpacing: -0.8,
  },
  blendedUnit: {
    fontSize: 12,
    color: O.textMuted,
    marginLeft: 6,
  },
  badge: {
    backgroundColor: 'rgba(212,101,74,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  badgeText: {
    color: O.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHead: {
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: O.text,
    letterSpacing: -0.4,
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: '600',
    color: O.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  hScroll: {
    paddingHorizontal: 22,
    paddingBottom: 4,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: 14,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: O.accent,
  },
  dotIdle: {
    width: 5,
    backgroundColor: O.textFaint,
  },
  softBlock: {
    marginHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 20,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 14,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 7,
    height: 7,
    borderRadius: 2,
  },
  legendPrice: {
    fontSize: 11,
    color: O.textMuted,
    fontWeight: '600',
  },
  optimizeHint: {
    textAlign: 'center',
    fontSize: 13,
    color: O.textMuted,
    marginBottom: 6,
    fontWeight: '500',
  },
  tradeBtn: {
    marginHorizontal: 22,
    marginTop: 8,
    marginBottom: 6,
    backgroundColor: O.accentMid,
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tradeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.2,
  },
});
