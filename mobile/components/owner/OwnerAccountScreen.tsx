import { PrimaryButton } from "@emappa/ui";
import { OwnerBriefCard, OwnerIntroCard, OwnerProfileCard, OwnerScreenShell } from "./OwnerShared";

export function OwnerAccountScreen() {
  return (
    <OwnerScreenShell
      section="Profile"
      title="Owner settings"
      subtitle="Identity, access, notifications. Private to this owner session."
      actions={["Edit details", "Manage access", "Sign out"]}
      hero={(building) => ({
        label: "Signed in as",
        value: "Primary owner",
        sub: `${building.project.name} · verified session`,
        tone: "good",
        status: "verified",
      })}
    >
      {(building) => (
        <>
          <OwnerProfileCard building={building} />
          <OwnerBriefCard
            eyebrow="Owner identity"
            title="Verified once, used everywhere."
            body="Owner identity is the signature of record for terms, inspections, and approvals."
            rows={[
              { label: "Role", value: "building owner", note: "One signer of record per building operator account.", tone: "good" },
              { label: "Contacts", value: "masked", note: "Installer and financier routes messages without exposing personal phones on-screen.", tone: "neutral" },
            ]}
          />
          <OwnerIntroCard
            eyebrow="Account"
            title="Actions"
            detail="Edit profile, delegate access, and session controls for this demo owner surface."
          >
            <PrimaryButton>Manage notification cadence</PrimaryButton>
          </OwnerIntroCard>
        </>
      )}
    </OwnerScreenShell>
  );
}
