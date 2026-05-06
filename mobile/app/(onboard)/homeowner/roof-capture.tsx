import { RoofCaptureStep, useRequiredParams } from "../_shared";

export default function HomeownerRoofCaptureScreen() {
  const { buildingId, lat, lon } = useRequiredParams<{ buildingId: string; lat: string; lon: string }>(["buildingId", "lat", "lon"]);

  return (
    <RoofCaptureStep
      role="homeowner"
      destination="/(homeowner)/home"
      buildingId={buildingId}
      lat={Number(lat)}
      lon={Number(lon)}
      nextLabel="Continue to terms"
      nextHref={`/(onboard)/homeowner/terms?buildingId=${encodeURIComponent(buildingId)}`}
    />
  );
}
