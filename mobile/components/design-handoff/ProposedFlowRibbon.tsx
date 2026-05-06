import { Text, View } from "react-native";
import { colors } from "@emappa/ui";

export function ProposedFlowRibbon() {
  return (
    <View
      style={{
        backgroundColor: "#FFF7E5",
        borderBottomWidth: 1,
        borderBottomColor: `${colors.amber}66`,
        paddingVertical: 6,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: colors.amber }} />
      <Text
        style={{
          color: colors.amber,
          fontSize: 9.5,
          fontWeight: "700",
          letterSpacing: 1.2,
          textTransform: "uppercase",
          flex: 1,
        }}
      >
        Proposed · design handoff flow
      </Text>
      <Text style={{ color: colors.amber, fontSize: 9.5, fontWeight: "600" }}>wireframe</Text>
    </View>
  );
}
