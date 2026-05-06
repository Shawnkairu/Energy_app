import { getWebSections } from "@emappa/shared";
import type { StakeholderScreenProps } from "../../../types";
import { DashboardShell } from "../DashboardShell";
import { ProviderDashboard } from "./ProviderDashboard";

export default function ProviderPortal({ project, onLogout }: StakeholderScreenProps & { onLogout: () => void }) {
  return (
    <DashboardShell role="provider" project={project} navItems={getWebSections("provider")} onLogout={onLogout}>
      {(activeSectionId) => <ProviderDashboard project={project} activeSectionId={activeSectionId} />}
    </DashboardShell>
  );
}
