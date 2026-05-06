import { useState } from "react";
import { useRouter } from "expo-router";
import { GlassCard } from "@emappa/ui";
import { ActionButton, MultiChoiceGroup, OnboardShell, StatusText, TextField } from "../_shared";

type ElectricianScope = "install" | "inspection" | "maintenance";

export default function ElectricianBasicsScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [region, setRegion] = useState("");
  const [scope, setScope] = useState<ElectricianScope[]>(["install"]);
  const [error, setError] = useState<string | null>(null);

  function continueToCert() {
    if (!displayName.trim()) {
      setError("Enter your name.");
      return;
    }
    if (!region.trim()) {
      setError("Enter your region of operation.");
      return;
    }
    if (scope.length === 0) {
      setError("Choose at least one work scope.");
      return;
    }

    router.push({
      pathname: "/(onboard)/electrician/cert",
      params: {
        displayName: displayName.trim(),
        region: region.trim(),
        scope: scope.join(","),
      },
    });
  }

  return (
    <OnboardShell eyebrow="Electrician" title="Set your operating profile" footer={<ActionButton onPress={continueToCert}>Continue</ActionButton>}>
      <GlassCard>
        <TextField label="Name" value={displayName} onChangeText={setDisplayName} placeholder="Jane Wanjiku" />
        <TextField label="Region of operation" value={region} onChangeText={setRegion} placeholder="Nyeri County" />
        <MultiChoiceGroup
          label="Scope"
          values={scope}
          onChange={setScope}
          options={[
            { label: "Install", value: "install" },
            { label: "Inspection", value: "inspection" },
            { label: "Maintenance", value: "maintenance" },
          ]}
        />
      </GlassCard>
      <StatusText status={error} tone="error" />
    </OnboardShell>
  );
}
