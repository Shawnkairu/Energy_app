import { useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { GlassCard } from "@emappa/ui";
import { ActionButton, OnboardShell, StatusText, TextField, errorMessage, styles } from "../_shared";
import { useApi } from "../../../lib/api";

export default function ResidentInviteScreen() {
  const api = useApi();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    const inviteCode = code.trim();
    if (!inviteCode) {
      setError("Enter the building invite code from your owner or QR card.");
      return;
    }

    setIsJoining(true);
    setError(null);
    try {
      const result = await api.joinBuilding(inviteCode);
      router.push({
        pathname: "/(onboard)/resident/confirm",
        params: {
          buildingId: result.building.id,
          name: result.building.name,
          address: result.building.address,
          kind: result.building.kind,
          unitCount: String(result.building.unitCount),
        },
      });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <OnboardShell
      eyebrow="Resident"
      title="Join your building"
      footer={<ActionButton onPress={join} disabled={isJoining}>{isJoining ? "Checking..." : "Continue"}</ActionButton>}
    >
      <GlassCard>
        <TextField label="Invite code or QR code text" value={code} onChangeText={setCode} placeholder="NYERI-RIDGE-A" />
        <Text style={styles.helper}>Your building owner shares this code after listing the building with e.mappa.</Text>
      </GlassCard>
      <StatusText status={error} tone="error" />
    </OnboardShell>
  );
}
