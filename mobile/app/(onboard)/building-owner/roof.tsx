import { RoofCaptureStep, useRequiredParams } from "../_shared";

export default function BuildingOwnerRoofScreen() {
  const { buildingId, lat, lon } = useRequiredParams<{ buildingId: string; lat: string; lon: string }>(["buildingId", "lat", "lon"]);

  return (
    <RoofCaptureStep
      role="building_owner"
      destination="/(building-owner)/home"
      buildingId={buildingId}
      lat={Number(lat)}
      lon={Number(lon)}
      nextLabel="Continue to terms"
      nextHref={`/(onboard)/building-owner/terms?buildingId=${encodeURIComponent(buildingId)}`}
    />
  );
}
