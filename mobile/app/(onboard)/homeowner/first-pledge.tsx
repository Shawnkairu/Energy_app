import { PledgeStep, useRequiredParams } from "../_shared";

export default function HomeownerFirstPledgeScreen() {
  const { buildingId } = useRequiredParams<{ buildingId: string }>(["buildingId"]);

  return <PledgeStep role="homeowner" destination="/(homeowner)/home" buildingId={buildingId} />;
}
