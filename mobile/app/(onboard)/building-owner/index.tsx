import { useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { GlassCard } from "@emappa/ui";
import { ActionButton, OnboardShell, StatusText, TextField, errorMessage, styles, useGeocodedAddress } from "../_shared";
import { useApi } from "../../../lib/api";

export default function BuildingOwnerBasicsScreen() {
  const api = useApi();
  const router = useRouter();
  const { address, setAddress, geocode, isGeocoding, geocodeError, geocodeAddress } = useGeocodedAddress();
  const [name, setName] = useState("");
  const [unitCount, setUnitCount] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createBuilding() {
    const units = Number(unitCount);
    const occupancyPct = Number(occupancy);
    if (!name.trim()) {
      setError("Enter the building name.");
      return;
    }
    if (!geocode) {
      setError("Confirm a geocoded address before continuing. The address geocodes when the field loses focus.");
      return;
    }
    if (!Number.isInteger(units) || units <= 1) {
      setError("Enter the number of apartment units. Building-owner onboarding is for multi-unit properties.");
      return;
    }
    if (!Number.isFinite(occupancyPct) || occupancyPct < 0 || occupancyPct > 100) {
      setError("Enter occupancy as a percentage from 0 to 100.");
      return;
    }

    setIsCreating(true);
    setError(null);
    try {
      const result = await api.createBuilding({
        name: name.trim(),
        address: geocode.formattedAddress,
        lat: geocode.lat,
        lon: geocode.lon,
        unitCount: units,
        occupancy: occupancyPct / 100,
        kind: "apartment",
      });
      router.push({
        pathname: "/(onboard)/building-owner/roof",
        params: {
          buildingId: result.building.id,
          lat: String(result.building.lat),
          lon: String(result.building.lon),
        },
      });
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <OnboardShell
      eyebrow="Building owner"
      title="List your building"
      footer={<ActionButton onPress={createBuilding} disabled={isCreating || isGeocoding}>{isCreating ? "Creating..." : "Continue"}</ActionButton>}
    >
      <GlassCard>
        <TextField label="Building name" value={name} onChangeText={setName} placeholder="Nyeri Ridge A" />
        <TextField label="Address" value={address} onChangeText={setAddress} onBlur={geocodeAddress} placeholder="Street, town, country" />
        <TextField label="Unit count" value={unitCount} onChangeText={setUnitCount} keyboardType="number-pad" placeholder="12" />
        <TextField label="Occupancy estimate (%)" value={occupancy} onChangeText={setOccupancy} keyboardType="numeric" placeholder="85" />
        <Text style={styles.helper}>Readiness gates use these basics before funding, supplier lock, installer scheduling, and go-live.</Text>
        {geocode ? <Text style={styles.success}>Geocoded: {geocode.formattedAddress}</Text> : null}
      </GlassCard>
      <StatusText status={geocodeError ?? error} tone="error" />
    </OnboardShell>
  );
}
