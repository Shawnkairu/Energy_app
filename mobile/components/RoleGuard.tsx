import { useEffect, useState, type ReactNode } from "react";
import { Text, View } from "react-native";
import { Redirect } from "expo-router";
import type { StakeholderRole } from "@emappa/shared";
import { AppMark, colors, Surface } from "@emappa/ui";
import { readPilotSession } from "./session";

const homeByRole: Record<StakeholderRole, string> = {
  resident: "/(resident)/home",
  owner: "/(owner)/home",
  provider: "/(provider)/home",
  financier: "/(financier)/home",
  installer: "/(installer)/home",
  supplier: "/(supplier)/home",
  admin: "/(admin)/home",
};

export function RoleGuard({ role, children }: { role: StakeholderRole; children: ReactNode }) {
  const [sessionRole, setSessionRole] = useState<StakeholderRole | null | undefined>(undefined);

  useEffect(() => {
    setSessionRole(readPilotSession()?.role ?? null);
  }, []);

  if (sessionRole === undefined) {
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

  if (sessionRole !== role) {
    return <Redirect href={sessionRole ? homeByRole[sessionRole] : "/(auth)/role-select"} />;
  }

  return children;
}
