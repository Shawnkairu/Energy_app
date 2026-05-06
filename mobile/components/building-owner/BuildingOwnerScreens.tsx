import { useCallback, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Redirect, Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppMark, GlassCard, Label, Pill, PrimaryButton, Surface, colors, typography } from "@emappa/ui";
import { EnergyTodayChart, type EnergyTodayPoint } from "../EnergyTodayChart";
import { PilotBanner } from "../PilotBanner";
import { ProjectHero } from "../ProjectHero";
import { RoofMap } from "../RoofMap";
import { readPilotSession } from "../session";
import { createApiClient } from "@emappa/api-client";
import { useApiData } from "../../lib/useApiData";

type Tone = "good" | "warn" | "bad" | "neutral";

interface BuildingProject {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  unitCount: number;
  occupancy: number | null;
  kind: string;
  stage: string;
  roofAreaM2: number | null;
  roofSource: string | null;
  roofConfidence: number | null;
  prepaidCommittedKes: number;
  dataSource?: string | null;
}

interface RoleHomePayload {
  primary: BuildingProject | null;
  projects: BuildingProject[];
  activity: string[];
}

interface DrsPayload {
  score: number;
  decision: "approve" | "review" | "block";
  reasons: string[];
  components: Record<string, number>;
}

interface EnergyTodayPayload {
  generation_kwh: number[];
  load_kwh: number[];
  irradiance_w_m2?: number[];
}

interface UserPayload {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  buildingId: string | null;
  displayName: string | null;
}

interface WalletBalancePayload {
  kes: number;
}

interface WalletTransaction {
  id: string;
  at: string | null;
  kind: string;
  amountKes: number;
  reference: string | null;
}

interface OwnerContext {
  home: RoleHomePayload;
  project: BuildingProject;
  drs: DrsPayload;
}

interface WalletContext extends OwnerContext {
  user: UserPayload;
  balance: WalletBalancePayload;
  transactions: WalletTransaction[];
}

interface EnergyContext extends OwnerContext {
  today: EnergyTodayPayload;
}

export function BuildingOwnerLayout() {
  const session = readPilotSession();

  if (!session?.role) {
    return <Redirect href="/(auth)/role-select" />;
  }

  if (session.role !== "building_owner") {
    return <Redirect href="/(auth)/role-select" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        title: tabTitle(route.name),
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontSize: 15, fontWeight: "600" },
        tabBarActiveTintColor: colors.orangeDeep,
        tabBarInactiveTintColor: colors.dim,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={tabIcon(route.name)} color={color} size={Math.max(18, size - 4)} />
        ),
      })}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="energy" />
      <Tabs.Screen name="wallet" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="_embedded" options={{ href: null }} />
      <Tabs.Screen name="owner-account" options={{ href: null }} />
    </Tabs>
  );
}

export function BuildingOwnerHomeScreen() {
  const load = useCallback(loadOwnerContext, []);
  const state = useApiData(load, []);
  const router = useRouter();

  return (
    <OwnerDataFrame state={state} title="Building Owner Home">
      {({ project, drs }) => {
        const blockers = drs.reasons.slice(0, 3);
        return (
          <>
            <PilotBanner
              title="Building-owner pilot"
              message="Deployment, funding, supplier lock, and go-live remain blocked until readiness is proven by API-backed gates."
            />
            <ProjectHero
              name={project.name}
              location={project.address}
              readinessLabel={`${formatDrsScore(drs.score)}/100 DRS · ${drs.decision}`}
              summary={blockers.length ? blockers.join(" · ") : "No active readiness blockers returned by the API."}
            />
            <MetricGrid
              metrics={[
                { label: "Stage", value: formatStage(project.stage), detail: "Current project lane from the building record." },
                { label: "Prepaid", value: formatKes(project.prepaidCommittedKes), detail: "Cash-backed demand committed to this building." },
                { label: "Units", value: String(project.unitCount), detail: "Owner sees aggregate building context only." },
                { label: "DRS", value: drs.decision, detail: "Readiness gates decide deployment movement.", tone: decisionTone(drs.decision) },
              ]}
            />
            <ActionList
              title="Owner actions"
              items={[
                { label: "Review readiness", detail: "Open DRS blockers and component scores.", onPress: () => router.push("/(building-owner)/_embedded/drs") },
                { label: "Track deployment", detail: "View access, supplier, installer, monitoring, and go-live gates.", onPress: () => router.push("/(building-owner)/_embedded/deployment") },
                { label: "Invite residents", detail: "Open the privacy-safe resident roster aggregate.", onPress: () => router.push("/(building-owner)/_embedded/resident-roster") },
                { label: "Compare today", detail: "Compare current API energy signals with e.mappa readiness.", onPress: () => router.push("/(building-owner)/_embedded/compare-today") },
              ]}
            />
          </>
        );
      }}
    </OwnerDataFrame>
  );
}

