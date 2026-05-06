import { Text, View } from "react-native";
import { GlassCard, Label, colors } from "@emappa/ui";

type Lens = "resident" | "provider";

function toneColor(t?: "good" | "warn" | "bad" | "neutral") {
  if (t === "good") return colors.green;
  if (t === "warn") return colors.amber;
  if (t === "bad") return colors.red;
  return colors.text;
}

const ROWS: Record<
  Lens,
  Array<{ label: string; value: string; tone?: "good" | "warn" | "bad" | "neutral" }>
> = {
  resident: [
    { label: "Asset", value: "Riverside Apartments · provider asset" },
    { label: "Buying", value: "8% of provider-side cashflows" },
    { label: "Price", value: "KSh 96,000" },
    { label: "Submitted", value: "Apr 18" },
    { label: "Compliance", value: "pending", tone: "warn" },
    { label: "Effective", value: "May settlement" },
  ],
  provider: [
    { label: "Asset", value: "Riverside Apartments · provider asset" },
    { label: "Selling", value: "8% of provider-side cashflows" },
    { label: "Price", value: "KSh 96,000" },
    { label: "Submitted", value: "Apr 18" },
    { label: "Compliance", value: "pending", tone: "warn" },
    { label: "Effective", value: "May settlement" },
  ],
};

export function OwnershipLedgerEntry({ lens = "resident" }: { lens?: Lens }) {
  const isResident = lens === "resident";
  const rows = ROWS[lens];

  return (
    <GlassCard>
      <Label>Ownership ledger</Label>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700", letterSpacing: -0.2, marginTop: 5 }}>
        {isResident ? "Your pending purchase" : "Pending share sale"}
      </Text>
      <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 5 }}>
        Transfers affect future settlement periods only after payment clears and compliance checks pass.
      </Text>
      <View style={{ marginTop: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: "hidden" }}>
        {rows.map((r, i) => (
          <View
            key={r.label}
            style={{
              paddingVertical: 9,
              paddingHorizontal: 11,
              backgroundColor: i % 2 === 0 ? colors.white : colors.sky,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: colors.border,
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <Text
              style={{
                color: colors.muted,
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 0.8,
                textTransform: "uppercase",
              }}
            >
              {r.label}
            </Text>
            <Text
              style={{
                color: toneColor(r.tone),
                fontSize: 11,
                fontWeight: "600",
                textAlign: "right",
                flexShrink: 1,
              }}
            >
              {r.value}
            </Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}
