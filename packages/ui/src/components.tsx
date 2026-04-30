import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { colors, radius, shadows, spacing, typography } from "./tokens";

export function Surface({ children }: { children: ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.ink, paddingHorizontal: 20, paddingTop: 18 }}>
      {children}
    </View>
  );
}

export function GlassCard({ children, accent }: { children: ReactNode; accent?: string }) {
  return (
    <View
      style={{
        backgroundColor: colors.panel,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: 20,
        marginBottom: spacing.lg,
        ...shadows.card,
      }}
    >
      {accent ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 20,
            right: 20,
            height: 3,
            backgroundColor: accent,
            borderBottomLeftRadius: radius.pill,
            borderBottomRightRadius: radius.pill,
          }}
        />
      ) : null}
      {children}
    </View>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <Text style={{ color: colors.muted, fontSize: typography.small, fontWeight: "600" }}>
      {children}
    </Text>
  );
}

export function Value({ children, color = colors.text }: { children: ReactNode; color?: string }) {
  return (
    <Text style={{ color, fontSize: typography.heading, fontWeight: "800", marginTop: spacing.xs }}>
      {children}
    </Text>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "good" | "warn" | "bad" | "neutral" }) {
  const toneColor =
    tone === "good" ? colors.green : tone === "warn" ? colors.amber : tone === "bad" ? colors.red : colors.orange;

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderColor: toneColor,
        borderWidth: 1,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        backgroundColor: `${toneColor}22`,
      }}
    >
      <Text style={{ color: toneColor, fontSize: typography.micro, fontWeight: "800", textTransform: "uppercase" }}>
        {children}
      </Text>
    </View>
  );
}
