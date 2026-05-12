import type { ProjectedBuilding } from "@emappa/shared";

type ResidentCompatibleBuilding = Partial<ProjectedBuilding> & {
  unitCount?: number;
  prepaidCommittedKes?: number;
  project?: Partial<ProjectedBuilding["project"]>;
  roleViews?: {
    resident?: Partial<ProjectedBuilding["roleViews"]["resident"]>;
  };
};

export function residentView(building: ProjectedBuilding) {
  const raw = building as ResidentCompatibleBuilding;
  const units = Number(raw.project?.units ?? raw.unitCount ?? 1) || 1;
  const prepaidCommittedKes = Number(raw.project?.prepaidCommittedKes ?? raw.prepaidCommittedKes ?? 0) || 0;

  return {
    prepaidBalanceKes: Math.round(prepaidCommittedKes / units),
    averagePrepaidBalanceKes: Math.round(prepaidCommittedKes / units),
    monthlySolarKwh: 0,
    savingsKes: 0,
    solarCoverage: prepaidCommittedKes > 0 ? 0.42 : 0,
    ownedProviderShare: 0,
    ...(raw.roleViews?.resident ?? {}),
  };
}

export function formatKes(value: number) {
  return `KSh ${Math.round(value).toLocaleString()}`;
}

export function formatKwh(value: number) {
  return `${Math.round(value).toLocaleString()} kWh`;
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}
