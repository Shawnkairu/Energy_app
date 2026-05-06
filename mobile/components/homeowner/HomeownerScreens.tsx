import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type DimensionValue,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import type { DrsResult, PrepaidCommitment, User, WalletTransaction } from "@emappa/shared";
import { colors, GlassCard, Label, Pill, PrimaryButton, Surface, typography } from "@emappa/ui";
import { DrsCard } from "../DrsCard";
import { EnergyTodayChart, type EnergyTodayPoint } from "../EnergyTodayChart";
import { MetricCard } from "../MetricCard";
import { PilotBanner } from "../PilotBanner";
import { ProjectHero } from "../ProjectHero";
import { RoofMap } from "../RoofMap";
import { TokenHero } from "../TokenHero";
import { useAuth } from "../AuthContext";
import { readPilotSession } from "../session";
import { useApi } from "../../lib/api";
import { useApiData } from "../../lib/useApiData";

type ApiStage = "listed" | "qualifying" | "funding" | "installing" | "live" | "retired";

interface ApiBuilding {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lon?: number;
  unitCount: number;
  occupancy: number | null;
  kind: "apartment" | "single_family";
  stage: ApiStage;
  roofAreaM2?: number | null;
  roofPolygonGeojson?: unknown;
  roofSource?: "microsoft_footprints" | "owner_traced" | "owner_typed" | null;
  roofConfidence?: number | null;
  dataSource?: "synthetic" | "measured" | "mixed";
  prepaidCommittedKes?: number;
}

interface RoleHome {
  role: "homeowner";
  primary: ApiBuilding | null;
  projects: ApiBuilding[];
  activity: string[];
}

interface EnergyToday {
  generation_kwh: number[];
  load_kwh: number[];
  irradiance_w_m2: number[];
}

interface PrepaidBalance {
  confirmedTotalKes: number;
}

interface WalletBalance {
  kes: number;
  breakdown: Record<string, number>;
}

interface SettlementPeriod {
  id: string;
  eGen: number;
  eSold: number;
  eWaste: number;
  revenueKes: number;
  payouts: Record<string, number>;
  dataSource: "synthetic" | "measured" | "mixed";
}

interface OwnershipPosition {
  percentage?: number;
  shareFraction?: number;
  ownerRole?: string;
  ownerId?: string;
}

interface HomeownerSnapshot {
  user: User;
  building: ApiBuilding | null;
  balance: PrepaidBalance | null;
  pledgeHistory: PrepaidCommitment[];
  energy: EnergyToday | null;
  drs: DrsResult | null;
  walletBalance: WalletBalance | null;
  transactions: WalletTransaction[];
  ownership: OwnershipPosition[];
  settlement: SettlementPeriod | null;
}

type EmbeddedKind = "drs" | "deployment" | "approve-terms" | "compare-today" | "roof-detail" | "marketplace";

const MONEY_KINDS = new Set(["pledge", "royalty", "capital_return"]);

