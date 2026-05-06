import { getWebSections } from "@emappa/shared";
import type { StakeholderScreenProps } from "../../../types";
import { DashboardShell } from "../DashboardShell";
import { InstallerDashboard } from "./InstallerDashboard";

export default function InstallerPortal({ project, onLogout }: StakeholderScreenProps & { onLogout: () => void }) {
  return (
    <DashboardShell role="installer" project={project} navItems={getWebSections("installer")} onLogout={onLogout}>
      {(activeSectionId) => <InstallerDashboard project={project} activeSectionId={activeSectionId} />}
    </DashboardShell>
  );
}
