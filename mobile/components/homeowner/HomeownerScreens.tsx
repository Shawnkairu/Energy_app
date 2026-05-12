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
  type ViewStyle,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { DrsResult, PrepaidCommitment, User, WalletTransaction } from "@emappa/shared";
import { colors, Label, Pill, PrimaryButton, typography } from "@emappa/ui";
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

const MONEY_KINDS = new Set(["royalty", "capital_return"]);

export function HomeownerHomeScreen() {
  const { data, error, isLoading, refetch } = useHomeownerSnapshot();
  const router = useRouter();

  return (
    <HomeownerShell title="Roof" subtitle="Permission, readiness, next step.">
      <SnapshotState data={data} error={error} isLoading={isLoading} refetch={refetch}>
        {(snapshot) => {
          if (!snapshot.building) {
            return (
              <EmptyCard
                icon="home-outline"
                title="Add your roof"
                body="Create a home record before roof review can begin."
                actionLabel="Start"
                onAction={() => router.push("/(homeowner)/_embedded/start-project")}
              />
            );
          }

          const readiness = readinessLabel(snapshot.drs);
          const blockers = snapshot.drs?.reasons ?? [];
          const permission = roofPermissionLabel(snapshot.building);
          const nextAction = nextHomeownerAction(snapshot.building, snapshot.drs);

          return (
            <>
              <RoofStatusHero building={snapshot.building} readiness={readiness} permission={permission} />

              <MetricGrid
                metrics={[
                  { label: "Readiness", value: readiness, detail: blockers[0] ?? "No blocker reported" },
                  { label: "Status", value: formatStage(snapshot.building.stage), detail: "Project path" },
                  { label: "Permission", value: permission, detail: "Roof access record" },
                  { label: "Next", value: nextAction.label, detail: nextAction.detail },
                ]}
              />

              <ActionRail
                actions={[
                  ["Roof detail", "/(homeowner)/_embedded/roof-detail"],
                  ["Readiness", "/(homeowner)/_embedded/drs"],
                  ["Terms", "/(homeowner)/_embedded/approve-terms"],
                  ["Timeline", "/(homeowner)/_embedded/deployment"],
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
    <HomeownerShell title="Energy" subtitle="Roof flow, not asset ownership.">
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
              <EnergyFlowCard generation={generation} load={load} source={snapshot.building.dataSource ?? "unreported"} />
              <MetricGrid
                metrics={[
                  { label: "Produced", value: formatKwh(generation), detail: "Provider system" },
                  { label: "Home use", value: formatKwh(load), detail: "Trailing 24h" },
                  { label: "Matched", value: formatPercent(coverage), detail: "Served by roof flow" },
                ]}
              />
              <WhiteCard>
                <Label>Truth</Label>
                <Text style={styles.cardTitle}>You control access to the roof.</Text>
                <Text style={styles.bodyText}>
                  The solar array is a provider asset. Income only follows monetized energy and settlement records.
                </Text>
              </WhiteCard>
            </>
          );
        }}
      </SnapshotState>
    </HomeownerShell>
  );
}

export function HomeownerWalletScreen() {
  const { data, error, isLoading, refetch } = useHomeownerSnapshot();
  const [segment, setSegment] = useState<"income" | "account">("income");

  return (
    <HomeownerShell title="Wallet" subtitle="Roof income and account records.">
      <SnapshotState data={data} error={error} isLoading={isLoading} refetch={refetch}>
        {(snapshot) => {
          if (!snapshot.building) {
            return <NoBuildingCard />;
          }

          const royalties = snapshot.transactions
            .filter((tx) => tx.kind === "royalty")
            .reduce((total, tx) => total + Math.max(0, tx.amountKes), 0);
          const shareEarnings = snapshot.transactions
            .filter((tx) => tx.kind === "capital_return")
            .reduce((total, tx) => total + Math.max(0, tx.amountKes), 0);
          const ownedShare = ownershipPercent(snapshot.ownership);

          return (
            <>
              <IncomeHero royalties={royalties} shareEarnings={shareEarnings} walletBalance={snapshot.walletBalance?.kes ?? 0} />
              <MetricGrid
                metrics={[
                  { label: "Roof income", value: formatKes(royalties), detail: "Royalty credits" },
                  { label: "Account", value: formatKes(snapshot.walletBalance?.kes ?? 0), detail: "Wallet balance" },
                  { label: "Share record", value: formatPercent(ownedShare), detail: "Cashflow position" },
                ]}
              />

              <Segmented
                value={segment}
                options={[
                  ["income", "Income"],
                  ["account", "Account"],
                ]}
                onChange={setSegment}
              />

              {segment === "income" ? <TransactionList transactions={snapshot.transactions.filter((tx) => MONEY_KINDS.has(tx.kind))} /> : null}
              {segment === "account" ? (
                <AccountPanel user={snapshot.user} positions={snapshot.ownership} ownedShare={ownedShare} />
              ) : null}
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
    <HomeownerShell title="Profile" subtitle="Home, trust, support.">
      <SnapshotState data={data} error={error} isLoading={isLoading} refetch={refetch}>
        {(snapshot) => {
          const initials = initialsFor(snapshot.user);
          return (
            <>
              <WhiteCard>
                <View style={styles.profileHero}>
                  <View style={styles.avatarLarge}>
                    <Text style={styles.avatarTextLarge}>{initials}</Text>
                  </View>
                  <Text style={styles.profileName}>{snapshot.user.displayName ?? "Homeowner"}</Text>
                  <Text style={styles.profileEmail}>{snapshot.user.email}</Text>
                  <View style={styles.pillRow}>
                    <Pill>Roof host</Pill>
                    <Pill>Verified account</Pill>
                  </View>
                </View>
              </WhiteCard>

              {snapshot.building ? (
                <WhiteCard>
                  <Label>Home</Label>
                  <Text style={styles.cardTitle}>{snapshot.building.name}</Text>
                  <Text style={styles.bodyText}>{snapshot.building.address}</Text>
                  <MiniRoofGraphic area={snapshot.building.roofAreaM2} />
                  <InfoRows
                    rows={[
                      ["Kind", snapshot.building.kind.replace("_", " ")],
                      ["Roof record", formatArea(snapshot.building.roofAreaM2)],
                      ["Source", snapshot.building.roofSource ?? "Not captured"],
                      ["Confidence", formatPercent(snapshot.building.roofConfidence ?? 0)],
                    ]}
                  />
                  <PrimaryButton onPress={() => router.push("/(homeowner)/_embedded/roof-detail")}>Edit roof</PrimaryButton>
                </WhiteCard>
              ) : (
                <NoBuildingCard />
              )}

              <WhiteCard>
                <Label>Trust</Label>
                <InfoRows
                  rows={[
                    ["Identity", "Account email on file"],
                    ["Permission", snapshot.building ? roofPermissionLabel(snapshot.building) : "No roof"],
                    ["Updates", "Readiness and settlements"],
                  ]}
                />
              </WhiteCard>

              <WhiteCard>
                <Label>Support</Label>
                <Text style={styles.bodyText}>Get help with roof records or income questions.</Text>
                <PrimaryButton onPress={() => Linking.openURL("mailto:support@emappa.test?subject=Homeowner%20support")}>
                  Contact support
                </PrimaryButton>
              </WhiteCard>

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
    marketplace: "Shares",
  };

  return (
    <HomeownerShell title={titleByKind[kind]} subtitle="Homeowner roof record.">
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
    <HomeownerShell title="Start" subtitle="Add the roof you control.">
      <WhiteCard>
        <IconBadge name="home-outline" />
        <Text style={styles.cardTitle}>Home details</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Project name" placeholderTextColor={colors.dim} style={styles.input} />
        <TextInput value={address} onChangeText={setAddress} placeholder="Address" placeholderTextColor={colors.dim} style={styles.input} />
        <TextInput value={lat} onChangeText={setLat} placeholder="Latitude" placeholderTextColor={colors.dim} keyboardType="decimal-pad" style={styles.input} />
        <TextInput value={lon} onChangeText={setLon} placeholder="Longitude" placeholderTextColor={colors.dim} keyboardType="decimal-pad" style={styles.input} />
        {status ? <Text style={styles.bodyText}>{status}</Text> : null}
        <PrimaryButton onPress={createProject}>Create</PrimaryButton>
      </WhiteCard>
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
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.kicker}>Homeowner</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.stack}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </View>
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
          <WhiteCard style={styles.metricCard}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricDetail}>{metric.detail}</Text>
          </WhiteCard>
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
    return <EmptyCard icon="wallet-outline" title="No income yet" body="Roof royalty credits appear after settlement." />;
  }

  return (
    <WhiteCard>
      <Label>Income</Label>
      {transactions.map((tx) => (
        <Row key={tx.id} label={tx.reference} value={formatKes(tx.amountKes)} note={`${tx.kind} · ${formatDate(tx.at)}`} />
      ))}
    </WhiteCard>
  );
}

function AccountPanel({ user, positions, ownedShare }: { user: User; positions: OwnershipPosition[]; ownedShare: number }) {
  const router = useRouter();
  return (
    <WhiteCard>
      <Label>Account</Label>
      <Text style={styles.cardTitle}>{user.displayName ?? user.email}</Text>
      <Text style={styles.bodyText}>{user.email}</Text>
      {positions.length === 0 ? (
        <Row label="Share record" value="None" note="No cashflow position was returned." />
      ) : (
        positions.map((position, index) => (
          <Row
            key={`${position.ownerId ?? "owner"}-${index}`}
            label={position.ownerRole ?? "cashflow"}
            value={formatPercent(positionShare(position))}
            note={position.ownerId ?? "Record id unavailable"}
          />
        ))
      )}
      {ownedShare < 1 ? (
        <PrimaryButton onPress={() => router.push("/(homeowner)/_embedded/marketplace")}>Review shares</PrimaryButton>
      ) : null}
    </WhiteCard>
  );
}

function DrsDetail({ snapshot }: { snapshot: HomeownerSnapshot }) {
  if (!snapshot.drs) {
    return <EmptyCard icon="shield-checkmark-outline" title="No readiness yet" body="No DRS result was returned." />;
  }

  return (
    <WhiteCard>
      <IconBadge name="shield-checkmark-outline" />
      <Text style={styles.cardTitle}>{readinessLabel(snapshot.drs)}</Text>
      <Text style={styles.bodyText}>Readiness gates funding, scheduling, and go-live.</Text>
      {snapshot.drs.reasons.length === 0 ? (
        <Row label="Blockers" value="None" note="No DRS blocker was returned." />
      ) : (
        snapshot.drs.reasons.map((reason) => <Row key={reason} label={reason} value="Review" note="Resolve before go-live." />)
      )}
    </WhiteCard>
  );
}

function DeploymentDetail({ building, drs }: { building: ApiBuilding; drs: DrsResult | null }) {
  const stages: ApiStage[] = ["listed", "qualifying", "funding", "installing", "live"];
  const current = Math.max(0, stages.indexOf(building.stage));
  const progress = `${Math.max(8, ((current + 1) / stages.length) * 100)}%` as DimensionValue;

  return (
    <WhiteCard>
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
    </WhiteCard>
  );
}

function TermsDetail({ snapshot }: { snapshot: HomeownerSnapshot }) {
  return (
    <WhiteCard>
      <Label>Terms</Label>
      <Text style={styles.cardTitle}>Roof permission rules</Text>
      <InfoRows
        rows={[
          ["Roof control", "You grant access; provider owns the array."],
          ["Readiness", "Funding and go-live stay gated."],
          ["Income", "Payout follows monetized energy only."],
          ["Current stage", formatStage(snapshot.building!.stage)],
        ]}
      />
    </WhiteCard>
  );
}

function CompareTodayDetail({ snapshot }: { snapshot: HomeownerSnapshot }) {
  const generation = sum(snapshot.energy?.generation_kwh);
  const load = sum(snapshot.energy?.load_kwh);
  const sold = Math.min(generation, load);

  return (
    <>
      <EnergyFlowCard generation={generation} load={load} source={snapshot.building?.dataSource ?? "unreported"} />
      <MetricGrid
        metrics={[
          { label: "Produced", value: formatKwh(generation), detail: "Provider system" },
          { label: "Matched", value: formatKwh(sold), detail: "Served home load" },
          { label: "Income", value: formatKes(snapshot.settlement?.payouts["homeowner"] ?? 0), detail: "Latest settlement" },
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
    <WhiteCard>
      <Label>Roof detail</Label>
      <MiniRoofGraphic area={snapshot.building!.roofAreaM2} />
      <TextInput value={area} onChangeText={setArea} keyboardType="decimal-pad" placeholder="Usable roof area m2" placeholderTextColor={colors.dim} style={styles.input} />
      {status ? <Text style={styles.bodyText}>{status}</Text> : null}
      <PrimaryButton onPress={saveRoof}>Save roof area</PrimaryButton>
    </WhiteCard>
  );
}

function MarketplaceDetail({ snapshot }: { snapshot: HomeownerSnapshot }) {
  const ownedShare = ownershipPercent(snapshot.ownership);
  return (
    <WhiteCard>
      <Label>Cashflow shares</Label>
      <Text style={styles.cardTitle}>{formatPercent(Math.max(0, 1 - ownedShare))} outside homeowner record</Text>
      <Text style={styles.bodyText}>
        This is a payout record, not solar array ownership. Transfers need backend support.
      </Text>
      <PrimaryButton onPress={() => Linking.openURL("mailto:support@emappa.test?subject=Homeowner%20share%20buyback")}>
        Contact support
      </PrimaryButton>
    </WhiteCard>
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
    <WhiteCard>
      <IconBadge name="sync-outline" />
      <Text style={styles.cardTitle}>Preparing homeowner data</Text>
      <Text style={styles.bodyText}>Fetching roof, energy, income, and readiness.</Text>
    </WhiteCard>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <WhiteCard>
      <IconBadge name="warning-outline" />
      <Text style={styles.cardTitle}>Homeowner data unavailable</Text>
      <Text style={styles.bodyText}>{message}</Text>
      <PrimaryButton onPress={onRetry}>Retry</PrimaryButton>
    </WhiteCard>
  );
}

function EmptyCard({
  icon = "home-outline",
  title,
  body,
  actionLabel,
  onAction,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <WhiteCard>
      <IconBadge name={icon} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.bodyText}>{body}</Text>
      {actionLabel && onAction ? <PrimaryButton onPress={onAction}>{actionLabel}</PrimaryButton> : null}
    </WhiteCard>
  );
}

function NoBuildingCard() {
  const router = useRouter();
  return (
    <EmptyCard
      icon="home-outline"
      title="No roof yet"
      body="Add a home before this screen can load."
      actionLabel="Start"
      onAction={() => router.push("/(homeowner)/_embedded/start-project")}
    />
  );
}

function WhiteCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.whiteCard, style]}>{children}</View>;
}

function IconBadge({ name }: { name: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.iconBadge}>
      <Ionicons name={name} color={colors.orangeDeep} size={20} />
    </View>
  );
}

function RoofStatusHero({ building, readiness, permission }: { building: ApiBuilding; readiness: string; permission: string }) {
  return (
    <WhiteCard style={styles.heroCard}>
      <View style={styles.heroTopRow}>
        <View style={{ flex: 1 }}>
          <Label>Roof host</Label>
          <Text style={styles.heroTitle}>{building.name}</Text>
          <Text style={styles.heroSub}>{building.address}</Text>
        </View>
        <IconBadge name="home-outline" />
      </View>
      <MiniRoofGraphic area={building.roofAreaM2} />
      <View style={styles.heroStatusRow}>
        <Pill>{permission}</Pill>
        <Text style={styles.heroStatusText}>{readiness}</Text>
      </View>
    </WhiteCard>
  );
}

function MiniRoofGraphic({ area }: { area?: number | null }) {
  return (
    <View style={styles.roofGraphic}>
      <View style={styles.roofPeak} />
      <View style={styles.roofBase}>
        <View style={styles.roofLine} />
        <View style={[styles.roofLine, styles.roofLineShort]} />
      </View>
      <Text style={styles.roofArea}>{formatArea(area)}</Text>
    </View>
  );
}

function EnergyFlowCard({ generation, load, source }: { generation: number; load: number; source: string }) {
  const matched = Math.min(generation, load);
  const ratio = generation > 0 ? matched / generation : 0;
  const width = `${Math.max(8, ratio * 100)}%` as DimensionValue;

  return (
    <WhiteCard style={styles.heroCard}>
      <View style={styles.energyHeader}>
        <Label>Today</Label>
        <Text style={styles.energySource}>Source: {source}</Text>
      </View>
      <View style={styles.flowRow}>
        <FlowNode icon="hardware-chip-outline" label="Provider array" />
        <View style={styles.flowLine}>
          <View style={[styles.flowLineFill, { width }]} />
        </View>
        <FlowNode icon="home-outline" label="Your roof" />
        <View style={styles.flowLine}>
          <View style={[styles.flowLineFill, { width }]} />
        </View>
        <FlowNode icon="bulb-outline" label="Home use" />
      </View>
      <View style={styles.energyTotals}>
        <Text style={styles.energyNumber}>{formatKwh(generation)}</Text>
        <Text style={styles.energyCaption}>produced on the roof</Text>
      </View>
    </WhiteCard>
  );
}

function FlowNode({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.flowNode}>
      <Ionicons name={icon} color={colors.orangeDeep} size={18} />
      <Text style={styles.flowLabel}>{label}</Text>
    </View>
  );
}

function IncomeHero({
  royalties,
  shareEarnings,
  walletBalance,
}: {
  royalties: number;
  shareEarnings: number;
  walletBalance: number;
}) {
  return (
    <WhiteCard style={styles.heroCard}>
      <View style={styles.heroTopRow}>
        <View>
          <Label>Available account</Label>
          <Text style={styles.heroTitle}>{formatKes(walletBalance)}</Text>
        </View>
        <IconBadge name="wallet-outline" />
      </View>
      <View style={styles.incomeBars}>
        <IncomeBar label="Roof income" value={royalties} max={Math.max(royalties, shareEarnings, 1)} />
        <IncomeBar label="Share earnings" value={shareEarnings} max={Math.max(royalties, shareEarnings, 1)} />
      </View>
    </WhiteCard>
  );
}

function IncomeBar({ label, value, max }: { label: string; value: number; max: number }) {
  const width = `${Math.max(6, (value / max) * 100)}%` as DimensionValue;
  return (
    <View>
      <View style={styles.barLabelRow}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>{formatKes(value)}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width }]} />
      </View>
    </View>
  );
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

