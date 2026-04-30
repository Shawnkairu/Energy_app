import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View, type DimensionValue } from "react-native";
import { getRoleHome } from "@emappa/api-client";
import type { ProjectedBuilding, StakeholderRole } from "@emappa/shared";
import { colors, GlassCard, Label, Pill, Surface, Value } from "@emappa/ui";
import { DrsCard } from "./DrsCard";
import { EnergyFlowCard } from "./EnergyFlowCard";
import { MetricCard } from "./MetricCard";
import { OwnershipCard } from "./OwnershipCard";
import { PaybackCard } from "./PaybackCard";

const copy: Record<StakeholderRole, { title: string; subtitle: string }> = {
  resident: {
    title: "Your Solar Home",
    subtitle: "Prepaid solar when available. Grid fallback when needed. Ownership after trust.",
  },
  owner: {
    title: "Building Command",
    subtitle: "DRS, resident readiness, deployment progress, and host royalties.",
  },
  provider: {
    title: "Provider Assets",
    subtitle: "Panels become liquid, yield-generating assets tied to monetized kWh.",
  },
  financier: {
    title: "Deal Room",
    subtitle: "Named projects, live utilization, downside cases, and recovery tracking.",
  },
  installer: {
    title: "Install Network",
    subtitle: "Certified execution, photo evidence, checklist gates, and go-live verification.",
  },
  supplier: {
    title: "Supply Desk",
    subtitle: "Standardized BOMs, quotes, orders, lead times, and fulfillment proof.",
  },
  admin: {
    title: "Ops Command",
    subtitle: "Pipeline, DRS distribution, settlement integrity, alerts, and governance.",
  },
};

const roleActions: Record<StakeholderRole, string[]> = {
  resident: ["Top up solar", "View usage", "Buy shares"],
  owner: ["Start deployment", "Invite residents", "View building metrics"],
  provider: ["Add panels", "Sell shares", "Track payout"],
  financier: ["Invest in deal", "Stress test", "Track recovery"],
  installer: ["Upload photos", "Complete checklist", "Request parts"],
  supplier: ["Submit quote", "Confirm delivery", "Upload warranty"],
  admin: ["Review DRS", "Pause settlement", "Resolve alert"],
};

export function RoleScreen({ role, section }: { role: StakeholderRole; section: string }) {
  const [building, setBuilding] = useState<ProjectedBuilding | null>(null);
  const [activity, setActivity] = useState<string[]>([]);

  useEffect(() => {
    getRoleHome(role).then((home) => {
      setBuilding(home.primary);
      setActivity(home.activity);
    });
  }, [role]);

  if (!building) {
    return (
      <Surface>
        <Text style={{ color: colors.text }}>Loading e.mappa...</Text>
      </Surface>
    );
  }

  const { title, subtitle } = copy[role];

  return (
    <Surface>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 28 }}>
          <Pill>{section}</Pill>
          <View style={{ height: 42, width: 42, borderRadius: 999, backgroundColor: colors.panelSoft, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: colors.orange, fontWeight: "900" }}>e</Text>
          </View>
        </View>
        <Text style={{ color: colors.text, fontSize: 40, fontWeight: "900", letterSpacing: -1.8, marginTop: 22 }}>
          {title}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 20 }}>
          {subtitle}
        </Text>

        <ActionRail actions={roleActions[role]} />

        <HeroMetric role={role} building={building} />

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <MetricCard label="Utilization" value={`${Math.round(building.energy.utilization * 100)}%`} />
          </View>
          <View style={{ flex: 1 }}>
            <MetricCard label="Savings" value={`KSh ${building.savingsKes.toLocaleString()}`} />
          </View>
        </View>

        <EnergyFlowCard energy={building.energy} />
        <RolePanel role={role} building={building} />

        {role === "provider" || role === "resident" ? (
          <OwnershipCard payouts={building.providerPayouts} />
        ) : null}

        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "900", marginBottom: 10 }}>
          Activity
        </Text>
        {activity.map((item) => (
          <Text key={item} style={{ color: colors.muted, paddingVertical: 10, borderTopColor: colors.border, borderTopWidth: 1 }}>
            {item}
          </Text>
        ))}
      </ScrollView>
    </Surface>
  );
}

