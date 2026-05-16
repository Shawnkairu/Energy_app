import { Text, View } from "react-native";
import { GlassCard, Label, colors } from "@emappa/ui";
import { OwnerBriefCard, OwnerScreenShell } from "../owner/OwnerShared";

export function OwnerCompareTodayScreen() {
  return (
    <OwnerScreenShell
      showHandoffRibbon
      section="Compare"
      title="Today vs e.mappa"
      subtitle="A side-by-side of the building's current grid spend and the projected outcome under prepaid solar. No commitments here."
      actions={["See assumptions", "Adjust scenario", "Continue"]}
      hero={() => ({
        label: "Projected monthly delta",
        value: "−KSh 84,000",
        sub: "Combined resident bill drop + new owner royalty, vs current grid-only spend.",
        tone: "good",
        status: "projected",
      })}
    >
      {() => (
        <>
          <GlassCard>
            <Label>How to read this</Label>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: "600", marginTop: 6 }}>A range, not a guarantee.</Text>
            <Text style={{ color: colors.muted, lineHeight: 22, marginTop: 8 }}>
              Numbers below assume pledged demand and utilization scenarios — not guaranteed outcomes. Both move with DRS gates and resident sign-up.
            </Text>
          </GlassCard>
          <GlassCard>
            <Label>Side-by-side</Label>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <View style={{ flex: 1, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 12, backgroundColor: colors.panelSoft }}>
                <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>Today</Text>
                <Text style={{ color: colors.text, fontSize: 22, fontWeight: "600", marginTop: 4 }}>KSh 240k</Text>
                <Text style={{ color: colors.muted, fontSize: 10.5, marginTop: 4 }}>Grid spend / month, building total</Text>
                <Text style={{ color: colors.text, fontSize: 11, marginTop: 10 }}>Owner royalty: KSh 0</Text>
              </View>
              <View style={{ flex: 1, borderRadius: 16, borderWidth: 1, borderColor: `${colors.green}66`, padding: 12, backgroundColor: `${colors.green}12` }}>
                <Text style={{ color: colors.green, fontSize: 10, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                  With e.mappa
                </Text>
                <Text style={{ color: colors.green, fontSize: 22, fontWeight: "600", marginTop: 4 }}>KSh 156k</Text>
                <Text style={{ color: colors.muted, fontSize: 10.5, marginTop: 4 }}>Grid + prepaid solar, building total</Text>
                <Text style={{ color: colors.text, fontSize: 11, marginTop: 10 }}>
                  Owner royalty: <Text style={{ fontWeight: "700" }}>KSh 18.4k</Text>
                </Text>
              </View>
            </View>
          </GlassCard>
          <OwnerBriefCard
            eyebrow="Levers"
            title="What changes the projection."
            body="The comparison reflects only monetized prepaid solar. Free generation, waste, and curtailment do not improve owner royalty."
            rows={[
              { label: "Resident participation", value: "Scenario range", note: "Low demand can block DRS critical gates.", tone: "good" },
              { label: "Utilization", value: "75% assumed", note: "Below 70% lowers royalty.", tone: "good" },
              { label: "Grid tariff", value: "+ shocks", note: "Tariff rises favor e.mappa more, never less.", tone: "neutral" },
            ]}
          />
        </>
      )}
    </OwnerScreenShell>
  );
}
