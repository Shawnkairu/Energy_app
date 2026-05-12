import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { GlassCard, colors } from "@emappa/ui";
import { ActionButton, OnboardShell, StatusText, TextField, errorMessage, styles, useGeocodedAddress } from "../_shared";
import { useApi } from "../../../lib/api";

export default function HomeownerAddressScreen() {
  const api = useApi();
  const router = useRouter();
  const { address, setAddress, geocode, isGeocoding, geocodeError, geocodeAddress } = useGeocodedAddress();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createHome() {
    if (!geocode) {
      setError("Confirm a geocoded address before continuing. The address geocodes when the field loses focus.");
      return;
    }

    setIsCreating(true);
    setError(null);
    try {
      const result = await api.createBuilding({
        name: `Home at ${geocode.formattedAddress}`,
        address: geocode.formattedAddress,
        lat: geocode.lat,
        lon: geocode.lon,
        unitCount: 1,
        occupancy: 1,
        kind: "single_family",
      });
      router.push({
        pathname: "/(onboard)/homeowner/roof-capture",
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
      eyebrow="Homeowner"
      title="Start with your home address"
      footer={
        <ActionButton
          onPress={createHome}
          disabled={isCreating || isGeocoding}
          accessibilityLabel={isCreating ? "Creating project" : isGeocoding ? "Waiting for geocode" : "Continue to roof capture"}
        >
          {isCreating ? "Creating..." : "Continue"}
        </ActionButton>
      }
    >
      <GlassCard>
        <TextField label="Home address" value={address} onChangeText={setAddress} onBlur={geocodeAddress} placeholder="Street, town, country" />
        <Text style={styles.helper}>Homeowners are automatically set as single-family, one-unit projects.</Text>
        {geocode ? <Text style={styles.success}>Geocoded: {geocode.formattedAddress}</Text> : null}
        {isGeocoding ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
            <ActivityIndicator color={colors.orangeDeep} size="small" />
            <Text style={styles.helper}>Pinning address on the map…</Text>
          </View>
        ) : null}
      </GlassCard>
      <StatusText status={geocodeError ?? error} tone="error" />
    </OnboardShell>
  );
}
