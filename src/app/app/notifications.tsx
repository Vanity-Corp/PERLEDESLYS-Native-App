import { Image } from "expo-image";
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
import { memo, useEffect, useState } from "react";
import { FlatList, Linking, Pressable, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/ui/icon";
import { useHardRefresh, useNotificationsFeedQuery } from "@/lib/content-queries";
import { useNotificationsStore } from "@/lib/notifications-store";
import { externalUrlForPushData, hrefForPushData } from "@/lib/push";
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

// How many items are shown initially and revealed per scroll-triggered load.
// The feed itself is already bounded server-side (14-day retention, capped at
// 50 rows — see push.service.ts), so this is purely a rendering window, not
// real pagination: everything is already fetched in one request.
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

const NotificationRow = memo(function NotificationRow({
  item,
  onPress,
}: {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
}) {
  const hasLink = !!hrefForPushData(item.data) || !!externalUrlForPushData(item.data);
  return (
    <Pressable
      onPress={() => onPress(item)}
      disabled={!hasLink}
      className="mb-3 flex-row items-center gap-3 rounded-2xl border border-border bg-card p-3"
    >
      {item.image ? (
        <Image
          source={item.image}
          contentFit="cover"
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
      ) : (
        <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <Icon as={ICONS[item.type] ?? Sparkles} size={18} className="text-primary" />
        </View>
      )}
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-medium leading-snug text-foreground" numberOfLines={1}>
          {item.title}
        </Text>
        {item.body ? (
          <Text className="mt-0.5 text-xs leading-snug text-muted-foreground" numberOfLines={2}>
            {item.body}
          </Text>
        ) : null}
        <Text className="mt-0.5 text-[11px] text-muted-foreground">
          {relativeTime(item.createdAt)}
        </Text>
      </View>
    </Pressable>
  );
});

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
    const url = externalUrlForPushData(item.data);
    if (url) {
      void Linking.openURL(url);
      return;
    }
    const href = hrefForPushData(item.data);
    if (href) router.push(href);
  };

  const Header = (
    <View className="flex-row items-center gap-3 pb-2 pt-2">
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
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <FlatList
        data={shown}
        renderItem={({ item }) => <NotificationRow item={item} onPress={openItem} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-5 pb-16 pt-2"
        ListHeaderComponent={Header}
        ListEmptyComponent={
          <Text className="mt-16 text-center text-sm text-muted-foreground">
            Aucune notification pour le moment.
          </Text>
        }
        onEndReached={() => setVisible((v) => Math.min(v + PAGE_SIZE, items.length))}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={feedQ.isFetching} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}
