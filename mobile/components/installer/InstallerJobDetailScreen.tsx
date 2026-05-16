import { Text, View } from "react-native";
import { radius, shadows, spacing, typography } from "@emappa/ui";
import {
  colors,
  InstallerBrief,
  InstallerMetricCard,
  InstallerScaffold,
  Label,
  Pill,
  GlassCard,
} from "./InstallerShared";

export function InstallerJobDetailScreen() {
  return (
    <InstallerScaffold
      section="Job"
      title="Site Packet"
      subtitle="Apartment ATS, solar path, PAYG map."
      actions={["Capture proof", "Crew queue", "Lead card"]}
      hero={(building) => {
        const drs = building.project.drs;
        const pathReady =
          drs.solarApartmentCapacityFitVerified && drs.apartmentAtsMeterMappingVerified && drs.atsKplcSwitchingVerified;
        return {
          label: building.project.locationBand,
          value: pathReady ? "Cleared" : "Review",
          sub: "Capacity fit · ATS map · switching",
          tone: pathReady ? "good" : "bad",
        };
      }}
    >
      {(building) => {
        const drs = building.project.drs;
        const pathReady =
          drs.solarApartmentCapacityFitVerified && drs.apartmentAtsMeterMappingVerified && drs.atsKplcSwitchingVerified;

        return (
          <>
            <InstallerBrief
              eyebrow="Packet"
              title={building.project.name}
              body="Proof stays with this building."
              rows={[
                {
                  label: "Site",
                  value: building.project.locationBand,
                  note: "Named job.",
                },
                {
                  label: "Apartment supply path",
                  value: pathReady ? "Verified" : "Review",
                  note: "Non-participating units stay on KPLC only.",
                  tone: pathReady ? "good" : "bad",
                },
                {
                  label: "Access",
                  value: drs.ownerPermissionsComplete ? "Complete" : "Blocked",
                  note: "Roof + meter room.",
                  tone: drs.ownerPermissionsComplete ? "good" : "bad",
                },
              ]}
            />

            <GlassCard>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 14 }}>
                <View style={{ flex: 1 }}>
                  <Label>Site map</Label>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: typography.title,
                      fontWeight: "700",
                      letterSpacing: -0.5,
                      marginTop: 6,
                      lineHeight: typography.title + 4,
                    }}
                  >
                    Site map
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 7 }}>
                    Tap the next physical proof.
                  </Text>
                </View>
                <Pill tone={pathReady ? "good" : "bad"}>{pathReady ? "cleared" : "review"}</Pill>
              </View>
              <View
                style={{
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 22,
                  backgroundColor: colors.white,
                  minHeight: 148,
                  marginTop: 16,
                  overflow: "hidden",
                  padding: 16,
                }}
              >
                <View style={{ position: "absolute", top: 24, left: 22, right: 22, height: 1, backgroundColor: colors.borderStrong }} />
                <View style={{ position: "absolute", top: 72, left: 22, right: 22, height: 1, backgroundColor: colors.borderStrong }} />
                <View style={{ position: "absolute", top: 120, left: 22, right: 22, height: 1, backgroundColor: colors.borderStrong }} />
                <View style={{ position: "absolute", top: 18, bottom: 18, left: 82, width: 1, backgroundColor: colors.borderStrong }} />
                <View style={{ position: "absolute", top: 18, bottom: 18, right: 82, width: 1, backgroundColor: colors.borderStrong }} />
                {[
                  ["Access", drs.ownerPermissionsComplete ? "Open" : "Hold", 12, 18],
                  ["ATS path", pathReady ? "OK" : "Fix", 134, 56],
                  ["Inverter", drs.settlementDataTrusted ? "Live" : "Read", 48, 105],
                ].map(([label, value, left, top]) => (
                  <View
                    key={label}
                    style={{
                      position: "absolute",
                      left: Number(left),
                      top: Number(top),
                      borderRadius: radius.md,
                      backgroundColor: colors.white,
                      borderColor: colors.border,
                      borderWidth: 1,
                      paddingHorizontal: 11,
                      paddingVertical: 8,
                      ...shadows.soft,
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: typography.small, fontWeight: "600" }}>{label}</Text>
                    <Text style={{ color: colors.muted, fontSize: typography.micro, marginTop: 2 }}>{value}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard
                  label="Array size"
                  value={`${building.project.energy.arrayKw} kW`}
                  detail="System size."
                />
              </View>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard
                  label="Battery"
                  value={`${building.project.energy.batteryKwh} kWh`}
                  detail="Storage."
                />
              </View>
            </View>

            <GlassCard>
              <Label>Readings</Label>
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.title,
                  fontWeight: "700",
                  letterSpacing: -0.5,
                  marginTop: 6,
                  lineHeight: typography.title + 4,
                }}
              >
                Readings
              </Text>
              <View
                style={{
                  marginTop: 14,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: "hidden",
                  backgroundColor: colors.white,
                  ...shadows.soft,
                }}
              >
                {[
                  ["Apartment path", pathReady ? "Verified" : "Open"],
                  ["Cable", drs.ownerPermissionsComplete ? "Open" : "Blocked"],
                  ["Telemetry", drs.settlementDataTrusted ? "Trusted" : "Recapture"],
                ].map(([label, value], index) => (
                  <View
                    key={label}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: spacing.md,
                      paddingHorizontal: spacing.md,
                      backgroundColor: colors.white,
                      borderTopColor: index === 0 ? "transparent" : colors.border,
                      borderTopWidth: index === 0 ? 0 : 1,
                      gap: spacing.sm,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.muted,
                        fontSize: typography.micro,
                        fontWeight: "600",
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                      }}
                    >
                      {label}
                    </Text>
                    <Text style={{ color: colors.text, fontSize: typography.small, fontWeight: "600", flexShrink: 1, textAlign: "right" }}>{value}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </>
        );
      }}
    </InstallerScaffold>
  );
}
