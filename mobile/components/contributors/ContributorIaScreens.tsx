import { useCallback, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "@emappa/ui";
import type { ApiClient } from "@emappa/api-client";
import { EnergyTodayChart, type EnergyTodayPoint } from "../EnergyTodayChart";
import { PilotBanner } from "../PilotBanner";
import { PortfolioRow } from "../PortfolioRow";
import { ProjectCard } from "../ProjectCard";
import { SyntheticBadge } from "../SyntheticBadge";
import { useAuth } from "../AuthContext";
import { useApi } from "../../lib/api";
import { useApiData } from "../../lib/useApiData";

type ContributorRole = "provider" | "electrician" | "financier";
type ContributorSection =
  | "discover"
  | "inventory"
  | "generation"
  | "wallet"
  | "profile"
  | "jobs"
  | "compliance"
  | "portfolio";

interface ContributorScreenProps {
  role: ContributorRole;
  section: ContributorSection;
}

interface ContributorRequest {
  api: ApiClient;
  role: ContributorRole;
  section: ContributorSection;
  userId?: string;
  buildingId?: string | null;
}

interface ContributorSectionData {
  title?: string;
  subtitle?: string;
  sourceLabel?: string;
  synthetic?: boolean;
  banner?: {
    title?: string;
    message?: string;
  };
  projects?: ContributorCard[];
  deals?: ContributorCard[];
  jobs?: ContributorCard[];
  cards?: ContributorCard[];
  items?: ContributorCard[];
  rows?: ContributorRow[];
  portfolio?: {
    rows?: ContributorRow[];
  };
  wallet?: {
    rows?: ContributorRow[];
  };
  profile?: {
    rows?: ContributorRow[];
  };
  inventory?: {
    rows?: ContributorRow[];
  };
  compliance?: {
    rows?: ContributorRow[];
  };
  energyToday?: {
    title?: string;
    unit?: string;
    points?: EnergyTodayPoint[];
  };
  chart?: {
    title?: string;
    unit?: string;
    points?: EnergyTodayPoint[];
  };
  emptyTitle?: string;
  emptyMessage?: string;
}

interface ContributorCard {
  id?: string | number;
  title?: string;
  name?: string;
  subtitle?: string;
  location?: string;
  status?: string;
  stage?: string;
  metricLabel?: string;
  metricValue?: string | number;
  readiness?: string | number;
}

interface ContributorRow {
  id?: string | number;
  label?: string;
  name?: string;
  value?: string | number;
  detail?: string;
  note?: string;
  trend?: string;
  status?: string;
}

const sectionCopy: Record<ContributorRole, Record<string, { title: string; subtitle: string; empty: string }>> = {
  provider: {
    discover: {
      title: "Discover",
      subtitle: "Building opportunities needing provider equipment or retained supply-side ownership.",
      empty: "No provider-ready projects are available from the API right now.",
    },
    inventory: {
      title: "Inventory",
      subtitle: "Live SKU, order, quote, and reliability signals from the provider inventory feed.",
      empty: "No inventory records are available from the API right now.",
    },
    generation: {
      title: "Generation",
      subtitle: "Live array output and monetized solar performance for retained provider positions.",
      empty: "No generation telemetry is available from the API right now.",
    },
    wallet: {
      title: "Wallet",
      subtitle: "Equipment revenue and retained-share royalties, only from monetized prepaid solar.",
      empty: "No provider wallet entries are available from the API right now.",
    },
    profile: {
      title: "Profile",
      subtitle: "Business profile, support status, and account readiness from the provider API.",
      empty: "No provider profile records are available from the API right now.",
    },
  },
  electrician: {
    discover: {
      title: "Discover",
      subtitle: "Projects that need certified electrician work before deployment or maintenance.",
      empty: "No electrician-ready projects are available from the API right now.",
    },
    jobs: {
      title: "Jobs",
      subtitle: "Active, completed, and maintenance work assigned to the electrician workspace.",
      empty: "No electrician jobs are available from the API right now.",
    },
    wallet: {
      title: "Wallet",
      subtitle: "Job earnings and payout records from completed electrician work.",
      empty: "No electrician wallet entries are available from the API right now.",
    },
    compliance: {
      title: "Compliance",
      subtitle: "Certification, training, and lead-electrician gate status.",
      empty: "No compliance records are available from the API right now.",
    },
    profile: {
      title: "Profile",
      subtitle: "Electrician account, support status, and field-readiness profile.",
      empty: "No electrician profile records are available from the API right now.",
    },
  },
  financier: {
    discover: {
      title: "Discover",
      subtitle: "Named building deals open for deal-level capital review.",
      empty: "No financier deals are available from the API right now.",
    },
    portfolio: {
      title: "Portfolio",
      subtitle: "Named positions, recovery status, and compounding records.",
      empty: "No financier portfolio positions are available from the API right now.",
    },
    wallet: {
      title: "Wallet",
      subtitle: "Cash, deployed capital, and return records from named building deals.",
      empty: "No financier wallet entries are available from the API right now.",
    },
    profile: {
      title: "Profile",
      subtitle: "Investor profile, support status, and account readiness.",
      empty: "No financier profile records are available from the API right now.",
    },
  },
};

async function fetchContributorSection({ api, role, section, userId, buildingId }: ContributorRequest): Promise<ContributorSectionData> {
  if (section === "discover") {
    return { cards: (await api.getDiscover(role)).map(projectToCard) };
  }

  if (section === "profile") {
    return { rows: [userToRow(await api.me())] };
  }

  if (section === "generation") {
    if (!buildingId) throw new Error("This tab needs a building assignment before generation data can load.");
    const today = await api.getEnergyToday(buildingId);
    return {
      energyToday: {
        title: "Generation today",
        unit: "kWh",
        points: today.generation_kwh.map((value, index) => ({ label: `${index + 1}`, value })),
      },
      rows: [
        { label: "Generation readings", value: today.generation_kwh.length, detail: "API samples returned for solar generation.", trend: "Live" },
        { label: "Load readings", value: today.load_kwh.length, detail: "API samples returned for building load.", trend: "Live" },
        { label: "Irradiance readings", value: today.irradiance_w_m2.length, detail: "API samples returned for irradiance.", trend: "Live" },
      ],
    };
  }

  if (!userId) throw new Error("This tab needs an authenticated user before data can load.");

  if (role === "provider" && section === "inventory") {
    return { rows: (await api.getProviderInventory(userId)).map((item) => ({
      id: item.id,
      label: item.sku,
      value: `KES ${formatValue(item.unitPriceKes)}`,
      detail: `${item.kind} stock: ${item.stock}`,
      trend: `${item.reliabilityScore}% reliability`,
    })) };
  }

  if (role === "electrician" && section === "jobs") {
    return { cards: (await api.getElectricianJobs(userId)).map((job) => ({
      id: job.id,
      title: `${capitalize(job.scope)} job`,
      subtitle: `${job.checklist.filter((item) => item.status === "done").length}/${job.checklist.length} checklist items complete`,
      status: job.status,
      metricLabel: "Pay estimate",
      metricValue: `KES ${formatValue(job.payEstimateKes)}`,
    })) };
  }

  if (role === "electrician" && section === "compliance") {
    return { rows: (await api.getCertifications(userId)).map((certification) => ({
      id: certification.id,
      label: certification.name,
      value: certification.status,
      detail: certification.issuer,
      trend: `Expires ${certification.expiresAt}`,
    })) };
  }

  if (role === "financier" && section === "portfolio") {
    return { rows: (await api.getPortfolio(userId)).map((position) => ({
      id: position.buildingId,
      label: position.buildingId,
      value: `KES ${formatValue(position.deployedKes)}`,
      detail: `Committed KES ${formatValue(position.committedKes)}; returned KES ${formatValue(position.returnsToDateKes)}`,
      trend: `${position.irrPct}% IRR`,
    })) };
  }

  if (section === "wallet") {
    const [balance, transactions] = await Promise.all([api.getWalletBalance(userId), api.getWalletTransactions(userId)]);
    return {
      rows: [
        { label: "Cash balance", value: `KES ${formatValue(balance.kes)}`, detail: "Current API wallet balance.", trend: "Live" },
        ...transactions.map((transaction) => ({
          id: transaction.id,
          label: transaction.kind.replace(/_/g, " "),
          value: `KES ${formatValue(transaction.amountKes)}`,
          detail: transaction.reference,
          trend: transaction.at,
        })),
      ],
    };
  }

  throw new Error(`No mobile API contract is available for ${role} ${section}.`);
}

export function ContributorIaScreen({ role, section }: ContributorScreenProps) {
  const api = useApi();
  const { session } = useAuth();
  const userId = session?.user?.id;
  const buildingId = session?.buildingId ?? session?.user?.buildingId ?? null;
  const load = useCallback(
    () => fetchContributorSection({ api, role, section, userId, buildingId }),
    [role, section, userId, buildingId],
  );
  const { data, error, isLoading, refetch } = useApiData(load, [role, section, userId, buildingId]);
  const copy = sectionCopy[role][section];

  if (isLoading) {
    return (
      <ScreenFrame title={copy.title} subtitle={copy.subtitle}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingTitle}>Loading {copy.title.toLowerCase()}</Text>
          <Text style={styles.muted}>Fetching the latest contributor workspace data.</Text>
        </View>
      </ScreenFrame>
    );
  }

  if (error) {
    return (
      <ScreenFrame title={copy.title} subtitle={copy.subtitle}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Could not load this tab</Text>
          <Text style={styles.muted}>{error.message}</Text>
          <Pressable accessibilityRole="button" onPress={refetch} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </ScreenFrame>
    );
  }

  const cards = getCards(data);
  const rows = getRows(data);
  const chart = getChart(data);
  const hasContent = cards.length > 0 || rows.length > 0 || chart.points.length > 0;

  return (
    <ScreenFrame title={data?.title ?? copy.title} subtitle={data?.subtitle ?? copy.subtitle}>
      <PilotBanner
        title={data?.banner?.title ?? "Contributor workspace"}
        message={data?.banner?.message ?? "All values below are loaded from the mobile API for this role and tab."}
      />

      {(data?.synthetic || data?.sourceLabel) && <SyntheticBadge label={data.sourceLabel ?? "Synthetic data source"} />}

      {chart.points.length > 0 && <EnergyTodayChart title={chart.title} points={chart.points} unit={chart.unit} />}

      {cards.length > 0 && (
        <View style={styles.stack}>
          {cards.map((card, index) => (
            <ProjectCard
              key={card.id ?? `${card.title ?? card.name ?? "card"}-${index}`}
              title={card.title ?? card.name ?? "Unnamed API record"}
              subtitle={card.subtitle ?? card.location ?? "Details unavailable from API"}
              status={card.status ?? card.stage ?? "Status unavailable"}
              metricLabel={card.metricLabel ?? "Readiness"}
              metricValue={formatValue(card.metricValue ?? card.readiness ?? "Unavailable")}
            />
          ))}
        </View>
      )}

      {rows.length > 0 && (
        <View style={styles.stack}>
          {rows.map((row, index) => (
            <PortfolioRow
              key={row.id ?? `${row.label ?? row.name ?? "row"}-${index}`}
              label={row.label ?? row.name ?? "Unnamed API row"}
              value={formatValue(row.value ?? "Unavailable")}
              detail={row.detail ?? row.note ?? "Detail unavailable from API"}
              trend={row.trend ?? row.status ?? "Live"}
            />
          ))}
        </View>
      )}

      {!hasContent && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{data?.emptyTitle ?? "Nothing to show yet"}</Text>
          <Text style={styles.muted}>{data?.emptyMessage ?? copy.empty}</Text>
        </View>
      )}
    </ScreenFrame>
  );
}

