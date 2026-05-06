import type { ApiClient } from "@emappa/api-client";
import type { PrepaidCommitment, ProjectedBuilding } from "@emappa/shared";

export interface ResidentHomeData {
  primary: ProjectedBuilding | null;
  projects: ProjectedBuilding[];
  activity: string[];
}

export interface ResidentEnergyToday {
  generation_kwh: number[];
  load_kwh: number[];
  irradiance_w_m2: number[];
}

export interface ResidentPrepaidBalance {
  confirmedTotalKes: number;
}

export function getResidentHome(api: ApiClient) {
  return api.roleHome("resident") as Promise<ResidentHomeData>;
}

export function getResidentEnergyToday(api: ApiClient, buildingId: string) {
  return api.getEnergyToday(buildingId) as Promise<ResidentEnergyToday>;
}

export function getResidentPrepaidBalance(api: ApiClient, buildingId: string) {
  return api.getPrepaidBalance(buildingId) as Promise<ResidentPrepaidBalance>;
}

export function getResidentPrepaidHistory(api: ApiClient, buildingId: string) {
  return api.getPrepaidHistory(buildingId) as Promise<PrepaidCommitment[]>;
}

export function commitResidentPrepaid(api: ApiClient, buildingId: string, amountKes: number) {
  return api.commitPrepaid({ buildingId, amountKes }) as Promise<{ commitment: PrepaidCommitment }>;
}
