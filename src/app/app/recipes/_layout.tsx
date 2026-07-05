import { Stack } from "expo-router";

// Nested Stack so "Recettes" is a single tab in app/_layout.tsx's Tabs
// while list -> detail -> back works as a real push/pop within that tab
// (the tab bar, rendered by the outer Tabs, stays visible throughout —
// matches the web app, where BottomNav renders on every /app/* page).
export default function RecipesLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
