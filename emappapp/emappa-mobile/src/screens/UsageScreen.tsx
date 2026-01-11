import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export function UsageScreen() {

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Header Stats */}
      <View style={styles.headerSection}>
        <Text style={styles.headerLabel}>Total Energy Usage</Text>
        <Text style={styles.headerValue}>
          15.0<Text style={styles.headerUnit}> MWh</Text>
        </Text>
        <Text style={styles.headerSubtext}>This year</Text>
      </View>

      {/* Energy Flow Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Energy Flow</Text>

        <View style={styles.flowCard}>
          <View style={styles.flowItem}>
            <View style={styles.flowIconContainer}>
              <Ionicons name="home" size={20} color={colors.text} />
            </View>
            <View style={styles.flowInfo}>
              <Text style={styles.flowLabel}>Used By Home</Text>
              <Text style={styles.flowPercentage}>53%</Text>
            </View>
            <Text style={styles.flowValue}>7.9 MWh</Text>
          </View>

          <View style={styles.flowDivider} />

          <View style={styles.flowItem}>
            <View style={styles.flowIconContainer}>
              <Ionicons name="battery-charging" size={20} color={colors.success} />
            </View>
            <View style={styles.flowInfo}>
              <Text style={styles.flowLabel}>Stored</Text>
              <Text style={styles.flowPercentage}>47%</Text>
            </View>
            <Text style={styles.flowValue}>7.1 MWh</Text>
          </View>
        </View>
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
  // Header
  headerSection: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerValue: {
    color: colors.text,
    fontSize: 56,
    fontWeight: '300',
    letterSpacing: -2,
  },
  headerUnit: {
    fontSize: 28,
    color: colors.textMuted,
    fontWeight: '400',
  },
  headerSubtext: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  // Energy Flow
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.text,
    marginBottom: spacing.md,
  },
  flowCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.soft,
  },
  flowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  flowIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  flowInfo: {
    flex: 1,
  },
  flowLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  flowPercentage: {
    color: colors.textMuted,
    fontSize: 12,
  },
  flowValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '400',
  },
  flowDivider: {
    height: 1,
    backgroundColor: colors.soft,
    marginVertical: spacing.xs,
  },
});
