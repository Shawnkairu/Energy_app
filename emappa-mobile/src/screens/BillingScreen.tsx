import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, fontSize } from '../theme';
import { GlassCard, StatusChip } from '../components';
import { repository, apiClient } from '../api';
import { ProviderInfo, UserConfig, BillRow } from '../types';

export function BillingScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bill, setBill] = useState<BillRow[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const providers = repository.defaultProviders();
      const users = await repository.fetchUsers();
      const user = users[0];
      setUserName(user.name);

      // Run optimization
      const optRes = await repository.optimize(providers, users, 30);

      // Filter allocation for this user
      const userAlloc = optRes.allocation.filter((a) => a.user === user.name);

      // Get billing - cast to required type
      const billRes = await repository.bill(
        userAlloc as unknown as Record<string, unknown>[],
        providers,
        'postpaid'
      );

      setBill(billRes.bill);
      setTotalCost(billRes.total_cost);
    } catch (e: any) {
      setError(e.message || 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `KSh ${value.toFixed(0)}`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {userName}</Text>
        <StatusChip online={apiClient.backendOnline} />
      </View>

      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>Bill summary</Text>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total (30 days)</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalCost)}</Text>
        </View>
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>Daily breakdown</Text>
        {bill.slice(0, 10).map((row) => (
          <View key={row.day} style={styles.billRow}>
            <View>
              <Text style={styles.billDay}>Day {row.day}</Text>
              <Text style={styles.billSub}>
                {row.used_kwh.toFixed(2)} kWh • {row.status}
              </Text>
            </View>
            <Text style={styles.billCost}>{formatCurrency(row.cost)}</Text>
          </View>
        ))}
        {bill.length > 10 && (
          <Text style={styles.moreText}>
            + {bill.length - 10} more days...
          </Text>
        )}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.md,
    textAlign: 'center',
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '400',
    color: colors.text,
  },
  card: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '400',
    color: colors.text,
    marginBottom: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  totalValue: {
    fontSize: fontSize.xxl,
    fontWeight: '400',
    color: colors.text,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.soft,
  },
  billDay: {
    fontSize: fontSize.md,
    fontWeight: '400',
    color: colors.text,
  },
  billSub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  billCost: {
    fontSize: fontSize.md,
    fontWeight: '400',
    color: colors.text,
  },
  moreText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
});