export function HomeownerHomeScreen() {
  const { data, error, isLoading, refetch } = useHomeownerSnapshot();
  const router = useRouter();

  return (
    <HomeownerShell title="Home" subtitle="Your rooftop project, prepaid token state, and readiness gates in one place.">
      <SnapshotState data={data} error={error} isLoading={isLoading} refetch={refetch}>
        {(snapshot) => {
          if (!snapshot.building) {
            return (
              <>
                <PilotBanner
                  title="Project setup"
                  message="Create your single-family-home project before solar allocation, funding, or payouts can begin."
                />
                <EmptyCard
                  title="Start your home solar project"
                  body="Add your home address and roof basics. The backend will attach the new single-family building to your homeowner account."
                  actionLabel="Start project"
                  onAction={() => router.push("/(homeowner)/_embedded/start-project")}
                />
              </>
            );
          }

          const live = snapshot.building.stage === "live";
          const drsLabel = readinessLabel(snapshot.drs);
          const blockers = snapshot.drs?.reasons ?? [];
          const balance = snapshot.balance?.confirmedTotalKes ?? 0;
          const generation = sum(snapshot.energy?.generation_kwh);

          return (
            <>
              <PilotBanner
                title="Pilot pledge mode"
                message="Prepaid cash is required before solar allocation or stakeholder payout can activate."
              />

              {live ? (
                <>
                  <TokenHero
                    eyebrow="Live token balance"
                    title="Prepaid solar is active"
                    subtitle={`${formatKwh(generation)} generated today. Allocation remains capped by confirmed prepaid balance.`}
                    tokenLabel="Confirmed prepaid"
                    tokenValue={formatKes(balance)}
                  />
                  <CompactSpacer />
                  <ProjectHero
                    name={snapshot.building.name}
                    location={snapshot.building.address}
                    readinessLabel={drsLabel}
                    summary="Project is live. Roof, DRS, and settlement details remain available from the project screens."
                  />
                  <ActionRail
                    actions={[
                      ["Pledge", "/(homeowner)/wallet"],
                      ["View energy", "/(homeowner)/energy"],
                      ["Wallet", "/(homeowner)/wallet"],
                      ["Roof", "/(homeowner)/_embedded/roof-detail"],
                    ]}
                  />
                </>
              ) : (
                <>
                  <ProjectHero
                    name={snapshot.building.name}
                    location={snapshot.building.address}
                    readinessLabel={drsLabel}
                    summary={blockers.length ? blockers.slice(0, 2).join(" · ") : `Current project stage: ${formatStage(snapshot.building.stage)}.`}
                  />
                  <ActionRail
                    actions={[
                      ["View blockers", "/(homeowner)/_embedded/drs"],
                      ["Approve terms", "/(homeowner)/_embedded/approve-terms"],
                      ["Compare bill", "/(homeowner)/_embedded/compare-today"],
                      ["Deployment timeline", "/(homeowner)/_embedded/deployment"],
                      ["Roof detail", "/(homeowner)/_embedded/roof-detail"],
                    ]}
                  />
                  <View style={styles.disabledHero}>
                    <TokenHero
                      eyebrow="Tokens locked"
                      title="Tokens activate once your project goes live."
                      subtitle="Funding, supplier lock, installer scheduling, and go-live remain gated by readiness."
                      tokenLabel="Available allocation"
                      tokenValue={formatKes(0)}
                    />
                  </View>
                </>
              )}

              <MetricGrid
                metrics={[
                  { label: "Pledged", value: formatKes(balance), detail: "Confirmed prepaid cash" },
                  { label: "Stage", value: formatStage(snapshot.building.stage), detail: "Deployment lifecycle" },
                  { label: "Roof", value: formatArea(snapshot.building.roofAreaM2), detail: "Usable area on file" },
                ]}
              />
            </>
          );
        }}
      </SnapshotState>
    </HomeownerShell>
  );
}

export function HomeownerEnergyScreen() {
  const { data, error, isLoading, refetch } = useHomeownerSnapshot();

  return (
    <HomeownerShell title="Energy" subtitle="Generation is always visible here because the homeowner owns the rooftop.">
      <SnapshotState data={data} error={error} isLoading={isLoading} refetch={refetch}>
        {(snapshot) => {
          if (!snapshot.building) {
            return <NoBuildingCard />;
          }

          const generation = sum(snapshot.energy?.generation_kwh);
          const load = sum(snapshot.energy?.load_kwh);
          const sold = Math.min(generation, load);
          const coverage = load > 0 ? sold / load : 0;

          return (
            <>
              <PilotBanner
                title="Energy data"
                message={`Chart values are sourced from the energy API. Current building source: ${snapshot.building.dataSource ?? "unreported"}.`}
              />
              <EnergyTodayChart title="Rooftop generation today" points={chartPoints(snapshot.energy?.generation_kwh)} unit="kWh" />
              <MetricGrid
                metrics={[
                  { label: "Generated", value: formatKwh(generation), detail: "Trailing 24h solar" },
                  { label: "Home load", value: formatKwh(load), detail: "Trailing 24h usage" },
                  { label: "Solar cover", value: formatPercent(coverage), detail: "Generation matched to load" },
                ]}
              />
              <GlassCard>
                <Label>Readiness link</Label>
                <Text style={styles.cardTitle}>Energy only earns after it is monetized</Text>
                <Text style={styles.bodyText}>
                  Generated, wasted, curtailed, or free-exported energy does not create payout. Wallet payouts follow confirmed settlement records.
                </Text>
            </GlassCard>
            </>
          );
        }}
      </SnapshotState>
    </HomeownerShell>
  );
}

