import { Tabs } from "expo-router";
import { BookOpen, Home, PlayCircle, Radio, User } from "lucide-react-native";

// Default expo-router tab bar for now — Task 2 replaces it with a custom
// `tabBar` render prop matching the web's floating gradient-pill BottomNav.
// This is the standard `<Tabs>` navigator (not `unstable-native-tabs`,
// which the pre-existing scaffold used): matching the web's exact pill
// design needs full JSX control that the native-tabs API doesn't offer —
// see MIGRATION_PLAN.md Task 1's "Architectural decision to record".
//
// `search` / `calendar` / `first-steps` are pushed from Home (and, for
// calendar, from Profile too) but aren't tab-bar buttons themselves —
// `href: null` keeps them part of this navigator (so the tab bar stays
// visible on them, matching the web's <MobileShell> rendering BottomNav on
// every /app/* page with no exceptions) without adding extra tab icons.
export default function AppLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Recettes",
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tutorials"
        options={{
          title: "Vidéos",
          tabBarIcon: ({ color, size }) => <PlayCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="lives"
        options={{
          title: "Lives",
          tabBarIcon: ({ color, size }) => <Radio color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />

      <Tabs.Screen name="search" options={{ href: null, title: "Recherche" }} />
      <Tabs.Screen name="calendar" options={{ href: null, title: "Calendrier" }} />
      <Tabs.Screen name="first-steps" options={{ href: null, title: "Mes premiers pas" }} />
    </Tabs>
  );
}
