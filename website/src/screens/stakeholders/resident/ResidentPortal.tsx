import { getWebSections } from "@emappa/shared";
import type { StakeholderScreenProps } from "../../../types";
import { DashboardShell } from "../DashboardShell";
import { ResidentDashboard } from "./ResidentDashboard";

export default function ResidentPortal({ project, onLogout }: StakeholderScreenProps & { onLogout: () => void }) {
  return (
    <DashboardShell role="resident" project={project} navItems={getWebSections("resident")} onLogout={onLogout}>
      {(activeSectionId) => <ResidentDashboard project={project} activeSectionId={activeSectionId} />}
    </DashboardShell>
  );
}