export function HomeownerWalletScreen() {
  const { data, error, isLoading, refetch } = useHomeownerSnapshot();
  const api = useApi();
  const [segment, setSegment] = useState<"cashflow" | "ownership" | "pledges">("cashflow");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function pledge(buildingId: string) {
    const amountKes = Number(amount);
    if (!Number.isFinite(amountKes) || amountKes <= 0) {
      setStatus("Enter a positive pledge amount before submitting.");
      return;
    }

    setStatus("Submitting pledge...");
    await api.commitPrepaid({ buildingId, amountKes });
    setAmount("");
    setStatus("Pledge confirmed. Refreshing wallet...");
    refetch();
  }

  return (
    <HomeownerShell title="Wallet" subtitle="Pledges, homeowner royalties, and share earnings stay segmented.">
      <SnapshotState data={data} error={error} isLoading={isLoading} refetch={refetch}>
        {(snapshot) => {
          if (!snapshot.building) {
            return <NoBuildingCard />;
          }

          const pledged = snapshot.balance?.confirmedTotalKes ?? 0;
          const royalties = snapshot.transactions
            .filter((tx) => tx.kind === "royalty")
            .reduce((total, tx) => total + Math.max(0, tx.amountKes), 0);
          const shareEarnings = snapshot.transactions
            .filter((tx) => tx.kind === "capital_return")
            .reduce((total, tx) => total + Math.max(0, tx.amountKes), 0);
          const ownedShare = ownershipPercent(snapshot.ownership);

          return (
            <>
              <PilotBanner
                title="Wallet settlement"
                message="Payouts appear only when solar has been monetized and a settlement record exists."
              />
              <MetricGrid
                metrics={[
                  { label: "Pledged total", value: formatKes(pledged), detail: "Confirmed prepaid" },
                  { label: "Royalties earned", value: formatKes(royalties), detail: "Wallet royalty credits" },
                  { label: "Share earnings", value: formatKes(shareEarnings), detail: "Ownership-linked credits" },
                ]}
              />

              <GlassCard>
                <Label>Pledge tokens</Label>
                <Text style={styles.cardTitle}>Add prepaid solar cash</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="number-pad"
                  placeholder="Amount in KES"
                  placeholderTextColor={colors.dim}
                  style={styles.input}
                />
                {status ? <Text style={styles.bodyText}>{status}</Text> : null}
                <PrimaryButton onPress={() => pledge(snapshot.building!.id)}>Submit pledge</PrimaryButton>
              </GlassCard>

              <Segmented
                value={segment}
                options={[
                  ["cashflow", "Cashflow"],
                  ["ownership", "Ownership"],
                  ["pledges", "Pledges"],
                ]}
                onChange={setSegment}
              />

              {segment === "cashflow" ? <TransactionList transactions={snapshot.transactions.filter((tx) => MONEY_KINDS.has(tx.kind))} /> : null}
              {segment === "ownership" ? (
                <OwnershipPanel positions={snapshot.ownership} ownedShare={ownedShare} />
              ) : null}
              {segment === "pledges" ? <PledgeHistory history={snapshot.pledgeHistory} /> : null}
            </>
          );
        }}
      </SnapshotState>
    </HomeownerShell>
  );
}

