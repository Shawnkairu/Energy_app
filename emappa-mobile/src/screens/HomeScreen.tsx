import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { spacing, borderRadius, fontSize } from '../theme';
import { walletService } from '../services';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Simple color palette - coral accent + black text on white
const COLORS = {
  background: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#6B6B6B',
  accent: '#E07856', // coral/orange
  accentLight: '#FDF0EC',
};

// Helper to get greeting based on time
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Generate mock power usage data for the last hour (60 data points)
function generatePowerData(): number[] {
  const baseLoad = 2.0;
  const data: number[] = [];
  for (let i = 0; i < 60; i++) {
    // Simulate realistic power fluctuations
    const noise = Math.sin(i * 0.3) * 0.5 + Math.random() * 0.4 - 0.2;
    const spike = i > 45 && i < 52 ? 0.8 : 0; // afternoon spike
    data.push(Math.max(0.5, baseLoad + noise + spike));
  }
  return data;
}

// Time period options like Robinhood
const TIME_PERIODS = ['1H', '6H', '1D', '1W'] as const;
type TimePeriod = typeof TIME_PERIODS[number];

// Animated blinking sun icon component
function BlinkingSun({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }}>
      <Ionicons name="sunny" size={16} color={color} />
    </Animated.View>
  );
}

// Power usage line chart component with touch interaction
interface PowerChartProps {
  data: number[];
  accentColor: string;
  width: number;
  height: number;
  onValueChange?: (value: number | null) => void;
}