function HeroMetric({ role, building }: { role: StakeholderRole; building: ProjectedBuilding }) {
  const primary =
    role === "resident"
      ? { label: "Avg prepaid balance", value: `KSh ${building.roleViews.resident.averagePrepaidBalanceKes.toLocaleString()}`, sub: "Mock average per resident" }
      : role === "owner"
        ? { label: "DRS", value: `${building.drs.score}`, sub: building.drs.label }
        : role === "provider"
          ? { label: "Provider payout", value: `KSh ${building.roleViews.provider.monthlyPayoutKes.toLocaleString()}`, sub: "From monetized kWh only" }
          : role === "financier"
            ? { label: "Recovery", value: `KSh ${building.roleViews.financier.monthlyRecoveryKes.toLocaleString()}`, sub: "Projected monthly waterfall" }
            : role === "installer"
              ? { label: "Checklist", value: `${building.roleViews.installer.checklistComplete}/${building.roleViews.installer.checklistTotal}`, sub: "Before go-live" }
              : role === "supplier"
                ? { label: "Lead time", value: `${building.roleViews.supplier.leadTimeDays} days`, sub: "Current BOM estimate" }
                : { label: "Active alerts", value: `${building.roleViews.admin.alertCount}`, sub: "Internal governance" };

  return (
    <View
      style={{
        borderRadius: 32,
        padding: 24,
        marginBottom: 14,
        backgroundColor: colors.panel,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{ color: colors.muted, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 }}>
        {primary.label}
      </Text>
      <Text style={{ color: colors.text, fontSize: 48, fontWeight: "900", letterSpacing: -2, marginTop: 10 }}>
        {primary.value}
      </Text>
      <Text style={{ color: colors.muted, marginTop: 6 }}>{primary.sub}</Text>
      <View style={{ height: 10, borderRadius: 999, backgroundColor: colors.panelSoft, marginTop: 22 }}>
        <View
          style={{
            height: 10,
            width: `${Math.min(100, building.energy.utilization * 100)}%` as DimensionValue,
            borderRadius: 999,
            backgroundColor: colors.orange,
          }}
        />
      </View>
    </View>
  );
}

function ActionRail({ actions }: { actions: string[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
      {actions.map((action) => (
        <Pressable
          key={action}
          style={{
            borderRadius: 999,
            backgroundColor: colors.orange,
            paddingHorizontal: 18,
            paddingVertical: 12,
            marginRight: 10,
          }}
        >
          <Text style={{ color: colors.ink, fontWeight: "900" }}>{action}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function RolePanel({ role, building }: { role: StakeholderRole; building: ProjectedBuilding }) {
  if (role === "resident") {
    const view = building.roleViews.resident;
    return (
      <>
        <GlassCard accent={colors.green}>
          <Label>Average prepaid solar balance</Label>
          <Value>KSh {view.averagePrepaidBalanceKes.toLocaleString()}</Value>
          <Text style={{ color: colors.muted, marginTop: 8 }}>
            Mock per-resident average. {view.monthlySolarKwh} kWh solar this month · KSh {view.savingsKes.toLocaleString()} saved vs grid.
          </Text>
        </GlassCard>
        <Insight title="Ownership unlocked" body={`Residents own ${Math.round(view.ownedProviderShare * 100)}% of provider-side cashflows in this building.`} />
      </>
    );
  }

  if (role === "owner") {
    const view = building.roleViews.owner;
    return (
      <>
        <DrsCard drs={building.drs} />
        <GlassCard accent={colors.amber}>
          <Label>Monthly host royalty</Label>
          <Value>KSh {view.monthlyRoyaltyKes.toLocaleString()}</Value>
          <Text style={{ color: colors.muted, marginTop: 8 }}>
            Comparable buildings median: KSh {view.comparableMedianRoyaltyKes.toLocaleString()}.
          </Text>
        </GlassCard>
        <GateList gates={view.gates} />
      </>
    );
  }

  if (role === "provider") {
    const view = building.roleViews.provider;
    return (
      <GlassCard accent={colors.solar}>
        <Label>Retained provider ownership</Label>
        <Value>{Math.round(view.retainedOwnership * 100)}%</Value>
        <Text style={{ color: colors.muted, marginTop: 8 }}>
          {Math.round(view.soldOwnership * 100)}% sold to residents. Payout only follows monetized kWh.
        </Text>
        <Text style={{ color: colors.text, marginTop: 14, fontWeight: "900" }}>
          KSh {view.monthlyPayoutKes.toLocaleString()} projected monthly provider payout
        </Text>
      </GlassCard>
    );
  }

  if (role === "financier") {
    const view = building.roleViews.financier;
    return (
      <>
        <PaybackCard payback={building.financierPayback} />
        <GlassCard accent={colors.blue}>
          <Label>Committed capital</Label>
          <Value>KSh {view.committedCapitalKes.toLocaleString()}</Value>
          <Text style={{ color: colors.muted, marginTop: 8 }}>
            Remaining raise: KSh {view.remainingCapitalKes.toLocaleString()}. Base utilization {Math.round(view.baseUtilization * 100)}%; downside case {Math.round(view.downsideUtilization * 100)}%.
          </Text>
        </GlassCard>
      </>
    );
  }

  if (role === "installer") {
    const view = building.roleViews.installer;
    return (
      <>
        <GlassCard accent={colors.cyan}>
          <Label>Checklist progress</Label>
          <Value>{view.checklistComplete}/{view.checklistTotal}</Value>
          <Text style={{ color: colors.muted, marginTop: 8 }}>
            Go-live is blocked until photos, readings, connectivity, and ops signoff are complete.
          </Text>
        </GlassCard>
        <GateList gates={view.gates} />
      </>
    );
  }

  if (role === "supplier") {
    const view = building.roleViews.supplier;
    return (
      <GlassCard accent={colors.amber}>
        <Label>BOM readiness</Label>
        <Value>{view.verifiedBom ? "Verified" : "Needs quotes"}</Value>
        <Text style={{ color: colors.muted, marginTop: 8 }}>
          {view.openRequests} open request(s). Estimated lead time: {view.leadTimeDays} days.
        </Text>
      </GlassCard>
    );
  }

  const view = building.roleViews.admin;
  return (
    <>
      <DrsCard drs={building.drs} />
      <GlassCard accent={view.alertCount > 0 ? colors.red : colors.green}>
        <Label>Settlement health</Label>
        <Value>{view.settlementHealth}</Value>
        <Text style={{ color: colors.muted, marginTop: 8 }}>
          {view.alertCount} active alert(s). {view.blockedReasonCount} deployment blocker(s).
        </Text>
      </GlassCard>
      <GateList gates={view.gates} />
    </>
  );
}

function Insight({ title, body }: { title: string; body: string }) {
  return (
    <GlassCard accent={colors.orange}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>{title}</Text>
      <Text style={{ color: colors.muted, marginTop: 8, lineHeight: 21 }}>{body}</Text>
    </GlassCard>
  );
}

function GateList({ gates }: { gates: Array<{ label: string; complete: boolean }> }) {
  return (
    <GlassCard>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: "900", marginBottom: 10 }}>
        Deployment Gates
      </Text>
      {gates.map((gate) => (
        <View key={gate.label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 }}>
          <Text style={{ color: colors.muted }}>{gate.label}</Text>
          <Text style={{ color: gate.complete ? colors.green : colors.red, fontWeight: "900" }}>
            {gate.complete ? "Ready" : "Blocked"}
          </Text>
        </View>
      ))}
    </GlassCard>
  );
}
