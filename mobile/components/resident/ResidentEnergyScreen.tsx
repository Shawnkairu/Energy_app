import { useCallback, useRef } from "react";
import type { ProjectedBuilding } from "@emappa/shared";
import { PrimaryButton } from "@emappa/ui";
import { EnergyTodayChart } from "../EnergyTodayChart";
import { useApi } from "../../lib/api";
import { useApiData } from "../../lib/useApiData";
import { getResidentEnergyToday } from "./ResidentApi";
import { CenteredState, ResidentInfoCard, ResidentMetricGrid, ResidentScreenFrame } from "./ResidentScaffold";
import { formatKwh, formatPercent, residentView } from "./residentUtils";

export function ResidentEnergyScreen() {
  return (
    <ResidentScreenFrame
      section="Energy"
      title="Energy flow"
      subtitle="Usage, sold solar, and grid fallback for this resident account."
    >
      {(building) => <ResidentEnergyPanels building={building} />}
    </ResidentScreenFrame>
  );
}

function ResidentEnergyPanels({ building }: { building: ProjectedBuilding }) {
  const api = useApi();
  const apiRef = useRef(api);
  apiRef.current = api;
  const load = useCallback(() => getResidentEnergyToday(apiRef.current, building.project.id), [building.project.id]);
  const { data, error, isLoading, refetch } = useApiData(load, [building.project.id]);
  const view = residentView(building);
  const householdGridKwh = building.energy.E_grid / building.project.units;
  const householdBatteryKwh = building.energy.E_battery_used / building.project.units;

  if (isLoading) {
    return <CenteredState title="Loading energy data" detail="Fetching today's generation and load from the API." />;
  }

  if (error) {
    return <CenteredState title="Energy data unavailable" detail={error.message} actionLabel="Retry" onAction={refetch} />;
  }

  const points = (data?.generation_kwh ?? []).map((value, index) => ({
    label: formatHour(index),
    value,
  }));

  return (
    <>
      <EnergyTodayChart title="Solar generation today" points={points} unit="kWh" />

      <ResidentMetricGrid
        items={[
          {
            label: "Solar",
            value: formatKwh(view.monthlySolarKwh),
            detail: "Sold solar allocated to this household this month.",
            tone: view.monthlySolarKwh > 0 ? "good" : "warn",
          },
          {
            label: "Coverage",
            value: formatPercent(view.solarCoverage),
            detail: "Share of household load covered by monetized local solar.",
            tone: view.solarCoverage > 0 ? "good" : "neutral",
          },
          {
            label: "Battery",
            value: formatKwh(householdBatteryKwh),
            detail: "Resident share of stored support after direct solar.",
          },
          {
            label: "Grid",
            value: formatKwh(householdGridKwh),
            detail: "Fallback energy remains outside prepaid solar allocation.",
            tone: householdGridKwh > 0 ? "warn" : "good",
          },
        ]}
      />

      <ResidentInfoCard
        eyebrow="Source truth"
        title="Solar first, fallback clearly labeled."
        detail="Energy views separate generated power from prepaid solar that residents actually bought. This keeps savings and payouts tied to monetized solar only."
        synthetic
      >
        <PrimaryButton onPress={refetch}>Refresh energy</PrimaryButton>
      </ResidentInfoCard>
    </>
  );
}

function formatHour(index: number) {
  return `${String(index).padStart(2, "0")}:00`;
}
