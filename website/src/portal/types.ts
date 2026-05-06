import type { ProjectedBuilding, PublicRole, StakeholderSection, User } from "@emappa/shared";
import type { PortalData } from "../lib/api";

export interface PortalScreenProps {
  project: ProjectedBuilding;
  user: User;
  data: PortalData;
}

export interface PortalShellProps {
  role: PublicRole;
  user: User;
  project: ProjectedBuilding;
  data: PortalData;
  sections: readonly StakeholderSection[];
  activeTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}
