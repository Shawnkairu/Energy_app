import { useCallback, type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View, type ViewStyle } from "react-native";
import type { BuildingRecord, User } from "@emappa/shared";
import { AppMark, colors, radius, shadows, typography } from "@emappa/ui";
import { useAuth } from "../AuthContext";
import { useApi } from "../../lib/api";
import { useApiData } from "../../lib/useApiData";
import { ProfileEssentials } from "../ProfileEssentials";

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

type ChipTone = "good" | "warn" | "bad" | "neutral";

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
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Header section={section} title={title} subtitle={subtitle} />
        {children({ projects, alerts })}
      </ScrollView>
    </View>
  );
}

function AdminState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.screen}>
      <View style={styles.center}>
        <AppMark size={52} />
        <Text style={styles.stateTitle}>{title}</Text>
        <Text style={styles.stateBody}>{body}</Text>
      </View>
    </View>
  );
}

function Header({ section, title, subtitle }: { section: string; title: string; subtitle: string }) {
  return (
    <>
      <View style={styles.topRow}>
        <View>
          <StatusChip tone="neutral">{section}</StatusChip>
          <Text style={styles.kicker}>trust ops</Text>
        </View>
        <AppMark />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </>
  );
}

function AdminHomeCockpit({ projects, alerts }: { projects: AdminProject[]; alerts: AdminAlert[] }) {
  const liveProjects = projects.filter((project) => project.stage === "live").length;
  const gatedProjects = projects.filter((project) => project.stage === "listed" || project.stage === "qualifying").length;
  const auditScore = projects.length ? Math.round((projects.filter(isAuditable).length / projects.length) * 100) : 0;
  const nextProjects = [...projects].sort((left, right) => readinessScore(right) - readinessScore(left)).slice(0, 3);

  return (
    <>
      <View style={styles.heroGrid}>
        <MetricCard label="Alerts" value={String(alerts.length)} tone={alerts.length ? "bad" : "good"} />
        <MetricCard label="Live" value={String(liveProjects)} tone="good" />
      </View>
      <Card style={styles.commandCard}>
        <View style={styles.commandVisual}>
          <Ring value={auditScore} />
          <View style={styles.commandCopy}>
            <Text style={styles.cardEyebrow}>Audit state</Text>
            <Text style={styles.commandTitle}>{auditScore}% clean</Text>
            <Text style={styles.cardBody}>{projects.length} projects / {gatedProjects} gated</Text>
          </View>
        </View>
        <View style={styles.auditStrip}>
          <AuditDot active={alerts.length === 0} label="alerts" />
          <AuditDot active={projects.length > 0 && projects.every((project) => project.dataSource === "measured")} label="data" />
          <AuditDot active={projects.length > 0 && projects.every(hasRoofEvidence)} label="roof" />
          <AuditDot active={projects.length > 0 && projects.every((project) => (project.prepaidCommittedKes ?? 0) > 0)} label="prepaid" />
        </View>
      </Card>
      <SectionTitle title="Next Checks" meta={`${nextProjects.length} shown`} />
      <ProjectQueue projects={nextProjects} />
    </>
  );
}

function SummaryRail({ projects, alerts }: { projects: AdminProject[]; alerts: AdminAlert[] }) {
  const measured = projects.filter((project) => project.dataSource === "measured").length;
  const roofed = projects.filter(hasRoofEvidence).length;

  return (
    <View style={styles.summaryRail}>
      <MetricCard label="Projects" value={String(projects.length)} tone="neutral" />
      <MetricCard label="Alerts" value={String(alerts.length)} tone={alerts.length ? "bad" : "good"} />
      <MetricCard label="Measured" value={`${measured}/${projects.length}`} tone={measured === projects.length ? "good" : "warn"} />
      <MetricCard label="Roof" value={`${roofed}/${projects.length}`} tone={roofed === projects.length ? "good" : "warn"} />
    </View>
  );
}