export function BuildingOwnerEnergyScreen() {
  const load = useCallback(loadEnergyContext, []);
  const state = useApiData(load, []);

  return (
    <OwnerDataFrame state={state} title="Building Energy">
      {({ project, today }) => {
        const generation = sum(today.generation_kwh);
        const load = sum(today.load_kwh);
        const points = toEnergyPoints(today.generation_kwh);

        return (
          <>
            <PilotBanner
              title="Energy data"
              message="The owner sees building-level generation and load only. Resident balances and household usage stay private."
            />
            <EnergyTodayChart title="Rooftop generation today" points={points} unit="kWh" />
            <MetricGrid
              metrics={[
                { label: "Generated", value: `${round(generation)} kWh`, detail: "Today from the energy endpoint.", tone: generation > 0 ? "good" : "neutral" },
                { label: "Building load", value: `${round(load)} kWh`, detail: "Aggregate load returned by the API." },
                { label: "Utilization view", value: load > 0 ? `${Math.min(100, Math.round((generation / load) * 100))}%` : "pending", detail: "Generation compared with same-day load." },
                { label: "Payout rule", value: "sold only", detail: "Generated, wasted, or free-exported solar is not owner payout." },
              ]}
            />
            <RoofMap title={project.name} usableAreaSqm={project.roofAreaM2 ?? 0} panelCount={estimatePanels(project.roofAreaM2)} />
            <InfoCard
              eyebrow="Energy truth"
              title="Generation visibility is not a cash claim."
              body="Wallet payouts are created by monetized, prepaid solar settlement. This screen is operational context for the building owner."
            />
          </>
        );
      }}
    </OwnerDataFrame>
  );
}

export function BuildingOwnerWalletScreen() {
  const load = useCallback(loadWalletContext, []);
  const state = useApiData(load, []);

  return (
    <OwnerDataFrame state={state} title="Owner Wallet">
      {({ project, balance, transactions }) => {
        const royaltyTransactions = transactions.filter((tx) => tx.kind === "royalty");
        const royaltyTotal = royaltyTransactions.reduce((total, tx) => total + tx.amountKes, 0);

        return (
          <>
            <PilotBanner
              title="Royalty wallet"
              message="Owner payout is shown only from wallet transactions and settled cashflow returned by the API."
            />
            <MetricGrid
              metrics={[
                { label: "Wallet balance", value: formatKes(balance.kes), detail: "Current API wallet balance." },
                { label: "Royalties", value: formatKes(royaltyTotal), detail: "Royalty transactions in this wallet." },
                { label: "Prepaid demand", value: formatKes(project.prepaidCommittedKes), detail: "Demand context, not owner balance." },
                { label: "Transactions", value: String(transactions.length), detail: "Cashflow rows returned by the wallet endpoint." },
              ]}
            />
            <TransactionList transactions={transactions} />
            <InfoCard
              eyebrow="Settlement guardrail"
              title="No monetized solar, no owner payout."
              body="Generated, wasted, curtailed, or free-exported energy does not create wallet movement. The transaction list is the source of truth."
            />
          </>
        );
      }}
    </OwnerDataFrame>
  );
}

