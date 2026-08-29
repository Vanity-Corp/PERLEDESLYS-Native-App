import { Image } from "expo-image";
import { Link } from "expo-router";
import { ArrowLeft, Play, Search } from "lucide-react-native";
import { memo, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NetworkError } from "@/components/network-error";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { InfiniteScrollFooter } from "@/components/ui/infinite-scroll-footer";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useCategories,
  useHardRefresh,
  useVideos,
  useVideosInfiniteQuery,
} from "@/lib/content-queries";
import type { Video } from "@/types/content";

// A single video row. Memoized so paging/filtering doesn't re-render every
// row — only rows whose video reference changed (same pattern as recipes'
// `RecipeCard`).
const VideoCard = memo(function VideoCard({ video: v }: { video: Video }) {
  return (
    <Link href={{ pathname: "/app/videos/[videoId]", params: { videoId: v.id } }} asChild>
      <Pressable className="mx-5" style={{ marginBottom: 16 }}>
        <View className="relative aspect-video overflow-hidden rounded-2xl">
          <Image
            source={v.image}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
            accessibilityLabel={v.title}
          />
          <GradientView tone="overlay" className="absolute inset-0" />
          <View className="absolute inset-0 items-center justify-center">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-background/95">
              <Icon as={Play} size={24} className="text-primary" fill="currentColor" />
            </View>
          </View>
          {v.duration ? (
            <View className="absolute bottom-2 right-2 rounded-full bg-background/95 px-2 py-0.5">
              <Text className="text-[10px] font-medium text-foreground">{v.duration}</Text>
            </View>
          ) : null}
          {v.progress ? (
            <Progress value={v.progress} className="absolute inset-x-0 bottom-0" />
          ) : null}
        </View>
        <View className="mt-2">
          <Text className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
            {v.category}
          </Text>
          <Text className="mt-0.5 text-sm font-medium leading-snug text-foreground">{v.title}</Text>
          <Text className="mt-1 text-xs text-muted-foreground" numberOfLines={1}>
            {v.description}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
});

// Web source: kitchen-haven-club/src/routes/app/tutorials/index.tsx
export default function TutorialsScreen() {
  const onRefresh = useHardRefresh([["videos"]]);
  // Category tabs come from the dashboard-managed video categories; fall back
  // to the distinct categories present across all videos (the full,
  // unpaginated array — a separate cached fetch from the page below) when
  // empty, so the tabs are never blank.
  const managedCategories = useCategories("video");
  const allVideos = useVideos();
  const TABS = [
    "Tout",
    ...(managedCategories.length > 0
      ? managedCategories
      : [...new Set(allVideos.map((v) => v.category))]),
  ];
  const [tab, setTab] = useState("Tout");
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q);

  const videosQ = useVideosInfiniteQuery({
    category: tab === "Tout" ? undefined : tab,
    search: debouncedQ || undefined,
  });
  const videos = videosQ.data?.pages.flatMap((p) => p.items) ?? [];

  const Header = (
    <>
      <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
        <Link href="/app" asChild>
          <Pressable className="-ml-2 rounded-full p-2">
            <Icon as={ArrowLeft} size={20} className="text-foreground" />
          </Pressable>
        </Link>
        <View>
          <Text className="font-display text-2xl font-medium tracking-tight text-foreground">Vidéos</Text>
          <Text className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Formations exclusives Thermomix TM7
          </Text>
        </View>
      </View>

      <View className="mt-4 px-5">
        <View className="justify-center ">
          <View className="pointer-events-none absolute left-4 z-10">
            <Icon as={Search} size={16} className="text-muted-foreground" />
          </View>
          <Input
            value={q}
            onChangeText={setQ}
            placeholder="Rechercher une vidéo..."
            className="rounded-2xl py-3.5 pl-11 pr-4  bg-white h-fit"
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-5 pb-1"
        className="mt-4"
      >
        <ToggleGroup type="single" value={tab} onValueChange={(v) => v && setTab(v)}>
          {TABS.map((t) => (
            <ToggleGroupItem
              key={t}
              value={t}
              className="mr-2 h-auto min-w-0 rounded-full border border-border bg-card px-4 py-2"
            >
              <Text className="text-xs font-medium">{t}</Text>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </ScrollView>
    </>
  );

  const Empty = videosQ.isError ? (
    <NetworkError onRetry={() => void videosQ.refetch()} />
  ) : videosQ.isLoading ? (
    <View className="mt-5 gap-4 px-5">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="aspect-video w-full rounded-2xl" />
      ))}
    </View>
  ) : (
    <Text className="mt-10 px-6 text-center text-sm text-muted-foreground">
      Aucune vidéo ne correspond à votre recherche.
    </Text>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <FlatList
        data={videosQ.isLoading || videosQ.isError ? [] : videos}
        renderItem={({ item }) => <VideoCard video={item} />}
        keyExtractor={(v) => v.id}
        contentContainerClassName="pb-16"
        ListHeaderComponent={Header}
        ListFooterComponent={<InfiniteScrollFooter visible={videosQ.isFetchingNextPage} />}
        ListEmptyComponent={Empty}
        onEndReached={() => {
          if (videosQ.hasNextPage && !videosQ.isFetchingNextPage) void videosQ.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={7}
        refreshControl={
          <RefreshControl
            refreshing={videosQ.isFetching && !videosQ.isFetchingNextPage}
            onRefresh={onRefresh}
          />
        }
      />
    </SafeAreaView>
  );
}
