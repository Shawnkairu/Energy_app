import { Text, View } from "react-native";
import type { ProjectedBuilding } from "@emappa/shared";
import { GlassCard, Label, colors } from "@emappa/ui";
import { formatKes, residentView } from "../resident/residentUtils";

export function TariffComparison({ building }: { building: ProjectedBuilding }) {
  const view = residentView(building);
  const gridOnly = Math.round(view.savingsKes + view.averagePrepaidBalanceKes);
  const here = view.averagePrepaidBalanceKes;

  return (
    <GlassCard>
      <Label>Tariff comparison · this month</Label>
      <Text style={{ color: colors.text, fontSize: 17, fontWeight: "700", letterSpacing: -0.2, marginTop: 5 }}>
        You paid less by buying solar first
      </Text>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <View
          style={{
            flex: 1,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 12,
            backgroundColor: colors.sky,
          }}
        >
          <Text
            style={{
              color: colors.muted,
              fontSize: 9.5,
              fontWeight: "700",
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            Grid-only
          </Text>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700", letterSpacing: -0.5, marginTop: 4 }}>
            {formatKes(gridOnly)}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 10.5, lineHeight: 15, marginTop: 4 }}>
            What you'd have paid at grid rates.
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: `${colors.green}66`,
            padding: 12,
            backgroundColor: `${colors.green}12`,
          }}
        >
          <Text
            style={{
              color: colors.green,
              fontSize: 9.5,
              fontWeight: "700",
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            With e.mappa
          </Text>
          <Text style={{ color: colors.green, fontSize: 22, fontWeight: "700", letterSpacing: -0.5, marginTop: 4 }}>
            {formatKes(here)}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 10.5, lineHeight: 15, marginTop: 4 }}>
            Solar-first · grid covers the rest.
          </Text>
        </View>
      </View>
      <View
        style={{
          marginTop: 10,
          borderRadius: 12,
          padding: 10,
          backgroundColor: `${colors.green}10`,
          borderWidth: 1,
          borderColor: `${colors.green}44`,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: colors.muted,
            fontSize: 10.5,
            fontWeight: "600",
            letterSpacing: 0.6,
            textTransform: "uppercase",
          }}
        >
          You saved
        </Text>
        <Text style={{ color: colors.green, fontSize: 16, fontWeight: "700" }}>{formatKes(view.savingsKes)}</Text>
      </View>
    </GlassCard>
  );
}