export function BuildingOwnerProfileScreen() {
  const load = useCallback(loadWalletContext, []);
  const state = useApiData(load, []);
  const router = useRouter();

  return (
    <OwnerDataFrame state={state} title="Owner Profile">
      {({ project, user }) => (
        <>
          <PilotBanner
            title="Account profile"
            message="Building, roof, account, support, and terms are grouped here without exposing private resident finances."
          />
          <ProfileCard user={user} project={project} />
          <RoofMap title="Confirmed roof" usableAreaSqm={project.roofAreaM2 ?? 0} panelCount={estimatePanels(project.roofAreaM2)} />
          <ActionList
            title="Profile links"
            items={[
              { label: "Review terms", detail: "Open the owner terms summary tied to readiness gates.", onPress: () => router.push("/(building-owner)/_embedded/approve-terms") },
              { label: "Resident roster", detail: "Open aggregate roster and prepaid participation context.", onPress: () => router.push("/(building-owner)/_embedded/resident-roster") },
              { label: "Deployment path", detail: "Open building access and go-live requirements.", onPress: () => router.push("/(building-owner)/_embedded/deployment") },
            ]}
          />
        </>
      )}
    </OwnerDataFrame>
  );
}

export function BuildingOwnerDrsScreen() {
  const load = useCallback(loadOwnerContext, []);
  const state = useApiData(load, []);

  return (
    <OwnerDataFrame state={state} title="Readiness Score">
      {({ project, drs }) => (
        <>
          <ProjectHero
            name={project.name}
            location={project.address}
            readinessLabel={`${formatDrsScore(drs.score)}/100 DRS · ${drs.decision}`}
            summary="DRS gates funding, supplier lock, installer scheduling, deployment, and go-live."
          />
          <MetricGrid
            metrics={Object.entries(drs.components).map(([label, value]) => ({
              label: formatStage(label),
              value: `${formatRatio(value)}%`,
              detail: "Component score returned by the DRS endpoint.",
              tone: value >= 0.7 ? "good" : value >= 0.4 ? "warn" : "bad",
            }))}
          />
          <InfoRows
            eyebrow="Open blockers"
            empty="No active DRS blockers returned."
            rows={drs.reasons.map((reason) => ({ label: "Blocker", value: "open", note: reason, tone: "bad" as Tone }))}
          />
        </>
      )}
    </OwnerDataFrame>
  );
}

export function BuildingOwnerDeploymentScreen() {
  const load = useCallback(loadOwnerContext, []);
  const state = useApiData(load, []);

  return (
    <OwnerDataFrame state={state} title="Deployment">
      {({ project, drs }) => {
        const gates = [
          { label: "Owner access", ready: Boolean(project.roofAreaM2), detail: "Roof area and access evidence must be captured before scheduling." },
          { label: "Prepaid demand", ready: project.prepaidCommittedKes > 0, detail: "No prepaid cash means no solar allocation or payout." },
          { label: "DRS decision", ready: drs.decision === "approve", detail: "Review or block decisions hold deployment movement." },
          { label: "Monitoring", ready: drs.components.installationReadiness >= 0.6, detail: "Installation and monitoring readiness are checked by DRS." },
        ];

        return (
          <>
            <ProjectHero
              name={project.name}
              location={project.address}
              readinessLabel={`${formatStage(project.stage)} · ${drs.decision}`}
              summary="Deployment progresses only when readiness gates clear in order."
            />
            <InfoRows
              eyebrow="Deployment gates"
              empty="No deployment gates returned."
              rows={gates.map((gate) => ({
                label: gate.label,
                value: gate.ready ? "ready" : "blocked",
                note: gate.detail,
                tone: gate.ready ? "good" : "bad",
              }))}
            />
          </>
        );
      }}
    </OwnerDataFrame>
  );
}