function PowerChart({ data, accentColor, width, height, onValueChange }: PowerChartProps) {
  const padding = { top: 10, bottom: 20, left: 0, right: 20 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const [touchedIndex, setTouchedIndex] = useState<number | null>(null);

  const minValue = Math.min(...data) * 0.9;
  const maxValue = Math.max(...data) * 1.1;
  const valueRange = maxValue - minValue;

  // Create SVG path
  const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
  const getY = (value: number) => padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

  // Get time label for index (assumes 1-minute intervals for 1H view)
  const getTimeLabel = (index: number) => {
    const now = new Date();
    const minutesAgo = data.length - 1 - index;
    const time = new Date(now.getTime() - minutesAgo * 60000);
    const timeStr = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
    const dateStr = time.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${timeStr}, ${dateStr}`;
  };

  // Build the line path
  let linePath = `M ${getX(0)} ${getY(data[0])}`;
  for (let i = 1; i < data.length; i++) {
    linePath += ` L ${getX(i)} ${getY(data[i])}`;
  }

  // Build the gradient fill path
  const fillPath = `${linePath} L ${getX(data.length - 1)} ${height} L ${getX(0)} ${height} Z`;

  // Current point position (last data point)
  const currentX = getX(data.length - 1);
  const currentY = getY(data[data.length - 1]);

  // Track the chart's position on screen
  const chartRef = useRef<View>(null);

  // Calculate index from local X position (relative to element)
  const getIndexFromLocalX = (localX: number) => {
    const index = Math.round(((localX - padding.left) / chartWidth) * (data.length - 1));
    return Math.max(0, Math.min(data.length - 1, index));
  };

  const handleLayout = () => {
    // Layout measured for potential future use
  };

  // Native touch event handlers
  const handleTouchStart = (e: GestureResponderEvent) => {
    const touchX = e.nativeEvent.locationX;
    const index = getIndexFromLocalX(touchX);
    setTouchedIndex(index);
    onValueChange?.(data[index]);
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    const touchX = e.nativeEvent.locationX;
    const index = getIndexFromLocalX(touchX);
    setTouchedIndex(index);
    onValueChange?.(data[index]);
  };

  const handleTouchEnd = () => {
    setTouchedIndex(null);
    onValueChange?.(null);
  };

  // Touched point position
  const touchedX = touchedIndex !== null ? getX(touchedIndex) : 0;
  const touchedY = touchedIndex !== null ? getY(data[touchedIndex]) : 0;

  return (
    <View
      ref={chartRef}
      style={{ width, height }}
      onLayout={handleLayout}
    >
      {/* SVG Chart - pointer events disabled so touches pass through */}
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={accentColor} stopOpacity={0.2} />
            <Stop offset="100%" stopColor={accentColor} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Gradient fill under the line */}
        <Path d={fillPath} fill="url(#fillGradient)" />

        {/* The line itself */}
        <Path
          d={linePath}
          stroke={accentColor}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current point - small dot */}
        <Circle
          cx={currentX}
          cy={currentY}
          r={3}
          fill={accentColor}
        />

        {/* Touched point indicator */}
        {touchedIndex !== null && (
          <>
            {/* Vertical line - solid */}
            <Path
              d={`M ${touchedX} ${padding.top + 20} L ${touchedX} ${height - padding.bottom}`}
              stroke={accentColor}
              strokeWidth={1}
              opacity={0.6}
            />
            {/* Point circle */}
            <Circle
              cx={touchedX}
              cy={touchedY}
              r={5}
              fill={accentColor}
            />
          </>
        )}
      </Svg>

      {/* Touch overlay - captures all touches using native events */}
      <View
        style={{
          position: 'absolute',
          width,
          height,
          backgroundColor: 'transparent',
        }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
        onResponderTerminate={handleTouchEnd}
      />

      {/* Blinking sun at current point */}
      <View style={[styles.blinkingSunContainer, { left: currentX - 8, top: currentY - 8 }]} pointerEvents="none">
        <BlinkingSun color={accentColor} />
      </View>

      {/* Time label when touching - simple text above the line */}
      {touchedIndex !== null && (
        <Text style={[
          styles.timeLabel,
          {
            left: Math.min(Math.max(touchedX - 60, 0), width - 120),
            top: padding.top,
          }
        ]} pointerEvents="none">
          {getTimeLabel(touchedIndex)}
        </Text>
      )}
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - in production, this comes from backend/smart meter
  const [liveData] = useState({
    currentPowerKw: 2.4,
    isOnline: true,
  });

  // Power usage time series data
  const [powerHistory] = useState(() => generatePowerData());
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1H');
  const [touchedValue, setTouchedValue] = useState<number | null>(null);

  // Display value - shows touched value while scrubbing, otherwise current
  const displayValue = touchedValue !== null ? touchedValue : liveData.currentPowerKw;

  // Chart dimensions
  const chartWidth = SCREEN_WIDTH - spacing.xl * 2;
  const chartHeight = 120;

  const [todayStats] = useState({
    consumedKwh: 12.8,
  });

  // Energy tokens (like prepaid airtime - you buy kWh)
  const [energyTokensKwh] = useState(45.2);

  const [supplyMix] = useState({
    solarPercent: 65,
    gridPercent: 35,
  });

  const [currentHost] = useState({
    name: "St. Mary's School",
    distance: '1.2 km',
  });

  const loadData = useCallback(async () => {
    await walletService.load();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.accent}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
          </Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Live Power - What you're using RIGHT NOW */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Using right now</Text>
          <View style={styles.timePeriodRow}>
            {TIME_PERIODS.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.timePeriodButton,
                  selectedPeriod === period && styles.timePeriodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text
                  style={[
                    styles.timePeriodText,
                    selectedPeriod === period && styles.timePeriodTextActive,
                  ]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Current power value */}
        <View style={styles.livePowerRow}>
          <Text style={styles.livePowerValue}>
            {displayValue.toFixed(1)}
          </Text>
          <Text style={styles.livePowerUnit}>kW</Text>
        </View>

        {/* Robinhood-style time series chart */}
        <View style={styles.chartContainer}>
          <PowerChart
            data={powerHistory}
            accentColor={COLORS.accent}
            width={chartWidth}
            height={chartHeight}
            onValueChange={setTouchedValue}
          />
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Two Stats Side by Side */}
      <View style={styles.statsRow}>
        {/* Energy Tokens - Prepaid energy you own */}
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Your energy tokens</Text>
          <Text style={styles.statValue}>
            {energyTokensKwh.toFixed(1)} <Text style={styles.statUnit}>kWh</Text>
          </Text>
        </View>

        {/* Today's Usage */}
        <View style={styles.statBlock}>
          <Text style={styles.statLabel}>Used today</Text>
          <Text style={styles.statValue}>
            {todayStats.consumedKwh.toFixed(1)} <Text style={styles.statUnit}>kWh</Text>
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Supply Mix - Where your energy comes from */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { marginBottom: spacing.md }]}>Where your energy comes from</Text>

        {/* Single progress bar showing solar vs grid */}
        <View style={styles.supplyBar}>
          <View
            style={[
              styles.supplyBarFill,
              { width: `${supplyMix.solarPercent}%` }
            ]}
          />
        </View>

        <View style={styles.supplyLabels}>
          <View style={styles.supplyLabelItem}>
            <Ionicons name="sunny" size={18} color={COLORS.accent} />
            <Text style={styles.supplyLabelText}>Solar {supplyMix.solarPercent}%</Text>
          </View>
          <View style={styles.supplyLabelItem}>
            <Ionicons name="grid-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.supplyLabelText}>Grid {supplyMix.gridPercent}%</Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Your Host */}
      <TouchableOpacity style={styles.section}>
        <Text style={[styles.sectionLabel, { marginBottom: spacing.md }]}>Your solar host</Text>
        <View style={styles.hostRow}>
          <Ionicons name="location" size={20} color={COLORS.accent} />
          <View style={styles.hostInfo}>
            <Text style={styles.hostName}>{currentHost.name}</Text>
            <Text style={styles.hostDistance}>{currentHost.distance} away</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </View>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('BuyPower')}
        >
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Buy Energy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButtonOutline}
          onPress={() => navigation.navigate('Billing')}
        >
          <Ionicons name="document-text-outline" size={24} color={COLORS.text} />
          <Text style={styles.actionButtonOutlineText}>View Bills</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 70,
    paddingBottom: 120,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  statusText: {
    fontSize: fontSize.sm,
    color: COLORS.textMuted,
  },
  notificationButton: {
    padding: spacing.sm,
  },

  // Sections
  section: {
    paddingVertical: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Time period selector
  timePeriodRow: {
    flexDirection: 'row',
    gap: 4,
  },
  timePeriodButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timePeriodButtonActive: {
    backgroundColor: COLORS.accentLight,
  },
  timePeriodText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  timePeriodTextActive: {
    color: COLORS.accent,
  },

  // Chart
  chartContainer: {
    marginTop: spacing.md,
    marginHorizontal: -spacing.sm,
  },
  blinkingSunContainer: {
    position: 'absolute',
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeLabel: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    width: 120,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },

  // Live Power
  livePowerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  livePowerValue: {
    fontSize: 48,
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -1,
  },
  livePowerUnit: {
    fontSize: 22,
    fontWeight: '400',
    color: COLORS.textMuted,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
  },
  statBlock: {
    flex: 1,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
  },
  statUnit: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.textMuted,
  },

  // Supply Mix
  supplyBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  supplyBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  supplyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  supplyLabelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  supplyLabelText: {
    fontSize: fontSize.sm,
    color: COLORS.text,
  },

  // Host
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  hostDistance: {
    fontSize: fontSize.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: COLORS.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  actionButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: COLORS.background,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionButtonOutlineText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: COLORS.text,
  },
});
