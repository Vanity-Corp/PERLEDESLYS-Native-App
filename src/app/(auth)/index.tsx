import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";

// Web source: kitchen-haven-club/src/routes/index.tsx (Landing)
// Stub only — real hero/CTA UI lands in Task 10. The link list below is
// temporary scaffolding so every route added in this task is reachable for
// manual testing; it goes away once Task 10 builds the real screen.
export default function LandingScreen() {
  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerClassName="gap-3 p-6" contentInsetAdjustmentBehavior="automatic">
        <Text className="font-display text-3xl text-foreground">PERLEDESLYS</Text>
        <Text className="text-muted-foreground">Landing (stub) — Task 1 debug route list</Text>

        <DebugLink href="/(auth)/login" label="Login" />
        <DebugLink href="/app" label="Dashboard" />
        <DebugLink href="/app/search" label="Search" />
        <DebugLink href="/app/calendar" label="Calendar" />
        <DebugLink href="/app/first-steps" label="First steps" />
        <DebugLink href="/app/recipes" label="Recipes list" />
        <DebugLink
          href={{ pathname: "/app/recipes/[recipeId]", params: { recipeId: "couscous-royal" } }}
          label="Recipe detail (couscous-royal)"
        />
        <DebugLink href="/app/tutorials" label="Tutorials list" />
        <DebugLink
          href={{ pathname: "/app/videos/[videoId]", params: { videoId: "premiers-pas-tm7" } }}
          label="Video detail (premiers-pas-tm7)"
        />
        <DebugLink href="/app/lives" label="Lives" />
        <DebugLink href="/app/profile" label="Profile hub" />
        <DebugLink href="/app/profile/favorites" label="Favorites" />
        <DebugLink href="/app/profile/history" label="History" />
        <DebugLink href="/app/profile/notes" label="Notes" />
        <DebugLink href="/app/profile/settings" label="Settings" />
        <DebugLink href="/app/profile/faq" label="FAQ" />
        <DebugLink href="/app/profile/tips" label="Tips" />
      </ScrollView>
    </View>
  );
}

function DebugLink({ href, label }: { href: Parameters<typeof Link>[0]["href"]; label: string }) {
  return (
    <Link href={href} className="rounded-xl border border-border bg-card p-3">
      <Text className="text-foreground">{label}</Text>
    </Link>
  );
}