export function BuildingOwnerResidentRosterScreen() {
  const load = useCallback(loadOwnerContext, []);
  const state = useApiData(load, []);

  return (
    <OwnerDataFrame state={state} title="Resident Roster">
      {({ project }) => {
        const occupiedUnits = project.occupancy === null ? null : Math.round(project.unitCount * project.occupancy);

        return (
          <>
            <PilotBanner
              title="Privacy-safe roster"
              message="The mobile API exposes aggregate building demand here, not household names, balances, or private usage."
            />
            <MetricGrid
              metrics={[
                { label: "Units", value: String(project.unitCount), detail: "Total units in the building record." },
                { label: "Occupied", value: occupiedUnits === null ? "not returned" : String(occupiedUnits), detail: "Derived from occupancy when the API returns it." },
                { label: "Prepaid", value: formatKes(project.prepaidCommittedKes), detail: "Aggregate committed demand for this building." },
                { label: "Roster detail", value: "private", detail: "No resident-level roster endpoint is exposed to this role." },
              ]}
            />
            <InfoCard
              eyebrow="Owner boundary"
              title="Aggregate demand is enough to move deployment."
              body="Resident identities and wallet balances stay outside the building-owner surface. DRS uses aggregate participation and prepaid readiness."
            />
          </>
        );
      }}
    </OwnerDataFrame>
  );
}

export function BuildingOwnerApproveTermsScreen() {
  const load = useCallback(loadOwnerContext, []);
  const state = useApiData(load, []);

  return (
    <OwnerDataFrame state={state} title="Owner Terms">
      {({ project, drs }) => (
        <>
          <PilotBanner
            title="Terms preview"
            message="This mobile slice renders the API-backed terms context. It does not fabricate a signature endpoint."
          />
          <InfoRows
            eyebrow="Terms tied to gates"
            empty="No terms context returned."
            rows={[
              { label: "Building", value: project.name, note: project.address },
              { label: "Deployment", value: drs.decision, note: "Funding, supplier lock, installer scheduling, and go-live remain DRS-gated.", tone: decisionTone(drs.decision) },
              { label: "Payout basis", value: "sold solar", note: "Owner royalty can come only from monetized prepaid solar.", tone: "good" },
              { label: "Prepaid demand", value: formatKes(project.prepaidCommittedKes), note: "Cash-backed demand returned by the project endpoint." },
            ]}
          />
        </>
      )}
    </OwnerDataFrame>
  );
}

export function BuildingOwnerCompareTodayScreen() {
  const load = useCallback(loadEnergyContext, []);
  const state = useApiData(load, []);

  return (
    <OwnerDataFrame state={state} title="Today Compare">
      {({ project, drs, today }) => {
        const generation = sum(today.generation_kwh);
        const load = sum(today.load_kwh);

        return (
          <>
            <MetricGrid
              metrics={[
                { label: "Generation", value: `${round(generation)} kWh`, detail: "Today from the energy endpoint.", tone: generation > 0 ? "good" : "neutral" },
                { label: "Load", value: `${round(load)} kWh`, detail: "Today from the energy endpoint." },
                { label: "Prepaid", value: formatKes(project.prepaidCommittedKes), detail: "Cash-backed demand context." },
                { label: "DRS", value: drs.decision, detail: `${formatDrsScore(drs.score)}/100 readiness`, tone: decisionTone(drs.decision) },
              ]}
            />
            <InfoCard
              eyebrow="Comparison rule"
              title="Today is operational, not a royalty promise."
              body="The API currently returns generation, load, prepaid demand, and DRS. A cash comparison should wait for settlement rows rather than inventing a grid bill."
            />
          </>
        );
      }}
    </OwnerDataFrame>
  );
}

async function loadOwnerContext(): Promise<OwnerContext> {
  const api = mobileClient();
  const home = (await api.roleHome("building_owner")) as unknown as RoleHomePayload;
  const project = home.primary;

  if (!project) {
    throw new Error("No building is assigned to this building-owner account.");
  }

  const drs = (await api.getDrsAssessment(project.id)) as DrsPayload;
  return { home, project, drs };
}

async function loadEnergyContext(): Promise<EnergyContext> {
  const context = await loadOwnerContext();
  const today = await mobileClient().getEnergyToday(context.project.id);
  return { ...context, today };
}

