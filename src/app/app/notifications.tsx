import { useRouter } from "expo-router";
import { ArrowLeft, BookOpen, Play, Radio, UtensilsCrossed } from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/ui/icon";
import { useRecentQuery } from "@/lib/content-queries";
import { useNotificationsStore } from "@/lib/notifications-store";
import type { RecentItem } from "@/types/content";

const ICONS = {
  recipe: UtensilsCrossed,
  video: Play,
  live: Radio,
  article: BookOpen,
} as const;

const LABELS = {
  recipe: "Nouvelle recette",
  video: "Nouvelle vidéo",
  live: "Nouveau live",
  article: "Nouvel article",
} as const;

function href(item: RecentItem) {
  switch (item.type) {
    case "recipe":
      return { pathname: "/app/recipes/[recipeId]", params: { recipeId: item.id } } as const;
    case "video":
      return { pathname: "/app/videos/[videoId]", params: { videoId: item.id } } as const;
    case "live":
      return { pathname: "/app/lives/[liveId]", params: { liveId: item.id } } as const;
    case "article":
      return { pathname: "/app/articles/[articleId]", params: { articleId: item.id } } as const;
  }
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const recentQ = useRecentQuery();
  const items = recentQ.data ?? [];
  const markSeen = useNotificationsStore((s) => s.markSeen);

  // Viewing the list clears the unread badge.
  useEffect(() => {
    markSeen();
  }, [markSeen]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
        <Pressable onPress={() => router.back()} className="-ml-2 rounded-full p-2">
          <Icon as={ArrowLeft} size={20} className="text-foreground" />
        </Pressable>
        <Text className="font-display text-2xl font-medium tracking-tight text-foreground">
          Notifications
        </Text>
      </View>

      <ScrollView
        contentContainerClassName="px-5 pb-16 pt-2 gap-3"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={recentQ.isFetching}
            onRefresh={() => recentQ.refetch()}
          />
        }
      >
        {items.length === 0 ? (
          <Text className="mt-16 text-center text-sm text-muted-foreground">
            Aucune notification pour le moment.
          </Text>
        ) : (
          items.map((item) => (
            <Pressable
              key={`${item.type}-${item.id}`}
              onPress={() => router.push(href(item))}
              className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-3"
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <Icon as={ICONS[item.type]} size={18} className="text-primary" />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-[10px] font-medium uppercase tracking-wider text-primary">
                  {LABELS[item.type]}
                </Text>
                <Text
                  className="text-sm font-medium leading-snug text-foreground"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text className="mt-0.5 text-[11px] text-muted-foreground">
                  {relativeTime(item.createdAt)}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
