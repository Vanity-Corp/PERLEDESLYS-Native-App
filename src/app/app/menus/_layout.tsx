import { Stack } from "expo-router";

// Nested Stack so "Menus" is a single entry in app/_layout.tsx's Tabs while
// list -> detail -> back works as a real push/pop within it (same pattern as
// recipes/_layout.tsx — the tab bar stays visible throughout).
export default function MenusLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
