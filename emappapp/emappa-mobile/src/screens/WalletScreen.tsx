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
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { GlassCard } from '../components';
import { walletService } from '../services';

export function WalletScreen() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);

  const loadData = useCallback(async () => {
    await walletService.load();
    setBalance(walletService.balanceKwh);
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

  const recentTransactions = walletService.allEntries.slice(0, 5);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textMuted} />
      }
    >
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Token Balance</Text>
        <Text style={styles.balanceValue}>{balance.toFixed(2)} kWh</Text>
        <TouchableOpacity
          style={styles.viewHistoryButton}
          onPress={() => navigation.navigate('WalletHistory')}
        >
          <Text style={styles.viewHistoryText}>View full history</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>Your transaction history will appear here</Text>
          </View>
        ) : (
          <View style={styles.transactionList}>
            {recentTransactions.map((entry, index) => (
              <View key={index} style={styles.transactionItem}>
                <View style={[
                  styles.transactionIcon,
                  entry.type === 'topup' ? styles.topupIcon : styles.deductIcon
                ]}>
                  <Ionicons
                    name={entry.type === 'topup' ? 'add' : 'remove'}
                    size={16}
                    color={entry.type === 'topup' ? colors.success : colors.error}
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionType}>
                    {entry.type === 'topup' ? 'Top Up' : 'Usage Deduction'}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(entry.ts).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[
                    styles.transactionKwh,
                    entry.type === 'topup' ? styles.positiveAmount : styles.negativeAmount
                  ]}>
                    {entry.type === 'topup' ? '+' : '-'}{entry.kwh.toFixed(1)} kWh
                  </Text>
                  <Text style={styles.transactionCost}>
                    KSh {entry.amount_ksh.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: 100,
    paddingBottom: 100,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.soft,
    alignItems: 'center',
  },
  balanceLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  balanceValue: {
    color: colors.text,
    fontSize: 48,
    fontWeight: '300',
    letterSpacing: -1,
    marginBottom: spacing.md,
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  viewHistoryText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.soft,
  },
  emptyText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '400',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  transactionList: {
    gap: spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.soft,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  topupIcon: {
    backgroundColor: `${colors.success}20`,
  },
  deductIcon: {
    backgroundColor: `${colors.error}20`,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 2,
  },
  transactionDate: {
    color: colors.textMuted,
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionKwh: {
    fontSize: 15,
    fontWeight: '400',
    marginBottom: 2,
  },
  positiveAmount: {
    color: colors.success,
  },
  negativeAmount: {
    color: colors.error,
  },
  transactionCost: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
