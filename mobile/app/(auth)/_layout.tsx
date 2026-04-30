import { Stack } from "expo-router";
import { colors } from "@emappa/ui";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerStyle: { backgroundColor: colors.ink }, headerTintColor: colors.text }} />;
}
