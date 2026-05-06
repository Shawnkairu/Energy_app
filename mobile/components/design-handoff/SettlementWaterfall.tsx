import { Text, View } from "react-native";
import type { ProjectedBuilding, StakeholderRole } from "@emappa/shared";
import { GlassCard, Label, colors, officialPalette } from "@emappa/ui";

const SLICE_KEYS = ["reserve", "provider", "financier", "owner", "emappa"] as const;

type SliceKey = (typeof SLICE_KEYS)[number];

const BAR_FILL: Record<SliceKey, string> = {
  reserve: "#C7CACD",
  provider: officialPalette.plushCaramel,
  financier: officialPalette.softCinnamon,
  owner: officialPalette.studioCocoa,
  emappa: officialPalette.warmUmbar,
};

export function SettlementWaterfall({
  role,
  building,
}: {
  role: StakeholderRole;
  building: ProjectedBuilding;
}) {
  const { settlement } = building;
  const total = Math.max(1, settlement.revenue);
  const slices: Array<{ key: SliceKey; label: string; value: number; desc: string }> = [
    { key: "reserve", label: "Reserve", value: settlement.reserve, desc: "Risk buffer" },
    { key: "provider", label: "Providers", value: settlement.providerPool, desc: "Asset payout pool" },
    { key: "financier", label: "Financiers", value: settlement.financierPool, desc: "Recovery tranche" },
    { key: "owner", label: "Owner", value: settlement.ownerRoyalty, desc: "Host royalty" },
    { key: "emappa", label: "e.mappa", value: settlement.emappaFee, desc: "Platform" },
  ];

  const highlightKey: SliceKey | null =
    role === "building_owner" || role === "homeowner"
      ? "owner"
      : role === "provider"
        ? "provider"
        : role === "financier"
          ? "financier"
          : null;

  return (
    <GlassCard>
      <Label>Settlement waterfall · this period</Label>
      <Text style={{ color: colors.text, fontSize: 17, fontWeight: "700", letterSpacing: -0.2, marginTop: 5 }}>
        Where the building's {formatKes(total)} goes
      </Text>
      <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 5 }}>
        From monetized prepaid solar only · Reserve · Providers · Financiers · Owner · e.mappa.
      </Text>
      <View
        style={{
          flexDirection: "row",
          height: 24,
          marginTop: 14,
          borderRadius: 999,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {slices.map((s) => {
          const w = (s.value / total) * 100;
          const isMine = s.key === highlightKey;
          const fill = isMine ? colors.text : BAR_FILL[s.key];
          return (
            <View
              key={s.key}
              style={{
                width: `${w}%`,
                backgroundColor: fill,
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          );
        })}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
        {slices.map((s) => {
          const isMine = s.key === highlightKey;
          return (
            <View
              key={s.key}
              style={{
                flexGrow: 1,
                flexBasis: "18%",
                padding: 6,
                borderRadius: 8,
                backgroundColor: isMine ? `${colors.text}12` : "transparent",
                borderWidth: 1,
                borderColor: isMine ? colors.text : "transparent",
              }}
            >
              <Text
                style={{
                  color: isMine ? colors.text : colors.muted,
                  fontSize: 8.5,
                  fontWeight: "700",
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                }}
              >
                {s.label}
              </Text>
              <Text style={{ color: colors.text, fontSize: 11, fontWeight: "600", marginTop: 2 }}>
                {(s.value / 1000).toFixed(0)}k
              </Text>
              <Text style={{ color: colors.muted, fontSize: 8.5, marginTop: 1, lineHeight: 12 }}>
                {Math.round((s.value / total) * 100)}%
              </Text>
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
}

function formatKes(value: number) {
  return `KSh ${Math.round(value).toLocaleString()}`;
}
