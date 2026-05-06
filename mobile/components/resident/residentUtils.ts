import type { ProjectedBuilding } from "@emappa/shared";

export function residentView(building: ProjectedBuilding) {
  return building.roleViews.resident;
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
