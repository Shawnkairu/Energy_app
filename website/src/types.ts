import type { ProjectedBuilding, PublicRole } from "@emappa/shared";

export type WebRole = PublicRole;

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
