import { Text, View } from "react-native";
import type { ProjectedBuilding } from "@emappa/shared";
import { colors } from "@emappa/ui";

function synthReasons(projectDrs: ProjectedBuilding["project"]["drs"], explicit: string[]): string[] {
  const synth: string[] = [];
  if (!projectDrs.ownerPermissionsComplete) {
    synth.push("Owner permission incomplete · Owner must confirm building access.");
  }
  if (!projectDrs.hasVerifiedSupplierQuote) {
    synth.push("Supplier quote/BOM missing · Supplier must lock the BOM.");
  }
  if (!projectDrs.hasCertifiedLeadElectrician) {
    synth.push("No certified lead electrician · Installer must assign a certified lead.");
  }
  if (!projectDrs.meterInverterMatchResolved) {
    synth.push("Meter/inverter mismatch · Installer must reconcile readings.");
  }
  if (!projectDrs.monitoringConnectivityResolved) {
    synth.push("Monitoring offline · Restore connectivity before go-live.");
  }
  if (!projectDrs.settlementDataTrusted) {
    synth.push("Settlement data not trusted · Recheck telemetry before payout.");
  }
  return [...explicit, ...synth];
}

export function KillSwitchBanner({ building }: { building: ProjectedBuilding }) {
  const reasons = building.drs.reasons ?? [];
  const all = synthReasons(building.project.drs, reasons);
  if (all.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: `${colors.red}14`,
        borderColor: `${colors.red}66`,
        borderWidth: 1,
        borderRadius: 14,
        padding: 11,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: colors.red }} />
        <Text
          style={{
            color: colors.red,
            fontSize: 9.5,
            fontWeight: "700",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            flex: 1,
          }}
        >
          Kill switch active · deployment paused
        </Text>
      </View>
      {all.slice(0, 3).map((r, i) => (
        <Text
          key={`${i}-${r.slice(0, 24)}`}
          style={{
            color: colors.text,
            fontSize: 11,
            lineHeight: 16,
            paddingTop: i === 0 ? 0 : 6,
            marginTop: i === 0 ? 0 : 6,
            borderTopColor: i === 0 ? "transparent" : `${colors.red}33`,
            borderTopWidth: i === 0 ? 0 : 1,
          }}
        >
          {r}
        </Text>
      ))}
    </View>
  );
}