async function loadWalletContext(): Promise<WalletContext> {
  const api = mobileClient();
  const [context, user] = await Promise.all([loadOwnerContext(), api.me() as Promise<UserPayload>]);
  const [balance, transactions] = await Promise.all([
    api.getWalletBalance(user.id) as Promise<WalletBalancePayload>,
    api.getWalletTransactions(user.id) as Promise<WalletTransaction[]>,
  ]);

  return { ...context, user, balance, transactions };
}

function mobileClient() {
  return createApiClient({
    baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? null,
    token: readPilotSession()?.token ?? null,
  });
}

function OwnerDataFrame<T>({
  state,
  title,
  children,
}: {
  state: { data: T | null; error: Error | null; isLoading: boolean; refetch: () => void };
  title: string;
  children: (data: T) => ReactNode;
}) {
  if (state.isLoading) {
    return (
      <Surface>
        <View style={styles.center}>
          <AppMark size={52} />
          <Text style={styles.centerTitle}>Loading {title.toLowerCase()}</Text>
          <Text style={styles.centerText}>Fetching live building-owner data from the mobile API.</Text>
        </View>
      </Surface>
    );
  }

  if (state.error || !state.data) {
    return (
      <Surface>
        <View style={styles.center}>
          <AppMark size={52} />
          <Text style={styles.centerTitle}>{title} unavailable</Text>
          <Text style={styles.centerText}>{state.error?.message ?? "The API returned no building-owner data."}</Text>
          <View style={{ marginTop: 18, alignSelf: "stretch" }}>
            <PrimaryButton onPress={state.refetch}>Retry</PrimaryButton>
          </View>
        </View>
      </Surface>
    );
  }

  return (
    <Surface>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Pill>Building Owner</Pill>
            <Text style={styles.kicker}>Private building workspace</Text>
          </View>
          <AppMark />
        </View>
        <Text style={styles.title}>{title}</Text>
        {children(state.data)}
      </ScrollView>
    </Surface>
  );
}

function MetricGrid({ metrics }: { metrics: Array<{ label: string; value: string; detail: string; tone?: Tone }> }) {
  return (
    <View style={styles.metricGrid}>
      {metrics.map((metric) => (
        <View key={`${metric.label}-${metric.value}`} style={styles.metric}>
          <Text style={styles.metricLabel}>{metric.label}</Text>
          <Text style={[styles.metricValue, { color: toneColor(metric.tone) }]}>{metric.value}</Text>
          <Text style={styles.metricDetail}>{metric.detail}</Text>
        </View>
      ))}
    </View>
  );
}

function ActionList({ title, items }: { title: string; items: Array<{ label: string; detail: string; onPress: () => void }> }) {
  return (
    <GlassCard>
      <Label>{title}</Label>
      <View style={{ marginTop: 10 }}>
        {items.map((item, index) => (
          <Pressable key={item.label} onPress={item.onPress} style={[styles.actionRow, index > 0 && styles.divider]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.label}</Text>
              <Text style={styles.rowDetail}>{item.detail}</Text>
            </View>
            <Ionicons name="chevron-forward" color={colors.orangeDeep} size={18} />
          </Pressable>
        ))}
      </View>
    </GlassCard>
  );
}

function InfoCard({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <GlassCard>
      <Label>{eyebrow}</Label>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
    </GlassCard>
  );
}

