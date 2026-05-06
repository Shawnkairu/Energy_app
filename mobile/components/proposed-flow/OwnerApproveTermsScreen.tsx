import { Text, View } from "react-native";
import { GlassCard, Label, PrimaryButton, colors } from "@emappa/ui";
import { OwnerBriefCard, OwnerScreenShell, OwnerWorkflowCard } from "../owner/OwnerShared";

export function OwnerApproveTermsScreen() {
  return (
    <OwnerScreenShell
      showHandoffRibbon
      section="Terms"
      title="Approve Building Terms"
      subtitle="A single-step owner approval before deployment moves. Provider, financier, and royalty terms are bundled here."
      actions={["Approve", "Request changes", "Open contract"]}
      hero={() => ({
        label: "Awaiting owner signature",
        value: "3 terms",
        sub: "Provider royalty split, financier milestones, supplier lock window.",
        tone: "warn",
        status: "pending",
      })}
    >
      {() => (
        <>
          <GlassCard>
            <Label>What you are approving</Label>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: "600", marginTop: 6 }}>Owner has the last gate before money moves.</Text>
            <Text style={{ color: colors.muted, lineHeight: 22, marginTop: 8 }}>
              Each term is bundled with its DRS dependency so it is clear what would be unlocked by approval.
            </Text>
          </GlassCard>
          <OwnerBriefCard
            eyebrow="Terms summary"
            title="Three things to confirm."
            body="None of these unlock deployment alone - DRS gates still apply."
            rows={[
              { label: "Royalty split", value: "12% owner", note: "Of monetized solar after provider pool. Future periods only.", tone: "good" },
              { label: "Financier raise", value: "milestone", note: "3 tranches, released against verified evidence - not against time." },
              { label: "Supplier lock", value: "30 days", note: "BOM and quote held for owner to confirm before installer scheduling." },
            ]}
          />
          <OwnerWorkflowCard
            eyebrow="Owner accountability"
            title="Once approved"
            items={[
              {
                label: "Provider asset terms",
                detail: 'Provider can list this building as "named exposure" for capital matching.',
                status: "unlocks",
                tone: "good",
              },
              { label: "Financier deal room", detail: "Capital matching opens for the deal up to the agreed raise.", status: "unlocks", tone: "good" },
              { label: "Supplier scheduling", detail: "Installer can be paired with a locked BOM and dispatch window.", status: "unlocks", tone: "good" },
            ]}
          />
          <GlassCard>
            <Label>Signature</Label>
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: "600", marginTop: 6 }}>One owner, one signature</Text>
            <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8 }}>
              The signer must be the listed building owner. e.mappa keeps a versioned record of approval and any later change request.
            </Text>
            <View style={{ marginTop: 14, alignSelf: "stretch" }}>
              <PrimaryButton>Approve all 3 terms</PrimaryButton>
            </View>
          </GlassCard>
        </>
      )}
    </OwnerScreenShell>
  );
}
