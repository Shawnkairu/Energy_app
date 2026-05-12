import { PortalKpiBar, PortalLedger, PortalPanel, PortalTable, PortalWorkflow } from "../../../components/PortalPrimitives";
import { kes } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

const statusLabel = (status: string) => status.replace("_", " ");

export default function ElectricianJobs({ project, user, data }: PortalScreenProps) {
  const jobs = data.jobs.length ? data.jobs : [
    {
      id: "install",
      electricianUserId: user.id,
      buildingId: project.project.id,
      scope: "install" as const,
      status: "active" as const,
      checklist: project.roleViews.installer.gates.map((gate, index) => ({
        id: String(index),
        label: gate.label,
        status: gate.complete ? "done" as const : "pending" as const,
      })),
      payEstimateKes: 42000,
      startedAt: null,
      completedAt: null,
    },
    {
      id: "inspection",
      electricianUserId: user.id,
      buildingId: project.project.id,
      scope: "inspection" as const,
      status: project.roleViews.installer.certified ? "completed" as const : "active" as const,
      checklist: [
        { id: "cert", label: "Lead electrician certification checked", status: project.roleViews.installer.certified ? "done" as const : "pending" as const },
        { id: "roof", label: "Roof access and DB route photographed", status: "done" as const },
      ],
      payEstimateKes: 18500,
      startedAt: null,
      completedAt: project.roleViews.installer.certified ? new Date().toISOString() : null,
    },
  ];
  const activeJobs = jobs.filter((job) => job.status === "active");
  const completedJobs = jobs.filter((job) => job.status === "completed");
  const nextJob = activeJobs[0];
  const openChecklistItems = jobs.flatMap((job) => job.checklist.filter((item) => item.status !== "done"));
  const activePay = activeJobs.reduce((sum, job) => sum + job.payEstimateKes, 0);

  return (
    <>
      <PortalKpiBar items={[
        { label: "Active jobs", value: String(activeJobs.length), detail: kes(activePay) },
        { label: "Completed", value: String(completedJobs.length), detail: "signed off" },
        { label: "Open checklist", value: String(openChecklistItems.length), detail: "proof items" },
        { label: "Maintenance", value: String(project.roleViews.installer.maintenanceTickets), detail: "tickets" },
      ]} />
      <div className="portal-two-col">
        <PortalPanel eyebrow="Jobs" title="Work queue">
          <PortalTable
            columns={["Scope", "Status", "Next proof", "Pay"]}
            rows={jobs.map((job) => [
              statusLabel(job.scope),
              statusLabel(job.status),
              job.checklist.find((item) => item.status !== "done")?.label ?? "Ready for sign-off",
              kes(job.payEstimateKes),
            ])}
          />
        </PortalPanel>
        <PortalPanel eyebrow="Next action" title={nextJob ? statusLabel(nextJob.scope) : "All caught up"}>
          <PortalWorkflow
            steps={(nextJob?.checklist ?? [
              { label: "No active checklist items", status: "done" as const },
            ]).slice(0, 4).map((item) => ({
              label: item.label,
              detail: item.status === "done" ? "Proof accepted" : "Awaiting upload or field reading",
              status: item.status,
            }))}
          />
          <PortalLedger rows={[
            { label: "Building", value: project.project.name, note: project.project.locationBand },
            { label: "Priority", value: openChecklistItems.length ? "Proof required" : "Ready", note: "demo queue" },
          ]} />
        </PortalPanel>
      </div>
    </>
  );
}
