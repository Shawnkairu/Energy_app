import type { ReactNode } from "react";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { colors, radius, typography } from "@emappa/ui";

/** Outlined CTA — pairs with `PrimaryButton` (shared-screens secondary `Button full`). */
export function SecondaryButton({
  children,
  onPress,
  disabled,
  accessibilityLabel,
  accessibilityHint,
}: {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.panel,
        borderRadius: radius.md,
        paddingVertical: 16,
        paddingHorizontal: 18,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
        opacity: disabled ? 0.55 : pressed ? 0.92 : 1,
      })}
    >
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>{children}</Text>
    </Pressable>
  );
}

/** Small muted + accent link row (shared-screens “Already a member?”). */
export function AuthFooterHint({ muted, accentLabel, accentHref }: { muted: string; accentLabel: string; accentHref: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap", marginTop: 16 }}>
      <Text style={{ fontSize: typography.micro, color: colors.dim }}>{muted} </Text>
      <Link href={accentHref} asChild>
        <Pressable accessibilityRole="link" accessibilityLabel={`${accentLabel}`} accessibilityHint={`${muted} Opens sign in.`}>
          <Text style={{ fontSize: typography.micro, color: colors.orangeDeep, fontWeight: "600" }}>{accentLabel}</Text>
        </Pressable>
      </Link>
    </View>
  );
}

export default function AuthShellRoutePlaceholder() {
  return null;
}
