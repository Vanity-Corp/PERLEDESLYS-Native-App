import { useRouter } from "expo-router";
import {
  ArrowLeft,
  BookOpen,
  Megaphone,
  Play,
  Radio,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/ui/icon";
import { useHardRefresh, useNotificationsFeedQuery } from "@/lib/content-queries";
import { useNotificationsStore } from "@/lib/notifications-store";
import { hrefForPushData } from "@/lib/push";
import type { NotificationItem } from "@/types/content";

// Icon per notification type.
const ICONS: Record<NotificationItem["type"], LucideIcon> = {
  recipe: UtensilsCrossed,
  video: Play,
  live: Radio,
  replay: Radio,
  article: BookOpen,
  ramadan: Sparkles,
  promo: Megaphone,
};

// How many items are shown initially and revealed per "Voir plus" press.
const PAGE_SIZE = 8;

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
  const feedQ = useNotificationsFeedQuery();
  const items = feedQ.data ?? [];
  const markSeen = useNotificationsStore((s) => s.markSeen);
  const onRefresh = useHardRefresh([["notifications"]]);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Viewing the list clears the unread badge.
  useEffect(() => {
    markSeen();
  }, [markSeen]);

  const shown = items.slice(0, visible);

  const openItem = (item: NotificationItem) => {
    const href = hrefForPushData(item.data);
    if (href) router.push(href);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
        <Pressable onPress={() => router.back()} className="-ml-2 rounded-full p-2">
          <Icon as={ArrowLeft} size={20} className="text-foreground" />
        </Pressable>
        <View>
          <Text className="font-display text-2xl font-medium tracking-tight text-foreground">
            Notifications
          </Text>
          <Text className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {items.length} notification{items.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerClassName="px-5 pb-16 pt-2 gap-3"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={feedQ.isFetching} onRefresh={onRefresh} />
        }
      >
        {items.length === 0 ? (
          <Text className="mt-16 text-center text-sm text-muted-foreground">
            Aucune notification pour le moment.
          </Text>
        ) : (
          <>
            {shown.map((item) => {
              const hasLink = !!hrefForPushData(item.data);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => openItem(item)}
                  disabled={!hasLink}
                  className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-3"
                >
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    <Icon
                      as={ICONS[item.type] ?? Sparkles}
                      size={18}
                      className="text-primary"
                    />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text
                      className="text-sm font-medium leading-snug text-foreground"
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    {item.body ? (
                      <Text
                        className="mt-0.5 text-xs leading-snug text-muted-foreground"
                        numberOfLines={2}
                      >
                        {item.body}
                      </Text>
                    ) : null}
                    <Text className="mt-0.5 text-[11px] text-muted-foreground">
                      {relativeTime(item.createdAt)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}

            {visible < items.length && (
              <Pressable
                onPress={() => setVisible((v) => v + PAGE_SIZE)}
                className="mt-1 items-center rounded-2xl border border-border bg-card py-3.5"
              >
                <Text className="text-sm font-medium text-primary">Voir plus</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
