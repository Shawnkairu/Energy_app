import { Platform, StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { getMobileSections, type StakeholderRole } from "@emappa/shared";
import { colors } from "@emappa/ui";

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: "home-outline",
  wallet: "wallet-outline",
  usage: "pulse-outline",
  energy: "flash-outline",
  ownership: "aperture-outline",
  profile: "person-circle-outline",
  support: "help-buoy-outline",
  drs: "shield-checkmark-outline",
  earnings: "leaf-outline",
  assets: "sunny-outline",
  performance: "analytics-outline",
  shares: "git-branch-outline",
  maintenance: "build-outline",
  deployment: "trail-sign-outline",
  deals: "briefcase-outline",
  "deal-detail": "document-text-outline",
  portfolio: "pie-chart-outline",
  certification: "ribbon-outline",
  checklist: "checkbox-outline",
  "job-detail": "camera-outline",
  catalog: "albums-outline",
  "quote-requests": "receipt-outline",
  orders: "cube-outline",
  reliability: "sparkles-outline",
  projects: "grid-outline",
  alerts: "warning-outline",
};

function TabBarChromeBackground() {
  if (Platform.OS === "ios") {
    return <BlurView intensity={26} tint="light" style={StyleSheet.absoluteFill} />;
  }
  return <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceElevated }]} />;
}

const hiddenTabRoutes: Partial<Record<StakeholderRole, string[]>> = {
  provider: ["qualified-projects", "commit-capacity", "accept-terms"],
  financier: ["tranche-release"],
  installer: ["jobs-inbox"],
  owner: ["list-building", "compare-today", "resident-roster", "approve-terms", "owner-account"],
};

export function RoleTabs({ role }: { role: StakeholderRole }) {
  const sectionByRoute = Object.fromEntries(
    getMobileSections(role).map((section) => [
      section.mobileRoute?.split("/").at(-1) ?? section.id,
      section,
    ]),
  );

  const hidden = hiddenTabRoutes[role] ?? [];

  return (
    <Tabs
      screenOptions={({ route }) => ({
        title: sectionByRoute[route.name]?.label,
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
        tabBarLabelStyle: { fontWeight: "500", fontSize: 9 },
        tabBarLabel: sectionByRoute[route.name]?.label,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={icons[route.name] ?? "ellipse-outline"} color={color} size={Math.max(16, size - 6)} />
        ),
      })}
    >
      {hidden.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}
