import { useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import type { BusinessType } from "@emappa/shared";
import { GlassCard } from "@emappa/ui";
import { ActionButton, ChoiceGroup, OnboardShell, StatusText, TextField, styles } from "../_shared";

export default function ProviderBasicsScreen() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [contact, setContact] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("panels");
  const [error, setError] = useState<string | null>(null);

  function continueToInventory() {
    if (!businessName.trim()) {
      setError("Enter your business name.");
      return;
    }
    if (!contact.trim()) {
      setError("Enter the operations contact for project coordination.");
      return;
    }

    router.push({
      pathname: "/(onboard)/provider/inventory",
      params: {
        businessName: businessName.trim(),
        contact: contact.trim(),
        businessType,
      },
    });
  }

  return (
    <OnboardShell eyebrow="Provider" title="Set up your provider profile" footer={<ActionButton onPress={continueToInventory}>Continue</ActionButton>}>
      <GlassCard>
        <TextField label="Business name" value={businessName} onChangeText={setBusinessName} placeholder="Acme Solar Kenya" />
        <TextField label="Operations contact" value={contact} onChangeText={setContact} placeholder="ops@example.com or +254..." />
        <ChoiceGroup
          label="Business type"
          value={businessType}
          onChange={setBusinessType}
          options={[
            { label: "Panels", value: "panels", detail: "Panel inventory and generation participation." },
            { label: "Infrastructure", value: "infrastructure", detail: "Inverters, batteries, rails, and balance-of-system gear." },
            { label: "Both", value: "both", detail: "Panels plus supporting infrastructure." },
          ]}
        />
        <Text style={styles.helper}>Inventory is optional, but profile completion always posts through the onboarding endpoint.</Text>
      </GlassCard>
      <StatusText status={error} tone="error" />
    </OnboardShell>
  );
}