function ProjectList({ projects }: { projects: AdminProject[] }) {
  if (projects.length === 0) {
    return <EmptyCard title="No projects" body="Portfolio is empty." />;
  }

  return (
    <>
      {projects.map((project) => (
        <Card key={project.id}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardEyebrow}>{formatKind(project.kind)}</Text>
              <Text style={styles.cardTitle}>{project.name}</Text>
              <Text style={styles.cardBody}>{project.address}</Text>
            </View>
            <StatusChip tone={stageTone(project.stage)}>{formatStage(project.stage)}</StatusChip>
          </View>
          <ReadinessBar value={readinessScore(project)} />
          <View style={styles.chipRow}>
            <StatusChip tone={project.dataSource === "measured" ? "good" : "warn"}>{project.dataSource}</StatusChip>
            <StatusChip tone={hasRoofEvidence(project) ? "good" : "warn"}>{hasRoofEvidence(project) ? "roof" : "roof?"}</StatusChip>
            <StatusChip tone={(project.prepaidCommittedKes ?? 0) > 0 ? "good" : "warn"}>{formatKes(project.prepaidCommittedKes ?? 0)}</StatusChip>
          </View>
          <View style={styles.projectFacts}>
            <MiniFact label="Units" value={String(project.unitCount)} />
            <MiniFact label="Roof" value={formatRoof(project)} />
          </View>
        </Card>
      ))}
    </>
  );
}

function ProjectQueue({ projects }: { projects: AdminProject[] }) {
  if (projects.length === 0) {
    return <EmptyCard title="No checks" body="Nothing to review." />;
  }

  return (
    <Card>
      {projects.map((project, index) => (
        <View key={project.id} style={[styles.queueItem, index === projects.length - 1 && styles.queueItemLast]}>
          <View style={styles.queueMarker}>
            <Text style={styles.queueNumber}>{index + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.queueTitle}>{project.name}</Text>
            <Text style={styles.queueMeta}>{formatStage(project.stage)} / {readinessScore(project)}%</Text>
          </View>
          <StatusChip tone={readinessScore(project) >= 75 ? "good" : "warn"}>{readinessScore(project)}%</StatusChip>
        </View>
      ))}
    </Card>
  );
}

function AlertList({ alerts }: { alerts: AdminAlert[] }) {
  if (alerts.length === 0) {
    return <EmptyCard title="Clear" body="No open alerts." />;
  }

  return (
    <>
      {alerts.map((alert) => (
        <Card key={alert.id} accent={alert.tone === "bad" ? colors.red : colors.orangeDeep}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardEyebrow}>{alert.project.name}</Text>
              <Text style={styles.cardTitle}>{alert.title}</Text>
            </View>
            <StatusChip tone={alert.tone}>{alert.tone === "bad" ? "blocked" : "review"}</StatusChip>
          </View>
          <Text style={styles.cardBody}>{alert.detail}</Text>
        </Card>
      ))}
    </>
  );
}

function EmptyCard({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <Text style={styles.cardEyebrow}>Read-only</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
    </Card>
  );
}

function Card({ children, style, accent }: { children: ReactNode; style?: ViewStyle; accent?: string }) {
  return (
    <View style={[styles.card, style]}>
      {accent ? <View style={[styles.cardAccent, { backgroundColor: accent }]} /> : null}
      {children}
    </View>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: ChipTone }) {
  return (
    <Card style={styles.metricCard}>
      <View style={[styles.metricGlyph, { backgroundColor: toneFill(tone) }]}>
        <View style={[styles.metricDot, { backgroundColor: toneColor(tone) }]} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Card>
  );
}

function SectionTitle({ title, meta }: { title: string; meta: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionText}>{title}</Text>
      <Text style={styles.sectionMeta}>{meta}</Text>
    </View>
  );
}

