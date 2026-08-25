import { Stack } from "expo-router";

// Nested Stack so "Vidéos" is a single tab in app/_layout.tsx's Tabs,
// matching the Recipes/Lives tabs, so it resolves to a route named
// "tutorials" that BottomNav's TAB_ORDER/TAB_ICONS can match.
export default function TutorialsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
