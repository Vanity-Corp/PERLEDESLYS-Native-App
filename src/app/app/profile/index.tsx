import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Compass,
  Heart,
  HelpCircle,
  History as HistoryIcon,
  LogOut,
  Settings as SettingsIcon,
  StickyNote,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/lib/auth-store";
import { useFavorites } from "@/lib/local-store";
import { unregisterPushToken } from "@/lib/push";

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

// Web source: kitchen-haven-club/src/routes/app/profile/index.tsx
// Accounts are username-only (privacy — WIRING_PLAN B1/A1), so the profile shows
// the real authenticated user: username + join date + activation status. The
// old mock avatar / Thermomix products / invitation code were dropped (no data).
export default function ProfileScreen() {
  const router = useRouter();
  const logout = useAuth((s) => s.logout);
  const user = useAuth((s) => s.user);
  const token = useAuth((s) => s.token);
  const { favoriteRecipes, favoriteVideos } = useFavorites();
  const favoritesCount = favoriteRecipes.length + favoriteVideos.length;

  const memberSince = (() => {
    if (!user?.createdAt) return null;
    const d = new Date(user.createdAt);
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  })();
  const initials = (user?.username ?? "?").slice(0, 2).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
          <Link href="/app" asChild>
            <Pressable className="-ml-2 rounded-full p-2">
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </Pressable>
          </Link>
          <Text className="font-display text-2xl font-medium tracking-tight text-foreground">
            Mon espace
          </Text>
        </View>

        {/* User card */}
        <GradientView
          tone="luxe"
          className="mx-5 mt-4 flex-row items-center gap-4 rounded-3xl p-5"
        >
          <View
            className="items-center justify-center overflow-hidden rounded-full bg-primary-foreground/20"
            style={{ width: 64, height: 64 }}
          >
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                contentFit="cover"
                style={{ width: "100%", height: "100%" }}
                accessibilityLabel="Avatar"
              />
            ) : (
              <Text className="font-italiana text-2xl text-primary-foreground">
                {initials}
              </Text>
            )}
          </View>
          <View className="min-w-0 flex-1">
            <Text className="font-italiana text-xl leading-tight tracking-wide text-primary-foreground">
              @{user?.username ?? ""}
            </Text>
            <Text className="mt-0.5 text-[11px] text-primary-foreground opacity-90">
              Cliente Perledeslys{memberSince ? ` · depuis ${memberSince}` : ""}
            </Text>
          </View>
        </GradientView>

        {/* Quick access grid */}
        <View className="mt-4 flex-row flex-wrap gap-3 px-5">
          <Tile
            href="/app/profile/favorites"
            icon={Heart}
            title="Favoris"
            subtitle={`${favoritesCount} ${favoritesCount <= 1 ? "enregistrée" : "enregistrées"}`}
          />
          <Tile
            href="/app/profile/history"
            icon={HistoryIcon}
            title="Historique"
            subtitle="Reprendre"
          />
          <Tile
            href="/app/profile/notes"
            icon={StickyNote}
            title="Mes notes"
            subtitle="Toutes mes idées"
          />
          <Tile
            href="/app/first-steps"
            icon={Compass}
            title="Premiers pas"
            subtitle="TM7 — 35 min"
          />
        </View>

        <SectionTitle>Mon compte</SectionTitle>
        <View className="mx-5 divide-y divide-border rounded-2xl border border-border bg-card">
          <Row
            href="/app/profile/settings"
            icon={SettingsIcon}
            label="Paramètres"
            value="Mes préférences"
          />
          <Row
            href="/app/calendar"
            icon={CalendarDays}
            label="Calendrier"
            value="Lives & ateliers"
          />
          <Row
            href="/app/profile/history"
            icon={HistoryIcon}
            label="Historique de visionnage"
            value="Reprendre où vous étiez"
          />
          <Row
            href="/app/profile/notes"
            icon={StickyNote}
            label="Mes notes"
            value="Vos prises de notes"
          />
        </View>

        <SectionTitle>Support</SectionTitle>
        <View className="mx-5 divide-y divide-border rounded-2xl border border-border bg-card">
          <Row
            href="/app/profile/faq"
            icon={HelpCircle}
            label="FAQ"
            value="Toutes les réponses"
          />
        </View>

        <Pressable
          onPress={() => {
            // Stop this device receiving push before dropping the session
            // (the unregister route is member-guarded — needs the token).
            void unregisterPushToken(token ?? undefined);
            logout();
            router.replace("/(auth)");
          }}
          className="mx-5 mt-7 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-card py-4"
        >
          <Icon as={LogOut} size={16} className="text-destructive" />
          <Text className="font-medium text-destructive">Se déconnecter</Text>
        </Pressable>

        <Text className="mt-4 text-center font-italiana text-[10px] tracking-[0.3em] text-muted-foreground">
          Perledeslys · v1.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Tile({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href as never} asChild>
      <Pressable
        style={{ width: "47%" }}
        className="gap-2 rounded-2xl border border-border bg-card p-4"
      >
        <GradientView
          tone="luxe"
          className="h-10 w-10 items-center justify-center rounded-xl"
        >
          <Icon as={icon} size={20} className="text-primary-foreground" />
        </GradientView>
        <View>
          <Text className="text-sm font-medium leading-tight text-foreground">
            {title}
          </Text>
          <Text className="mt-0.5 text-[10px] text-muted-foreground">
            {subtitle}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text className="mb-2 mt-7 px-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
      {children}
    </Text>
  );
}

function Row({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <Link href={href as never} asChild>
      <Pressable className="flex-row items-center gap-3 px-4 py-3.5">
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-secondary">
          <Icon as={icon} size={16} className="text-primary" />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {label}
          </Text>
          <Text
            className="text-sm font-medium text-foreground"
            numberOfLines={1}
          >
            {value}
          </Text>
        </View>
        <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
      </Pressable>
    </Link>
  );
}
