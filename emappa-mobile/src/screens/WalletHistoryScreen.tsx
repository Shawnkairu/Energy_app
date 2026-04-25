import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { GlassCard, StatusChip } from '../components';
import { walletService } from '../services';
import { apiClient } from '../api';
import { WalletEntry } from '../types';

export function WalletHistoryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [entries, setEntries] = useState<WalletEntry[]>([]);
  const [balance, setBalance] = useState(0);

  const loadData = useCallback(async () => {
    await walletService.load();
    setEntries(walletService.allEntries);
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

  const handleClear = () => {
    Alert.alert(
      'Clear history?',
      'This removes all top-ups and deductions from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await walletService.clearAll();
            await loadData();
          },
        },
      ]
    );
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <GlassCard style={styles.card}>
        <Text style={styles.label}>Token balance</Text>
        <Text style={styles.bigValue}>{balance.toFixed(2)} kWh</Text>
      </GlassCard>

      <GlassCard style={styles.card}>
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>History</Text>
          <StatusChip online={apiClient.backendOnline} />
        </View>

        {entries.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet</Text>
        ) : (
          entries.map((entry, index) => {
            const isTopup = entry.type === 'topup';
            return (
              <View key={index} style={styles.entryRow}>
                <View
                  style={[
                    styles.entryIcon,
                    isTopup ? styles.iconTopup : styles.iconDeduct,
                  ]}
                >
                  <Ionicons
                    name={isTopup ? 'add' : 'remove'}
                    size={16}
                    color={colors.text}
                  />
                </View>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryTitle}>
                    {isTopup
                      ? `Top-up ${entry.kwh.toFixed(2)} kWh`
                      : `Deduct ${entry.kwh.toFixed(2)} kWh`}
                  </Text>
                  <Text style={styles.entrySub} numberOfLines={1}>
                    {formatDate(entry.ts)}
                    {isTopup && entry.amount_ksh > 0 && ` • KSh ${entry.amount_ksh}`}
                    {entry.ref && ` • ${entry.ref}`}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.entryAmount,
                    isTopup ? styles.amountPositive : styles.amountNegative,
                  ]}
                >
                  {isTopup ? '+' : '-'}
                  {entry.kwh.toFixed(2)}
                </Text>
              </View>
            );
          })
        )}

        {entries.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>Clear history</Text>
          </TouchableOpacity>
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
  card: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  bigValue: {
    color: colors.text,
    fontSize: fontSize.display,
    fontWeight: '400',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '400',
    color: colors.text,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.soft,
  },
  entryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconTopup: {
    backgroundColor: colors.online,
  },
  iconDeduct: {
    backgroundColor: colors.error,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    fontSize: fontSize.md,
    fontWeight: '400',
    color: colors.text,
  },
  entrySub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  entryAmount: {
    fontSize: fontSize.md,
    fontWeight: '400',
  },
  amountPositive: {
    color: colors.online,
  },
  amountNegative: {
    color: colors.error,
  },
  clearButton: {
    alignItems: 'flex-end',
    marginTop: spacing.md,
  },
  clearButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '400',
  },
});