export function HomeownerProfileScreen() {
  const { data, error, isLoading, refetch } = useHomeownerSnapshot();
  const { clearSession } = useAuth();
  const router = useRouter();

  function logout() {
    clearSession();
    router.replace("/(auth)/login");
  }

  return (
    <HomeownerShell title="Profile" subtitle="Account, home profile, roof evidence, settings, support, and session controls.">
      <SnapshotState data={data} error={error} isLoading={isLoading} refetch={refetch}>
        {(snapshot) => {
          const initials = initialsFor(snapshot.user);
          return (
            <>
              <GlassCard>
                <View style={styles.profileRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{snapshot.user.displayName ?? snapshot.user.email}</Text>
                    <Text style={styles.bodyText}>{snapshot.user.email}</Text>
                    <View style={{ alignSelf: "flex-start", marginTop: 8 }}>
                      <Pill>Homeowner</Pill>
                    </View>
                  </View>
                </View>
              </GlassCard>

              {snapshot.building ? (
                <GlassCard>
                  <Label>Building & roof</Label>
                  <Text style={styles.cardTitle}>{snapshot.building.name}</Text>
                  <Text style={styles.bodyText}>{snapshot.building.address}</Text>
                  <View style={{ marginTop: 14 }}>
                    <RoofMap
                      title="Roof evidence"
                      usableAreaSqm={snapshot.building.roofAreaM2 ?? 0}
                      panelCount={panelEstimate(snapshot.building.roofAreaM2)}
                    />
                  </View>
                  <InfoRows
                    rows={[
                      ["Kind", snapshot.building.kind.replace("_", " ")],
                      ["Units", String(snapshot.building.unitCount)],
                      ["Roof source", snapshot.building.roofSource ?? "Not captured"],
                      ["Confidence", formatPercent(snapshot.building.roofConfidence ?? 0)],
                    ]}
                  />
                  <PrimaryButton onPress={() => router.push("/(homeowner)/_embedded/roof-detail")}>Edit roof</PrimaryButton>
                </GlassCard>
              ) : (
                <NoBuildingCard />
              )}

              <GlassCard>
                <Label>Settings</Label>
                <InfoRows
                  rows={[
                    ["Notifications", "Project gates and settlement events"],
                    ["Units", "kWh and KES"],
                    ["Language", "English"],
                  ]}
                />
              </GlassCard>

              <GlassCard>
                <Label>Support</Label>
                <Text style={styles.bodyText}>Get help with roof capture, prepaid pledges, and settlement questions.</Text>
                <PrimaryButton onPress={() => Linking.openURL("mailto:support@emappa.test?subject=Homeowner%20support")}>
                  Contact support
                </PrimaryButton>
              </GlassCard>

              <Pressable onPress={logout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Log out</Text>
              </Pressable>
            </>
          );
        }}
      </SnapshotState>
    </HomeownerShell>
  );
}

export function HomeownerEmbeddedScreen({ kind }: { kind: EmbeddedKind }) {
  const { data, error, isLoading, refetch } = useHomeownerSnapshot();
  const titleByKind: Record<EmbeddedKind, string> = {
    drs: "Readiness",
    deployment: "Deployment",
    "approve-terms": "Terms",
    "compare-today": "Compare",
    "roof-detail": "Roof",
    marketplace: "Ownership",
  };

  return (
    <HomeownerShell title={titleByKind[kind]} subtitle="Project detail screen for the homeowner workspace.">
      <SnapshotState data={data} error={error} isLoading={isLoading} refetch={refetch}>
        {(snapshot) => {
          if (!snapshot.building) {
            return <NoBuildingCard />;
          }
          if (kind === "drs") {
            return <DrsDetail snapshot={snapshot} />;
          }
          if (kind === "deployment") {
            return <DeploymentDetail building={snapshot.building} drs={snapshot.drs} />;
          }
          if (kind === "approve-terms") {
            return <TermsDetail snapshot={snapshot} />;
          }
          if (kind === "compare-today") {
            return <CompareTodayDetail snapshot={snapshot} />;
          }
          if (kind === "roof-detail") {
            return <RoofDetail snapshot={snapshot} refetch={refetch} />;
          }
          return <MarketplaceDetail snapshot={snapshot} />;
        }}
      </SnapshotState>
    </HomeownerShell>
  );
}

export function HomeownerStartProjectScreen() {
  const api = useApi();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();

  async function createProject() {
    const parsedLat = Number(lat);
    const parsedLon = Number(lon);
    if (!name.trim() || !address.trim() || !Number.isFinite(parsedLat) || !Number.isFinite(parsedLon)) {
      setStatus("Add a name, address, latitude, and longitude to create the project.");
      return;
    }

    setStatus("Creating project...");
    await api.createBuilding({
      name: name.trim(),
      address: address.trim(),
      lat: parsedLat,
      lon: parsedLon,
      unitCount: 1,
      occupancy: 1,
      kind: "single_family",
    });
    router.replace("/(homeowner)/home");
  }

  return (
    <HomeownerShell title="Start Project" subtitle="Create the single-family-home building record attached to your homeowner account.">
      <PilotBanner title="Homeowner onboarding" message="The backend enforces single-family kind and one unit for homeowner projects." />
      <GlassCard>
        <Label>Home details</Label>
        <TextInput value={name} onChangeText={setName} placeholder="Project name" placeholderTextColor={colors.dim} style={styles.input} />
        <TextInput value={address} onChangeText={setAddress} placeholder="Address" placeholderTextColor={colors.dim} style={styles.input} />
        <TextInput value={lat} onChangeText={setLat} placeholder="Latitude" placeholderTextColor={colors.dim} keyboardType="decimal-pad" style={styles.input} />
        <TextInput value={lon} onChangeText={setLon} placeholder="Longitude" placeholderTextColor={colors.dim} keyboardType="decimal-pad" style={styles.input} />
        {status ? <Text style={styles.bodyText}>{status}</Text> : null}
        <PrimaryButton onPress={createProject}>Create project</PrimaryButton>
      </GlassCard>
    </HomeownerShell>
  );
}

export function HomeownerGuard({ children }: { children: ReactNode }) {
  const session = readPilotSession();
  if (session?.role && session.role !== "homeowner") {
    return <Redirect href="/(auth)/role-select" />;
  }
  return children;
}

function useHomeownerSnapshot() {
  const api = useApi();
  const apiRef = useRef(api);
  apiRef.current = api;
  const load = useCallback(() => loadHomeownerSnapshot(apiRef.current), []);
  return useApiData(load, []);
}

async function loadHomeownerSnapshot(api: ReturnType<typeof useApi>): Promise<HomeownerSnapshot> {
  const [user, homeResult] = await Promise.all([api.me(), api.roleHome("homeowner")]);
  const home = homeResult as unknown as RoleHome;
  const building =
    home.primary ?? (user.buildingId ? ((await api.getProject(user.buildingId)) as unknown as ApiBuilding) : null);

  if (!building) {
    return {
      user,
      building: null,
      balance: null,
      pledgeHistory: [],
      energy: null,
      drs: null,
      walletBalance: null,
      transactions: [],
      ownership: [],
      settlement: null,
    };
  }

  const [balance, pledgeHistory, energy, drs, walletBalance, transactions, ownership, settlement] = await Promise.all([
    api.getPrepaidBalance(building.id),
    api.getPrepaidHistory(building.id),
    api.getEnergyToday(building.id),
    api.getDrsAssessment(building.id) as Promise<DrsResult>,
    api.getWalletBalance(user.id),
    api.getWalletTransactions(user.id),
    api.getOwnership(building.id, "homeowner") as Promise<OwnershipPosition[]>,
    api.getLatestSettlement(building.id) as Promise<SettlementPeriod | null>,
  ]);

  return { user, building, balance, pledgeHistory, energy, drs, walletBalance, transactions, ownership, settlement };
}

function SnapshotState({
  data,
  error,
  isLoading,
  refetch,
  children,
}: {
  data: HomeownerSnapshot | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => void;
  children: (snapshot: HomeownerSnapshot) => ReactNode;
}) {
  if (isLoading) {
    return <LoadingCard />;
  }
  if (error) {
    return <ErrorCard message={error.message} onRetry={refetch} />;
  }
  if (!data) {
    return <ErrorCard message="No homeowner data was returned." onRetry={refetch} />;
  }
  return <>{children(data)}</>;
}

function HomeownerShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <Surface>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.kicker}>Homeowner</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.stack}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </Surface>
  );
}

