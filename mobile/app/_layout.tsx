import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { colors } from "@emappa/ui";
import { AuthProvider } from "../components/AuthContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <View style={{ flex: 1, backgroundColor: colors.surface }}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.surface },
              headerShadowVisible: false,
              headerTintColor: colors.text,
              headerTitleStyle: { fontWeight: "600", fontSize: 17, color: colors.text },
              contentStyle: { backgroundColor: colors.surface },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboard)" options={{ headerShown: false }} />
            <Stack.Screen name="(homeowner)" options={{ headerShown: false }} />
            <Stack.Screen name="(resident)" options={{ headerShown: false }} />
            <Stack.Screen name="(building-owner)" options={{ headerShown: false }} />
            <Stack.Screen name="(provider)" options={{ headerShown: false }} />
            <Stack.Screen name="(financier)" options={{ headerShown: false }} />
            <Stack.Screen name="(electrician)" options={{ headerShown: false }} />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          </Stack>
        </View>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
