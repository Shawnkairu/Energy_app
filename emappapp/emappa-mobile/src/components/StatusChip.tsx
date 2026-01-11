import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, fontSize } from '../theme';

interface StatusChipProps {
  online: boolean;
}

export function StatusChip({ online }: StatusChipProps) {
  return (
    <View style={[styles.chip, online ? styles.online : styles.offline]}>
      <Text style={styles.text}>{online ? 'Online' : 'Mock'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  online: {
    backgroundColor: colors.online,
  },
  offline: {
    backgroundColor: colors.warning,
  },
  text: {
    color: colors.surface,
    fontSize: fontSize.sm,
    fontWeight: '400',
  },
});