function ScreenFrame({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>e.mappa mobile</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {children}
    </ScrollView>
  );
}

function getCards(data: ContributorSectionData | null): ContributorCard[] {
  if (!data) return [];
  return firstArray(data.projects, data.deals, data.jobs, data.cards, data.items);
}

function getRows(data: ContributorSectionData | null): ContributorRow[] {
  if (!data) return [];
  return firstArray(data.rows, data.portfolio?.rows, data.wallet?.rows, data.profile?.rows, data.inventory?.rows, data.compliance?.rows);
}

function getChart(data: ContributorSectionData | null) {
  const source = data?.energyToday ?? data?.chart;
  return {
    title: source?.title ?? "Energy today",
    unit: source?.unit ?? "kWh",
    points: Array.isArray(source?.points) ? source.points : [],
  };
}

function firstArray<T>(...arrays: Array<T[] | undefined>): T[] {
  return arrays.find((items) => Array.isArray(items)) ?? [];
}

function formatValue(value: string | number) {
  return typeof value === "number" ? value.toLocaleString("en-KE") : value;
}

function projectToCard(project: {
  buildingId: string;
  name: string;
  address: string;
  stage: string;
  gapSummary: string;
  drsScore: number;
  capitalAskKes?: number;
  electricianAsk?: { payEstimateKes: number };
}) {
  return {
    id: project.buildingId,
    title: project.name,
    subtitle: project.gapSummary || project.address,
    status: project.stage,
    metricLabel: project.capitalAskKes ? "Capital ask" : project.electricianAsk ? "Pay estimate" : "DRS",
    metricValue: project.capitalAskKes
      ? `KES ${formatValue(project.capitalAskKes)}`
      : project.electricianAsk
        ? `KES ${formatValue(project.electricianAsk.payEstimateKes)}`
        : `${project.drsScore}/100`,
  };
}

function userToRow(user: { id: string; email: string; role: string; displayName: string | null; onboardingComplete: boolean }) {
  return {
    id: user.id,
    label: user.displayName ?? user.email,
    value: user.role,
    detail: user.email,
    trend: user.onboardingComplete ? "Complete" : "Incomplete",
  };
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    backgroundColor: colors.surfaceElevated,
    padding: 18,
    paddingBottom: 36,
  },
  header: {
    gap: 8,
    paddingTop: 4,
  },
  eyebrow: {
    color: colors.orangeDeep,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  stack: {
    gap: 12,
  },
  loadingCard: {
    gap: 8,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 18,
  },
  loadingTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  errorCard: {
    gap: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(174, 64, 49, 0.22)",
    backgroundColor: colors.surface,
    padding: 18,
  },
  errorTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  retryButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.orangeDeep,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  emptyCard: {
    gap: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(103, 64, 34, 0.12)",
    backgroundColor: colors.surface,
    padding: 18,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});
