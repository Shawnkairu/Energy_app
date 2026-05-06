import { PledgeStep, useRequiredParams } from "../_shared";

export default function ResidentFirstPledgeScreen() {
  const { buildingId } = useRequiredParams<{ buildingId: string }>(["buildingId"]);

  return <PledgeStep role="resident" destination="/(resident)/home" buildingId={buildingId} />;
}
