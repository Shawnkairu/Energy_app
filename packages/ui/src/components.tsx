import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type AccessibilityProps, type ViewStyle } from "react-native";
import {
  cardBorderColor,
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from "./tokens";

/** Screen body — pure white canvas with warm spacing. */
export function Surface({ children }: { children: ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: colors.surface, paddingHorizontal: 20, paddingTop: 16 }}>{children}</View>;
}

export function PaletteCard({
  children,
  style,
  contentStyle,
  padding = spacing.lg,
  borderRadius = radius.lg,
}: {
  children: ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  padding?: number;
  borderRadius?: number;
}) {
  return (
    <View
      style={[
        {
          borderColor: cardBorderColor,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderRadius,
          backgroundColor: colors.white,
          ...shadows.card,
        },
        style,
      ]}
    >
      <View style={[{ padding }, contentStyle]}>{children}</View>
    </View>
  );
}

export function GlassCard({ children }: { children: ReactNode }) {
  return <PaletteCard style={{ marginBottom: spacing.lg }}>{children}</PaletteCard>;
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <Text style={{ color: colors.muted, fontSize: typography.micro, fontWeight: "500", letterSpacing: 0.65, textTransform: "uppercase" }}>
      {children}
    </Text>
  );
}

export function Value({ children, color = colors.text }: { children: ReactNode; color?: string }) {
  return (
    <Text style={{ color, fontSize: typography.heading, fontWeight: "500", letterSpacing: -0.35, marginTop: spacing.xs }}>
      {children}
    </Text>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "good" | "warn" | "bad" | "neutral" }) {
  const toneColor =
    tone === "good" ? colors.green : tone === "warn" ? colors.amber : tone === "bad" ? colors.red : colors.orangeDeep;

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderColor: toneColor,
        borderWidth: 1,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        backgroundColor: `${toneColor}12`,
      }}
    >
      <Text style={{ color: toneColor, fontSize: typography.micro, fontWeight: "500", textTransform: "uppercase" }}>
        {children}
      </Text>
    </View>
  );
}

type PrimaryButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
} & Pick<AccessibilityProps, "accessibilityLabel" | "accessibilityHint" | "accessibilityRole" | "accessible">;

export function PrimaryButton({
  children,
  onPress,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = "button",
  accessible,
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessible={accessible}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.orangeDeep,
        borderRadius: radius.md,
        paddingVertical: 16,
        paddingHorizontal: 18,
        alignItems: "center",
        ...shadows.soft,
        opacity: disabled ? 0.55 : pressed ? 0.92 : 1,
      })}
    >
      <Text style={{ color: colors.white, fontSize: 15, fontWeight: "600" }}>{children}</Text>
    </Pressable>
  );
}

export function AppMark({ size = 42 }: { size?: number }) {
  return (
    <View
      style={{
        height: size,
        width: size,
        borderRadius: radius.pill,
        backgroundColor: colors.orangeDeep,
        borderColor: colors.white,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        ...shadows.soft,
      }}
    >
      <Text style={{ color: colors.cream, fontWeight: "600", fontSize: Math.max(15, size * 0.38), letterSpacing: -0.5 }}>
        e
      </Text>
    </View>
  );
}
