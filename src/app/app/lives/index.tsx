import { Image } from "expo-image";
import { Link } from "expo-router";
import { ArrowLeft, Bell, Calendar, Clock, PlayCircle, Radio, Search } from "lucide-react-native";
import { memo, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NetworkError } from "@/components/network-error";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { InfiniteScrollFooter } from "@/components/ui/infinite-scroll-footer";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text as TabLabel } from "@/components/ui/text";
import { useDebounce } from "@/hooks/use-debounce";
import { addToCalendar, parseEventDate } from "@/lib/calendar";
import { useHardRefresh, useLivesInfiniteQuery } from "@/lib/content-queries";
import type { Live } from "@/types/content";

// Web source: kitchen-haven-club/src/routes/app/lives/index.tsx
//
// The upcoming/replays switcher used to be a `Tabs`/`TabsContent` pair with
// both lists rendered inline inside one page-level `ScrollView`. Paginating
// each list means each one needs to become its own `FlatList` — but a
// `FlatList` (VirtualizedList) can't be nested inside a `ScrollView` of the
// same orientation (an RN anti-pattern that breaks scrolling/virtualization).
// So this screen is now built around a single top-level `FlatList` instead:
// the hero card + the `Tabs`/`TabsList` switcher (trigger pills only, no
// `TabsContent`) are its `ListHeaderComponent`, and `data` is whichever tab's
// current page is active — switching tabs just swaps which already-fetched
// page feeds the same list.
export default function LivesScreen() {
  const onRefresh = useHardRefresh([["lives"]]);
  const [tab, setTab] = useState<"upcoming" | "replays">("upcoming");
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q);
  const search = debouncedQ || undefined;

  // Each tab keeps its own cursor chain — switching tabs doesn't reset the
  // other's, and a search term change resets both via their query keys.
  const upcomingQ = useLivesInfiniteQuery({ status: "À venir", search });
  const replaysQ = useLivesInfiniteQuery({ status: "Replay", search });
  // The hero "Prochain live" card always shows the true next upcoming live,
  // independent of the search box — a separate, unfiltered query so typing a
  // search term can't hide or swap out the banner.
  const nextLiveQ = useLivesInfiniteQuery({ status: "À venir" });
  const next = nextLiveQ.data?.pages[0]?.items[0];

  const activeQ = tab === "upcoming" ? upcomingQ : replaysQ;
  const items = activeQ.data?.pages.flatMap((p) => p.items) ?? [];
  const upcomingTotal = upcomingQ.data?.pages[0]?.total ?? 0;
  const replaysTotal = replaysQ.data?.pages[0]?.total ?? 0;

  const Header = (
    <>
      <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
        <Link href="/app" asChild>
          <Pressable className="-ml-2 rounded-full p-2">
            <Icon as={ArrowLeft} size={20} className="text-foreground" />
          </Pressable>
        </Link>
        <View>
          <Text className="font-display text-2xl font-medium tracking-tight text-foreground">
            Lives privés
          </Text>
          <Text className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Rendez-vous exclusifs avec Ghania
          </Text>
        </View>
      </View>

      {nextLiveQ.isLoading ? (
        <View className="mx-5 mt-5">
          <Skeleton className="h-56 w-full rounded-3xl" />
        </View>
      ) : nextLiveQ.isError ? (
        <NetworkError onRetry={() => void nextLiveQ.refetch()} />
      ) : next ? (
        <View className="relative mx-5 mt-5 overflow-hidden rounded-3xl">
          <Image
            source={next.image}
            contentFit="cover"
            style={{ width: "100%", height: 224 }}
            accessibilityLabel={next.title}
          />
          <GradientView tone="roseOverlay" className="absolute inset-0" />
          <View className="absolute inset-0 flex-col justify-between p-5">
            <View className="flex-row items-center gap-1.5 self-start rounded-full bg-background/95 px-2.5 py-1">
              <Icon as={Radio} size={12} className="text-primary" />
              <Text className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
                Prochain live
              </Text>
            </View>
            <View>
              <Text className="font-display text-2xl leading-tight text-primary-foreground">
                {next.title}
              </Text>
              <Text className="mt-1.5 text-xs text-primary-foreground opacity-90">{next.description}</Text>
              <View className="mt-3 flex-row items-center gap-3">
                <View className="flex-row items-center gap-1">
                  <Icon as={Calendar} size={12} className="text-primary-foreground" />
                  <Text className="text-[11px] text-primary-foreground opacity-95">{next.date}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Icon as={Clock} size={12} className="text-primary-foreground" />
                  <Text className="text-[11px] text-primary-foreground opacity-95">{next.time}</Text>
                </View>
              </View>
              <View className="mt-4 flex-row gap-2">
                {/* Join the live (YouTube player) + "Me rappeler" adds it to the
                    device calendar, pre-filled. */}
                <Link
                  href={{ pathname: "/app/lives/[liveId]", params: { liveId: next.id } }}
                  asChild
                >
                  <Pressable
                    role="button"
                    className="flex-row items-center gap-1.5 rounded-full bg-background px-4 py-2"
                  >
                    <Icon as={PlayCircle} size={16} className="text-foreground" />
                    <Text className="text-xs font-semibold text-foreground">Rejoindre le live</Text>
                  </Pressable>
                </Link>
                <Pressable
                  role="button"
                  onPress={() => {
                    const start = parseEventDate(next.date, next.time);
                    if (!start) return;
                    void addToCalendar({
                      title: `Perledeslys - ${next.title}`,
                      start,
                      notes: next.description ?? undefined,
                    });
                  }}
                  className="flex-row items-center gap-1.5 rounded-full border border-background/30 bg-background/20 px-4 py-2"
                >
                  <Icon as={Bell} size={16} className="text-primary-foreground" />
                  <Text className="text-xs font-medium text-primary-foreground">Me rappeler</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      ) : null}

      <View className="mx-5 mt-6">
        <View className="justify-center ">
          <View className="pointer-events-none absolute left-4 z-10">
            <Icon as={Search} size={16} className="text-muted-foreground" />
          </View>
          <Input
            value={q}
            onChangeText={setQ}
            placeholder="Rechercher un live..."
            className="rounded-2xl py-3.5 pl-11 pr-4  bg-white h-fit"
          />
        </View>
      </View>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "upcoming" | "replays")} className="mx-5 mt-4">
        <TabsList className="w-full flex-row rounded-2xl bg-secondary/60 p-1">
          <TabsTrigger value="upcoming" className="flex-1 rounded-xl ">
            <TabLabel className="text-xs font-medium">À venir ({upcomingTotal})</TabLabel>
          </TabsTrigger>
          <TabsTrigger value="replays" className="flex-1 rounded-xl ">
            <TabLabel className="text-xs font-medium">Replays ({replaysTotal})</TabLabel>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <View className="mt-5" />
    </>
  );

  const Empty = activeQ.isError ? (
    <NetworkError onRetry={() => void activeQ.refetch()} />
  ) : activeQ.isLoading ? (
    <View className="gap-3 px-5">
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
      ))}
    </View>
  ) : search ? (
    <Text className="mt-10 px-6 text-center text-sm text-muted-foreground">
      Aucun résultat pour votre recherche.
    </Text>
  ) : (
    <Text className="mt-10 px-6 text-center text-sm text-muted-foreground">
      {tab === "upcoming" ? "Aucun live à venir." : "Aucun replay pour le moment."}
    </Text>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <FlatList
        // Keying on `tab` resets scroll position when switching lists, since
        // upcoming/replays are otherwise unrelated datasets.
        key={tab}
        data={activeQ.isLoading || activeQ.isError ? [] : items}
        renderItem={({ item }) => <LiveRow live={item} />}
        keyExtractor={(l) => l.id}
        contentContainerClassName="pb-16"
        ListHeaderComponent={Header}
        ListFooterComponent={<InfiniteScrollFooter visible={activeQ.isFetchingNextPage} />}
        ListEmptyComponent={Empty}
        onEndReached={() => {
          if (activeQ.hasNextPage && !activeQ.isFetchingNextPage) void activeQ.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={7}
        refreshControl={
          <RefreshControl
            refreshing={
              (upcomingQ.isFetching && !upcomingQ.isFetchingNextPage) ||
              (replaysQ.isFetching && !replaysQ.isFetchingNextPage)
            }
            onRefresh={onRefresh}
          />
        }
      />
    </SafeAreaView>
  );
}

const LiveRow = memo(function LiveRow({ live }: { live: Live }) {
  return (
    <Link
      href={{ pathname: "/app/lives/[liveId]", params: { liveId: live.id } }}
      asChild
    >
      <Pressable className="mx-5 mb-3 flex-row gap-3 rounded-2xl border border-border bg-card p-3">
      <View className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
        <Image
          source={live.image}
          contentFit="cover"
          style={{ width: "100%", height: "100%" }}
          accessibilityLabel={live.title}
        />
        <GradientView tone="overlay" className="absolute inset-0" />
        {live.status === "Replay" && (
          <View className="absolute inset-0 items-center justify-center">
            <Icon as={PlayCircle} size={28} className="text-primary-foreground" fill="currentColor" />
          </View>
        )}
      </View>
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-1.5">
          {live.status === "Replay" ? (
            <View className="rounded-full bg-secondary px-2 py-0.5">
              <Text className="text-[9px] font-semibold uppercase tracking-wider text-foreground">
                {live.status}
              </Text>
            </View>
          ) : (
            <GradientView tone="luxe" className="rounded-full px-2 py-0.5">
              <Text className="text-[9px] font-semibold uppercase tracking-wider text-primary-foreground">
                {live.status}
              </Text>
            </GradientView>
          )}
          <Text className="text-[10px] text-muted-foreground">{live.platform}</Text>
        </View>
        <Text className="mt-1.5 text-sm font-medium leading-snug text-foreground" numberOfLines={2}>
          {live.title}
        </Text>
        <View className="mt-1.5 flex-row items-center gap-2">
          <Icon as={Calendar} size={12} className="text-muted-foreground" />
          <Text className="text-[10px] text-muted-foreground">{live.date}</Text>
          <Text className="text-[10px] text-muted-foreground">·</Text>
          <Icon as={Clock} size={12} className="text-muted-foreground" />
          <Text className="text-[10px] text-muted-foreground">{live.time}</Text>
        </View>
      </View>
      </Pressable>
    </Link>
  );
});
