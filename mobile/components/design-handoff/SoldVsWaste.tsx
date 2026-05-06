import { Text, View } from "react-native";
import type { ProjectedBuilding } from "@emappa/shared";
import { GlassCard, Label, colors } from "@emappa/ui";

export function SoldVsWaste({
  building,
  headline = "Generated → Sold → Waste",
}: {
  building: ProjectedBuilding;
  headline?: string;
}) {
  const e = building.energy;
  const total = Math.max(1, e.E_gen);
  const soldPct = (e.E_sold / total) * 100;
  const wastePct = (e.E_waste / total) * 100;
  const otherPct = Math.max(0, 100 - soldPct - wastePct);

  return (
    <GlassCard>
      <Label>Asset truth</Label>
      <Text style={{ color: colors.text, fontSize: 17, fontWeight: "700", letterSpacing: -0.2, marginTop: 5 }}>{headline}</Text>
      <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 5 }}>
        Only the green slice creates payout. Wasted, curtailed, or free-exported energy stays unpaid.
      </Text>
      <View style={{ marginTop: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 10, color: colors.muted, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase" }}>
            Generated
          </Text>
          <Text style={{ fontSize: 10, color: colors.muted, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase" }}>
            {Math.round(e.E_gen).toLocaleString()} kWh
          </Text>
        </View>
        <View
          style={{
            height: 14,
            marginTop: 6,
            borderRadius: 999,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: "row",
          }}
        >
          <View style={{ width: `${soldPct}%`, height: 14, backgroundColor: colors.green }} />
          <View style={{ width: `${otherPct}%`, height: 14, backgroundColor: colors.borderStrong }} />
          <View style={{ width: `${wastePct}%`, height: 14, backgroundColor: colors.amber }} />
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
        <Tile
          label="Sold"
          value={`${Math.round(e.E_sold).toLocaleString()} kWh`}
          desc="Prepaid demand · creates payout"
          fg={colors.green}
        />
        <Tile
          label="Grid fallback"
          value={`${Math.round(e.E_grid).toLocaleString()} kWh`}
          fg={colors.text}
          desc="Household load outside sold solar"
        />
        <Tile
          label="Waste"
          value={`${Math.round(e.E_waste).toLocaleString()} kWh`}
          fg={colors.amber}
          desc="Curtailed · no payout"
        />
      </View>
    </GlassCard>
  );
}

function Tile({
  label,
  value,
  desc,
  fg,
}: {
  label: string;
  value: string;
  desc: string;
  fg: string;
}) {
  return (
    <View style={{ flex: 1, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 8 }}>
      <Text
        style={{
          color: fg,
          fontSize: 9,
          fontWeight: "700",
          letterSpacing: 0.8,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      <Text style={{ color: colors.text, fontSize: 12, fontWeight: "700", marginTop: 3 }}>{value}</Text>
      <Text style={{ color: colors.muted, fontSize: 9.5, lineHeight: 13, marginTop: 3 }}>{desc}</Text>
    </View>
  );
}
