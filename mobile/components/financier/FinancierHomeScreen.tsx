import { BuildingPulse, KillSwitchBanner } from "../design-handoff";
import {
  FinancierBriefCard,
  FinancierScreenShell,
  FinancierWorkflowCard,
  StatusRail,
  drsTone,
  formatKes,
  formatPercent,
} from "./FinancierShared";

function formatStage(stage: string) {
  return stage
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`)
    .join(" ");
}

export function FinancierHomeScreen() {
  return (
    <FinancierScreenShell
      section="Home"
      title="Financier Deal Room"
      subtitle="A calm overview of the active named building raise, readiness gate, and next underwriting move."
      actions={["Open deal room", "Review DRS", "Track recovery"]}
      showActivity
      hero={({ primary }) => ({
        label: "Active deal room",
        value: primary.project.name,
        sub: "Capital and recovery stay tied to this building.",
      })}
    >
      {({ primary }) => {
        const view = primary.roleViews.financier;
        return (
          <>
            <BuildingPulse role="financier" building={primary} />
            <KillSwitchBanner building={primary} />
            <StatusRail
              items={[
                {
                  label: "Committed",
                  value: formatKes(view.committedCapitalKes),
                  note: "To primary named deal.",
                  tone: "neutral",
                },
                {
                  label: "Progress",
                  value: formatPercent(view.fundingProgress),
                  note: `${formatKes(view.remainingCapitalKes)} remaining.`,
                  tone: "good",
                },
                {
                  label: "DRS",
                  value: `${primary.drs.score}/100`,
                  note: primary.drs.label ?? "Readiness gate",
                  tone: drsTone(primary),
                },
              ]}
            />
            <FinancierBriefCard
              eyebrow="Deal room"
              title="Named building, named risk."
              body="Capital is committed to the building shown here, not a pooled vehicle. Readiness and recovery stay legible at every step."
              rows={[
                { label: "Site", value: primary.project.locationBand, note: `${primary.project.units} apartments under one named raise.` },
                { label: "Stage", value: formatStage(primary.project.stage), note: "Building advances only after readiness gates clear." },
                {
                  label: "Capital",
                  value: formatKes(view.committedCapitalKes),
                  note: `${formatPercent(view.fundingProgress)} funded; ${formatKes(view.remainingCapitalKes)} remaining to close.`,
                },
              ]}
            />
            <FinancierWorkflowCard
              eyebrow="Next deal-room moves"
              title="Underwriting plan"
              items={[
                {
                  label: "Confirm named exposure",
                  detail: "Capital is committed to the building shown here, not a pooled vehicle.",
                  status: "named",
                  tone: "good",
                },
                { label: "Review readiness", detail: "DRS and kill switches determine when capital can move.", status: "DRS" },
                { label: "Watch recovery", detail: "Recovery cases use monetized prepaid solar and remain ranges.", status: "range" },
              ]}
            />
          </>
        );
      }}
    </FinancierScreenShell>
  );
}
