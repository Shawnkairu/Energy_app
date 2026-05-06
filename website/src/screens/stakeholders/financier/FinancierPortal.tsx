import { getWebSections } from "@emappa/shared";
import type { StakeholderScreenProps } from "../../../types";
import { DashboardShell } from "../DashboardShell";
import { FinancierDashboard } from "./FinancierDashboard";

export default function FinancierPortal({ project, onLogout }: StakeholderScreenProps & { onLogout: () => void }) {
  return (
    <DashboardShell role="financier" project={project} navItems={getWebSections("financier")} onLogout={onLogout}>
      {(activeSectionId) => <FinancierDashboard project={project} activeSectionId={activeSectionId} />}
    </DashboardShell>
  );
}
