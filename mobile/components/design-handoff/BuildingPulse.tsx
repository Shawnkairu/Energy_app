import { Text, View } from "react-native";
import type { ProjectedBuilding, StakeholderRole } from "@emappa/shared";
import { Pill, colors } from "@emappa/ui";
import { ROLE_TINT } from "./roleTint";

export function BuildingPulse({
  role,
  building,
}: {
  role: StakeholderRole;
  building: ProjectedBuilding;
}) {
  const tint = ROLE_TINT[role];
  const drs = building.drs;
  const { project } = building;
  const activated =
    drs.decision === "deployment_ready" &&
    project.drs.monitoringConnectivityResolved &&
    project.drs.settlementDataTrusted;

  const statePill =
    activated
      ? { tone: "good" as const, label: "Live · settling" }
      : drs.decision === "deployment_ready"
        ? { tone: "good" as const, label: "Approved · pre-go-live" }
        : drs.decision === "review"
          ? { tone: "warn" as const, label: "In review" }
          : { tone: "bad" as const, label: "Blocked" };

  const initial = project.name.slice(0, 1).toUpperCase();

  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 18,
        padding: 12,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 999,
          backgroundColor: tint.bg,
          borderColor: `${tint.fg}30`,
          borderWidth: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: tint.fg, fontSize: 13, fontWeight: "700" }}>{initial}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 12.5,
              fontWeight: "700",
              letterSpacing: -0.1,
              flexShrink: 1,
            }}
            numberOfLines={1}
          >
            {project.name}
          </Text>
          <Text
            style={{
              color: colors.muted,
              fontSize: 9.5,
              fontWeight: "600",
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            · {tint.label}
          </Text>
        </View>
        <Text style={{ color: colors.muted, fontSize: 10.5, marginTop: 2 }} numberOfLines={1}>
          {project.units} units · {project.locationBand} · DRS {drs.score}/100
        </Text>
      </View>
      <Pill tone={statePill.tone}>{statePill.label}</Pill>
    </View>
  );
}
