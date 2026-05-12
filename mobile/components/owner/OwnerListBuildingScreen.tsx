import { Text, View } from "react-native";
import { GlassCard, Label, PrimaryButton, colors, typography } from "@emappa/ui";
import { OwnerBriefCard, OwnerIntroCard, OwnerScreenShell, OwnerWireframeWell } from "./OwnerShared";

export function OwnerListBuildingScreen() {
  return (
    <OwnerScreenShell
      section="Onboard"
      title="List your Building"
      subtitle="Tell e.mappa about the building so qualification can begin. Required before DRS, supplier, and installer steps unlock."
      actions={["Save draft", "Request inspection", "Cancel"]}
      hero={() => ({
        label: "Step 1 of 5",
        value: "Building basics",
        sub: "Two minutes. You can edit any field before requesting inspection.",
        tone: "warn",
        status: "draft",
      })}
    >
      {() => (
        <>
          <OwnerIntroCard
            eyebrow="What e.mappa needs"
            title="Just the basics. Inspection captures the rest."
            detail="No counterparty data yet — this is the owner's self-declared snapshot. e.mappa verifies during inspection."
          />
          <GlassCard>
            <Label>Building basics</Label>
            {[
              { k: "Building name", p: "e.g. Riverside Apartments" },
              { k: "Address / location band", p: "Nairobi · Kileleshwa", n: "A neighborhood band is enough; full address comes during inspection." },
              { k: "Number of units", p: "38" },
              { k: "Current monthly grid bill (avg)", p: "KSh 240,000", n: "Used for the comparison view in step 2." },
              { k: "Roof type / orientation", p: "Flat concrete, mostly south-facing" },
            ].map((row) => (
              <View key={row.k} style={{ marginTop: 12 }}>
                <Text style={{ color: colors.text, fontSize: typography.small, fontWeight: "600", marginBottom: 5 }}>{row.k}</Text>
                <View style={{ padding: 11, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white }}>
                  <Text style={{ color: colors.muted, fontSize: typography.small }}>{row.p}</Text>
                </View>
                {"n" in row && row.n ? (
                  <Text style={{ color: colors.muted, fontSize: typography.micro + 0.5, marginTop: 4, lineHeight: 16 }}>{row.n}</Text>
                ) : null}
              </View>
            ))}
            <View style={{ marginTop: 14, alignSelf: "stretch" }}>
              <PrimaryButton>Save draft</PrimaryButton>
            </View>
          </GlassCard>
          <OwnerBriefCard
            eyebrow="Optional now"
            title="Anything you can attach speeds up DRS."
            body="Skip these if you don't have them — inspection covers them."
            rows={[
              { label: "Existing meter map", value: "attach", note: "PDF, image, or sketch.", tone: "neutral" },
              { label: "Roof photos", value: "attach", note: "A handful of phone photos works." },
              { label: "Land/title proof", value: "attach", note: "Inspection captures this if missing." },
            ]}
          />
          <OwnerWireframeWell height={80} label="Map preview" />
        </>
      )}
    </OwnerScreenShell>
  );
}
