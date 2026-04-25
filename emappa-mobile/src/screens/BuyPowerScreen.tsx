import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { GlassCard, StatusChip } from '../components';
import { repository, apiClient } from '../api';
import { walletService } from '../services';

const PRESETS = [50, 100, 250, 500, 1000];

export function BuyPowerScreen() {
  const navigation = useNavigation();
  const [amount, setAmount] = useState(100);
  const [inputValue, setInputValue] = useState('100');
  const [loading, setLoading] = useState(false);

  const handlePreset = (value: number) => {
    setAmount(value);
    setInputValue(value.toString());
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    const parsed = parseFloat(text);
    if (!isNaN(parsed)) {
      setAmount(parsed);
    }
  };

  const handleSubmit = async () => {
    if (amount <= 0) {
      Alert.alert('Invalid', 'Enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const res = await repository.buyPower(amount);

      const kwh = res.tokens_kwh ?? 0;
      const ref = res.reference ?? `TOPUP-${Date.now()}`;

      await walletService.addTopUp(kwh, amount, ref);

      Alert.alert(
        'Purchase successful',
        `Amount: KSh ${res.amount_ksh}\nTokens: ${kwh.toFixed(2)} kWh\nRef: ${ref}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert('Payment failed', e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <GlassCard style={styles.card}>
        <Text style={styles.title}>Top up</Text>

        <View style={styles.presetRow}>
          {PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetChip,
                amount === preset && styles.presetChipSelected,
              ]}
              onPress={() => handlePreset(preset)}
            >
              <Text
                style={[
                  styles.presetText,
                  amount === preset && styles.presetTextSelected,
                ]}
              >
                KSh {preset}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={handleInputChange}
          keyboardType="numeric"
          placeholder="Custom amount (KSh)"
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <>
              <Ionicons name="flash" size={20} color={colors.text} />
              <Text style={styles.payButtonText}>Pay</Text>
            </>
          )}
        </TouchableOpacity>
      </GlassCard>

      <View style={styles.statusRow}>
        <StatusChip online={apiClient.backendOnline} />
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
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  card: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '400',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  presetChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.soft,
  },
  presetChipSelected: {
    backgroundColor: colors.accent + '33', // 20% opacity
    borderColor: colors.accent,
  },
  presetText: {
    color: colors.text,
    fontWeight: '400',
    fontSize: fontSize.md,
  },
  presetTextSelected: {
    color: colors.text,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.soft,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  payButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: colors.text,
    fontWeight: '400',
    fontSize: fontSize.lg,
  },
  statusRow: {
    alignItems: 'center',
  },
});
