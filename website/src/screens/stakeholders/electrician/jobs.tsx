import { PortalKpiBar, PortalPanel, PortalTable } from "../../../components/PortalPrimitives";
import { kes } from "../../../portal/PortalWidgets";
import type { PortalScreenProps } from "../../../portal/types";

export default function ElectricianJobs({ project, data }: PortalScreenProps) {
  const jobs = data.jobs.length ? data.jobs : [
    { id: "install", scope: "install", status: "active", checklist: project.roleViews.installer.gates.map((gate, index) => ({ id: String(index), label: gate.label, status: gate.complete ? "done" : "pending" })), payEstimateKes: 42000, startedAt: null, completedAt: null },
  ];

  return (
    <>
      <PortalKpiBar items={[
        { label: "Active", value: String(jobs.filter((job) => job.status === "active").length), detail: "jobs" },
        { label: "Completed", value: String(jobs.filter((job) => job.status === "completed").length), detail: "history" },
        { label: "Maintenance", value: String(project.roleViews.installer.maintenanceTickets), detail: "tickets" },
      ]} />
      <PortalPanel eyebrow="Jobs" title="Active / Completed / Maintenance">
        <PortalTable
          columns={["Scope", "Status", "Next checklist item", "Pay"]}
          rows={jobs.map((job) => [
            job.scope,
            job.status,
            job.checklist.find((item) => item.status !== "done")?.label ?? "Ready for sign-off",
            kes(job.payEstimateKes),
          ])}
        />
      </PortalPanel>
    </>
  );
}
