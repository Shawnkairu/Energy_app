import { getWebSections } from "@emappa/shared";
import type { StakeholderScreenProps } from "../../../types";
import { DashboardShell } from "../DashboardShell";
import { OwnerDashboard } from "./OwnerDashboard";

export default function OwnerPortal({ project, onLogout }: StakeholderScreenProps & { onLogout: () => void }) {
  return (
    <DashboardShell role="owner" project={project} navItems={getWebSections("owner")} onLogout={onLogout}>
      {(activeSectionId) => <OwnerDashboard project={project} activeSectionId={activeSectionId} />}
    </DashboardShell>
  );
}
