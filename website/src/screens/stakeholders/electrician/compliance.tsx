import { PortalKpiBar, PortalLedger, PortalPanel, PortalTable, PortalWorkflow } from "../../../components/PortalPrimitives";
import type { PortalScreenProps } from "../../../portal/types";

const daysUntil = (isoDate: string) => Math.ceil((new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
const dateLabel = (isoDate: string) => new Date(isoDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

/** Certification / training / expiry detail — embedded on Profile for IA (no extra nav tab). */
export function ElectricianComplianceContent({ project, user, data }: PortalScreenProps) {
  const certifications = data.certifications.length ? data.certifications : [
    {
      id: "solar-pv",
      electricianUserId: user.id,
      name: "Solar PV Installation",
      issuer: "EPRA",
      docUrl: "",
      issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(),
      status: project.roleViews.electrician.certified ? "valid" as const : "expiring" as const,
    },
    {
      id: "site-safety",
      electricianUserId: user.id,
      name: "Site Safety Induction",
      issuer: "Emappa field ops",
      docUrl: "",
      issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(),
      status: "valid" as const,
    },
  ];
  const validCerts = certifications.filter((cert) => cert.status === "valid").length;
  const attentionCerts = certifications.filter((cert) => cert.status !== "valid");
  const checklistTotal = Math.max(project.roleViews.electrician.checklistTotal, 1);
  const checklistPct = Math.round((project.roleViews.electrician.checklistComplete / checklistTotal) * 100);

  return (
    <>
      <PortalKpiBar items={[
        { label: "Valid certs", value: `${validCerts}/${certifications.length}`, detail: "uploaded" },
        { label: "Checklist", value: `${checklistPct}%`, detail: `${project.roleViews.electrician.checklistComplete}/${project.roleViews.electrician.checklistTotal} complete` },
        { label: "Alerts", value: String(attentionCerts.length), detail: "expiry watch" },
      ]} />
      <div className="portal-two-col">
        <PortalPanel eyebrow="Compliance" title="Certifications and training">
          <PortalTable
            columns={["Certification", "Issuer", "Expiry", "Status"]}
            rows={certifications.map((cert) => [
              cert.name,
              cert.issuer,
              dateLabel(cert.expiresAt),
              cert.status,
            ])}
          />
        </PortalPanel>
        <PortalPanel eyebrow="Readiness" title={project.roleViews.electrician.certified ? "Cleared for field work" : "Certification needed"}>
          <PortalWorkflow
            steps={[
              { label: "Identity and contact", detail: "Profile is visible to project ops.", status: "done" },
              { label: "Certification review", detail: attentionCerts.length ? "Refresh expiring credentials before dispatch." : "Lead electrician credential accepted.", status: attentionCerts.length ? "pending" : "done" },
              { label: "Install checklist", detail: `${project.roleViews.electrician.checklistComplete} of ${project.roleViews.electrician.checklistTotal} gates complete.`, status: checklistPct === 100 ? "done" : "pending" },
            ]}
          />
          <PortalLedger rows={[
            { label: "Nearest expiry", value: certifications.map((cert) => daysUntil(cert.expiresAt)).sort((a, b) => a - b)[0] + " days", note: "auto-sorted" },
            { label: "Dispatch state", value: project.roleViews.electrician.certified ? "Eligible" : "Hold", note: "compliance gate" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}

export default ElectricianComplianceContent;
