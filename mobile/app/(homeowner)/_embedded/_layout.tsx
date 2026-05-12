import { Stack } from "expo-router";
import { colors } from "@emappa/ui";

/** Stack for drill-in homeowner flows; shell screens supply their own titles. */
export default function HomeownerEmbeddedLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface },
        animation: "slide_from_right",
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    />
  );
}
