import { Text, View } from "react-native";
import { GlassCard, Label, colors, typography } from "@emappa/ui";
import { OwnerBriefCard, OwnerIntroCard, OwnerScreenShell } from "./OwnerShared";

export function OwnerCompareTodayScreen() {
  return (
    <OwnerScreenShell
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
          <OwnerIntroCard
            eyebrow="How to read this"
            title="A range, not a guarantee."
            detail="Numbers below use pledged demand and utilization scenarios — not guaranteed outcomes. Both move with DRS gates and resident sign-up."
          />
          <GlassCard>
            <Label>Side-by-side</Label>
            <Text
              style={{
                color: colors.text,
                fontSize: typography.heading,
                fontWeight: "600",
                letterSpacing: -0.35,
                marginTop: 5,
                lineHeight: typography.heading + 4,
              }}
            >
              Grid today vs prepaid solar
            </Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <View style={{ flex: 1, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 12, backgroundColor: colors.panelSoft }}>
                <Text style={{ color: colors.muted, fontSize: typography.micro, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                  Today
                </Text>
                <Text style={{ color: colors.text, fontSize: typography.hero - 6, fontWeight: "600", marginTop: 4 }}>KSh 240k</Text>
                <Text style={{ color: colors.muted, fontSize: typography.micro + 0.5, marginTop: 4 }}>Grid spend / month, building total</Text>
                <Text style={{ color: colors.text, fontSize: typography.micro + 0.5, marginTop: 10 }}>Owner royalty: KSh 0</Text>
              </View>
              <View style={{ flex: 1, borderRadius: 16, borderWidth: 1, borderColor: `${colors.green}66`, padding: 12, backgroundColor: `${colors.green}12` }}>
                <Text style={{ color: colors.green, fontSize: typography.micro, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                  With e.mappa
                </Text>
                <Text style={{ color: colors.green, fontSize: typography.hero - 6, fontWeight: "600", marginTop: 4 }}>KSh 156k</Text>
                <Text style={{ color: colors.muted, fontSize: typography.micro + 0.5, marginTop: 4 }}>Grid + prepaid solar, building total</Text>
                <Text style={{ color: colors.text, fontSize: typography.micro + 0.5, marginTop: 10 }}>
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
