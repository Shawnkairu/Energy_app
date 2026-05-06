import { useState } from "react";
import { Text } from "react-native";
import { GlassCard } from "@emappa/ui";
import { ActionButton, OnboardShell, StatusText, TextField, errorMessage, styles, useFinishOnboarding, useRequiredParams } from "../_shared";
import { useAuth } from "../../../components/AuthContext";
import { useApi } from "../../../lib/api";

type ElectricianScope = "install" | "inspection" | "maintenance";

export default function ElectricianCertificationScreen() {
  const api = useApi();
  const { session } = useAuth();
  const { displayName, region, scope } = useRequiredParams<{ displayName: string; region: string; scope: string }>([
    "displayName",
    "region",
    "scope",
  ]);
  const { finish, isSubmitting, error } = useFinishOnboarding("electrician", "/(electrician)/discover");
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [certError, setCertError] = useState<string | null>(null);

  const completeBody = {
    displayName,
    profile: {
      region,
      scope: scope.split(",").filter(Boolean) as ElectricianScope[],
    },
  };

  async function addCertAndFinish() {
    if (!session?.user?.id) {
      setCertError("Your session is missing a user id. Sign in again before adding certification.");
      return;
    }
    if (!name.trim() || !issuer.trim() || !expiresAt.trim()) {
      setCertError("Enter the certification name, issuer, and expiry date.");
      return;
    }

    setCertError(null);
    try {
      await api.addCertification(session.user.id, {
        name: name.trim(),
        issuer: issuer.trim(),
        docUrl: docUrl.trim() || undefined,
        issuedAt: new Date().toISOString(),
        expiresAt: expiresAt.trim(),
      });
      await finish(completeBody);
    } catch (cause) {
      setCertError(errorMessage(cause));
    }
  }

  return (
    <OnboardShell
      eyebrow="Electrician"
      title="Add a certification"
      footer={
        <>
          <ActionButton onPress={addCertAndFinish} disabled={isSubmitting}>
            {isSubmitting ? "Finishing..." : "Add certification and finish"}
          </ActionButton>
          <ActionButton onPress={() => finish(completeBody)} variant="secondary" disabled={isSubmitting}>
            Add later
          </ActionButton>
        </>
      }
    >
      <GlassCard>
        <Text style={styles.helper}>Optional: upload a real certification record now, or add it later from Compliance.</Text>
        <TextField label="Certification name" value={name} onChangeText={setName} placeholder="EPRA Solar PV T2" />
        <TextField label="Issuer" value={issuer} onChangeText={setIssuer} placeholder="EPRA" />
        <TextField label="Document URL" value={docUrl} onChangeText={setDocUrl} placeholder="https://..." />
        <TextField label="Expires at" value={expiresAt} onChangeText={setExpiresAt} placeholder="2027-12-31" />
      </GlassCard>
      <StatusText status={certError ?? error} tone="error" />
    </OnboardShell>
  );
}
