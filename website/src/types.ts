import type { ProjectedBuilding, StakeholderRole } from "@emappa/shared";

export type WebRole = Exclude<StakeholderRole, "admin">;

export interface StakeholderScreenProps {
  project: ProjectedBuilding;
  activeSectionId?: string;
}

export interface RoleConfig {
  id: WebRole;
  label: string;
  shortLabel: string;
  accessLabel: string;
  promise: string;
  unlockCopy: string;
}
