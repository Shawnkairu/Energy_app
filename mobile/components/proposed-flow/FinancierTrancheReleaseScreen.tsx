import { Text, View } from "react-native";
import { GlassCard, Label, PrimaryButton, colors, typography } from "@emappa/ui";
import { SettlementWaterfall } from "../design-handoff";
import { useEffect, useState } from "react";
import { getRoleHome } from "@emappa/api-client";
import type { ProjectedBuilding } from "@emappa/shared";
import { ResidentRuleCard } from "../resident/ResidentShared";
import { ProposedPageChrome } from "./ProposedPageChrome";

export function FinancierTrancheReleaseScreen() {
  const [building, setBuilding] = useState<ProjectedBuilding | null>(null);

  useEffect(() => {
    getRoleHome("financier").then((h) => setBuilding(h.primary));
  }, []);

  return (
    <ProposedPageChrome
      section="Tranche"
      workspace="financier workspace"
      title="Release a Tranche"
      subtitle="Capital is released by milestone, not by date. Confirm the next tranche only after the upstream gate clears."
      actions={["Release", "Hold", "Open evidence"]}
      hero={{
        label: "Next tranche",
        value: "KSh 850,000",
        sub: "Tranche 2 of 3. Releases when provider lock + electrician scheduling are both verified.",
        status: "gate pending",
        statusTone: "warn",
      }}
    >
      <ResidentRuleCard
        eyebrow="Milestone-based release"
        title="Three tranches, three gates."
        body="Recovery follows milestones, not time. A tranche is a contract - once released, it cannot be clawed back."
        rows={[
          { label: "Tranche 1", value: "released", note: "Site survey + owner permission + supplier shortlist.", tone: "good" },
          { label: "Tranche 2", value: "gate pending", note: "Awaiting verified provider BOM + electrician scheduling.", tone: "warn" },
          { label: "Tranche 3", value: "queued", note: "Awaiting monitoring online + first settlement run.", tone: "neutral" },
        ]}
      />
      <GlassCard>
        <Label>Release form</Label>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: "600", marginTop: 6 }}>Confirm release amount and recipient</Text>
        {[
          { k: "Amount", p: "KSh 850,000", h: "As specified in the term sheet for tranche 2." },
          { k: "Recipient", p: "e.mappa escrow → supplier + electrician", h: "Funds flow through escrow; never directly to provider." },
          { k: "Effective date", p: "On gate clearance", h: "Recorded immutably in the recovery ledger." },
        ].map((row) => (
          <View key={row.k} style={{ marginTop: 12 }}>
            <Text style={{ color: colors.text, fontSize: 12, fontWeight: "600", marginBottom: 5 }}>{row.k}</Text>
            <View style={{ padding: 11, borderRadius: 10, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.text, fontSize: typography.small }}>{row.p}</Text>
            </View>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4, lineHeight: 16 }}>{row.h}</Text>
          </View>
        ))}
        <View style={{ marginTop: 14, alignSelf: "stretch" }}>
          <PrimaryButton>Confirm release</PrimaryButton>
        </View>
      </GlassCard>
      {building ? <SettlementWaterfall role="financier" building={building} /> : null}
    </ProposedPageChrome>
  );
}
