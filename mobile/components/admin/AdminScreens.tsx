import { useCallback, type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { BuildingRecord, User } from "@emappa/shared";
import { AppMark, colors, GlassCard, Label, PaletteCard, Pill, Surface, typography, Value } from "@emappa/ui";
import { useAuth } from "../AuthContext";
import { useApi } from "../../lib/api";
import { useApiData } from "../../lib/useApiData";

type AdminProject = BuildingRecord & {
  prepaidCommittedKes?: number;
};

type AdminAlert = {
  id: string;
  title: string;
  detail: string;
  tone: "bad" | "warn" | "neutral";
  project: AdminProject;
};

function AdminDataScreen({
  section,
  title,
  subtitle,
  children,
}: {
  section: string;
  title: string;
  subtitle: string;
  children: (data: { projects: AdminProject[]; alerts: AdminAlert[] }) => ReactNode;
}) {
  const { session } = useAuth();
  const api = useApi();
  const loadProjects = useCallback(() => api.listProjects() as unknown as Promise<AdminProject[]>, [session?.token]);
  const { data, error, isLoading } = useApiData(loadProjects, [session?.token]);

  if (isLoading) {
    return <AdminState title="Loading admin data" body="Fetching the read-only mobile admin feed." />;
  }

  if (error) {
    return <AdminState title="Admin data unavailable" body={error.message} />;
  }

  const projects = data ?? [];
  const alerts = projects.flatMap(projectAlerts);

  return (
    <Surface>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Header section={section} title={title} subtitle={subtitle} />
        {children({ projects, alerts })}
      </ScrollView>
    </Surface>
  );
}

function AdminState({ title, body }: { title: string; body: string }) {
  return (
    <Surface>
      <View style={styles.center}>
        <AppMark size={52} />
        <Text style={styles.stateTitle}>{title}</Text>
        <Text style={styles.stateBody}>{body}</Text>
      </View>
    </Surface>
  );
}

function Header({ section, title, subtitle }: { section: string; title: string; subtitle: string }) {
  return (
    <>
      <View style={styles.topRow}>
        <View>
          <Pill>{section}</Pill>
          <Text style={styles.kicker}>admin workspace</Text>
        </View>
        <AppMark />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </>
  );
}

function SummaryRail({ projects, alerts }: { projects: AdminProject[]; alerts: AdminAlert[] }) {
  return (
    <View style={styles.summaryRail}>
      <PaletteCard borderRadius={24} padding={14} style={styles.summaryCard}>
        <Label>Projects</Label>
        <Value>{String(projects.length)}</Value>
        <Text style={styles.smallText}>Portfolio records visible to this admin.</Text>
      </PaletteCard>
      <PaletteCard borderRadius={24} padding={14} style={styles.summaryCard}>
        <Label>Alerts</Label>
        <Value>{String(alerts.length)}</Value>
        <Text style={styles.smallText}>Read-only ops signals from project records.</Text>
      </PaletteCard>
    </View>
  );
}

function ProjectList({ projects }: { projects: AdminProject[] }) {
  if (projects.length === 0) {
    return <EmptyCard title="No projects returned" body="The API returned an empty project portfolio for this admin account." />;
  }

  return (
    <>
      {projects.map((project) => (
        <GlassCard key={project.id}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Label>{project.stage}</Label>
              <Text style={styles.cardTitle}>{project.name}</Text>
              <Text style={styles.cardBody}>{project.address}</Text>
            </View>
            <Pill tone={project.dataSource === "measured" ? "good" : "warn"}>{project.dataSource}</Pill>
          </View>
          <Row label="Units" value={String(project.unitCount)} />
          <Row label="Kind" value={project.kind.replace("_", " ")} />
          <Row label="Roof" value={formatRoof(project)} />
          <Row label="Prepaid" value={formatKes(project.prepaidCommittedKes ?? 0)} />
        </GlassCard>
      ))}
    </>
  );
}

function AlertList({ alerts }: { alerts: AdminAlert[] }) {
  if (alerts.length === 0) {
    return <EmptyCard title="No open mobile alerts" body="The current project feed has no admin-visible mobile alerts." />;
  }

  return (
    <>
      {alerts.map((alert) => (
        <GlassCard key={alert.id}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Label>{alert.project.name}</Label>
              <Text style={styles.cardTitle}>{alert.title}</Text>
            </View>
            <Pill tone={alert.tone}>{alert.tone === "bad" ? "blocked" : "review"}</Pill>
          </View>
          <Text style={styles.cardBody}>{alert.detail}</Text>
        </GlassCard>
      ))}
    </>
  );
}

function EmptyCard({ title, body }: { title: string; body: string }) {
  return (
    <GlassCard>
      <Label>Read-only</Label>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
    </GlassCard>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function projectAlerts(project: AdminProject): AdminAlert[] {
  const alerts: AdminAlert[] = [];

  if (project.stage === "listed" || project.stage === "qualifying") {
    alerts.push({
      id: `${project.id}-stage`,
      title: "Project not deployment-ready",
      detail: `${project.name} is still ${project.stage}; funding and deployment should stay gated until readiness advances.`,
      tone: "bad",
      project,
    });
  }

  if (project.dataSource !== "measured") {
    alerts.push({
      id: `${project.id}-data`,
      title: "Measured data not confirmed",
      detail: `Current data source is ${project.dataSource}; admin mobile keeps this visible without changing project state.`,
      tone: "warn",
      project,
    });
  }

  if (!project.roofAreaM2 || !project.roofSource) {
    alerts.push({
      id: `${project.id}-roof`,
      title: "Roof evidence incomplete",
      detail: "Roof area or source is missing from the project record.",
      tone: "warn",
      project,
    });
  }

  return alerts;
}

function formatRoof(project: AdminProject) {
  if (!project.roofAreaM2 || !project.roofSource) {
    return "Incomplete";
  }

  return `${Math.round(project.roofAreaM2)} m2, ${project.roofSource.replace("_", " ")}`;
}

function formatKes(amount: number) {
  return `KSh ${Math.round(amount).toLocaleString("en-KE")}`;
}

export function AdminHomeScreen() {
  return <AdminProjectsScreen />;
}

export function AdminProjectsScreen() {
  return (
    <AdminDataScreen
      section="Projects"
      title="Project Pipeline"
      subtitle="Read-only portfolio scan for readiness, data provenance, roof evidence, and prepaid commitments."
    >
      {({ projects, alerts }) => (
        <>
          <SummaryRail projects={projects} alerts={alerts} />
          <ProjectList projects={projects} />
        </>
      )}
    </AdminDataScreen>
  );
}

export function AdminAlertsScreen() {
  return (
    <AdminDataScreen
      section="Alerts"
      title="Operational Alerts"
      subtitle="Mobile admin surfaces project records that need cockpit review; it does not mutate project state."
    >
      {({ projects, alerts }) => (
        <>
          <SummaryRail projects={projects} alerts={alerts} />
          <AlertList alerts={alerts} />
        </>
      )}
    </AdminDataScreen>
  );
}

export function AdminProfileScreen() {
  const { session } = useAuth();
  const api = useApi();
  const loadUser = useCallback(() => api.me() as Promise<User>, [session?.token]);
  const { data: user, error, isLoading } = useApiData(loadUser, [session?.token]);

  if (isLoading) {
    return <AdminState title="Loading profile" body="Fetching the authenticated admin profile." />;
  }

  if (error) {
    return <AdminState title="Profile unavailable" body={error.message} />;
  }

  return (
    <Surface>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Header
          section="Profile"
          title={user?.displayName ?? "Admin Profile"}
          subtitle="Read-only account identity for the signed-in mobile admin."
        />
        <GlassCard>
          <Label>Account</Label>
          <Row label="Email" value={user?.email ?? "Unavailable"} />
          <Row label="Role" value={user?.role ?? "Unavailable"} />
          <Row label="Phone" value={user?.phone ?? "Unavailable"} />
          <Row label="Onboarding" value={user?.onboardingComplete ? "Complete" : "Pending"} />
        </GlassCard>
        <GlassCard>
          <Label>Session</Label>
          <Row label="User ID" value={user?.id ?? "Unavailable"} />
          <Row label="Building scope" value={user?.buildingId ?? "Portfolio"} />
          <Row label="Last seen" value={user?.lastSeenAt ? new Date(user.lastSeenAt).toLocaleString() : "Unavailable"} />
        </GlassCard>
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 34 },
  center: { flex: 1, justifyContent: "center" },
  stateTitle: { color: colors.text, fontSize: typography.title, fontWeight: "600", letterSpacing: -0.45, marginTop: 18 },
  stateBody: { color: colors.muted, fontSize: typography.small, lineHeight: 20, marginTop: 8 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 22 },
  kicker: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.7,
    marginTop: 10,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: typography.hero,
    fontWeight: "600",
    letterSpacing: -0.9,
    lineHeight: typography.hero + 8,
    marginTop: 20,
  },
  subtitle: { color: colors.muted, fontSize: typography.body, lineHeight: 22, marginTop: 9, marginBottom: 16 },
  summaryRail: { flexDirection: "row", gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, minHeight: 118 },
  smallText: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 6 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  cardTitle: { color: colors.text, fontSize: 19, fontWeight: "600", letterSpacing: -0.4, marginTop: 6 },
  cardBody: { color: colors.muted, lineHeight: 22, marginTop: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  rowLabel: { color: colors.muted, flex: 1 },
  rowValue: { color: colors.text, flex: 1.2, fontWeight: "600", textAlign: "right" },
});
