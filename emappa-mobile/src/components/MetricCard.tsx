import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../theme';
import { GlassCard } from './GlassCard';

interface MetricCardProps {
  label: string;
  value: string;
}

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <GlassCard>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
  value: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '400',
  },
});
