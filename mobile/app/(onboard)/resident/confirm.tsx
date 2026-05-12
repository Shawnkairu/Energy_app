import { Text } from "react-native";
import { useRouter } from "expo-router";
import { GlassCard } from "@emappa/ui";
import { ActionButton, OnboardShell, useRequiredParams, styles } from "../_shared";

export default function ResidentConfirmBuildingScreen() {
  const router = useRouter();
  const { buildingId, name, address, kind, unitCount } = useRequiredParams<{
    buildingId: string;
    name: string;
    address: string;
    kind: string;
    unitCount: string;
  }>(["buildingId", "name", "address", "kind", "unitCount"]);

  return (
    <OnboardShell
      eyebrow="Resident"
      title="Confirm your building"
      footer={
        <>
          <ActionButton
            onPress={() =>
              router.push({
                pathname: "/(onboard)/resident/first-pledge",
                params: { buildingId },
              })
            }
            accessibilityLabel="Confirm this is my building"
          >
            This is my building
          </ActionButton>
          <ActionButton onPress={() => router.replace("/(onboard)/resident")} variant="secondary" accessibilityLabel="Go back, wrong building">
            Wrong building
          </ActionButton>
        </>
      }
    >
      <GlassCard>
        <Text style={styles.cardTitle}>{name}</Text>
        <Text style={styles.helper}>{address}</Text>
        <Text style={styles.helper}>
          {kind.replace("_", " ")} · {Number(unitCount).toLocaleString()} unit{unitCount === "1" ? "" : "s"}
        </Text>
      </GlassCard>
    </OnboardShell>
  );
}
