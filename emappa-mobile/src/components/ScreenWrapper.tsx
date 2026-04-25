import React from 'react';
import { View, StyleSheet, ScrollView, ScrollViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

interface ScreenWrapperProps extends ScrollViewProps {
  children: React.ReactNode;
  withGradient?: boolean;
  withScroll?: boolean;
}

export function ScreenWrapper({
  children,
  withGradient = true,
  withScroll = true,
  contentContainerStyle,
  ...scrollViewProps
}: ScreenWrapperProps) {
  const content = withScroll ? (
    <ScrollView
      {...scrollViewProps}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.scrollContent, contentContainerStyle]}>{children}</View>
  );

  if (!withGradient) {
    return <View style={styles.container}>{content}</View>;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        style={styles.gradient}
      >
        {content}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
});