function StatusChip({ children, tone = "neutral" }: { children: ReactNode; tone?: ChipTone }) {
  return (
    <View style={[styles.statusChip, { backgroundColor: toneFill(tone), borderColor: toneBorder(tone) }]}>
      <Text style={[styles.statusChipText, { color: toneColor(tone) }]}>{children}</Text>
    </View>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

function ReadinessBar({ value }: { value: number }) {
  return (
    <View style={styles.readinessTrack}>
      <View style={[styles.readinessFill, { width: `${value}%` }]} />
    </View>
  );
}

function Ring({ value }: { value: number }) {
  const tone = value >= 80 ? "good" : value >= 50 ? "warn" : "bad";

  return (
    <View style={[styles.ring, { borderColor: toneFill(tone) }]}>
      <View style={[styles.ringInner, { borderColor: toneColor(tone) }]}>
        <Text style={styles.ringValue}>{value}</Text>
        <Text style={styles.ringLabel}>audit</Text>
      </View>
    </View>
  );
}

function AuditDot({ active, label }: { active: boolean; label: string }) {
  return (
    <View style={styles.auditItem}>
      <View style={[styles.auditDot, { backgroundColor: active ? colors.orangeDeep : colors.panelSoft }]} />
      <Text style={styles.auditLabel}>{label}</Text>
    </View>
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

function isAuditable(project: AdminProject) {
  return project.dataSource === "measured" && hasRoofEvidence(project) && (project.prepaidCommittedKes ?? 0) > 0;
}

function hasRoofEvidence(project: AdminProject) {
  return Boolean(project.roofAreaM2 && project.roofSource);
}

function readinessScore(project: AdminProject) {
  const checks = [
    project.stage === "funding" || project.stage === "installing" || project.stage === "live",
    project.dataSource === "measured",
    hasRoofEvidence(project),
    (project.prepaidCommittedKes ?? 0) > 0,
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function formatRoof(project: AdminProject) {
  if (!hasRoofEvidence(project)) {
    return "Missing";
  }

  return `${Math.round(project.roofAreaM2 ?? 0)} m2`;
}

function formatKind(kind: AdminProject["kind"]) {
  return kind.replace("_", " ");
}

function formatStage(stage: AdminProject["stage"]) {
  return stage === "qualifying" ? "Qualify" : stage.charAt(0).toUpperCase() + stage.slice(1);
}

function stageTone(stage: AdminProject["stage"]): ChipTone {
  if (stage === "live" || stage === "installing" || stage === "funding") {
    return "good";
  }

  if (stage === "retired") {
    return "neutral";
  }

  return "warn";
}

function toneColor(tone: ChipTone) {
  if (tone === "good") {
    return colors.green;
  }

  if (tone === "warn") {
    return colors.amber;
  }

  if (tone === "bad") {
    return colors.red;
  }

  return colors.orangeDeep;
}

function toneFill(tone: ChipTone) {
  return `${toneColor(tone)}14`;
}

function toneBorder(tone: ChipTone) {
  return `${toneColor(tone)}28`;
}

function formatKes(amount: number) {
  if (amount <= 0) {
    return "KSh 0";
  }

  if (amount >= 1_000_000) {
    return `KSh ${Math.round(amount / 1_000_000)}M`;
  }

  return `KSh ${Math.round(amount / 1_000)}K`;
}

export function AdminHomeScreen() {
  return (
    <AdminDataScreen section="Home" title="Trust Cockpit" subtitle="Alerts, audit, readiness.">
      {({ projects, alerts }) => <AdminHomeCockpit projects={projects} alerts={alerts} />}
    </AdminDataScreen>
  );
}

export function AdminProjectsScreen() {
  return (
    <AdminDataScreen
      section="Projects"
      title="Project Queue"
      subtitle="Readiness by building."
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
      title="Alert Stack"
      subtitle="Blocked work first."
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
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Header
          section="Profile"
          title={user?.displayName ?? "Admin Profile"}
          subtitle="Identity and session state."
        />
        <Card>
          <Text style={styles.cardEyebrow}>Account</Text>
          <Row label="Email" value={user?.email ?? "Unavailable"} />
          <Row label="Role" value={user?.role ?? "Unavailable"} />
          <Row label="Phone" value={user?.phone ?? "Unavailable"} />
          <Row label="Onboarding" value={user?.onboardingComplete ? "Complete" : "Pending"} />
        </Card>
        <Card>
          <Text style={styles.cardEyebrow}>Session</Text>
          <Row label="User ID" value={user?.id ?? "Unavailable"} />
          <Row label="Building scope" value={user?.buildingId ?? "Portfolio"} />
          <Row label="Last seen" value={user?.lastSeenAt ? new Date(user.lastSeenAt).toLocaleString() : "Unavailable"} />
        </Card>
        <ProfileEssentials
          roleLabel="Admin"
          accountRows={[
            { label: "Scope", value: "Cockpit-first", note: "mobile is read-only" },
          ]}
          supportSubject="Admin mobile support"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white, paddingHorizontal: 20, paddingTop: 16 },
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
  heroGrid: { flexDirection: "row", gap: 10, marginBottom: 10 },
  summaryRail: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  card: {
    backgroundColor: colors.white,
    borderColor: "rgba(150, 90, 53, 0.16)",
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
    overflow: "hidden",
    padding: 16,
    ...shadows.card,
  },
  cardAccent: { borderRadius: radius.pill, height: 48, left: 0, position: "absolute", top: 18, width: 4 },
  metricCard: { flex: 1, minHeight: 112 },
  metricGlyph: {
    alignItems: "center",
    borderRadius: radius.pill,
    height: 32,
    justifyContent: "center",
    marginBottom: 12,
    width: 32,
  },
  metricDot: { borderRadius: radius.pill, height: 12, width: 12 },
  metricValue: { color: colors.text, fontSize: 30, fontWeight: "600", letterSpacing: -1 },
  metricLabel: { color: colors.muted, fontSize: typography.micro, fontWeight: "600", letterSpacing: 0.7, textTransform: "uppercase" },
  commandCard: { padding: 18 },
  commandVisual: { alignItems: "center", flexDirection: "row", gap: 16 },
  commandCopy: { flex: 1 },
  commandTitle: { color: colors.text, fontSize: 24, fontWeight: "600", letterSpacing: -0.8, marginTop: 4 },
  ring: {
    alignItems: "center",
    borderRadius: 44,
    borderWidth: 10,
    height: 88,
    justifyContent: "center",
    width: 88,
  },
  ringInner: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 31,
    borderWidth: 2,
    height: 62,
    justifyContent: "center",
    width: 62,
  },
  ringValue: { color: colors.text, fontSize: 18, fontWeight: "700", letterSpacing: -0.5 },
  ringLabel: { color: colors.dim, fontSize: 9, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },
  auditStrip: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    paddingTop: 14,
  },
  auditItem: { alignItems: "center", flex: 1, gap: 6 },
  auditDot: { borderRadius: radius.pill, height: 9, width: 9 },
  auditLabel: { color: colors.muted, fontSize: 10, fontWeight: "600", letterSpacing: 0.4, textTransform: "uppercase" },
  sectionTitle: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 10, marginTop: 4 },
  sectionText: { color: colors.text, fontSize: typography.heading, fontWeight: "600", letterSpacing: -0.3 },
  sectionMeta: { color: colors.dim, fontSize: typography.small },
  statusChip: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusChipText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.55, textTransform: "uppercase" },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  cardEyebrow: { color: colors.orangeDeep, fontSize: typography.micro, fontWeight: "700", letterSpacing: 0.75, textTransform: "uppercase" },
  cardTitle: { color: colors.text, fontSize: 19, fontWeight: "600", letterSpacing: -0.4, marginTop: 6 },
  cardBody: { color: colors.muted, lineHeight: 22, marginTop: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  readinessTrack: { backgroundColor: colors.panelSoft, borderRadius: radius.pill, height: 7, overflow: "hidden" },
  readinessFill: { backgroundColor: colors.orangeDeep, borderRadius: radius.pill, height: 7 },
  projectFacts: { flexDirection: "row", gap: 10, marginTop: 14 },
  fact: { backgroundColor: "#FFF9F4", borderRadius: radius.md, flex: 1, padding: 12 },
  factLabel: { color: colors.dim, fontSize: 10, fontWeight: "700", letterSpacing: 0.55, textTransform: "uppercase" },
  factValue: { color: colors.text, fontSize: typography.small, fontWeight: "600", marginTop: 5 },
  queueItem: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
  },
  queueItemLast: { borderBottomWidth: 0, paddingBottom: 0 },
  queueMarker: {
    alignItems: "center",
    backgroundColor: "rgba(150, 90, 53, 0.10)",
    borderRadius: radius.pill,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  queueNumber: { color: colors.orangeDeep, fontSize: typography.small, fontWeight: "700" },
  queueTitle: { color: colors.text, fontSize: typography.body, fontWeight: "600" },
  queueMeta: { color: colors.muted, fontSize: typography.small, marginTop: 3 },
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
