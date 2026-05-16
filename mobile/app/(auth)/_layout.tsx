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
        contentStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Screen name="login" options={{ title: "Log in" }} />
      <Stack.Screen name="verify-otp" options={{ title: "Verify code" }} />
      <Stack.Screen name="role-select" options={{ title: "Choose role" }} />
      <Stack.Screen name="join-building" options={{ title: "Join building" }} />
      <Stack.Screen name="authShell" options={{ title: "", headerShown: false }} />
    </Stack>
  );
}
