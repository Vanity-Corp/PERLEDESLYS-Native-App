import { Tabs } from "expo-router";

import { BottomNav } from "@/components/bottom-nav";

// Custom `tabBar` (Task 2, src/components/bottom-nav.tsx) matching the
// web's floating gradient-pill BottomNav. This is the standard `<Tabs>`
// navigator (not `unstable-native-tabs`, which the pre-existing scaffold
// used): matching the web's exact pill design needs full JSX control that
// the native-tabs API doesn't offer — see MIGRATION_PLAN.md Task 1's
// "Architectural decision to record". Per-screen `tabBarIcon` options are
// unused now that BottomNav renders its own icons directly (see its
// TAB_ICONS map), so they're left out here rather than kept as dead config.
//
// `search` / `calendar` / `first-steps` are pushed from Home (and, for
// calendar, from Profile too) but aren't tab-bar buttons themselves —
// `href: null` keeps them part of this navigator (so the tab bar stays
// visible on them, matching the web's <MobileShell> rendering BottomNav on
// every /app/* page with no exceptions) without adding extra tab icons.
// BottomNav filters its own rendered list to the 5 real tabs regardless.
export default function AppLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <BottomNav {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Accueil" }} />
      <Tabs.Screen name="recipes" options={{ title: "Recettes" }} />
      <Tabs.Screen name="tutorials" options={{ title: "Vidéos" }} />
      <Tabs.Screen name="lives" options={{ title: "Lives" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />

      <Tabs.Screen name="search" options={{ href: null, title: "Recherche" }} />
      <Tabs.Screen name="calendar" options={{ href: null, title: "Calendrier" }} />
      <Tabs.Screen name="first-steps" options={{ href: null, title: "Mes premiers pas" }} />
    </Tabs>
  );
}
