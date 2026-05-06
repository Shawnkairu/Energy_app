import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { configureApiClient } from "@emappa/api-client";
import { colors, shellGradientColors, shellGradientLocations, shellWashColors, shellWashLocations } from "@emappa/ui";
import { readPilotSession } from "../components/session";

export default function RootLayout() {
  configureApiClient({
    baseUrl: process.env.EXPO_PUBLIC_API_URL || null,
    token: readPilotSession()?.token ?? null,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <LinearGradient
          colors={[...shellGradientColors]}
          locations={[...shellGradientLocations]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={[...shellWashColors]}
          locations={[...shellWashLocations]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerShadowVisible: false,
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: "600", fontSize: 17, color: colors.text },
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(resident)" options={{ headerShown: false }} />
          <Stack.Screen name="(owner)" options={{ headerShown: false }} />
          <Stack.Screen name="(provider)" options={{ headerShown: false }} />
          <Stack.Screen name="(financier)" options={{ headerShown: false }} />
          <Stack.Screen name="(installer)" options={{ headerShown: false }} />
          <Stack.Screen name="(supplier)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        </Stack>
      </View>
    </GestureHandlerRootView>
  );
}
