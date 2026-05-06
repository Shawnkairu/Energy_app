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
      section="Job Detail"
      title="Site Evidence"
      subtitle="The site packet for map context, physical evidence, and readings tied to one named building."
      actions={["Capture site", "Map meters", "Log readings"]}
      hero={(building) => ({
        label: "Site proof",
        value: building.project.drs.meterInverterMatchResolved ? "Aligned" : "Mismatch",
        sub: "Meter and inverter proof for this named building",
      })}
    >
      {(building) => {
        const drs = building.project.drs;

        return (
          <>
            <InstallerBrief
              eyebrow="Job packet"
              title="Every field artifact stays attached to this building."
              body="Job detail is the crew's source of truth for physical proof, map context, and commissioning readings."
              rows={[
                {
                  label: "Site",
                  value: building.project.locationBand,
                  note: "The installer works against a named building, not an opaque pooled deployment.",
                },
                {
                  label: "Meter map",
                  value: drs.meterInverterMatchResolved ? "Matched" : "Review",
                  note: "Meter/inverter mismatch is a DRS kill switch.",
                  tone: drs.meterInverterMatchResolved ? "good" : "bad",
                },
                {
                  label: "Owner access",
                  value: drs.ownerPermissionsComplete ? "Complete" : "Blocked",
                  note: "Roof and meter access depends on completed building owner permission.",
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
                    Physical install packet
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: typography.small, lineHeight: 19, marginTop: 7 }}>
                    Keep field proof minimal: access, meter path, roof works, and readings.
                  </Text>
                </View>
                <Pill tone={drs.meterInverterMatchResolved ? "good" : "bad"}>
                  {drs.meterInverterMatchResolved ? "mapped" : "review"}
                </Pill>
              </View>
              <View
                style={{
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 22,
                  backgroundColor: colors.panelSoft,
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
                  ["Meter", drs.meterInverterMatchResolved ? "Matched" : "Mismatch", 134, 56],
                  ["Inverter", drs.settlementDataTrusted ? "Reading" : "Pending", 48, 105],
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
                  detail="Mock projected system size for the active job."
                />
              </View>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard
                  label="Battery"
                  value={`${building.project.energy.batteryKwh} kWh`}
                  detail="Storage capacity used during commissioning checks."
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
                Commissioning evidence
              </Text>
              <View
                style={{
                  marginTop: 14,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: "hidden",
                  backgroundColor: colors.sky,
                  ...shadows.soft,
                }}
              >
                {[
                  ["Meter map", drs.meterInverterMatchResolved ? "Matched" : "Mismatch blocks go-live"],
                  ["Cable route", drs.ownerPermissionsComplete ? "Access confirmed" : "Owner access incomplete"],
                  ["Settlement readings", drs.settlementDataTrusted ? "Trusted" : "Needs fresh capture"],
                ].map(([label, value], index) => (
                  <View
                    key={label}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: spacing.md,
                      paddingHorizontal: spacing.md,
                      backgroundColor: index % 2 === 0 ? colors.white : colors.panelSoft,
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
