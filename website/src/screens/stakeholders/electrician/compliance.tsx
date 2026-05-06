import { PortalKpiBar, PortalPanel, PortalTable } from "../../../components/PortalPrimitives";
import type { PortalScreenProps } from "../../../portal/types";

export default function ElectricianCompliance({ project, data }: PortalScreenProps) {
  const certifications = data.certifications.length ? data.certifications : [
    { name: "Solar PV Installation", issuer: "EPRA", expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString(), status: project.roleViews.installer.certified ? "valid" : "expiring" },
  ];

  return (
    <>
      <PortalKpiBar items={[
        { label: "Active certs", value: String(certifications.length), detail: "uploaded" },
        { label: "Checklist", value: `${project.roleViews.installer.checklistComplete}/${project.roleViews.installer.checklistTotal}`, detail: "complete" },
        { label: "Alerts", value: certifications.some((cert) => cert.status !== "valid") ? "1" : "0", detail: "expiry" },
      ]} />
      <PortalPanel eyebrow="Compliance" title="Certifications and training">
        <PortalTable
          columns={["Certification", "Issuer", "Expiry", "Status"]}
          rows={certifications.map((cert) => [cert.name, cert.issuer, new Date(cert.expiresAt).toLocaleDateString(), cert.status])}
        />
      </PortalPanel>
    </>
  );
}