function roofPermissionLabel(building: ApiBuilding) {
  if (building.roofAreaM2 && building.roofAreaM2 > 0) {
    return "Permission ready";
  }
  return "Needs roof area";
}

function nextHomeownerAction(building: ApiBuilding, drs: DrsResult | null) {
  if (!building.roofAreaM2 || building.roofAreaM2 <= 0) {
    return { label: "Add roof area", detail: "Capture usable space" };
  }
  if (!drs || drs.reasons.length > 0) {
    return { label: "Clear readiness", detail: drs?.reasons[0] ?? "Awaiting assessment" };
  }
  if (building.stage !== "live") {
    return { label: "Approve access", detail: "Wait for go-live gates" };
  }
  return { label: "Monitor", detail: "Roof flow is live" };
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
  screen: { flex: 1, backgroundColor: colors.white },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 36 },
  kicker: {
    color: colors.orangeDeep,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: typography.hero + 8,
    fontWeight: "800",
    letterSpacing: -1.1,
    lineHeight: typography.hero + 14,
    marginTop: 8,
  },
  subtitle: { color: colors.muted, fontSize: typography.body, lineHeight: 22, marginTop: 4 },
  stack: { gap: 16, marginTop: 18 },
  actionRail: { gap: 8, paddingVertical: 2 },
  actionPill: {
    borderColor: `${colors.orangeDeep}40`,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionText: { color: colors.orangeDeep, fontSize: 12, fontWeight: "800" },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricItem: { width: "48%" },
  metricCard: { minHeight: 118, padding: 14 },
  metricLabel: { color: colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.7, textTransform: "uppercase" },
  metricValue: { color: colors.text, fontSize: 19, fontWeight: "800", letterSpacing: -0.45, marginTop: 8 },
  metricDetail: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 5 },
  whiteCard: {
    gap: 10,
    borderColor: "rgba(150, 90, 53, 0.14)",
    borderRadius: 28,
    borderWidth: 1,
    backgroundColor: colors.white,
    padding: 16,
    boxShadow: "0 8px 16px rgba(87, 54, 27, 0.06)",
    elevation: 2,
  },
  heroCard: { padding: 18 },
  heroTopRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", gap: 14 },
  heroTitle: { color: colors.text, fontSize: 28, fontWeight: "900", letterSpacing: -0.9, lineHeight: 34, marginTop: 6 },
  heroSub: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  heroStatusRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 6 },
  heroStatusText: { color: colors.text, flex: 1, fontSize: 12, fontWeight: "800", textAlign: "right" },
  iconBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: `${colors.orangeDeep}12`,
    borderColor: `${colors.orangeDeep}25`,
    borderRadius: 16,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  roofGraphic: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 132,
    padding: 18,
  },
  roofPeak: {
    width: 0,
    height: 0,
    borderLeftWidth: 64,
    borderRightWidth: 64,
    borderBottomWidth: 44,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: `${colors.orangeDeep}22`,
  },
  roofBase: {
    alignItems: "center",
    backgroundColor: `${colors.orangeDeep}10`,
    borderColor: `${colors.orangeDeep}55`,
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    marginTop: -2,
    width: 132,
  },
  roofLine: { backgroundColor: colors.orangeDeep, borderRadius: 999, height: 3, width: 78 },
  roofLineShort: { opacity: 0.5, marginTop: 8, width: 48 },
  roofArea: { color: colors.text, fontSize: 12, fontWeight: "800", marginTop: 10 },
  energyHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 12 },
  energySource: { color: colors.dim, fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  flowRow: { alignItems: "center", flexDirection: "row", gap: 8, marginTop: 12 },
  flowLine: { flex: 1, height: 4, borderRadius: 999, backgroundColor: `${colors.orangeDeep}18`, overflow: "hidden" },
  flowLineFill: { height: 4, borderRadius: 999, backgroundColor: colors.orangeDeep },
  flowNode: { alignItems: "center", gap: 5, width: 68 },
  flowLabel: { color: colors.muted, fontSize: 10, fontWeight: "700", lineHeight: 13, textAlign: "center" },
  energyTotals: { alignItems: "center", backgroundColor: `${colors.orangeDeep}0D`, borderRadius: 22, marginTop: 18, paddingVertical: 18 },
  energyNumber: { color: colors.text, fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  energyCaption: { color: colors.muted, fontSize: 12, fontWeight: "700", marginTop: 3 },
  incomeBars: { gap: 12, marginTop: 16 },
  barLabelRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  barLabel: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  barValue: { color: colors.text, fontSize: 12, fontWeight: "900" },
  barTrack: { height: 9, borderRadius: 999, backgroundColor: `${colors.orangeDeep}14`, marginTop: 6, overflow: "hidden" },
  barFill: { height: 9, borderRadius: 999, backgroundColor: colors.orangeDeep },
  profileHero: { alignItems: "center", gap: 8, paddingVertical: 10 },
  avatarLarge: {
    alignItems: "center",
    backgroundColor: `${colors.orangeDeep}12`,
    borderColor: `${colors.orangeDeep}28`,
    borderRadius: 34,
    borderWidth: 1,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  avatarTextLarge: { color: colors.orangeDeep, fontSize: 22, fontWeight: "900" },
  profileName: { color: colors.text, fontSize: 22, fontWeight: "900", letterSpacing: -0.5, marginTop: 4 },
  profileEmail: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 6 },
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
    borderColor: "rgba(150, 90, 53, 0.14)",
    backgroundColor: colors.white,
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
  progressTrack: { height: 12, borderRadius: 999, backgroundColor: `${colors.orangeDeep}14`, marginVertical: 16, overflow: "hidden" },
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
