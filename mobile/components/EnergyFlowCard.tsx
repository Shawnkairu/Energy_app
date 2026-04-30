import { Text, View, type DimensionValue } from "react-native";
import type { EnergyOutputs } from "@emappa/shared";
import { colors, GlassCard } from "@emappa/ui";

export function EnergyFlowCard({ energy }: { energy: EnergyOutputs }) {
  const solarWidth = `${Math.min(100, energy.coverage * 100)}%` as DimensionValue;
  const wasteWidth = `${Math.min(100, energy.E_waste / Math.max(1, energy.E_gen) * 100)}%` as DimensionValue;

  return (
    <GlassCard accent={colors.solar}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>Live Energy Flow</Text>
      <Text style={{ color: colors.muted, marginTop: 6 }}>
        Solar first, battery second, grid fallback third.
      </Text>
      <View style={{ alignItems: "center", marginTop: 24 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
          <Node label="Solar" value={`${energy.E_gen.toLocaleString()} kWh`} color={colors.solar} />
          <Node label="Battery" value={`${energy.E_battery_used.toLocaleString()} kWh`} color={colors.cyan} />
          <Node label="Grid" value={`${energy.E_grid.toLocaleString()} kWh`} color={colors.dim} />
        </View>
        <View
          style={{
            width: 2,
            height: 28,
            backgroundColor: colors.orange,
            marginVertical: 4,
            opacity: 0.8,
          }}
        />
        <View
          style={{
            borderColor: colors.orange,
            borderWidth: 3,
            borderRadius: 999,
            height: 104,
            width: 104,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.panelSoft,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: "900" }}>
            {Math.round(energy.coverage * 100)}%
          </Text>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700" }}>solar</Text>
        </View>
      </View>
      <View style={{ marginTop: 18, height: 14, backgroundColor: colors.panelSoft, borderRadius: 999 }}>
        <View style={{ width: solarWidth, height: 14, borderRadius: 999, backgroundColor: colors.orange }} />
      </View>
      <View style={{ marginTop: 10, height: 8, backgroundColor: colors.panelSoft, borderRadius: 999 }}>
        <View style={{ width: wasteWidth, height: 8, borderRadius: 999, backgroundColor: colors.red }} />
      </View>
      <Text style={{ color: colors.text, marginTop: 14, fontWeight: "800" }}>
        {Math.round(energy.coverage * 100)}% solar coverage · {energy.E_grid.toLocaleString()} kWh grid fallback
      </Text>
    </GlassCard>
  );
}

function Node({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <View
        style={{
          height: 54,
          width: 54,
          borderRadius: 999,
          borderColor: color,
          borderWidth: 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: `${color}18`,
        }}
      >
        <View style={{ height: 18, width: 18, borderRadius: 999, backgroundColor: color }} />
      </View>
      <Text style={{ color: colors.text, fontWeight: "800", marginTop: 8 }}>{label}</Text>
      <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{value}</Text>
    </View>
  );
}
