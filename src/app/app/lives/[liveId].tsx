import { Link, useLocalSearchParams } from "expo-router";
import { ArrowLeft, CalendarDays, Clock, Radio } from "lucide-react-native";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/ui/icon";
import { VimeoEmbed } from "@/components/vimeo-embed";
import { useLives } from "@/lib/content-queries";

// Live/replay player (WIRING_PLAN B4). Resolves the live from the shared list
// query and plays its Vimeo link. No resume for lives (they're event streams,
// not resumable lessons).
export default function LiveDetailScreen() {
  const { liveId } = useLocalSearchParams<{ liveId: string }>();
  const lives = useLives();
  const live = lives.find((l) => l.id === liveId);

  if (lives.length === 0 && !live) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }
  if (!live) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Live introuvable.</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        {live.vimeoUrl ? (
          <View className="relative">
            <VimeoEmbed vimeoUrl={live.vimeoUrl} title={live.title} />
            <SafeAreaView
              className="absolute inset-x-0 top-0"
              edges={["top"]}
              pointerEvents="box-none"
            >
              <Link href="/app/lives" asChild>
                <Pressable className="ml-5 mt-5 h-10 w-10 items-center justify-center rounded-full bg-background/95">
                  <Icon as={ArrowLeft} size={20} className="text-foreground" />
                </Pressable>
              </Link>
            </SafeAreaView>
          </View>
        ) : (
          <SafeAreaView edges={["top"]}>
            <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
              <Link href="/app/lives" asChild>
                <Pressable className="-ml-2 rounded-full p-2">
                  <Icon as={ArrowLeft} size={20} className="text-foreground" />
                </Pressable>
              </Link>
            </View>
          </SafeAreaView>
        )}

        <View className="px-5 pb-10 pt-5">
          <Text className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
            {live.status}
          </Text>
          <Text className="mt-1 font-display text-2xl font-medium leading-tight text-foreground">
            {live.title}
          </Text>
          <View className="mt-2 flex-row flex-wrap items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Icon as={CalendarDays} size={12} className="text-muted-foreground" />
              <Text className="text-xs text-muted-foreground">{live.date}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Icon as={Clock} size={12} className="text-muted-foreground" />
              <Text className="text-xs text-muted-foreground">{live.time}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Icon as={Radio} size={12} className="text-muted-foreground" />
              <Text className="text-xs text-muted-foreground">{live.platform}</Text>
            </View>
          </View>
          <Text className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {live.description}
          </Text>
          {!live.vimeoUrl && (
            <View className="mt-5 rounded-2xl border border-border bg-card p-4">
              <Text className="text-sm text-muted-foreground">
                La vidéo de ce live n'est pas encore disponible.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
