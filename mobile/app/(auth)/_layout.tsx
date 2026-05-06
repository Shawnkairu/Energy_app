import { Stack } from "expo-router";
import { colors } from "@emappa/ui";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "600", fontSize: 17, color: colors.text },
        contentStyle: { backgroundColor: "transparent" },
      }}
    />
  );
}
