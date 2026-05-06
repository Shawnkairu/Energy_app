import { Text, View } from "react-native";
import { GlassCard, Label, Pill, colors } from "@emappa/ui";
import { ResidentRuleCard } from "../resident/ResidentShared";
import { ProposedPageChrome } from "./ProposedPageChrome";

const JOBS = [
  { name: "Riverside Apartments", stage: "Active install", next: "Ops signoff", pill: "on site", tone: "good" as const },
  { name: "Highridge Court", stage: "Scheduled", next: "Site survey", pill: "queued", tone: "neutral" as const },
  { name: "Tatu Heights", stage: "Awaiting lead", next: "Assign lead", pill: "blocked", tone: "warn" as const },
  { name: "Brookside Suites", stage: "Inspection", next: "Photos", pill: "today", tone: "neutral" as const },
];

export function InstallerJobsInboxScreen() {
  return (
    <ProposedPageChrome
      section="Jobs"
      workspace="installer workspace"
      title="Jobs Inbox"
      subtitle="The crew job queue across buildings: today's site, what is next, and what is blocked."
      actions={["Accept job", "Reschedule", "Filter"]}
      hero={{
        label: "Active queue",
        value: `${JOBS.length}`,
        sub: "1 live install, 2 queued, 1 blocked on lead electrician.",
        status: "on schedule",
        statusTone: "good",
      }}
    >
      <GlassCard>
        <Label>All jobs</Label>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: "600", marginTop: 6 }}>By urgency</Text>
        <View style={{ marginTop: 10 }}>
          {JOBS.map((j, i) => (
            <View
              key={j.name}
              style={{
                flexDirection: "row",
                gap: 10,
                paddingVertical: 11,
                alignItems: "center",
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: colors.panelSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>{j.name.slice(0, 1)}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ color: colors.text, fontSize: 12, fontWeight: "600" }}>{j.name}</Text>
                <Text style={{ color: colors.muted, fontSize: 10.5, marginTop: 2 }}>
                  {j.stage} · next: {j.next}
                </Text>
              </View>
              <Pill tone={j.tone}>{j.pill}</Pill>
            </View>
          ))}
        </View>
      </GlassCard>
      <ResidentRuleCard
        eyebrow="Acceptance rule"
        title="Do not accept what you cannot dispatch."
        body="Lead electrician eligibility is a kill switch. Confirm certification before accepting."
        rows={[
          { label: "Lead electrician", value: "verified for 1 of 4", note: "3 jobs need a certified lead before scheduling can open.", tone: "warn" },
          { label: "Site access", value: "verified for 2 of 4", note: "Owner permission gates roof + meter-room access.", tone: "warn" },
          { label: "Monitoring", value: "online for 1 live job", note: "Live ops requires connectivity stays online.", tone: "good" },
        ]}
      />
    </ProposedPageChrome>
  );
}