function InfoRows({
  eyebrow,
  rows,
  empty,
}: {
  eyebrow: string;
  rows: Array<{ label: string; value: string; note: string; tone?: Tone }>;
  empty: string;
}) {
  const resolvedRows = rows.length ? rows : [{ label: "Status", value: "clear", note: empty, tone: "good" as Tone }];

  return (
    <GlassCard>
      <Label>{eyebrow}</Label>
      <View style={{ marginTop: 10 }}>
        {resolvedRows.map((row, index) => (
          <View key={`${row.label}-${row.note}`} style={[styles.infoRow, index > 0 && styles.divider]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{row.label}</Text>
              <Text style={styles.rowDetail}>{row.note}</Text>
            </View>
            <Text style={[styles.rowValue, { color: toneColor(row.tone) }]}>{row.value}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

function TransactionList({ transactions }: { transactions: WalletTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <InfoCard
        eyebrow="Transactions"
        title="No wallet transactions returned."
        body="When owner royalties settle through the API, they will appear here as wallet transactions."
      />
    );
  }

  return (
    <GlassCard>
      <Label>Transactions</Label>
      <View style={{ marginTop: 10 }}>
        {transactions.map((tx, index) => (
          <View key={tx.id} style={[styles.infoRow, index > 0 && styles.divider]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{formatStage(tx.kind)}</Text>
              <Text style={styles.rowDetail}>{tx.reference ?? tx.at ?? "No reference returned"}</Text>
            </View>
            <Text style={[styles.rowValue, { color: tx.amountKes >= 0 ? colors.green : colors.red }]}>{formatKes(tx.amountKes)}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

function ProfileCard({ user, project }: { user: UserPayload; project: BuildingProject }) {
  return (
    <InfoRows
      eyebrow="Account"
      empty="No profile rows returned."
      rows={[
        { label: "Signer", value: user.displayName ?? "account", note: user.email },
        { label: "Role", value: "building owner", note: "This surface is scoped to the building_owner API role.", tone: "good" },
        { label: "Building", value: project.name, note: project.address },
        {
          label: "Roof source",
          value: project.roofSource ?? "pending",
          note: project.roofConfidence === null ? "No roof confidence returned." : `${Math.round(project.roofConfidence * 100)}% confidence returned by API.`,
        },
      ]}
    />
  );
}

function toEnergyPoints(values: number[]): EnergyTodayPoint[] {
  if (!values.length) {
    return [];
  }

  const labels = ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"];
  const step = Math.max(1, Math.floor(values.length / labels.length));
  return labels.map((label, index) => ({
    label,
    value: values[Math.min(values.length - 1, index * step)] ?? 0,
  }));
}

function tabTitle(name: string) {
  return name === "energy" ? "Energy" : name === "wallet" ? "Wallet" : name === "profile" ? "Profile" : "Home";
}

function tabIcon(name: string): keyof typeof Ionicons.glyphMap {
  if (name === "energy") return "flash-outline";
  if (name === "wallet") return "wallet-outline";
  if (name === "profile") return "person-circle-outline";
  return "home-outline";
}

function decisionTone(decision: DrsPayload["decision"]): Tone {
  return decision === "approve" ? "good" : decision === "review" ? "warn" : "bad";
}

function toneColor(tone: Tone = "neutral") {
  if (tone === "good") return colors.green;
  if (tone === "warn") return colors.amber;
  if (tone === "bad") return colors.red;
  return colors.text;
}

function formatStage(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatKes(value: number) {
  return `KSh ${Math.round(value).toLocaleString()}`;
}

function formatDrsScore(score: number) {
  return score <= 1 ? Math.round(score * 100) : Math.round(score);
}

function formatRatio(value: number) {
  return value <= 1 ? Math.round(value * 100) : Math.round(value);
}

function estimatePanels(areaM2: number | null) {
  return areaM2 ? Math.max(0, Math.floor(areaM2 / 2.2)) : 0;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

const styles = StyleSheet.create({
  scroll: {
    gap: 16,
    paddingBottom: 36,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },
  kicker: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.7,
    marginTop: 10,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: typography.hero,
    fontWeight: "700",
    letterSpacing: -0.9,
    lineHeight: typography.hero + 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
  },
  centerTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "700",
    letterSpacing: -0.45,
    marginTop: 18,
  },
  centerText: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 20,
    marginTop: 8,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metric: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 118,
    padding: 14,
    width: "48%",
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginTop: 10,
  },
  metricDetail: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
  },
  infoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
  },
  divider: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  rowTitle: {
    color: colors.text,
    fontWeight: "700",
  },
  rowDetail: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  rowValue: {
    flexShrink: 0,
    fontSize: 12,
    fontWeight: "700",
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginTop: 6,
  },
  cardBody: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: 8,
  },
});
