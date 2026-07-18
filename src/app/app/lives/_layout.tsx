import { Stack } from "expo-router";

// Nested Stack so "Lives" is a single tab in app/_layout.tsx's Tabs while
// list -> replay/player -> back works as a real push/pop within that tab
// (mirrors the Recipes tab). WIRING_PLAN B4.
export default function LivesLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
