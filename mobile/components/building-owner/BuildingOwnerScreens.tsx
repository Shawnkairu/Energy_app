import { useCallback, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type DimensionValue } from "react-native";
import { Redirect, Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppMark, colors, typography } from "@emappa/ui";
import { readPilotSession } from "../session";
import { SystemEnergyImmersiveHero } from "../energy/SystemImmersiveOverview";
import { ProfileEssentials } from "../ProfileEssentials";
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
  decision: "deployment_ready" | "review" | "blocked";
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
      screenOptions={({ route }) => {
        const title = tabTitle(route.name);
        return {
          title,
          headerStyle: { backgroundColor: colors.white },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text, fontSize: 15, fontWeight: "600" },
          tabBarActiveTintColor: colors.orangeDeep,
          tabBarInactiveTintColor: colors.dim,
          tabBarShowLabel: true,
          tabBarAccessibilityLabel: title,
          tabBarLabel: title,
          tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginTop: 2 },
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.border,
            height: 70,
            paddingBottom: 8,
            paddingTop: 7,
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={tabIcon(route.name)} color={color} size={Math.max(16, size - 8)} />
          ),
        };
      }}
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
    <OwnerDataFrame state={state} eyebrow="Building owner" title="Ready the building." subtitle="Access, residents, DRS, next move.">
      {({ home, project, drs }) => {
        const blockers = drs.reasons.slice(0, 3);
        const occupiedUnits = estimateOccupiedUnits(project);
        const nextAction =
          blockers[0] ??
          (project.roofAreaM2 ? "Keep resident prepaid demand warm." : "Confirm roof and access evidence.");

        return (
          <>
            <ReadinessHero project={project} drs={drs} nextAction={nextAction} />
            <BuildingReadinessMap project={project} drs={drs} />
            <ResidentVisual unitCount={project.unitCount} occupiedUnits={occupiedUnits} prepaidKes={project.prepaidCommittedKes} />
            <ActionList
              title="Next"
              items={[
                {
                  icon: "shield-checkmark-outline",
                  label: "Open DRS",
                  detail: blockers.length ? `${blockers.length} blocker${blockers.length === 1 ? "" : "s"}` : "All clear",
                  onPress: () => router.push("/(building-owner)/_embedded/drs"),
                },
                {
                  icon: "people-outline",
                  label: "Residents",
                  detail: "Aggregate sign-up only",
                  onPress: () => router.push("/(building-owner)/_embedded/resident-roster"),
                },
                {
                  icon: "construct-outline",
                  label: "Deployment",
                  detail: "Access and handoffs",
                  onPress: () => router.push("/(building-owner)/_embedded/deployment"),
                },
              ]}
            />
            <InfoRows
              eyebrow="Recent"
              empty="No owner activity returned."
              rows={home.activity.slice(0, 3).map((item) => ({ label: "Update", value: "new", note: item }))}
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
    <OwnerDataFrame state={state} eyebrow="Energy" title="Rooftop signal." subtitle="Clean generation view. Payout lives in Wallet." immersive>
      {({ project, today, drs }) => {
        const generation = sum(today.generation_kwh);
        const loadKwh = sum(today.load_kwh);
        const utilization = loadKwh > 0 ? Math.min(1, generation / loadKwh) : 0;
        const genSeries = today.generation_kwh;
        const loadSeries = today.load_kwh;
        const peakGen = genSeries.length ? Math.max(...genSeries) : 0;
        const peakLoad = loadSeries.length ? Math.max(...loadSeries) : 0;
        const batteryStatus = peakGen > peakLoad * 1.08 ? "charging" : peakLoad > peakGen * 1.08 ? "discharging" : "idle";
        const drs01 = formatDrsScore(drs.score) / 100;

        return (
          <>
            <View style={{ marginHorizontal: -20, marginTop: 8 }}>
              <SystemEnergyImmersiveHero
                siteName={project.name}
                weatherHint={`DRS ${formatDrsScore(drs.score)} · ${project.stage}`}
                generationKwhToday={generation}
                loadKwhToday={loadKwh}
                generationHourly={genSeries.length ? genSeries : [generation / 24]}
                loadHourly={loadSeries.length ? loadSeries : [loadKwh / 24]}
                batterySoc={Math.min(0.96, Math.max(0.1, drs01 * 0.55 + utilization * 0.4))}
                batteryStatus={batteryStatus}
                savingsKesLabel={formatKes(Math.round(Math.min(generation, loadKwh) * 14))}
                summaryCards={[
                  { label: "Used today", value: `${round(loadKwh)} kWh`, hint: "Aggregate load", icon: "business-outline" },
                  { label: "Produced", value: `${round(generation)} kWh`, hint: "Dedicated path", icon: "sunny-outline" },
                  { label: "Utilization", value: loadKwh > 0 ? `${Math.round(utilization * 100)}%` : "—", hint: "Ops view", icon: "pulse-outline" },
                ]}
              />
            </View>
            <MetricGrid
              metrics={[
                { label: "Generated", value: `${round(generation)} kWh`, detail: "e.mappa solar plant (dedicated path).", tone: generation > 0 ? "good" : "neutral" },
                { label: "Load", value: `${round(loadKwh)} kWh`, detail: "Aggregate only." },
                { label: "Use", value: loadKwh > 0 ? `${Math.round(utilization * 100)}%` : "pending", detail: "Operational view.", tone: utilization >= 0.75 ? "good" : "warn" },
                { label: "Payout", value: "wallet", detail: "Sold solar only." },
              ]}
            />
            <RoofDeckVisual title={project.name} usableAreaSqm={project.roofAreaM2 ?? 0} panelCount={estimatePanels(project.roofAreaM2)} />
            <InfoCard
              eyebrow="Boundary"
              title="Generation is context."
              body="The building owner coordinates readiness and access. Wallet payouts require monetized prepaid solar."
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
    <OwnerDataFrame state={state} eyebrow="Wallet" title="Settled cash." subtitle="Separate from readiness. Source of payout truth.">
      {({ project, balance, transactions }) => {
        const royaltyTransactions = transactions.filter((tx) => tx.kind === "royalty");
        const royaltyTotal = royaltyTransactions.reduce((total, tx) => total + tx.amountKes, 0);

        return (
          <>
            <WalletHero balanceKes={balance.kes} royaltyKes={royaltyTotal} />
            <MetricGrid
              metrics={[
                { label: "Balance", value: formatKes(balance.kes), detail: "Wallet endpoint." },
                { label: "Royalty", value: formatKes(royaltyTotal), detail: "Settled rows." },
                { label: "Demand", value: formatKes(project.prepaidCommittedKes), detail: "Not balance." },
                { label: "Rows", value: String(transactions.length), detail: "Transactions." },
              ]}
            />
            <TransactionList transactions={transactions} />
            <InfoCard
              eyebrow="Rule"
              title="Sold solar creates payout."
              body="Generated, wasted, curtailed, or free-exported energy does not move this wallet."
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
    <OwnerDataFrame state={state} eyebrow="Profile" title="Trust profile." subtitle="Identity, credentials, building access.">
      {({ project, user }) => (
        <>
          <ProfileCard user={user} project={project} />
          <CredentialsDeck project={project} />
          <ProfileEssentials
            roleLabel="Building owner"
            accountRows={[
              { label: "Building", value: project.name, note: project.address },
              { label: "Roof record", value: project.roofSource ?? "Pending", note: project.roofAreaM2 ? `${Math.round(project.roofAreaM2)} sqm` : "capture needed" },
            ]}
            supportSubject={`Building owner support - ${project.name}`}
          />
          <ActionList
            title="Account"
            items={[
              { icon: "document-text-outline", label: "Terms", detail: "Readiness-gated", onPress: () => router.push("/(building-owner)/_embedded/approve-terms") },
              { icon: "people-outline", label: "Residents", detail: "Private aggregates", onPress: () => router.push("/(building-owner)/_embedded/resident-roster") },
              { icon: "construct-outline", label: "Deployment", detail: "Access path", onPress: () => router.push("/(building-owner)/_embedded/deployment") },
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
    <OwnerDataFrame state={state} eyebrow="DRS" title="Readiness score." subtitle="The gate before money, suppliers, install, go-live.">
      {({ project, drs }) => (
        <>
          <ReadinessHero project={project} drs={drs} nextAction={drs.reasons[0] ?? "Keep gates current."} />
          <MetricGrid
            metrics={Object.entries(drs.components).map(([label, value]) => ({
              label: formatStage(label),
              value: `${formatRatio(value)}%`,
              detail: "Score input.",
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
    <OwnerDataFrame state={state} eyebrow="Deployment" title="Path to go-live." subtitle="Owner access, resident demand, partner proof.">
      {({ project, drs }) => {
        const gates = [
          { label: "Building access", ready: Boolean(project.roofAreaM2), detail: "Roof and meter-room evidence before scheduling." },
          { label: "Prepaid demand", ready: project.prepaidCommittedKes > 0, detail: "No prepaid cash means no solar allocation or payout." },
          { label: "DRS decision", ready: drs.decision === "deployment_ready", detail: "Review or block decisions hold deployment movement." },
          { label: "Monitoring", ready: drs.components.installationReadiness >= 0.6, detail: "Installation and monitoring readiness are checked by DRS." },
        ];

        return (
          <>
            <DeploymentCircuit gates={gates} stage={project.stage} />
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
    <OwnerDataFrame state={state} eyebrow="Residents" title="Resident signal." subtitle="Aggregates only. No balances, no household usage.">
      {({ project }) => {
        const occupiedUnits = estimateOccupiedUnits(project);

        return (
          <>
            <ResidentVisual unitCount={project.unitCount} occupiedUnits={occupiedUnits} prepaidKes={project.prepaidCommittedKes} />
            <MetricGrid
              metrics={[
                { label: "Units", value: String(project.unitCount), detail: "Building record." },
                { label: "Occupied", value: occupiedUnits === null ? "pending" : String(occupiedUnits), detail: "API aggregate." },
                { label: "Prepaid", value: formatKes(project.prepaidCommittedKes), detail: "Committed demand." },
                { label: "Details", value: "private", detail: "No resident rows." },
              ]}
            />
            <InfoCard
              eyebrow="Owner boundary"
              title="Aggregate demand is enough."
              body="Resident identities, balances, and household usage stay outside this surface."
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
    <OwnerDataFrame state={state} eyebrow="Terms" title="Approve the building." subtitle="Confirms access and terms. DRS still decides movement.">
      {({ project, drs }) => (
        <>
          <InfoRows
            eyebrow="Terms"
            empty="No terms context returned."
            rows={[
              { label: "Building", value: project.name, note: project.address },
              { label: "Deployment", value: drs.decision, note: "Funding, provider lock, electrician scheduling, and go-live remain DRS-gated.", tone: decisionTone(drs.decision) },
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
    <OwnerDataFrame state={state} eyebrow="Compare" title="Today vs ready." subtitle="Energy context beside readiness. No invented bill.">
      {({ project, drs, today }) => {
        const generation = sum(today.generation_kwh);
        const load = sum(today.load_kwh);

        return (
          <>
            <EnergyVisual generation={generation} load={load} values={today.generation_kwh} />
            <MetricGrid
              metrics={[
                { label: "Generation", value: `${round(generation)} kWh`, detail: "Today.", tone: generation > 0 ? "good" : "neutral" },
                { label: "Load", value: `${round(load)} kWh`, detail: "Aggregate." },
                { label: "Prepaid", value: formatKes(project.prepaidCommittedKes), detail: "Demand context." },
                { label: "DRS", value: drs.decision, detail: `${formatDrsScore(drs.score)}/100`, tone: decisionTone(drs.decision) },
              ]}
            />
            <InfoCard
              eyebrow="Comparison rule"
              title="No settlement, no payout claim."
              body="A cash comparison should wait for wallet or settlement rows."
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
  eyebrow,
  title,
  subtitle,
  children,
  immersive = false,
}: {
  state: { data: T | null; error: Error | null; isLoading: boolean; refetch: () => void };
  eyebrow: string;
  title: string;
  subtitle: string;
  children: (data: T) => ReactNode;
  /** Tesla / Enphase system-overview hero: hide document header for full-bleed diagram. */
  immersive?: boolean;
}) {
  if (state.isLoading) {
    return (
      <View style={styles.root}>
        <View style={styles.center}>
          <AppMark size={52} />
          <Text style={styles.centerTitle}>Loading {title.toLowerCase()}</Text>
          <Text style={styles.centerText}>Fetching building data.</Text>
        </View>
      </View>
    );
  }

  if (state.error || !state.data) {
    return (
      <View style={styles.root}>
        <View style={styles.center}>
          <AppMark size={52} />
          <Text style={styles.centerTitle}>{title} unavailable</Text>
          <Text style={styles.centerText}>{state.error?.message ?? "The API returned no building-owner data."}</Text>
          <Pressable onPress={state.refetch} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {immersive ? null : (
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>{eyebrow}</Text>
                <Text style={styles.kicker}>Private building workspace</Text>
              </View>
              <AppMark />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </>
        )}
        {children(state.data)}
      </ScrollView>
    </View>
  );
}

function ReadinessHero({ project, drs, nextAction }: { project: BuildingProject; drs: DrsPayload; nextAction: string }) {
  const score = formatDrsScore(drs.score);

  return (
    <Card style={styles.heroCard}>
      <View style={styles.heroTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroLabel}>{project.name}</Text>
          <Text style={styles.heroValue}>{score}</Text>
          <Text style={styles.heroMeta}>DRS / 100</Text>
        </View>
        <View style={[styles.statusOrb, { borderColor: toneColor(decisionTone(drs.decision)) }]}>
          <Text style={[styles.statusOrbText, { color: toneColor(decisionTone(drs.decision)) }]}>{drs.decision}</Text>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, score))}%` as DimensionValue }]} />
      </View>
      <View style={styles.nextAction}>
        <Ionicons name="arrow-forward-circle" color={ORANGE} size={22} />
        <View style={{ flex: 1 }}>
          <Text style={styles.nextLabel}>Next action</Text>
          <Text style={styles.nextText}>{nextAction}</Text>
        </View>
      </View>
    </Card>
  );
}

function BuildingReadinessMap({ project, drs }: { project: BuildingProject; drs: DrsPayload }) {
  const gates = [
    { icon: "business-outline", label: "Building", ready: true },
    { icon: "scan-outline", label: "Roof", ready: Boolean(project.roofAreaM2) },
    { icon: "people-outline", label: "Residents", ready: project.prepaidCommittedKes > 0 },
    { icon: "shield-checkmark-outline", label: "DRS", ready: drs.decision === "deployment_ready" },
  ] as const;

  return (
    <Card>
      <Text style={styles.cardKicker}>Readiness map</Text>
      <View style={styles.iconGrid}>
        {gates.map((gate) => (
          <View key={gate.label} style={styles.iconTile}>
            <View style={[styles.iconBubble, { backgroundColor: gate.ready ? `${ORANGE}14` : "#f7f4f1" }]}>
              <Ionicons name={gate.icon} color={gate.ready ? ORANGE : MUTED} size={22} />
            </View>
            <Text style={styles.iconTileLabel}>{gate.label}</Text>
            <Text style={[styles.iconTileStatus, { color: gate.ready ? GREEN : AMBER }]}>{gate.ready ? "ready" : "open"}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

function ResidentVisual({
  unitCount,
  occupiedUnits,
  prepaidKes,
}: {
  unitCount: number;
  occupiedUnits: number | null;
  prepaidKes: number;
}) {
  const shownUnits = Math.min(36, Math.max(12, unitCount));
  const filledUnits = occupiedUnits === null ? Math.floor(shownUnits * 0.62) : Math.min(shownUnits, Math.round((occupiedUnits / unitCount) * shownUnits));

  return (
    <Card>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardKicker}>Residents</Text>
          <Text style={styles.cardTitle}>Aggregate demand.</Text>
        </View>
        <Text style={styles.badge}>{formatKes(prepaidKes)}</Text>
      </View>
      <View style={styles.unitCloud}>
        {Array.from({ length: shownUnits }).map((_, index) => (
          <View key={`unit-${index}`} style={[styles.unitDot, index < filledUnits && styles.unitDotActive]} />
        ))}
      </View>
      <Text style={styles.cardBody}>
        Owner sees totals only. Residents keep wallet balances and household usage private.
      </Text>
    </Card>
  );
}

function EnergyVisual({ generation, load, values }: { generation: number; load: number; values: number[] }) {
  const bars = compactValues(values);
  const max = Math.max(1, ...bars);

  return (
    <Card style={styles.energyCard}>
      <View style={styles.energyHeader}>
        <View>
          <Text style={styles.cardKicker}>Solar today</Text>
          <Text style={styles.energyValue}>{round(generation)} kWh</Text>
        </View>
        <View style={styles.sun}>
          <Ionicons name="sunny" color={ORANGE} size={30} />
        </View>
      </View>
      <View style={styles.bars}>
        {bars.map((value, index) => (
          <View key={`bar-${index}`} style={styles.barTrack}>
            <View style={[styles.barFill, { height: `${Math.max(12, (value / max) * 100)}%` as DimensionValue }]} />
          </View>
        ))}
      </View>
      <View style={styles.energyFooter}>
        <Text style={styles.cardBody}>Load {round(load)} kWh</Text>
        <Text style={styles.cardBody}>Operational, not payout.</Text>
      </View>
    </Card>
  );
}

function RoofDeckVisual({ title, usableAreaSqm, panelCount }: { title: string; usableAreaSqm: number; panelCount: number }) {
  const visiblePanels = Math.min(18, Math.max(6, panelCount || 6));

  return (
    <Card>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardKicker}>Roof deck</Text>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.badge}>{Math.round(usableAreaSqm)} m2</Text>
      </View>
      <View style={styles.panelField}>
        {Array.from({ length: visiblePanels }).map((_, index) => (
          <View key={`panel-${index}`} style={styles.panel} />
        ))}
      </View>
      <Text style={styles.cardBody}>Access and roof evidence are owner coordination duties.</Text>
    </Card>
  );
}

function WalletHero({ balanceKes, royaltyKes }: { balanceKes: number; royaltyKes: number }) {
  return (
    <Card style={styles.walletCard}>
      <Text style={styles.cardKicker}>Available</Text>
      <Text style={styles.walletValue}>{formatKes(balanceKes)}</Text>
      <View style={styles.walletLine}>
        <Text style={styles.cardBody}>Settled royalty</Text>
        <Text style={styles.walletRoyalty}>{formatKes(royaltyKes)}</Text>
      </View>
    </Card>
  );
}

function DeploymentCircuit({ gates, stage }: { gates: Array<{ label: string; ready: boolean; detail: string }>; stage: string }) {
  return (
    <Card>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardKicker}>Live path</Text>
          <Text style={styles.cardTitle}>{formatStage(stage)}</Text>
        </View>
        <Ionicons name="flash-outline" color={ORANGE} size={26} />
      </View>
      <View style={styles.circuit}>
        {gates.map((gate, index) => (
          <View key={gate.label} style={styles.circuitNode}>
            <View style={[styles.circuitDot, { backgroundColor: gate.ready ? ORANGE : "#fff", borderColor: gate.ready ? ORANGE : BORDER }]} />
            {index < gates.length - 1 ? <View style={styles.circuitLine} /> : null}
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{gate.label}</Text>
              <Text style={styles.rowDetail}>{gate.detail}</Text>
            </View>
            <Text style={[styles.rowValue, { color: gate.ready ? GREEN : AMBER }]}>{gate.ready ? "ready" : "open"}</Text>
          </View>
        ))}
      </View>
    </Card>
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

function ActionList({
  title,
  items,
}: {
  title: string;
  items: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string; detail: string; onPress: () => void }>;
}) {
  return (
    <Card>
      <Text style={styles.cardKicker}>{title}</Text>
      <View style={{ marginTop: 10 }}>
        {items.map((item, index) => (
          <Pressable key={item.label} onPress={item.onPress} style={[styles.actionRow, index > 0 && styles.divider]}>
            <View style={styles.actionIcon}>
              <Ionicons name={item.icon} color={ORANGE} size={19} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.label}</Text>
              <Text style={styles.rowDetail}>{item.detail}</Text>
            </View>
            <Ionicons name="chevron-forward" color={ORANGE} size={18} />
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

function InfoCard({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <Card>
      <Text style={styles.cardKicker}>{eyebrow}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
    </Card>
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
    <Card>
      <Text style={styles.cardKicker}>{eyebrow}</Text>
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
    </Card>
  );
}

function TransactionList({ transactions }: { transactions: WalletTransaction[] }) {
  if (transactions.length === 0) {
    return <InfoCard eyebrow="Transactions" title="No transactions yet." body="Settled owner royalties will appear here." />;
  }

  return (
    <Card>
      <Text style={styles.cardKicker}>Transactions</Text>
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
    </Card>
  );
}

function ProfileCard({ user, project }: { user: UserPayload; project: BuildingProject }) {
  return (
    <Card style={styles.profileCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials(user.displayName ?? user.email)}</Text>
      </View>
      <Text style={styles.profileName}>{user.displayName ?? "Building owner"}</Text>
      <Text style={styles.profileEmail}>{user.email}</Text>
      <View style={styles.trustRow}>
        <TrustPill icon="checkmark-circle" label="Verified signer" />
        <TrustPill icon="business" label={project.name} />
      </View>
      <Text style={styles.cardBody}>
        Coordinates building access, roof evidence, residents, and readiness. Solar-array ownership stays with the provider unless terms explicitly say otherwise.
      </Text>
    </Card>
  );
}

function CredentialsDeck({ project }: { project: BuildingProject }) {
  return (
    <Card>
      <Text style={styles.cardKicker}>Credentials</Text>
      <View style={styles.credentialGrid}>
        <Credential label="Role" value="Building owner" icon="key-outline" />
        <Credential label="Roof" value={project.roofSource ?? "Pending"} icon="home-outline" />
        <Credential label="Access" value={project.roofAreaM2 ? "Ready" : "Needed"} icon="lock-open-outline" />
        <Credential
          label="Confidence"
          value={project.roofConfidence === null ? "Pending" : `${Math.round(project.roofConfidence * 100)}%`}
          icon="ribbon-outline"
        />
      </View>
    </Card>
  );
}

function Credential({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.credential}>
      <Ionicons name={icon} color={ORANGE} size={19} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.credentialValue}>{value}</Text>
    </View>
  );
}

function TrustPill({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.trustPill}>
      <Ionicons name={icon} color={ORANGE} size={15} />
      <Text style={styles.trustPillText}>{label}</Text>
    </View>
  );
}

function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
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
  return decision === "deployment_ready" ? "good" : decision === "review" ? "warn" : "bad";
}

function toneColor(tone: Tone = "neutral") {
  if (tone === "good") return GREEN;
  if (tone === "warn") return AMBER;
  if (tone === "bad") return RED;
  return TEXT;
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

function estimateOccupiedUnits(project: BuildingProject) {
  return project.occupancy === null ? null : Math.round(project.unitCount * project.occupancy);
}

function compactValues(values: number[]) {
  if (!values.length) return [0, 0, 0, 0, 0, 0, 0, 0];
  const labels = 10;
  const step = Math.max(1, Math.floor(values.length / labels));
  return Array.from({ length: labels }).map((_, index) => values[Math.min(values.length - 1, index * step)] ?? 0);
}

function initials(value: string) {
  return value
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

const TEXT = "#171412";
const MUTED = "#706962";
const FAINT = "#faf8f6";
const BORDER = "#eee7df";
const ORANGE = "#f36b21";
const GREEN = "#198754";
const AMBER = "#b96b00";
const RED = "#c2412d";

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#fff",
    flex: 1,
  },
  scroll: {
    gap: 16,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },
  eyebrow: {
    alignSelf: "flex-start",
    backgroundColor: `${ORANGE}10`,
    borderColor: `${ORANGE}28`,
    borderRadius: 999,
    borderWidth: 1,
    color: ORANGE,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  kicker: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
    marginTop: 10,
    textTransform: "uppercase",
  },
  title: {
    color: TEXT,
    fontSize: typography.hero + 4,
    fontWeight: "800",
    letterSpacing: -1.2,
    lineHeight: typography.hero + 10,
  },
  subtitle: {
    color: MUTED,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: -8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  centerTitle: {
    color: TEXT,
    fontSize: typography.title,
    fontWeight: "800",
    letterSpacing: -0.45,
    marginTop: 18,
  },
  centerText: {
    color: MUTED,
    fontSize: typography.small,
    lineHeight: 20,
    marginTop: 8,
  },
  primaryButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: ORANGE,
    borderRadius: 18,
    marginTop: 18,
    paddingVertical: 13,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#fff",
    borderColor: BORDER,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    boxShadow: "0 10px 18px rgba(61, 42, 31, 0.06)",
  },
  heroCard: {
    padding: 20,
  },
  heroTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
  },
  heroLabel: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "700",
  },
  heroValue: {
    color: TEXT,
    fontSize: 64,
    fontWeight: "800",
    letterSpacing: -3,
    lineHeight: 72,
    marginTop: 4,
  },
  heroMeta: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  statusOrb: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 76,
    justifyContent: "center",
    width: 76,
  },
  statusOrbText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  progressTrack: {
    backgroundColor: FAINT,
    borderRadius: 999,
    height: 10,
    marginTop: 18,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: ORANGE,
    borderRadius: 999,
    height: 10,
  },
  nextAction: {
    alignItems: "center",
    backgroundColor: FAINT,
    borderRadius: 20,
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    padding: 13,
  },
  nextLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  nextText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 2,
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  cardKicker: {
    color: ORANGE,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  cardTitle: {
    color: TEXT,
    fontSize: typography.title,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 5,
  },
  cardBody: {
    color: MUTED,
    fontSize: typography.small,
    lineHeight: 20,
    marginTop: 10,
  },
  badge: {
    backgroundColor: FAINT,
    borderColor: BORDER,
    borderRadius: 999,
    borderWidth: 1,
    color: TEXT,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  iconTile: {
    alignItems: "center",
    backgroundColor: FAINT,
    borderColor: BORDER,
    borderRadius: 22,
    borderWidth: 1,
    padding: 12,
    width: "48%",
  },
  iconBubble: {
    alignItems: "center",
    borderRadius: 999,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  iconTileLabel: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 8,
  },
  iconTileStatus: {
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
    textTransform: "uppercase",
  },
  unitCloud: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  unitDot: {
    backgroundColor: "#f0ebe5",
    borderRadius: 999,
    height: 16,
    width: 16,
  },
  unitDotActive: {
    backgroundColor: ORANGE,
  },
  energyCard: {
    backgroundColor: "#fffdfb",
  },
  energyHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  energyValue: {
    color: TEXT,
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: -1.7,
    marginTop: 4,
  },
  sun: {
    alignItems: "center",
    backgroundColor: `${ORANGE}10`,
    borderRadius: 999,
    height: 62,
    justifyContent: "center",
    width: 62,
  },
  bars: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 7,
    height: 128,
    marginTop: 18,
  },
  barTrack: {
    backgroundColor: FAINT,
    borderRadius: 999,
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    backgroundColor: ORANGE,
    borderRadius: 999,
  },
  energyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  panelField: {
    backgroundColor: FAINT,
    borderColor: BORDER,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
    padding: 12,
  },
  panel: {
    backgroundColor: "#fff",
    borderColor: `${ORANGE}40`,
    borderRadius: 9,
    borderWidth: 1,
    height: 34,
    width: "30%",
  },
  walletCard: {
    backgroundColor: TEXT,
    borderColor: TEXT,
  },
  walletValue: {
    color: "#fff",
    fontSize: 46,
    fontWeight: "800",
    letterSpacing: -1.9,
    marginTop: 8,
  },
  walletLine: {
    alignItems: "center",
    borderTopColor: "rgba(255,255,255,0.12)",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    paddingTop: 14,
  },
  walletRoyalty: {
    color: "#fff",
    fontWeight: "800",
  },
  circuit: {
    marginTop: 16,
  },
  circuitNode: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    minHeight: 72,
  },
  circuitDot: {
    borderRadius: 999,
    borderWidth: 2,
    height: 18,
    marginTop: 2,
    width: 18,
  },
  circuitLine: {
    backgroundColor: BORDER,
    bottom: -50,
    left: 8.5,
    position: "absolute",
    top: 22,
    width: 1,
  },
  profileCard: {
    alignItems: "center",
  },
  avatar: {
    alignItems: "center",
    backgroundColor: `${ORANGE}12`,
    borderColor: `${ORANGE}28`,
    borderRadius: 999,
    borderWidth: 1,
    height: 92,
    justifyContent: "center",
    width: 92,
  },
  avatarText: {
    color: ORANGE,
    fontSize: 30,
    fontWeight: "900",
  },
  profileName: {
    color: TEXT,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 14,
  },
  profileEmail: {
    color: MUTED,
    fontSize: 13,
    marginTop: 4,
  },
  trustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 14,
  },
  trustPill: {
    alignItems: "center",
    backgroundColor: FAINT,
    borderColor: BORDER,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  trustPillText: {
    color: TEXT,
    fontSize: 12,
    fontWeight: "800",
  },
  credentialGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  credential: {
    backgroundColor: FAINT,
    borderColor: BORDER,
    borderRadius: 20,
    borderWidth: 1,
    padding: 13,
    width: "48%",
  },
  credentialValue: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 8,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metric: {
    backgroundColor: "#fff",
    borderColor: BORDER,
    borderRadius: 24,
    borderWidth: 1,
    minHeight: 118,
    padding: 14,
    width: "48%",
  },
  metricLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: "800",
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
    color: MUTED,
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
  actionIcon: {
    alignItems: "center",
    backgroundColor: `${ORANGE}10`,
    borderRadius: 999,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  infoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
  },
  divider: {
    borderTopColor: BORDER,
    borderTopWidth: 1,
  },
  rowTitle: {
    color: TEXT,
    fontWeight: "800",
  },
  rowDetail: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  rowValue: {
    flexShrink: 0,
    fontSize: 12,
    fontWeight: "800",
  },
});
