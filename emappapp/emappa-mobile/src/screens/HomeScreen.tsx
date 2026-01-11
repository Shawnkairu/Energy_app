import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../theme';
import { walletService, allowanceService, paymentModelService, PaymentModel } from '../services';
import { GlassCard } from '../components/GlassCard';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyAllowance, setMonthlyAllowance] = useState(0);
  const [allowanceRemaining, setAllowanceRemaining] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [paymentModel, setPaymentModel] = useState<PaymentModel>('tokens');
  const [nearestFarm] = useState({ name: 'Sunshine Solar Farm', distance: '2.3 km' });

  const loadData = useCallback(async () => {
    await paymentModelService.load();
    await allowanceService.ensureCurrentPeriod();
    setPaymentModel(paymentModelService.currentModel);
    setMonthlyAllowance(allowanceService.state?.monthlyAllowanceKwh ?? 0);
    setAllowanceRemaining(allowanceService.state?.remainingKwh ?? 0);
    setTokenBalance(walletService.balanceKwh);
  }, []);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await walletService.load();
    await allowanceService.load();
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E8F4F8', '#F0F8FA', '#FAF9F9']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.textMuted}
            />
          }
        >
          {/* Hero Section - Big number display */}
          {paymentModel !== 'postpaid' && (
            <View style={styles.heroSection}>
              <Text style={styles.heroLabel}>
                {paymentModel === 'subscription' ? 'Allowance Remaining' : 'Token Balance'}
              </Text>
              <Text style={styles.heroValue}>
                {paymentModel === 'subscription'
                  ? allowanceRemaining.toFixed(1)
                  : tokenBalance.toFixed(1)}
                <Text style={styles.heroUnit}> kWh</Text>
              </Text>
              {paymentModel === 'subscription' && (
                <Text style={styles.heroSubtext}>
                  of {monthlyAllowance.toFixed(0)} kWh monthly allowance
                </Text>
              )}
            </View>
          )}

          {paymentModel === 'postpaid' && (
            <View style={styles.heroSection}>
              <Text style={styles.heroLabel}>Postpaid Billing</Text>
              <Text style={styles.heroSubtext}>
                Pay at the end of the month based on your usage
              </Text>
            </View>
          )}

          {/* Quick Stats Grid - Only for subscription (shows both) */}
          {paymentModel === 'subscription' && (
            <View style={styles.statsGrid}>
              <GlassCard style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                  <Text style={styles.statLabel}>Subscription</Text>
                </View>
                <Text style={styles.statValue}>{allowanceRemaining.toFixed(0)}</Text>
                <Text style={styles.statSubtext}>of {monthlyAllowance.toFixed(0)} kWh</Text>
              </GlassCard>

              <GlassCard style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="flash" size={18} color={colors.accent} />
                  <Text style={styles.statLabel}>Extra Tokens</Text>
                </View>
                <Text style={styles.statValue}>{tokenBalance.toFixed(1)}</Text>
                <Text style={styles.statSubtext}>kWh available</Text>
              </GlassCard>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => navigation.navigate('BuyPower')}
            >
              <Ionicons name="add-circle" size={20} color={colors.background} />
              <Text style={styles.primaryActionText}>Buy Power</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('ProvidersStack', { screen: 'Trading' })}
            >
              <Ionicons name="trending-up-outline" size={20} color={colors.text} />
              <Text style={styles.actionText}>Trade</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Billing')}
            >
              <Ionicons name="document-text-outline" size={20} color={colors.text} />
              <Text style={styles.actionText}>View Bill</Text>
            </TouchableOpacity>
          </View>

          {/* Nearest Solar Farm */}
          <GlassCard style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <Text style={styles.locationTitle}>Nearest Solar Farm</Text>
            </View>
            <Text style={styles.farmName}>{nearestFarm.name}</Text>
            <View style={styles.distanceRow}>
              <Ionicons name="navigate" size={14} color={colors.textMuted} />
              <Text style={styles.distanceText}>{nearestFarm.distance} away</Text>
            </View>
          </GlassCard>

          {/* Info Card */}
          <GlassCard style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
            <Text style={styles.infoText}>
              Manage your subscription and rollover settings in the Settings tab
            </Text>
          </GlassCard>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: 100,
    paddingBottom: 110,
  },
  // Hero Section
  heroSection: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  heroLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroValue: {
    color: colors.text,
    fontSize: 64,
    fontWeight: '300',
    letterSpacing: -2,
  },
  heroUnit: {
    fontSize: 32,
    color: colors.textMuted,
    fontWeight: '400',
  },
  heroSubtext: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '400',
    marginBottom: 2,
  },
  statSubtext: {
    color: colors.textMuted,
    fontSize: 11,
  },
  // Actions
  actionsSection: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  primaryAction: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '400',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
  },
  // Location Card
  locationCard: {
    marginBottom: spacing.xl,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  locationTitle: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  farmName: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
