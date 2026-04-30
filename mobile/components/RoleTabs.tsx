import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@emappa/ui";

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: "home",
  energy: "flash",
  ownership: "pie-chart",
  profile: "person-circle",
  drs: "shield-checkmark",
  deployment: "construct",
  earnings: "cash",
  assets: "sunny",
  shares: "swap-horizontal",
  deals: "briefcase",
  "deal-detail": "document-text",
  portfolio: "analytics",
  checklist: "checkbox",
  "job-detail": "camera",
  "quote-requests": "receipt",
  orders: "cube",
  projects: "grid",
  alerts: "warning",
};

export function RoleTabs() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.ink, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.dim,
        tabBarLabelStyle: { fontWeight: "800", fontSize: 11 },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={icons[route.name] ?? "ellipse"} color={color} size={size} />
        ),
      })}
    />
  );
}
