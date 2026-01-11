import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation';
import { apiClient } from './src/api';
import { walletService, allowanceService, paymentModelService } from './src/services';
import { colors } from './src/theme';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      // Initialize services
      await Promise.all([
        apiClient.checkBackend(),
        walletService.load(),
        allowanceService.load(),
        paymentModelService.load(),
      ]);
      setLoading(false);
    }
    init();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <AppNavigator />
      <StatusBar style="light" />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
