import { Image } from "expo-image";
import { Link } from "expo-router";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  History as HistoryIcon,
  Play,
  Trash2,
} from "lucide-react-native";
import { memo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { formatSeconds, useHistory } from "@/lib/local-store";
import type { HistoryEntry } from "@/types/local-store";

// Web source: kitchen-haven-club/src/routes/app/history/index.tsx
//
// The web's history only ever covers videos — recipe view-history (and the
// resulting per-row branching below) has no web counterpart, added at the
// user's direct request so viewed recipes show up here too, see
// `local-store.ts`'s own notes on the `HistoryEntry` union.

// The store itself hard-caps history at 50 entries (local-store.ts), so this
// is purely a rendering-cost control, not real pagination.
const PAGE_SIZE = 20;

const HistoryRow = memo(function HistoryRow({
  entry: h,
  onRemove,
}: {
  entry: HistoryEntry;
  onRemove: () => void;
}) {
  const href =
    h.kind === "video"
      ? ({ pathname: "/app/videos/[videoId]", params: { videoId: h.id } } as const)
      : ({ pathname: "/app/recipes/[recipeId]", params: { recipeId: h.id } } as const);

  return (
    <View className="mx-5 mb-3 overflow-hidden rounded-2xl border border-border bg-card">
      <Link href={href} asChild>
        <Pressable className="flex-row gap-3 p-2">
          <View className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
            <Image
              source={h.image}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
              accessibilityLabel={h.title}
            />
            <GradientView tone="overlay" className="absolute inset-0" />
            <View className="absolute inset-0 items-center justify-center">
              <Icon
                as={h.kind === "video" ? Play : BookOpen}
                size={20}
                className="text-primary-foreground"
                fill={h.kind === "video" ? "currentColor" : "none"}
              />
            </View>
            {h.kind === "video" && (
              <Progress value={h.progress} className="absolute inset-x-0 bottom-0 h-1" />
            )}
          </View>
          <View className="min-w-0 flex-1 py-1">
            <Text className="text-[10px] font-medium uppercase tracking-wider text-primary">
              {h.category}
            </Text>
            <Text className="mt-0.5 text-sm font-medium leading-snug text-foreground" numberOfLines={2}>
              {h.title}
            </Text>
            <View className="mt-1 flex-row items-center gap-1">
              <Icon as={Clock} size={12} className="text-muted-foreground" />
              <Text className="text-[11px] text-muted-foreground">
                {h.kind === "video"
                  ? `Reprendre à ${formatSeconds(h.positionSec)} / ${h.duration}`
                  : h.time}
              </Text>
            </View>
          </View>
        </Pressable>
      </Link>
      <Pressable
        onPress={onRemove}
        className="flex-row items-center justify-center gap-1 border-t border-border py-2"
      >
        <Icon as={Trash2} size={12} className="text-muted-foreground" />
        <Text className="text-[11px] text-muted-foreground">Retirer de l'historique</Text>
      </Pressable>
    </View>
  );
});

export default function HistoryScreen() {
  const { history, clear, remove } = useHistory();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = history.slice(0, visible);

  const Header = (
    <View className="flex-row items-center gap-3 px-5 pb-2 pt-6">
      <Link href="/app/profile" asChild>
        <Pressable className="-ml-2 rounded-full p-2">
          <Icon as={ArrowLeft} size={20} className="text-foreground" />
        </Pressable>
      </Link>
      <View className="flex-1">
        <Text className="font-display text-2xl font-medium tracking-tight text-foreground">
          Historique
        </Text>
        <Text className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Vos vidéos et recettes récentes
        </Text>
      </View>
      {history.length > 0 && (
        <Pressable onPress={clear} className="flex-row items-center gap-1">
          <Icon as={Trash2} size={12} className="text-destructive" />
          <Text className="text-[11px] text-destructive">Vider</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <FlatList
        data={shown}
        renderItem={({ item }) => (
          <HistoryRow entry={item} onRemove={() => remove(item.id, item.kind)} />
        )}
        keyExtractor={(h) => `${h.kind}-${h.id}`}
        contentContainerClassName="pb-16 pt-4"
        ListHeaderComponent={Header}
        ListEmptyComponent={
          <View className="mx-5 mt-6 items-center rounded-3xl border border-border bg-card p-10">
            <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-secondary">
              <Icon as={HistoryIcon} size={24} className="text-primary" />
            </View>
            <Text className="font-display text-lg text-foreground">Aucune activité récente</Text>
            <Text className="mt-1 text-center text-sm text-muted-foreground">
              Vos vidéos et recettes consultées s'afficheront ici.
            </Text>
          </View>
        }
        onEndReached={() => setVisible((v) => Math.min(v + PAGE_SIZE, history.length))}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
