import { useState } from "react";
import { Text } from "react-native";
import type { BusinessType } from "@emappa/shared";
import { GlassCard } from "@emappa/ui";
import { ActionButton, ChoiceGroup, OnboardShell, StatusText, TextField, errorMessage, styles, useFinishOnboarding, useRequiredParams } from "../_shared";
import { useAuth } from "../../../components/AuthContext";
import { useApi } from "../../../lib/api";

type InventoryKind = "panel" | "infra";

export default function ProviderInventoryScreen() {
  const api = useApi();
  const { session } = useAuth();
  const { businessName, contact, businessType } = useRequiredParams<{
    businessName: string;
    contact: string;
    businessType: BusinessType;
  }>(["businessName", "contact", "businessType"]);
  const { finish, isSubmitting, error } = useFinishOnboarding("provider", "/(provider)/discover");
  const [sku, setSku] = useState("");
  const [kind, setKind] = useState<InventoryKind>("panel");
  const [stock, setStock] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [inventoryError, setInventoryError] = useState<string | null>(null);

  const completeBody = {
    displayName: businessName,
    businessType,
    profile: {
      business_name: businessName,
      operations_contact: contact,
    },
  };

  async function addInventoryAndFinish() {
    const stockCount = Number(stock);
    const unitPriceKes = Number(unitPrice);
    if (!session?.user?.id) {
      setInventoryError("Your session is missing a user id. Sign in again before adding inventory.");
      return;
    }
    if (!sku.trim()) {
      setInventoryError("Enter an inventory SKU.");
      return;
    }
    if (!Number.isFinite(stockCount) || stockCount < 0) {
      setInventoryError("Enter stock as zero or more units.");
      return;
    }
    if (!Number.isFinite(unitPriceKes) || unitPriceKes <= 0) {
      setInventoryError("Enter a unit price greater than 0 KES.");
      return;
    }

    setInventoryError(null);
    try {
      await api.addProviderInventory(session.user.id, {
        sku: sku.trim(),
        kind,
        stock: stockCount,
        unitPriceKes,
      });
      await finish(completeBody);
    } catch (cause) {
      setInventoryError(errorMessage(cause));
    }
  }

  return (
    <OnboardShell
      eyebrow="Provider"
      title="Add an initial inventory snapshot"
      footer={
        <>
          <ActionButton onPress={addInventoryAndFinish} disabled={isSubmitting}>
            {isSubmitting ? "Finishing..." : "Add item and finish"}
          </ActionButton>
          <ActionButton onPress={() => finish(completeBody)} variant="secondary" disabled={isSubmitting}>
            Skip inventory
          </ActionButton>
        </>
      }
    >
      <GlassCard>
        <Text style={styles.helper}>Optional: add one real SKU now, or skip and manage inventory from the Provider workspace.</Text>
        <TextField label="SKU" value={sku} onChangeText={setSku} placeholder="PANEL-450W" />
        <ChoiceGroup
          label="Kind"
          value={kind}
          onChange={setKind}
          options={[
            { label: "Panel", value: "panel" },
            { label: "Infrastructure", value: "infra" },
          ]}
        />
        <TextField label="Stock" value={stock} onChangeText={setStock} keyboardType="number-pad" placeholder="24" />
        <TextField label="Unit price (KES)" value={unitPrice} onChangeText={setUnitPrice} keyboardType="numeric" placeholder="18000" />
      </GlassCard>
      <StatusText status={inventoryError ?? error} tone="error" />
    </OnboardShell>
  );
}
