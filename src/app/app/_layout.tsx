import { Redirect, Tabs } from "expo-router";
import { View } from "react-native";

import { AIChat } from "@/components/ai-chat";
import { BottomNav } from "@/components/bottom-nav";
import { EventReminders } from "@/components/event-reminders";
import { PushNotifications } from "@/components/push-notifications";
import { useAuth } from "@/lib/auth-store";

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
  // Route guard (BACKEND_PLAN.md Phase 3): only ACTIVE, authenticated users may
  // enter the app. Wait for the persisted auth store to rehydrate first to
  // avoid a redirect flash; no token → auth stack; PENDING → activation.
  const { token, user, hydrated } = useAuth();
  if (!hydrated) return null;
  if (!token) return <Redirect href="/(auth)" />;
  if (user?.status !== "ACTIVE") return <Redirect href="/(auth)/activate" />;

  // AIChat is a global floating overlay mounted above the tab navigator (the
  // web mounts <AIChat /> globally in MobileShell too). Wrapping <Tabs> in a
  // flex-1 View lets the FAB's `absolute` positioning measure against the full
  // screen and float over every /app/* screen.
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <BottomNav {...props} />}
      >
        <Tabs.Screen name="index" options={{ title: "Accueil" }} />
        <Tabs.Screen name="recipes" options={{ title: "Recettes" }} />
        <Tabs.Screen name="tutorials" options={{ title: "Vidéos" }} />
        <Tabs.Screen name="lives" options={{ title: "Lives" }} />
        <Tabs.Screen name="profile" options={{ title: "Profil" }} />

        <Tabs.Screen
          name="search"
          options={{ href: null, title: "Recherche" }}
        />
        <Tabs.Screen
          name="calendar"
          options={{ href: null, title: "Calendrier" }}
        />
        <Tabs.Screen
          name="first-steps"
          options={{ href: null, title: "Mes premiers pas" }}
        />
        <Tabs.Screen
          name="reviews"
          options={{ href: null, title: "Donner mon avis" }}
        />
        <Tabs.Screen name="about" options={{ href: null, title: "À propos" }} />
        <Tabs.Screen
          name="who-am-i"
          options={{ href: null, title: "Qui suis-je ?" }}
        />
        <Tabs.Screen name="tips" options={{ href: null, title: "Astuces" }} />
        <Tabs.Screen name="menus" options={{ href: null, title: "Menus" }} />
        <Tabs.Screen
          name="notifications"
          options={{ href: null, title: "Notifications" }}
        />
      </Tabs>
      <AIChat />
      <EventReminders />
      <PushNotifications />
    </View>
  );
}
