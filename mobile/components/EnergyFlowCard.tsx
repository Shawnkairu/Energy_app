import { Text, View, type DimensionValue } from "react-native";
import type { EnergyOutputs } from "@emappa/shared";
import { colors, GlassCard, Label } from "@emappa/ui";

export function EnergyFlowCard({ energy }: { energy: EnergyOutputs }) {
  const solarWidth = `${Math.min(100, energy.coverage * 100)}%` as DimensionValue;
  const wasteWidth = `${Math.min(100, energy.E_waste / Math.max(1, energy.E_gen) * 100)}%` as DimensionValue;

  return (
    <GlassCard>
      <Label>Energy routing</Label>
      <Text style={{ color: colors.text, fontSize: 19, fontWeight: "600", letterSpacing: -0.4, marginTop: 5 }}>
        Live Energy Flow
      </Text>
      <Text style={{ color: colors.muted, marginTop: 6, lineHeight: 21 }}>
        Solar first, battery second, grid fallback third.
      </Text>
      <View style={{ alignItems: "center", marginTop: 24, backgroundColor: colors.cream, borderRadius: 26, padding: 16, borderColor: colors.border, borderWidth: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
          <Node label="Solar" value={`${energy.E_gen.toLocaleString()} kWh`} color={colors.solar} />
          <Node label="Battery" value={`${energy.E_battery_used.toLocaleString()} kWh`} color={colors.amber} />
          <Node label="Grid" value={`${energy.E_grid.toLocaleString()} kWh`} color={colors.dim} />
        </View>
        <View
          style={{
            width: 2,
            height: 28,
            backgroundColor: colors.borderStrong,
            marginVertical: 4,
            opacity: 0.8,
          }}
        />
        <View
          style={{
            borderColor: colors.solar,
            borderWidth: 4,
            borderRadius: 999,
            height: 104,
            width: 104,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.white,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: "600" }}>
            {Math.round(energy.coverage * 100)}%
          </Text>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "500" }}>solar</Text>
        </View>
      </View>
      <View style={{ marginTop: 18, height: 14, backgroundColor: colors.panelSoft, borderRadius: 999 }}>
        <View style={{ width: solarWidth, height: 14, borderRadius: 999, backgroundColor: colors.solar }} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 7 }}>
        <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600" }}>Solar coverage</Text>
        <Text style={{ color: colors.text, fontSize: 11, fontWeight: "600" }}>{Math.round(energy.coverage * 100)}%</Text>
      </View>
      <View style={{ marginTop: 12, height: 8, backgroundColor: colors.panelSoft, borderRadius: 999 }}>
        <View style={{ width: wasteWidth, height: 8, borderRadius: 999, backgroundColor: colors.red }} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 7 }}>
        <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600" }}>Waste / curtailed</Text>
        <Text style={{ color: colors.red, fontSize: 11, fontWeight: "600" }}>{Math.round(energy.E_waste).toLocaleString()} kWh</Text>
      </View>
      <Text style={{ color: colors.text, marginTop: 14, fontWeight: "600" }}>
        {Math.round(energy.coverage * 100)}% solar coverage - {energy.E_grid.toLocaleString()} kWh grid fallback
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
      <Text style={{ color: colors.text, fontWeight: "600", marginTop: 8 }}>{label}</Text>
      <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{value}</Text>
    </View>
  );
}
