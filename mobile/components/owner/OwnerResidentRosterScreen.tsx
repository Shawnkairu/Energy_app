import { Text, View } from "react-native";
import { GlassCard, Label, Pill, colors, spacing, typography } from "@emappa/ui";
import { OwnerBriefCard, OwnerMetricGrid, OwnerScreenShell, OwnerWireframeWell, formatPercent } from "./OwnerShared";

export function OwnerResidentRosterScreen() {
  return (
    <OwnerScreenShell
      section="Residents"
      title="Drive Resident Sign-Up"
      subtitle="Owner-controlled funnel: invitations sent, residents joined, prepaid tokens loaded. Privacy-safe — no individual balances."
      actions={["Send invites", "Building message", "Print QR"]}
      hero={(building) => {
        const view = building.roleViews.owner;
        const u = building.project.units;
        const pct = view.residentParticipation;
        const joined = Math.max(0, Math.min(u, Math.round(pct * u)));
        return {
          label: "Participation",
          value: `${joined} / ${u}`,
          sub: `${formatPercent(pct)} enrolled. Below 60% blocks deployment; below 80% slows royalty.`,
          tone: pct >= 0.8 ? ("good" as const) : pct >= 0.6 ? ("warn" as const) : ("bad" as const),
          status: pct >= 0.8 ? "strong" : pct >= 0.6 ? "building" : "short",
        };
      }}
    >
      {(building) => (
        <>
          <OwnerMetricGrid
            metrics={[
              { label: "Invited", value: "38", detail: "All units reached" },
              { label: "Joined", value: "32", detail: "84% of invited" },
              { label: "Funded", value: "28", detail: "Cash-cleared tokens" },
              { label: "Target", value: "80%", detail: "Participation band" },
            ]}
          />
          <OwnerBriefCard
            eyebrow="Pre-onboarding gates"
            title="What unlocks deployment."
            body="The owner can move all three of these. Resident-side decisions are private to each household; the owner sees aggregates only."
            rows={[
              { label: "Demand coverage", value: "≥ 60%", note: "84% reached. Above the deployment-block threshold.", tone: "good" },
              { label: "Prepaid commitment", value: "received", note: "28 households have cleared at least one top-up.", tone: "good" },
              { label: "Building messages", value: "monthly", note: "Owner can send a building-wide note inside the app.", tone: "neutral" },
            ]}
          />
          <GlassCard>
            <Label>Invitation log</Label>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.heading,
                  fontWeight: "600",
                  letterSpacing: -0.35,
                  marginTop: 5,
                  flex: 1,
                  lineHeight: typography.heading + 4,
                }}
              >
                Most recent waves
              </Text>
              <Pill tone={building.roleViews.owner.residentParticipation >= 0.8 ? "good" : "warn"}>aggregate only</Pill>
            </View>
            {[
              { wave: "Wave 3 · last week", sent: 6, joined: 4 },
              { wave: "Wave 2 · 2 weeks ago", sent: 14, joined: 12 },
              { wave: "Wave 1 · 4 weeks ago", sent: 18, joined: 16 },
            ].map((w, i) => (
              <View
                key={w.wave}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 10,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                  gap: 10,
                }}
              >
                <Text style={{ color: colors.text, fontSize: typography.small + 0.5, fontWeight: "600", flex: 1 }}>{w.wave}</Text>
                <Text style={{ color: colors.muted, fontSize: typography.micro }}>sent {w.sent}</Text>
                <Text style={{ color: colors.green, fontSize: typography.micro, fontWeight: "600" }}>joined {w.joined}</Text>
              </View>
            ))}
          </GlassCard>
          <OwnerWireframeWell height={64} label="QR + shareable invite preview" />
        </>
      )}
    </OwnerScreenShell>
  );
}
