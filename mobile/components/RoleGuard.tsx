import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import type { StakeholderRole } from "@emappa/shared";
import { AppMark, colors, Surface } from "@emappa/ui";
import { useAuth } from "./AuthContext";

const homeByRole: Record<StakeholderRole, string> = {
  resident: "/(resident)/home",
  homeowner: "/(homeowner)/home",
  building_owner: "/(building-owner)/home",
  provider: "/(provider)/discover",
  financier: "/(financier)/discover",
  electrician: "/(electrician)/discover",
  admin: "/(admin)/alerts",
};

export function RoleGuard({ role, children }: { role: StakeholderRole; children: ReactNode }) {
  const { isHydrating, session } = useAuth();
  const sessionRole = session?.role ?? null;

  if (isHydrating) {
    return (
      <Surface>
        <View style={styles.hydrateWrap}>
          <AppMark size={48} />
          <Text style={styles.hydrateTitle}>Opening your workspace</Text>
          <Text style={styles.hydrateBody}>Checking your selected role…</Text>
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

const styles = StyleSheet.create({
  hydrateWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  hydrateTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: -0.6,
    marginTop: 18,
    textAlign: "center",
  },
  hydrateBody: {
    color: colors.muted,
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
});
