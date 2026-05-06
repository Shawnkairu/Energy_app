import { Platform, StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@emappa/ui";
import { HomeownerGuard } from "../../components/homeowner/HomeownerScreens";

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: "home-outline",
  energy: "flash-outline",
  wallet: "wallet-outline",
  profile: "person-circle-outline",
};

function TabBarChromeBackground() {
  if (Platform.OS === "ios") {
    return <BlurView intensity={26} tint="light" style={StyleSheet.absoluteFill} />;
  }
  return <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceElevated }]} />;
}

export default function HomeownerLayout() {
  return (
    <HomeownerGuard>
      <Tabs
        screenOptions={({ route }) => ({
          title: route.name === "home" ? "Home" : route.name === "energy" ? "Energy" : route.name === "wallet" ? "Wallet" : "Profile",
          headerStyle: { backgroundColor: colors.surface },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "600", fontSize: 15, color: colors.text },
          tabBarStyle: {
            backgroundColor: Platform.OS === "ios" ? "transparent" : colors.surfaceElevated,
            borderTopColor: colors.border,
            borderTopWidth: StyleSheet.hairlineWidth,
            height: 64,
            paddingTop: 8,
            paddingBottom: 10,
          },
          tabBarBackground: TabBarChromeBackground,
          tabBarShowLabel: false,
          tabBarActiveTintColor: colors.orangeDeep,
          tabBarInactiveTintColor: colors.dim,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={icons[route.name] ?? "ellipse-outline"} color={color} size={Math.max(16, size - 6)} />
          ),
        })}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="energy" />
        <Tabs.Screen name="wallet" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="_embedded" options={{ href: null }} />
      </Tabs>
    </HomeownerGuard>
  );
}
