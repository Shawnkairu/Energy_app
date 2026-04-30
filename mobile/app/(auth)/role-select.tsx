import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";
import type { StakeholderRole } from "@emappa/shared";
import { colors, Surface } from "@emappa/ui";
import { saveSelectedRole } from "../../components/session";

const roles = [
  ["Resident", "resident", "/(resident)/home"],
  ["Building Owner", "owner", "/(owner)/home"],
  ["Provider", "provider", "/(provider)/home"],
  ["Financier", "financier", "/(financier)/home"],
  ["Electrician", "installer", "/(installer)/home"],
  ["Supplier", "supplier", "/(supplier)/home"],
  ["Admin", "admin", "/(admin)/home"],
] as const;

export default function RoleSelect() {
  const router = useRouter();

  function chooseRole(role: StakeholderRole, href: string) {
    saveSelectedRole(role);
    router.replace(href);
  }

  return (
    <Surface>
      <Text style={{ color: colors.text, fontSize: 34, fontWeight: "900", marginVertical: 34 }}>
        Choose your role
      </Text>
      {roles.map(([label, role, href]) => (
        <Pressable key={label} onPress={() => chooseRole(role, href)}>
          <Text style={{ color: colors.text, paddingVertical: 14, fontSize: 18, fontWeight: "800" }}>
            {label}
          </Text>
        </Pressable>
      ))}
    </Surface>
  );
}
