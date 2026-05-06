import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { getRoleHome } from "@emappa/api-client";
import type { ProjectedBuilding } from "@emappa/shared";
import { GlassCard, Label, Pill, PrimaryButton, colors, typography } from "@emappa/ui";
import { BuildingPulse } from "../design-handoff";
import { ResidentRuleCard } from "../resident/ResidentShared";
import { ProposedPageChrome, WireframeWell } from "./ProposedPageChrome";

export function ResidentJoinBuildingScreen() {
  const [building, setBuilding] = useState<ProjectedBuilding | null>(null);

  useEffect(() => {
    getRoleHome("resident").then((h) => setBuilding(h.primary));
  }, []);

  return (
    <ProposedPageChrome
      section="Join"
      workspace="resident workspace"
      title="Join your Building"
      subtitle="Scan the building's QR code or enter the join code your owner shared. One household, one resident session."
      actions={["Scan QR", "Enter code", "Why join?"]}
      hero={{
        label: "Step 1 of 3",
        value: "Scan QR",
        sub: "Owner posts a QR in the lobby and shares a 6-digit code via building messaging.",
        status: "unverified",
        statusTone: "warn",
      }}
    >
      {building ? <BuildingPulse role="resident" building={building} /> : null}
      <GlassCard>
        <Label>Scan or enter code</Label>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: "600", marginTop: 6 }}>Two ways in</Text>
        <WireframeWell height={200} label="QR scanner viewfinder" />
        <Text style={{ color: colors.muted, fontSize: 11, textAlign: "center", marginBottom: 10 }}>or</Text>
        <Label>Building join code</Label>
        <View
          style={{
            marginTop: 6,
            padding: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.white,
          }}
        >
          <Text style={{ color: colors.muted, fontSize: typography.small }}>6 digits</Text>
        </View>
        <Text style={{ color: colors.muted, fontSize: typography.micro, marginTop: 6, lineHeight: 18 }}>
          Provided by your building owner or property manager.
        </Text>
        <View style={{ marginTop: 14, alignSelf: "stretch" }}>
          <PrimaryButton>Continue</PrimaryButton>
        </View>
      </GlassCard>
      <ResidentRuleCard
        eyebrow="Privacy"
        title="What e.mappa knows about you here."
        body="Joining only confirms you live in this building. Resident benchmarks are aggregated; neighbors never see your wallet."
        rows={[
          { label: "Building scope", value: "this one only", note: "Your session is bound to one building at a time.", tone: "good" },
          { label: "Phone", value: "verified next", note: "Used for OTP and account recovery." },
          { label: "No credit check", value: "never", note: "e.mappa is prepaid; nothing hits your credit.", tone: "good" },
        ]}
      />
    </ProposedPageChrome>
  );
}
