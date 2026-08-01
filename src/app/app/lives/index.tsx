import { Image } from "expo-image";
import { Link } from "expo-router";
import { ArrowLeft, Bell, Calendar, Clock, PlayCircle, Radio } from "lucide-react-native";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NetworkError } from "@/components/network-error";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addToCalendar, parseEventDate } from "@/lib/calendar";
import { useLivesQuery } from "@/lib/content-queries";
import type { Live } from "@/types/content";

// Web source: kitchen-haven-club/src/routes/app/lives/index.tsx
export default function LivesScreen() {
  const livesQ = useLivesQuery();
  const lives = livesQ.data ?? [];
  const [tab, setTab] = useState<"upcoming" | "replays">("upcoming");
  const upcoming = lives.filter((l) => l.status === "À venir");
  const replays = lives.filter((l) => l.status === "Replay");
  const next = upcoming[0];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={livesQ.isFetching}
            onRefresh={() => livesQ.refetch()}
          />
        }
      >
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

        {livesQ.isError ? (
          <NetworkError onRetry={() => void livesQ.refetch()} />
        ) : livesQ.isLoading ? (
          <View className="mt-5 gap-3 px-5">
            <Skeleton className="h-56 w-full rounded-3xl" />
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </View>
        ) : (
        <>
        {next && (
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
                  {/* Join the live (Vimeo player) + "Me rappeler" adds it to the
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
        )}

        <Tabs value={tab} onValueChange={(v) => setTab(v as "upcoming" | "replays")} className="mx-5 mt-6">
          <TabsList className="w-full flex-row rounded-2xl bg-secondary/60 p-1">
            <TabsTrigger value="upcoming" className="flex-1 rounded-xl ">
              <Text className="text-xs font-medium">À venir ({upcoming.length})</Text>
            </TabsTrigger>
            <TabsTrigger value="replays" className="flex-1 rounded-xl ">
              <Text className="text-xs font-medium">Replays ({replays.length})</Text>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-5 gap-3">
            {upcoming.map((l) => (
              <LiveRow key={l.id} live={l} />
            ))}
          </TabsContent>
          <TabsContent value="replays" className="mt-5 gap-3">
            {replays.map((l) => (
              <LiveRow key={l.id} live={l} />
            ))}
          </TabsContent>
        </Tabs>
        </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LiveRow({ live }: { live: Live }) {
  return (
    <Link
      href={{ pathname: "/app/lives/[liveId]", params: { liveId: live.id } }}
      asChild
    >
      <Pressable className="mx-5 flex-row gap-3 rounded-2xl border border-border bg-card p-3">
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
}
