import { PortalLedger, PortalPanel } from "../../../components/PortalPrimitives";
import { ProfileBlocks, kes, pct } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function FinancierProfile({ project, user }: PortalScreenProps) {
  const view = project.roleViews.financier;
  const targetBand = view.remainingCapitalKes > 750000 ? "KSh 250k-1.5m" : "KSh 50k-750k";

  return (
    <ProfileBlocks
      user={user}
      roleLabel="Financier"
      extra={(
        <PortalPanel eyebrow="Investor profile" title="Target deal shape">
          <PortalLedger rows={[
            { label: "Investor type", value: "Individual / institution", note: "pilot profile" },
            { label: "Target deal size", value: targetBand, note: `${kes(view.remainingCapitalKes)} currently open` },
            { label: "Target return", value: project.transparency.roiRange, note: "modeled from utilization" },
            { label: "Risk preference", value: project.drs.decision === "deployment_ready" ? "Ready deals" : "Gated review", note: `${project.drs.score} DRS score` },
            { label: "Deployment limit", value: pct(view.fundingProgress), note: "capital stack already funded" },
            { label: "KYC / escrow", value: view.kycEscrow?.status.replace(/_/g, " ") ?? "prototype", note: view.kycEscrow?.detail ?? "pilot-only capital status" },
          ]} />
        </PortalPanel>
      )}
    />
  );
}
