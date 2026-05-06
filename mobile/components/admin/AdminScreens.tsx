import { Text, View } from "react-native";
import type { ProjectedBuilding } from "@emappa/shared";
import { DrsCard } from "../DrsCard";
import { MetricCard } from "../MetricCard";
import { RoleDashboardScaffold } from "../roles/RoleDashboardScaffold";
import { GateList, GlassCard, Label, SectionBrief, Value, colors } from "../roles/RoleCards";

const actions = ["Review DRS", "Pause settlement", "Resolve alert"];

function AdminScreen({ section }: { section: string }) {
  const meta = adminScreenMeta[section] ?? adminScreenMeta.Home;

  return (
    <RoleDashboardScaffold
      role="admin"
      cohesionRole="admin"
      section={section}
      title={meta.title}
      subtitle={meta.subtitle}
      actions={meta.actions}
      renderHero={(building) => ({
        label: "Active alerts",
        value: `${building.roleViews.admin.alertCount}`,
        sub: "Internal governance",
        accent: colors.border,
      })}
      renderPanels={(building) => {
        const view = building.roleViews.admin;
        return (
          <>
            <SectionBrief
              stripedRows
              eyebrow="Internal ops screen"
              title={adminBriefs[section]?.title ?? "Governance command."}
              body={adminBriefs[section]?.body ?? "Admin mobile is internal only; public web portals remain stakeholder-scoped for non-e.mappa roles."}
              rows={[
                { label: "Settlement", value: view.settlementHealth, note: "Untrusted settlement data blocks go-live." },
                { label: "Blockers", value: `${view.blockedReasonCount}`, note: "DRS kill switches and governance alerts stay visible to ops." },
                { label: "Surface", value: "Cockpit", note: "Admin parity belongs in the internal cockpit, not public stakeholder web portals." },
              ]}
            />
            <AdminSectionPanels section={section} building={building} />
          </>
        );
      }}
    />
  );
}

function AdminSectionPanels({ section, building }: { section: string; building: ProjectedBuilding }) {
  const view = building.roleViews.admin;

  if (section === "Projects") {
    return (
      <>
        <DrsCard drs={building.drs} />
        <GateList gates={view.gates} />
        <MetricCard label="Project stage" value={building.project.stage} detail="Internal pipeline state" />
      </>
    );
  }

  if (section === "Alerts") {
    return (
      <>
        <GlassCard>
          <Label>Settlement health</Label>
          <Value>{view.settlementHealth}</Value>
          <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 }}>
            {view.alertCount} active alert(s). {view.blockedReasonCount} deployment blocker(s).
          </Text>
        </GlassCard>
        <SectionBrief
          stripedRows
          eyebrow="Governance action"
          title="Alerts pause unsafe activation."
          body="Ops can hold settlement or go-live when readiness, monitoring, or settlement data is not trusted."
          rows={[
            { label: "DRS reasons", value: `${building.drs.reasons.length}`, note: building.drs.reasons[0] ?? "No open kill switch reasons." },
            { label: "Settlement data", value: building.project.drs.settlementDataTrusted ? "Trusted" : "Paused", note: "Untrusted settlement data blocks go-live." },
            { label: "Monitoring", value: building.project.drs.monitoringConnectivityResolved ? "Resolved" : "Blocked", note: "Connectivity is a deployment kill switch." },
          ]}
        />
      </>
    );
  }

  return (
    <>
      <DrsCard drs={building.drs} />
      <GlassCard>
        <Label>Settlement health</Label>
        <Value>{view.settlementHealth}</Value>
        <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 }}>
          {view.alertCount} active alert(s). {view.blockedReasonCount} deployment blocker(s).
        </Text>
      </GlassCard>
    </>
  );
}

const adminBriefs: Record<string, { title: string; body: string }> = {
  Home: {
    title: "Pipeline and settlement integrity in one ops view.",
    body: "Admin mobile is for internal triage across DRS, settlement, alerts, and governance.",
  },
  Projects: {
    title: "Projects are judged by readiness, not hype.",
    body: "Project views surface DRS distribution, deployment blockers, and live utilization against prediction.",
  },
  Alerts: {
    title: "Alerts protect payout truth.",
    body: "Ops can pause settlement or go-live when data, monitoring, or counterparty proof is not trusted.",
  },
};

const adminScreenMeta: Record<string, { title: string; subtitle: string; actions: string[] }> = {
  Home: {
    title: "Ops Command",
    subtitle: "Internal command for DRS distribution, settlement integrity, alerts, and governance.",
    actions,
  },
  Projects: {
    title: "Project Pipeline",
    subtitle: "Judge projects by readiness, blockers, stage, and utilization against prediction.",
    actions: ["Review project", "DRS blockers", "Stage audit"],
  },
  Alerts: {
    title: "Governance Alerts",
    subtitle: "Pause unsafe go-live or settlement when proof, monitoring, or data trust fails.",
    actions: ["Resolve alert", "Pause settlement", "Audit proof"],
  },
};

export function AdminHomeScreen() {
  return <AdminScreen section="Home" />;
}

export function AdminProjectsScreen() {
  return <AdminScreen section="Projects" />;
}

export function AdminAlertsScreen() {
  return <AdminScreen section="Alerts" />;
}
