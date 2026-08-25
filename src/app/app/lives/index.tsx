import { Image } from "expo-image";
import { Link } from "expo-router";
import { ArrowLeft, Bell, Calendar, Clock, PlayCircle, Radio } from "lucide-react-native";
import { memo, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NetworkError } from "@/components/network-error";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text as TabLabel } from "@/components/ui/text";
import { addToCalendar, parseEventDate } from "@/lib/calendar";
import { useHardRefresh, useLivesPageQuery } from "@/lib/content-queries";
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
  // Each tab keeps its own page — switching tabs doesn't reset the other's.
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [replaysPage, setReplaysPage] = useState(1);

  const upcomingQ = useLivesPageQuery({ page: upcomingPage, status: "À venir" });
  const replaysQ = useLivesPageQuery({ page: replaysPage, status: "Replay" });
  const next = upcomingQ.data?.items[0];

  const activeQ = tab === "upcoming" ? upcomingQ : replaysQ;
  const activePage = tab === "upcoming" ? upcomingPage : replaysPage;
  const setActivePage = tab === "upcoming" ? setUpcomingPage : setReplaysPage;
  const items = activeQ.data?.items ?? [];
  const totalPages = activeQ.data?.totalPages ?? 1;

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

      {upcomingQ.isLoading ? (
        <View className="mx-5 mt-5">
          <Skeleton className="h-56 w-full rounded-3xl" />
        </View>
      ) : upcomingQ.isError ? (
        <NetworkError onRetry={() => void upcomingQ.refetch()} />
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

      <Tabs value={tab} onValueChange={(v) => setTab(v as "upcoming" | "replays")} className="mx-5 mt-6">
        <TabsList className="w-full flex-row rounded-2xl bg-secondary/60 p-1">
          <TabsTrigger value="upcoming" className="flex-1 rounded-xl ">
            <TabLabel className="text-xs font-medium">
              À venir ({upcomingQ.data?.total ?? 0})
            </TabLabel>
          </TabsTrigger>
          <TabsTrigger value="replays" className="flex-1 rounded-xl ">
            <TabLabel className="text-xs font-medium">
              Replays ({replaysQ.data?.total ?? 0})
            </TabLabel>
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
        ListFooterComponent={
          <Pagination page={activePage} totalPages={totalPages} onPageChange={setActivePage} />
        }
        ListEmptyComponent={Empty}
        showsVerticalScrollIndicator={false}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={7}
        refreshControl={
          <RefreshControl
            refreshing={upcomingQ.isFetching || replaysQ.isFetching}
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
