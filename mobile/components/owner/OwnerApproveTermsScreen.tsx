import { View } from "react-native";
import { PrimaryButton } from "@emappa/ui";
import { OwnerBriefCard, OwnerIntroCard, OwnerScreenShell, OwnerWorkflowCard } from "./OwnerShared";

export function OwnerApproveTermsScreen() {
  return (
    <OwnerScreenShell
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
          <OwnerIntroCard
            eyebrow="What you are approving"
            title="Owner holds the gate before capital moves."
            detail="Each term is bundled with its DRS dependency so it is clear what would be unlocked by approval."
          />
          <OwnerBriefCard
            eyebrow="Terms summary"
            title="Three things to confirm."
            body="None of these unlock deployment alone — DRS gates still apply."
            rows={[
              { label: "Royalty split", value: "12% owner", note: "Of monetized solar after provider pool. Future periods only.", tone: "good" },
              { label: "Financier raise", value: "milestone", note: "3 tranches, released against verified evidence — not against time." },
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
          <OwnerIntroCard
            eyebrow="Signature"
            title="One owner, one signature"
            detail="The signer must be the listed building owner. e.mappa keeps a versioned record of approval and any later change request."
          >
            <View style={{ alignSelf: "stretch" }}>
              <PrimaryButton>Approve all 3 terms</PrimaryButton>
            </View>
          </OwnerIntroCard>
        </>
      )}
    </OwnerScreenShell>
  );
}