function ActionRail({ actions }: { actions: Array<[string, string]> }) {
  const router = useRouter();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionRail}>
      {actions.map(([label, href]) => (
        <Pressable key={label} onPress={() => router.push(href)} style={styles.actionPill}>
          <Text style={styles.actionText}>{label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function MetricGrid({ metrics }: { metrics: Array<{ label: string; value: string; detail: string }> }) {
  return (
    <View style={styles.metricGrid}>
      {metrics.map((metric) => (
        <View key={metric.label} style={styles.metricItem}>
          <MetricCard label={metric.label} value={metric.value} detail={metric.detail} />
        </View>
      ))}
    </View>
  );
}

function Segmented<TValue extends string>({
  value,
  options,
  onChange,
}: {
  value: TValue;
  options: Array<[TValue, string]>;
  onChange: (next: TValue) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map(([next, label]) => {
        const selected = value === next;
        return (
          <Pressable key={next} onPress={() => onChange(next)} style={[styles.segment, selected && styles.segmentSelected]}>
            <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TransactionList({ transactions }: { transactions: WalletTransaction[] }) {
  if (transactions.length === 0) {
    return <EmptyCard title="No wallet cashflow yet" body="Pledge debits, royalty credits, and ownership-linked credits will appear after API records exist." />;
  }

  return (
    <GlassCard>
      <Label>Cashflow</Label>
      {transactions.map((tx) => (
        <Row key={tx.id} label={tx.reference} value={formatKes(tx.amountKes)} note={`${tx.kind} · ${formatDate(tx.at)}`} />
      ))}
    </GlassCard>
  );
}

function OwnershipPanel({ positions, ownedShare }: { positions: OwnershipPosition[]; ownedShare: number }) {
  const router = useRouter();
  return (
    <GlassCard>
      <Label>Ownership</Label>
      <Text style={styles.cardTitle}>{formatPercent(ownedShare)} recorded homeowner share</Text>
      {positions.length === 0 ? (
        <Text style={styles.bodyText}>The ownership API returned no homeowner positions for this building.</Text>
      ) : (
        positions.map((position, index) => (
          <Row
            key={`${position.ownerId ?? "owner"}-${index}`}
            label={position.ownerRole ?? "homeowner"}
            value={formatPercent(positionShare(position))}
            note={position.ownerId ?? "Owner id unavailable"}
          />
        ))
      )}
      {ownedShare < 1 ? (
        <PrimaryButton onPress={() => router.push("/(homeowner)/_embedded/marketplace")}>Buy back shares</PrimaryButton>
      ) : null}
    </GlassCard>
  );
}

function PledgeHistory({ history }: { history: PrepaidCommitment[] }) {
  if (history.length === 0) {
    return <EmptyCard title="No pledges yet" body="Confirmed homeowner pledges from the prepaid API will appear here." />;
  }
  return (
    <GlassCard>
      <Label>Pledge history</Label>
      {history.map((pledge) => (
        <Row key={pledge.id} label={formatKes(pledge.amountKes)} value={pledge.status} note={formatDate(pledge.createdAt)} />
      ))}
    </GlassCard>
  );
}

function DrsDetail({ snapshot }: { snapshot: HomeownerSnapshot }) {
  if (!snapshot.drs) {
    return <EmptyCard title="No DRS assessment" body="The readiness endpoint returned no DRS result for this building." />;
  }

  return (
    <>
      <DrsCard drs={{ ...snapshot.drs, score: drsScore(snapshot.drs), label: readinessLabel(snapshot.drs) }} />
      <GlassCard>
        <Label>Blockers</Label>
        {snapshot.drs.reasons.length === 0 ? (
          <Text style={styles.bodyText}>No DRS blockers were returned by the API.</Text>
        ) : (
          snapshot.drs.reasons.map((reason) => <Row key={reason} label={reason} value="Review" note="Resolve before go-live." />)
        )}
      </GlassCard>
    </>
  );
}

function DeploymentDetail({ building, drs }: { building: ApiBuilding; drs: DrsResult | null }) {
  const stages: ApiStage[] = ["listed", "qualifying", "funding", "installing", "live"];
  const current = Math.max(0, stages.indexOf(building.stage));
  const progress = `${Math.max(8, ((current + 1) / stages.length) * 100)}%` as DimensionValue;

  return (
    <GlassCard>
      <Label>Deployment timeline</Label>
      <Text style={styles.cardTitle}>{formatStage(building.stage)}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progress }]} />
      </View>
      {stages.map((stage, index) => (
        <Row
          key={stage}
          label={formatStage(stage)}
          value={index <= current ? "Reached" : "Pending"}
          note={stage === "live" ? "Go-live only follows readiness approval." : `DRS: ${readinessLabel(drs)}`}
        />
      ))}
    </GlassCard>
  );
}

function TermsDetail({ snapshot }: { snapshot: HomeownerSnapshot }) {
  return (
    <GlassCard>
      <Label>Terms gate</Label>
      <Text style={styles.cardTitle}>Prepaid and payout rules</Text>
      <InfoRows
        rows={[
          ["Prepaid only", "No prepaid cash means no solar allocation."],
          ["Readiness first", "Funding, supplier lock, scheduling, and go-live stay gated."],
          ["Monetized solar", "Payout only follows sold solar and settlement records."],
          ["Current stage", formatStage(snapshot.building!.stage)],
        ]}
      />
    </GlassCard>
  );
}

function CompareTodayDetail({ snapshot }: { snapshot: HomeownerSnapshot }) {
  const generation = sum(snapshot.energy?.generation_kwh);
  const load = sum(snapshot.energy?.load_kwh);
  const sold = Math.min(generation, load);

  return (
    <>
      <EnergyTodayChart title="Generation available today" points={chartPoints(snapshot.energy?.generation_kwh)} unit="kWh" />
      <MetricGrid
        metrics={[
          { label: "Generated", value: formatKwh(generation), detail: "Solar produced" },
          { label: "Matched load", value: formatKwh(sold), detail: "Solar that could serve home load" },
          { label: "Pledged", value: formatKes(snapshot.balance?.confirmedTotalKes ?? 0), detail: "Cash-cleared prepaid" },
        ]}
      />
    </>
  );
}

function RoofDetail({ snapshot, refetch }: { snapshot: HomeownerSnapshot; refetch: () => void }) {
  const api = useApi();
  const [area, setArea] = useState(snapshot.building?.roofAreaM2 ? String(snapshot.building.roofAreaM2) : "");
  const [status, setStatus] = useState<string | null>(null);

  async function saveRoof() {
    const areaM2 = Number(area);
    if (!Number.isFinite(areaM2) || areaM2 <= 0) {
      setStatus("Enter a positive roof area before saving.");
      return;
    }
    setStatus("Saving roof evidence...");
    await api.setRoof(snapshot.building!.id, { areaM2, source: "owner_typed" });
    setStatus("Roof evidence saved. Refreshing...");
    refetch();
  }

  return (
    <GlassCard>
      <Label>Roof detail</Label>
      <RoofMap
        title={snapshot.building!.name}
        usableAreaSqm={snapshot.building!.roofAreaM2 ?? 0}
        panelCount={panelEstimate(snapshot.building!.roofAreaM2)}
      />
      <TextInput value={area} onChangeText={setArea} keyboardType="decimal-pad" placeholder="Usable roof area m2" placeholderTextColor={colors.dim} style={styles.input} />
      {status ? <Text style={styles.bodyText}>{status}</Text> : null}
      <PrimaryButton onPress={saveRoof}>Save roof area</PrimaryButton>
    </GlassCard>
  );
}

function MarketplaceDetail({ snapshot }: { snapshot: HomeownerSnapshot }) {
  const ownedShare = ownershipPercent(snapshot.ownership);
  return (
    <GlassCard>
      <Label>Buy back shares</Label>
      <Text style={styles.cardTitle}>{formatPercent(Math.max(0, 1 - ownedShare))} outside homeowner record</Text>
      <Text style={styles.bodyText}>
        This screen reads the ownership API and shows whether there is a recorded share gap. A transfer action should appear only when the backend exposes a homeowner buyback endpoint.
      </Text>
      <PrimaryButton onPress={() => Linking.openURL("mailto:support@emappa.test?subject=Homeowner%20share%20buyback")}>
        Contact support
      </PrimaryButton>
    </GlassCard>
  );
}

function InfoRows({ rows }: { rows: Array<[string, string]> }) {
  return (
    <View style={{ marginTop: 12 }}>
      {rows.map(([label, value]) => (
        <Row key={label} label={label} value={value} />
      ))}
    </View>
  );
}

function Row({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {note ? <Text style={styles.rowNote}>{note}</Text> : null}
      </View>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function LoadingCard() {
  return (
    <GlassCard>
      <Label>Loading</Label>
      <Text style={styles.cardTitle}>Preparing homeowner data</Text>
      <Text style={styles.bodyText}>Fetching role home, energy, wallet, roof, and readiness records.</Text>
    </GlassCard>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <GlassCard>
      <Label>Unable to load</Label>
      <Text style={styles.cardTitle}>Homeowner data unavailable</Text>
      <Text style={styles.bodyText}>{message}</Text>
      <PrimaryButton onPress={onRetry}>Retry</PrimaryButton>
    </GlassCard>
  );
}

function EmptyCard({ title, body, actionLabel, onAction }: { title: string; body: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <GlassCard>
      <Label>Empty state</Label>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.bodyText}>{body}</Text>
      {actionLabel && onAction ? <PrimaryButton onPress={onAction}>{actionLabel}</PrimaryButton> : null}
    </GlassCard>
  );
}

function NoBuildingCard() {
  const router = useRouter();
  return (
    <EmptyCard
      title="No home project attached"
      body="Create a homeowner building record before energy, wallet, roof, and readiness data can load."
      actionLabel="Start project"
      onAction={() => router.push("/(homeowner)/_embedded/start-project")}
    />
  );
}

function CompactSpacer() {
  return <View style={{ height: 12 }} />;
}

function chartPoints(values: number[] | null | undefined): EnergyTodayPoint[] {
  const source = values ?? [];
  return source.map((value, index) => ({ label: `${index}`, value }));
}

function sum(values: number[] | null | undefined) {
  return values?.reduce((total, value) => total + value, 0) ?? 0;
}

function formatKes(value: number) {
  return `KSh ${Math.round(value).toLocaleString()}`;
}

function formatKwh(value: number) {
  return `${Number(value.toFixed(1)).toLocaleString()} kWh`;
}

function formatPercent(value: number) {
  return `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
}

function formatArea(value?: number | null) {
  return value ? `${Math.round(value).toLocaleString()} m2` : "Not captured";
}

function formatStage(stage: string) {
  return stage.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "Date unavailable";
}

function readinessLabel(drs: DrsResult | null) {
  if (!drs) {
    return "DRS unavailable";
  }
  return `${drs.decision} · ${drsScore(drs)}/100`;
}

function drsScore(drs: DrsResult) {
  return drs.score <= 1 ? Math.round(drs.score * 100) : Math.round(drs.score);
}

function panelEstimate(area?: number | null) {
  return area ? Math.max(1, Math.floor(area / 2)) : 0;
}

function ownershipPercent(positions: OwnershipPosition[]) {
  return Math.min(1, positions.reduce((total, position) => total + positionShare(position), 0));
}

function positionShare(position: OwnershipPosition) {
  if (typeof position.shareFraction === "number") {
    return position.shareFraction;
  }
  if (typeof position.percentage === "number") {
    return position.percentage > 1 ? position.percentage / 100 : position.percentage;
  }
  return 0;
}

function initialsFor(user: User) {
  const source = user.displayName ?? user.email;
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 36 },
  kicker: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: typography.hero + 4,
    fontWeight: "800",
    letterSpacing: -1.1,
    lineHeight: typography.hero + 12,
    marginTop: 8,
  },
  subtitle: { color: colors.muted, fontSize: typography.body, lineHeight: 22, marginTop: 8 },
  stack: { gap: 16, marginTop: 18 },
  actionRail: { gap: 8, paddingVertical: 2 },
  actionPill: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionText: { color: colors.text, fontSize: 12, fontWeight: "700" },
  disabledHero: { opacity: 0.55 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricItem: { width: "48%" },
  cardTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: typography.title + 6,
    marginTop: 6,
  },
  bodyText: { color: colors.muted, fontSize: typography.small, lineHeight: 20, marginTop: 8, marginBottom: 12 },
  input: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "600",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  segmented: {
    flexDirection: "row",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 4,
  },
  segment: { flex: 1, alignItems: "center", borderRadius: 999, paddingVertical: 9 },
  segmentSelected: { backgroundColor: `${colors.orangeDeep}18` },
  segmentText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  segmentTextSelected: { color: colors.orangeDeep },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
    paddingVertical: 12,
  },
  rowLabel: { color: colors.text, fontSize: typography.small, fontWeight: "700" },
  rowNote: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  rowValue: { color: colors.text, flexShrink: 0, fontSize: typography.small, fontWeight: "800" },
  progressTrack: { height: 12, borderRadius: 999, backgroundColor: colors.panelSoft, marginVertical: 16, overflow: "hidden" },
  progressFill: { height: 12, borderRadius: 999, backgroundColor: colors.orangeDeep },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    alignItems: "center",
    backgroundColor: `${colors.orangeDeep}18`,
    borderRadius: 22,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  avatarText: { color: colors.orangeDeep, fontSize: 18, fontWeight: "800" },
  logoutButton: {
    alignItems: "center",
    borderColor: `${colors.red}55`,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
  },
  logoutText: { color: colors.red, fontWeight: "800" },
});
