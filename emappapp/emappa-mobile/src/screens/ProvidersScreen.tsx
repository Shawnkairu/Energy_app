import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { PieChart } from 'react-native-chart-kit';
import { colors, spacing, borderRadius } from '../theme';
import { repository } from '../api/repository';
import { PROVIDER_COLORS } from '../types/models';

interface ProviderWithReliability {
  provider: string;
  price_per_kwh: number;
  capacity_kwh: number;
  reliability_score: number;
}

interface EnergyMixData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

export function ProvidersScreen() {
  const [providers, setProviders] = useState<ProviderWithReliability[]>([]);
  const [loading, setLoading] = useState(true);
  const [energyMix, setEnergyMix] = useState<EnergyMixData[]>([]);

  // Weights for optimization (must sum to 100)
  const [costWeight, setCostWeight] = useState(40);
  const [capacityWeight, setCapacityWeight] = useState(30);
  const [reliabilityWeight, setReliabilityWeight] = useState(30);

  useEffect(() => {
    loadProviders();
  }, []);

  // Recalculate mix whenever weights change
  useEffect(() => {
    if (providers.length > 0) {
      calculateEnergyMix(providers);
    }
  }, [costWeight, capacityWeight, reliabilityWeight, providers.length]);

  async function loadProviders() {
    try {
      setLoading(true);
      const providerList = repository.defaultProviders();

      const providersWithData = providerList.map((p) => ({
        ...p,
        reliability_score: 0.7 + Math.random() * 0.25,
        distance_km: Math.round(5 + Math.random() * 45),
      }));

      // Sort by cost by default
      const sorted = [...providersWithData].sort((a, b) => a.price_per_kwh - b.price_per_kwh);
      setProviders(sorted);
      calculateEnergyMix(sorted);
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateEnergyMix(providerList: ProviderWithReliability[]) {
    const mix: EnergyMixData[] = providerList.map(provider => {
      // Score based on normalized metrics
      const priceScore = 1 - (provider.price_per_kwh / Math.max(...providerList.map(p => p.price_per_kwh)));
      const capacityScore = provider.capacity_kwh / Math.max(...providerList.map(p => p.capacity_kwh));
      const reliabilityScore = provider.reliability_score;

      // Weighted score using current slider values
      const combinedScore =
        (priceScore * costWeight / 100) +
        (capacityScore * capacityWeight / 100) +
        (reliabilityScore * reliabilityWeight / 100);

      // Allocate percentage based on combined score
      const totalScore = providerList.reduce((sum, p) => {
        const ps = 1 - (p.price_per_kwh / Math.max(...providerList.map(x => x.price_per_kwh)));
        const cs = p.capacity_kwh / Math.max(...providerList.map(x => x.capacity_kwh));
        const rs = p.reliability_score;
        return sum + ((ps * costWeight / 100) + (cs * capacityWeight / 100) + (rs * reliabilityWeight / 100));
      }, 0);

      const percentage = (combinedScore / totalScore) * 100;

      return {
        name: provider.provider,
        population: Math.round(percentage),
        color: PROVIDER_COLORS[provider.provider] || '#888888',
        legendFontColor: colors.textMuted,
        legendFontSize: 12,
      };
    }).filter(item => item.population > 0);

    setEnergyMix(mix);
  }

  function handleCostChange(value: number) {
    const newCost = Math.round(value);
    const remaining = 100 - newCost;

    // Distribute remaining proportionally between capacity and reliability
    const total = capacityWeight + reliabilityWeight;
    if (total > 0) {
      const ratio = capacityWeight / total;
      setCostWeight(newCost);
      setCapacityWeight(Math.round(remaining * ratio));
      setReliabilityWeight(100 - newCost - Math.round(remaining * ratio));
    } else {
      setCostWeight(newCost);
      setCapacityWeight(Math.round(remaining / 2));
      setReliabilityWeight(remaining - Math.round(remaining / 2));
    }
  }

  function handleCapacityChange(value: number) {
    const newCapacity = Math.round(value);
    const remaining = 100 - newCapacity;

    const total = costWeight + reliabilityWeight;
    if (total > 0) {
      const ratio = costWeight / total;
      setCapacityWeight(newCapacity);
      setCostWeight(Math.round(remaining * ratio));
      setReliabilityWeight(100 - newCapacity - Math.round(remaining * ratio));
    } else {
      setCapacityWeight(newCapacity);
      setCostWeight(Math.round(remaining / 2));
      setReliabilityWeight(remaining - Math.round(remaining / 2));
    }
  }

  function handleReliabilityChange(value: number) {
    const newReliability = Math.round(value);
    const remaining = 100 - newReliability;

    const total = costWeight + capacityWeight;
    if (total > 0) {
      const ratio = costWeight / total;
      setReliabilityWeight(newReliability);
      setCostWeight(Math.round(remaining * ratio));
      setCapacityWeight(100 - newReliability - Math.round(remaining * ratio));
    } else {
      setReliabilityWeight(newReliability);
      setCostWeight(Math.round(remaining / 2));
      setCapacityWeight(remaining - Math.round(remaining / 2));
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Energy Mix Pie Chart */}
        {energyMix.length > 0 && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Ionicons name="pie-chart" size={20} color={colors.primary} />
              <Text style={styles.chartTitle}>Your Energy Mix</Text>
            </View>
            <PieChart
              data={energyMix}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(137, 176, 174, ${opacity})`,
                labelColor: (opacity = 1) => colors.textMuted,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
            <Text style={styles.chartSubtitle}>
              Optimized based on your preferences
            </Text>
          </View>
        )}

        {/* 3-Way Weight Sliders */}
        <View style={styles.weightsContainer}>
          <Text style={styles.weightsTitle}>Optimization Preferences</Text>

          {/* Cost Slider */}
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Cost Priority</Text>
              <Text style={styles.sliderValue}>{costWeight}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={costWeight}
              onValueChange={handleCostChange}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.soft}
              thumbTintColor={colors.primary}
            />
          </View>

          {/* Capacity Slider */}
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Capacity Priority</Text>
              <Text style={styles.sliderValue}>{capacityWeight}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={capacityWeight}
              onValueChange={handleCapacityChange}
              minimumTrackTintColor={colors.accent}
              maximumTrackTintColor={colors.soft}
              thumbTintColor={colors.accent}
            />
          </View>

          {/* Reliability Slider */}
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Reliability Priority</Text>
              <Text style={styles.sliderValue}>{reliabilityWeight}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={reliabilityWeight}
              onValueChange={handleReliabilityChange}
              minimumTrackTintColor={colors.warning}
              maximumTrackTintColor={colors.soft}
              thumbTintColor={colors.warning}
            />
          </View>

          <Text style={styles.weightsHint}>
            Adjust sliders to set your priorities. Total is always 100%.
          </Text>
        </View>

        {/* Provider List */}
        <View style={styles.providersSection}>
          <Text style={styles.sectionTitle}>Available Providers</Text>
          {providers.map((provider, index) => (
            <View key={provider.provider} style={styles.providerCard}>
              <View style={styles.providerHeader}>
                <View style={styles.providerTitleRow}>
                  <Ionicons name="sunny" size={24} color={colors.warning} />
                  <Text style={styles.providerName}>{provider.provider}</Text>
                </View>
                <View style={[
                  styles.mixBadge,
                  { backgroundColor: PROVIDER_COLORS[provider.provider] }
                ]}>
                  <Text style={styles.mixText}>
                    {energyMix.find(m => m.name === provider.provider)?.population || 0}%
                  </Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Price/kWh</Text>
                  <Text style={styles.statValue}>KSh {provider.price_per_kwh.toFixed(2)}</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Capacity</Text>
                  <Text style={styles.statValue}>{provider.capacity_kwh.toFixed(1)} kWh</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Reliability</Text>
                  <Text style={styles.statValue}>{(provider.reliability_score * 100).toFixed(0)}%</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100,
    paddingBottom: 100,
  },
  // Chart
  chartContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.soft,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.text,
  },
  chartSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  // Weights
  weightsContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.soft,
  },
  weightsTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  sliderSection: {
    marginBottom: spacing.lg,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.primary,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  weightsHint: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  // Providers
  providersSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.text,
    marginBottom: spacing.md,
  },
  providerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.soft,
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  providerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.text,
  },
  mixBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  mixText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
  },
});
