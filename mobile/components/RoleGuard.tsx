import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { Redirect } from "expo-router";
import type { StakeholderRole } from "@emappa/shared";
import { AppMark, colors, Surface } from "@emappa/ui";
import { useAuth } from "./AuthContext";

const homeByRole: Record<StakeholderRole, string> = {
  resident: "/(resident)/home",
  homeowner: "/(building-owner)/home",
  building_owner: "/(building-owner)/home",
  provider: "/(provider)/home",
  financier: "/(financier)/portfolio",
  electrician: "/(electrician)/jobs",
  admin: "/(admin)/home",
};

export function RoleGuard({ role, children }: { role: StakeholderRole; children: ReactNode }) {
  const { isHydrating, session } = useAuth();
  const sessionRole = session?.role ?? null;

  if (isHydrating) {
    return (
      <Surface>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <AppMark size={48} />
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: "600", letterSpacing: -0.6, marginTop: 18 }}>
            Opening your workspace
          </Text>
          <Text style={{ color: colors.muted, marginTop: 8 }}>Checking your selected role...</Text>
        </View>
      </Surface>
    );
  }

  const canEnterWorkspace = sessionRole === role || (role === "building_owner" && sessionRole === "homeowner");

  if (!canEnterWorkspace) {
    return <Redirect href={sessionRole ? homeByRole[sessionRole] : "/(auth)/role-select"} />;
  }

  return children;
}
