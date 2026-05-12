import { Platform, StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@emappa/ui";
import { HomeownerGuard } from "../../components/homeowner/HomeownerScreens";

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: "home-outline",
  energy: "flash-outline",
  wallet: "wallet-outline",
  profile: "person-circle-outline",
};

const tabHints: Record<string, string> = {
  home: "Roof readiness, status, and shortcuts",
  energy: "Generation, home use, and roof flow context",
  wallet: "Income, prepaid balance, and transactions",
  profile: "Account, permissions, and sign out",
};

function TabBarChromeBackground() {
  return <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />;
}

function tabTitle(routeName: string): string {
  switch (routeName) {
    case "home":
      return "Home";
    case "energy":
      return "Energy";
    case "wallet":
      return "Wallet";
    case "profile":
      return "Profile";
    default:
      return routeName;
  }
}

export default function HomeownerLayout() {
  return (
    <HomeownerGuard>
      <Tabs
        screenOptions={({ route }) => {
          const name = route.name;
          const title = tabTitle(name);
          const hint = tabHints[name];
          return {
            title,
            headerStyle: { backgroundColor: colors.surface },
            headerShadowVisible: false,
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: "600", fontSize: 17, color: colors.text },
            sceneContainerStyle: { backgroundColor: colors.surface },
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              borderTopWidth: StyleSheet.hairlineWidth,
              height: 70,
              paddingTop: 7,
              paddingBottom: Platform.OS === "ios" ? 8 : Platform.OS === "android" ? 6 : 8,
            },
            tabBarBackground: TabBarChromeBackground,
            tabBarShowLabel: true,
            tabBarHideOnKeyboard: true,
            tabBarActiveTintColor: colors.orangeDeep,
            tabBarInactiveTintColor: colors.dim,
            tabBarAccessibilityLabel: title,
            ...(hint ? { tabBarAccessibilityHint: hint } : {}),
            tabBarLabel: title,
            tabBarLabelStyle: { fontWeight: "700", fontSize: 10, marginTop: 2, letterSpacing: 0.2 },
            tabBarIcon: ({ color, size }) => (
              <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.tabIconWrap}>
                <Ionicons name={icons[name] ?? "ellipse-outline"} color={color} size={Math.max(16, size - 8)} />
              </View>
            ),
          };
        }}
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

const styles = StyleSheet.create({
  tabIconWrap: { alignItems: "center", justifyContent: "center" },
});
