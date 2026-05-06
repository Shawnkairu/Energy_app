import { useState } from "react";
import { GlassCard } from "@emappa/ui";
import { ActionButton, ChoiceGroup, OnboardShell, StatusText, TextField, useFinishOnboarding } from "../_shared";

type InvestorKind = "individual" | "institution";

export default function FinancierProfileScreen() {
  const { finish, isSubmitting, error } = useFinishOnboarding("financier", "/(financier)/discover");
  const [displayName, setDisplayName] = useState("");
  const [investorKind, setInvestorKind] = useState<InvestorKind>("individual");
  const [targetDealSize, setTargetDealSize] = useState("");
  const [targetReturn, setTargetReturn] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function complete() {
    const targetDealSizeKes = Number(targetDealSize);
    const targetReturnPct = Number(targetReturn);
    if (!displayName.trim()) {
      setFormError("Enter your investor name.");
      return;
    }
    if (!Number.isFinite(targetDealSizeKes) || targetDealSizeKes <= 0) {
      setFormError("Enter a target deal size greater than 0 KES.");
      return;
    }
    if (!Number.isFinite(targetReturnPct) || targetReturnPct <= 0) {
      setFormError("Enter a target return percentage greater than 0.");
      return;
    }

    setFormError(null);
    finish({
      displayName: displayName.trim(),
      profile: {
        investor_kind: investorKind,
        target_deal_size_kes: targetDealSizeKes,
        target_return_pct: targetReturnPct,
      },
    });
  }

  return (
    <OnboardShell
      eyebrow="Financier"
      title="Set your investor profile"
      footer={<ActionButton onPress={complete} disabled={isSubmitting}>{isSubmitting ? "Finishing..." : "Finish onboarding"}</ActionButton>}
    >
      <GlassCard>
        <TextField label="Investor name" value={displayName} onChangeText={setDisplayName} placeholder="Kairu Family Office" />
        <ChoiceGroup
          label="Investor kind"
          value={investorKind}
          onChange={setInvestorKind}
          options={[
            { label: "Individual", value: "individual" },
            { label: "Institution", value: "institution" },
          ]}
        />
        <TextField label="Target deal size (KES)" value={targetDealSize} onChangeText={setTargetDealSize} keyboardType="numeric" placeholder="500000" />
        <TextField label="Target return (%)" value={targetReturn} onChangeText={setTargetReturn} keyboardType="numeric" placeholder="14" />
      </GlassCard>
      <StatusText status={formError ?? error} tone="error" />
    </OnboardShell>
  );
}
