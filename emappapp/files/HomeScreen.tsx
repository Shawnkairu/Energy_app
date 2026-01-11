import React, { useEffect, useState, useCallback } from 'react';
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
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { GlassCard, MetricCard } from '../components';
import { walletService, allowanceService } from '../services';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyAllowance, setMonthlyAllowance] = useState(0);
  const [allowanceRemaining, setAllowanceRemaining] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);

  const loadData = useCallback(async () => {
    await allowanceService.ensureCurrentPeriod();
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* At a glance row */}
      <View style={styles.row}>
        <View style={styles.halfCard}>
          <MetricCard
            label="Allowance left"
            value={`${allowanceRemaining.toFixed(0)} kWh`}
          />
        </View>
        <View style={styles.halfCard}>
          <MetricCard
            label="Token balance"
            value={`${tokenBalance.toFixed(2)} kWh`}
          />
        </View>
      </View>

      {/* Monthly allowance */}
      <GlassCard style={styles.card}>
        <Text style={styles.label}>Monthly allowance</Text>
        <Text style={styles.value}>{monthlyAllowance.toFixed(0)} kWh</Text>
      </GlassCard>

      {/* Actions */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate('BuyPower')}
        >
          <Ionicons name="flash" size={20} color={colors.surface} />
          <Text style={styles.primaryButtonText}>Top up tokens</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.outlineButton]}
          onPress={() => navigation.navigate('Billing')}
        >
          <Ionicons name="receipt-outline" size={20} color={colors.primary} />
          <Text style={styles.outlineButtonText}>View bill</Text>
        </TouchableOpacity>
      </View>

      {/* Tips */}
      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>Tips</Text>
        <Text style={styles.tipText}>
          Track daily usage in the Usage tab. Set rollover & allowance in Settings.
        </Text>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  halfCard: {
    flex: 1,
  },
  card: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  value: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: fontSize.md,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  outlineButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: fontSize.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tipText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
});
