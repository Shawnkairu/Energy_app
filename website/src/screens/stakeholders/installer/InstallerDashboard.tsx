import { GateList } from "../../../components/GateList";
import { PortalKpiBar, PortalLedger, PortalPanel, PortalTable, PortalWorkflow } from "../../../components/PortalPrimitives";
import { PrivacyNote } from "../../../components/PrivacyNote";
import { ProgressBar } from "../../../components/ProgressBar";
import type { StakeholderScreenProps } from "../../../types";

export function InstallerDashboard({ project, activeSectionId = "home" }: StakeholderScreenProps) {
  const view = project.roleViews.installer;
  const checklistRatio = view.checklistTotal > 0 ? view.checklistComplete / view.checklistTotal : 0;

  if (activeSectionId === "certification") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Certified lead", value: view.certified ? "Assigned" : "Missing", detail: "scheduling gate" },
            { label: "Installer readiness", value: `${project.drs.components.installerReadiness}`, detail: "DRS component" },
            { label: "Go-live authority", value: view.certified ? "Available" : "Blocked", detail: "proof still required" },
            { label: "Building", value: project.project.name, detail: "named job" },
          ]}
        />
        <PortalPanel eyebrow="Certification" title="Lead electrician eligibility">
          <p>No certified lead means no deployment scheduling. Certification stays narrow: one accountable lead, one named building, and a clear DRS kill switch if eligibility is missing.</p>
          <ProgressBar value={project.drs.components.installerReadiness / 100} label="Installer readiness" />
          <PortalLedger
            rows={[
              { label: "Certified lead", value: view.certified ? "Assigned" : "Missing", note: "required before scheduling" },
              { label: "DRS installer component", value: `${project.drs.components.installerReadiness}/100`, note: "field readiness score" },
              { label: "Session scope", value: "Installer only", note: "no finance or provider private economics" },
            ]}
          />
        </PortalPanel>
      </div>
    );
  }

  if (activeSectionId === "checklist") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Checklist", value: `${view.checklistComplete}/${view.checklistTotal}`, detail: "before go-live" },
            { label: "Progress", value: `${Math.round(checklistRatio * 100)}%`, detail: "proof completion" },
            { label: "DRS", value: project.drs.label, detail: "deployment gate" },
            { label: "Settlement trust", value: project.project.drs.settlementDataTrusted ? "Trusted" : "Pending", detail: "reading proof" },
          ]}
        />
        <PortalPanel eyebrow="Verification checklist" title="Proof before go-live">
          <GateList gates={view.gates} />
        </PortalPanel>
        <PortalPanel eyebrow="Checklist doctrine" title="Proof capture is concentrated here.">
          <p>This is the installer screen with the full go-live checklist, keeping evidence capture concentrated instead of repeated everywhere.</p>
        </PortalPanel>
      </div>
    );
  }

  if (activeSectionId === "job-detail") {
    return (
      <div className="dashboard-stack">
        <PortalPanel eyebrow="Job detail" title="Photos, readings, and connectivity">
          <PortalTable
            columns={["Evidence", "Status", "Use"]}
            rows={[
              ["DB photo", project.drs.components.installationReadiness >= 60 ? "Ready" : "Needed", "confirm board condition and isolation"],
              ["Meter map", project.project.drs.settlementDataTrusted ? "Trusted" : "Pending", "bind readings to apartments"],
              ["Cable route", project.drs.components.installationReadiness >= 60 ? "Mapped" : "Review", "avoid unsafe or impractical runs"],
              ["Test readings", project.project.drs.settlementDataTrusted ? "Reconciled" : "Required", "settlement cannot guess"],
              ["Monitoring", project.project.drs.monitoringConnectivityResolved ? "Online" : "Blocked", "go-live and support signal"],
            ]}
          />
        </PortalPanel>
      </div>
    );
  }

  if (activeSectionId === "maintenance") {
    return (
      <div className="dashboard-stack">
        <PortalKpiBar
          items={[
            { label: "Open tickets", value: `${view.maintenanceTickets}`, detail: "post-live service" },
            { label: "Monitoring", value: project.project.drs.monitoringConnectivityResolved ? "Online" : "Blocked", detail: "data trust" },
            { label: "Reading trust", value: project.project.drs.settlementDataTrusted ? "Trusted" : "Needs proof", detail: "settlement" },
            { label: "Building", value: project.project.name, detail: "service scope" },
          ]}
        />
        <PortalPanel eyebrow="Maintenance tickets" title="Post-live service tickets">
          <PortalLedger
            rows={[
              { label: "Open tickets", value: `${view.maintenanceTickets}`, note: "monitoring, readings, or field service" },
              { label: "Monitoring", value: project.project.drs.monitoringConnectivityResolved ? "Online" : "Connectivity blocked", note: "settlement proof" },
              { label: "Reading trust", value: project.project.drs.settlementDataTrusted ? "Trusted" : "Needs proof", note: "production and apartment demand" },
            ]}
          />
        </PortalPanel>
        <PrivacyNote>Maintenance work shows job and quality data. Sensitive project financing stays outside the installer layer.</PrivacyNote>
      </div>
    );
  }

  return (
    <div className="dashboard-stack">
      <PortalKpiBar
        items={[
          { label: "Checklist", value: `${view.checklistComplete}/${view.checklistTotal}`, detail: "before go-live" },
          { label: "Site readiness", value: `${project.drs.components.installationReadiness}`, detail: "DB, route, roof" },
          { label: "Installer readiness", value: `${project.drs.components.installerReadiness}`, detail: "certified lead" },
          { label: "Deployment", value: project.drs.decision, detail: "DRS gate" },
        ]}
      />

      <PortalWorkflow
        steps={[
          { label: "Review site", detail: "Installer starts from DRS, roof access, DB readiness, and route constraints.", status: project.drs.label },
          { label: "Capture proof", detail: "Photos, readings, and connectivity evidence unlock go-live.", status: `${view.checklistComplete}/${view.checklistTotal}` },
          { label: "Map readings", detail: "Production, resident meters, and grid import/export must reconcile.", status: project.project.drs.settlementDataTrusted ? "trusted" : "pending" },
          { label: "Maintain", detail: "Post-live tickets protect settlement trust.", status: `${view.maintenanceTickets} tickets` },
        ]}
      />

      <section className="portal-two-column">
        <PortalPanel id="certification" eyebrow="Certification bay" title="Certified lead status controls scheduling.">
          <PortalLedger
            rows={[
              { label: "Certified lead", value: view.certified ? "Assigned" : "Missing", note: "required before scheduling" },
              { label: "Installer readiness", value: `${project.drs.components.installerReadiness}/100`, note: "DRS component" },
              { label: "Go-live authority", value: view.certified ? "Available" : "Blocked", note: "proof still required" },
            ]}
          />
          <ProgressBar value={project.drs.components.installerReadiness / 100} label="Installer readiness" />
        </PortalPanel>
        <PortalPanel id="checklist" eyebrow="Verification checklist" title="Certification is earned, not automatic.">
          <GateList gates={view.gates} />
        </PortalPanel>
      </section>

      <PortalPanel id="job-detail" eyebrow="Job detail" title="The desktop view turns the mobile field checklist into an evidence board.">
        <PortalTable
          columns={["Evidence", "Status", "Use"]}
          rows={[
            ["DB photo", project.drs.components.installationReadiness >= 60 ? "Ready" : "Needed", "confirm board condition and isolation"],
            ["Meter map", project.project.drs.settlementDataTrusted ? "Trusted" : "Pending", "bind readings to apartments"],
            ["Cable route", project.drs.components.installationReadiness >= 60 ? "Mapped" : "Review", "avoid unsafe or impractical runs"],
            ["Test readings", project.project.drs.settlementDataTrusted ? "Reconciled" : "Required", "settlement cannot guess"],
            ["Monitoring", project.project.drs.monitoringConnectivityResolved ? "Online" : "Blocked", "go-live and support signal"],
          ]}
        />
      </PortalPanel>

      <section className="portal-two-column">
        <PortalPanel eyebrow="Site proof packet" title="Every required artifact has a specific reason.">
          <PortalLedger
            rows={["DB photo", "Meter map", "Cable route", "Roof works", "Test readings", "Connectivity"].map((item) => ({
              label: item,
              value: "Required",
              note: "go-live evidence",
            }))}
          />
        </PortalPanel>
        <PortalPanel id="maintenance" eyebrow="Maintenance tickets" title="Post-live service keeps settlement trusted.">
          <PortalLedger
            rows={[
              { label: "Open tickets", value: `${view.maintenanceTickets}`, note: "monitoring, readings, or field service" },
              { label: "Monitoring", value: project.project.drs.monitoringConnectivityResolved ? "Online" : "Connectivity blocked", note: "settlement proof" },
              { label: "Reading trust", value: project.project.drs.settlementDataTrusted ? "Trusted" : "Needs proof", note: "production and apartment demand" },
            ]}
          />
        </PortalPanel>
      </section>

      <PrivacyNote>Electricians see job, quality, and checklist data. Sensitive project financing stays outside the installer layer.</PrivacyNote>
    </div>
  );
}
