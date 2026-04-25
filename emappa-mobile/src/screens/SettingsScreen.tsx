import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { allowanceService, paymentModelService, PaymentModel } from '../services';
import { useAuth } from '../context/AuthContext';

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const [paymentModel, setPaymentModel] = useState<PaymentModel>('tokens');
  const [monthlyAllowance, setMonthlyAllowance] = useState('100');
  const [rollover, setRollover] = useState(true);
  const [inFallbackMode, setInFallbackMode] = useState(false);

  const loadData = useCallback(async () => {
    await paymentModelService.load();
    await allowanceService.ensureCurrentPeriod();

    setPaymentModel(paymentModelService.currentModel);
    setInFallbackMode(paymentModelService.isInFallbackMode);
    setMonthlyAllowance(
      (allowanceService.state?.monthlyAllowanceKwh ?? 100).toFixed(0)
    );
    setRollover(allowanceService.state?.rollover ?? true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handlePaymentModelChange = async (model: PaymentModel) => {
    await paymentModelService.setPaymentModel(model);
    setPaymentModel(model);
    Alert.alert(
      'Payment Model Updated',
      `You are now on ${model === 'subscription' ? 'Subscription' : model === 'tokens' ? 'Token' : 'Postpaid'} billing.${
        model !== 'postpaid' ? '\n\nNote: If you run out of credits, you\'ll automatically switch to postpaid to avoid power interruption.' : ''
      }`
    );
  };

  const handleSaveAllowance = async () => {
    const value = parseFloat(monthlyAllowance);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Invalid', 'Please enter a valid allowance');
      return;
    }

    await allowanceService.setPlan(value, rollover, true);
    Alert.alert('Saved', 'Subscription plan updated successfully');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Fallback Mode Alert */}
      {inFallbackMode && (
        <View style={styles.alertCard}>
          <Ionicons name="warning" size={20} color={colors.warning} />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Fallback Mode Active</Text>
            <Text style={styles.alertText}>
              You've run out of credits and are now on postpaid billing. Top up to return to your preferred payment model.
            </Text>
          </View>
        </View>
      )}

      {/* Payment Model Selector */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Payment Model</Text>
        <Text style={styles.sectionDescription}>
          Choose how you want to pay for energy
        </Text>

        <View style={styles.paymentOptions}>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentModel === 'subscription' && styles.paymentOptionActive,
            ]}
            onPress={() => handlePaymentModelChange('subscription')}
          >
            <Ionicons
              name="calendar"
              size={24}
              color={paymentModel === 'subscription' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.paymentOptionTitle,
                paymentModel === 'subscription' && styles.paymentOptionTitleActive,
              ]}
            >
              Subscription
            </Text>
            <Text style={styles.paymentOptionDesc}>Fixed monthly allowance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentModel === 'tokens' && styles.paymentOptionActive,
            ]}
            onPress={() => handlePaymentModelChange('tokens')}
          >
            <Ionicons
              name="flash"
              size={24}
              color={paymentModel === 'tokens' ? colors.warning : colors.textMuted}
            />
            <Text
              style={[
                styles.paymentOptionTitle,
                paymentModel === 'tokens' && styles.paymentOptionTitleActive,
              ]}
            >
              Tokens
            </Text>
            <Text style={styles.paymentOptionDesc}>Prepaid power credits</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentModel === 'postpaid' && styles.paymentOptionActive,
            ]}
            onPress={() => handlePaymentModelChange('postpaid')}
          >
            <Ionicons
              name="receipt"
              size={24}
              color={paymentModel === 'postpaid' ? colors.accent : colors.textMuted}
            />
            <Text
              style={[
                styles.paymentOptionTitle,
                paymentModel === 'postpaid' && styles.paymentOptionTitleActive,
              ]}
            >
              Postpaid
            </Text>
            <Text style={styles.paymentOptionDesc}>Pay after usage</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Subscription Settings - Only show if subscription is selected */}
      {paymentModel === 'subscription' && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Subscription Plan</Text>
          <Text style={styles.inputLabel}>Monthly Allowance (kWh)</Text>
          <TextInput
            style={styles.input}
            value={monthlyAllowance}
            onChangeText={setMonthlyAllowance}
            keyboardType="numeric"
            placeholder="e.g. 100"
            placeholderTextColor={colors.textMuted}
          />

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Rollover unused kWh</Text>
              <Text style={styles.switchDescription}>
                Carry forward unused energy to next month
              </Text>
            </View>
            <Switch
              value={rollover}
              onValueChange={setRollover}
              trackColor={{ false: colors.soft, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveAllowance}>
            <Text style={styles.saveButtonText}>Save Plan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* User Info & Logout */}
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <Ionicons name="person-circle-outline" size={40} color={colors.text} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {user?.isDemoMode && (
              <Text style={styles.demoLabel}>Demo Mode</Text>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
    paddingTop: 100,
    paddingBottom: 100,
  },
  // Alert Card
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: fontSize.md,
    fontWeight: '400',
    color: colors.warning,
    marginBottom: 4,
  },
  alertText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 18,
  },
  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.soft,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '400',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  // Payment Options
  paymentOptions: {
    gap: spacing.md,
  },
  paymentOption: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.soft,
    padding: spacing.lg,
    alignItems: 'center',
  },
  paymentOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.darkCard,
  },
  paymentOptionTitle: {
    fontSize: fontSize.md,
    fontWeight: '400',
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  paymentOptionTitleActive: {
    color: colors.text,
  },
  paymentOptionDesc: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: 2,
  },
  // Input
  inputLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.soft,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  // Switch
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  switchInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  switchLabel: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  // Save Button
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.text,
    fontWeight: '400',
    fontSize: fontSize.md,
  },
  // User & Logout
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.soft,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: fontSize.lg,
    fontWeight: '400',
    color: colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  demoLabel: {
    fontSize: 11,
    color: colors.warning,
    fontWeight: '400',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
  },
  logoutText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: '400',
  },
});
