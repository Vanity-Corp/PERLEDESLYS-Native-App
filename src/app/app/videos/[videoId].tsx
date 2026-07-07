import Slider from "@react-native-community/slider";
import { Image } from "expo-image";
import { Link, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Clock,
  Download,
  Heart,
  Pause,
  Play,
  RotateCcw,
  Share2,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddNoteButton } from "@/components/add-note-button";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { VimeoEmbed } from "@/components/vimeo-embed";
import { formatSeconds, useFavorites, useHistory } from "@/lib/local-store";
import { FIRST_STEPS_VIDEO_ID, videos } from "@/lib/mock-data";
import { THEME } from "@/constants/theme";

// Web source: kitchen-haven-club/src/routes/app/videos/$videoId.tsx
//
// Task 21 built the simulated player (play/pause, scrubber, clamp/auto-pause)
// and full page content (metadata, actions, similar videos).
// Task 22 wires the player to `useHistory` for cross-session position
// persistence and the "Reprise à X%" resume banner.
// The web's "Favoris" action button has no onClick at all (a disconnected
// mock, same as its Recipe Detail heart used to be) — wired here to the real
// `useFavorites` store (now extended to cover both recipes and videos, see
// `local-store.ts`), matching the precedent Task 19 already set.
// The floating note button (bottom-right, like the web's global NotesFAB
// look) has no web counterpart scoped to a single screen — the web's
// note-taking is a route-detecting global overlay (Task 31, not built).
// Added at the user's direct request to scope note-taking to single-item
// content pages (recipe/video/tips) while keeping the floating-button look.
function parseDuration(duration: string): number {
  const m = duration.match(/(\d+)\s*min/);
  return m ? parseInt(m[1], 10) * 60 : 600;
}

export default function VideoDetailScreen() {
  const { videoId } = useLocalSearchParams<{ videoId: string }>();
  const video = videos.find((v) => v.id === videoId);

  if (!video) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Vidéo introuvable.</Text>
      </SafeAreaView>
    );
  }

  const similar = videos.filter((v) => v.id !== video.id).slice(0, 4);
  const isFirstSteps = video.id === FIRST_STEPS_VIDEO_ID;
  const totalSec = parseDuration(video.duration);

  const { get, upsert } = useHistory();
  const stored = get(video.id, "video");
  const { isFavorite, toggle } = useFavorites();
  const favVideo = isFavorite(video.id, "video");
  const [position, setPosition] = useState(stored?.positionSec ?? 0);
  const [playing, setPlaying] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing || isFirstSteps) return;
    tick.current = setInterval(() => {
      setPosition((p) => {
        const next = Math.min(p + 1, totalSec);
        if (next >= totalSec) setPlaying(false);
        return next;
      });
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [playing, totalSec, isFirstSteps]);

  useEffect(() => {
    if (position === 0 && !stored) return;
    upsert({
      kind: "video",
      id: video.id,
      title: video.title,
      image: video.image,
      category: video.category,
      duration: video.duration,
      positionSec: position,
      totalSec,
      progress: Math.round((position / totalSec) * 100),
      updatedAt: Date.now(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  const progress = Math.round((position / totalSec) * 100);

  return (
    <View className="flex-1 bg-background">
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Player */}
      {isFirstSteps ? (
        <View className="relative aspect-video bg-foreground">
          <VimeoEmbed videoId="1095621493" title={video.title} />
          <SafeAreaView className="absolute inset-x-0 top-0" edges={["top"]}>
            <Link href="/app/tutorials" asChild>
              <Pressable className="ml-5 mt-5 h-10 w-10 items-center justify-center rounded-full bg-background/95">
                <Icon as={ArrowLeft} size={20} className="text-foreground" />
              </Pressable>
            </Link>
          </SafeAreaView>
        </View>
      ) : (
        <View className="relative aspect-video bg-foreground">
          <Image
            source={video.image}
            contentFit="cover"
            style={{ width: "100%", height: "100%", opacity: 0.8 }}
            accessibilityLabel={video.title}
          />
          <GradientView tone="overlay" className="absolute inset-0" />
          <SafeAreaView className="absolute inset-x-0 top-0" edges={["top"]}>
            <View className="flex-row items-center justify-between px-5 pt-5">
              <Link href="/app/tutorials" asChild>
                <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-background/95">
                  <Icon as={ArrowLeft} size={20} className="text-foreground" />
                </Pressable>
              </Link>
              <View className="rounded-full bg-background/95 px-3 py-1.5">
                <Text className="text-[10px] font-medium text-foreground">Lecteur privé</Text>
              </View>
            </View>
          </SafeAreaView>
          <View className="absolute inset-0 items-center justify-center">
            <Pressable
              onPress={() => setPlaying((p) => !p)}
              className="h-16 w-16 items-center justify-center rounded-full"
            >
              <GradientView tone="luxe" className="h-16 w-16 items-center justify-center rounded-full">
                <Icon
                  as={playing ? Pause : Play}
                  size={28}
                  className="text-primary-foreground"
                  fill="currentColor"
                />
              </GradientView>
            </Pressable>
          </View>
          <View className="absolute bottom-3 left-4 right-4">
            <Slider
              minimumValue={0}
              maximumValue={totalSec}
              value={position}
              onValueChange={(v) => setPosition(Math.round(v))}
              minimumTrackTintColor={THEME.light.primary}
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbTintColor={THEME.light.primary}
              accessibilityLabel="Position"
            />
            <View className="mt-1 flex-row justify-between">
              <Text className="text-[10px] font-medium text-primary-foreground">
                {formatSeconds(position)}
              </Text>
              <Text className="text-[10px] font-medium text-primary-foreground">{video.duration}</Text>
            </View>
          </View>
        </View>
      )}

      <View className="px-5 pb-8 pt-5">
        <Text className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
          {video.category}
        </Text>
        <Text className="mt-1 font-display text-2xl font-medium leading-tight text-foreground">
          {video.title}
        </Text>
        <View className="mt-2 flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Icon as={Clock} size={12} className="text-muted-foreground" />
            <Text className="text-xs text-muted-foreground">{video.duration}</Text>
          </View>
          <Text className="text-xs text-muted-foreground">·</Text>
          <Text className="text-xs text-muted-foreground">HD 1080p</Text>
        </View>

        {stored && stored.positionSec > 5 && !isFirstSteps && (
          <View className="mt-3 flex-row items-center gap-2 rounded-xl bg-secondary p-3">
            <Icon as={RotateCcw} size={14} className="text-primary" />
            <Text className="flex-1 text-xs text-foreground">
              Reprise à <Text className="font-semibold">{formatSeconds(stored.positionSec)}</Text> (
              {progress}%)
            </Text>
            <Pressable onPress={() => setPosition(0)}>
              <Text className="text-xs font-medium text-primary">Recommencer</Text>
            </Pressable>
          </View>
        )}

        <Text className="mt-4 text-sm leading-relaxed text-muted-foreground">{video.description}</Text>

        <View className="mt-5 flex-row gap-2">
          <ActionBtn icon={<Icon as={Download} size={16} className="text-primary" />} label="Guide PDF" />
          <ActionBtn
            icon={
              <Icon
                as={Heart}
                size={16}
                className="text-primary"
                fill={favVideo ? "currentColor" : "none"}
              />
            }
            label="Favoris"
            onPress={() => toggle(video.id, "video")}
          />
          <ActionBtn icon={<Icon as={Share2} size={16} className="text-primary" />} label="Partager" />
        </View>

        <Text className="mb-3 mt-8 font-display text-lg font-semibold text-foreground">Vidéos similaires</Text>
        <View className="gap-3">
          {similar.map((v) => (
            <Link key={v.id} href={{ pathname: "/app/videos/[videoId]", params: { videoId: v.id } }} asChild>
              <Pressable className="flex-row gap-3 rounded-2xl border border-border bg-card p-2">
                <View className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    source={v.image}
                    contentFit="cover"
                    style={{ width: "100%", height: "100%" }}
                    accessibilityLabel={v.title}
                  />
                  <GradientView tone="overlay" className="absolute inset-0" />
                  <View className="absolute inset-0 items-center justify-center">
                    <Icon as={Play} size={20} className="text-primary-foreground" fill="currentColor" />
                  </View>
                </View>
                <View className="min-w-0 flex-1 py-1">
                  <Text className="text-[10px] font-medium uppercase tracking-wider text-primary">
                    {v.category}
                  </Text>
                  <Text className="mt-0.5 text-sm font-medium leading-snug text-foreground" numberOfLines={2}>
                    {v.title}
                  </Text>
                  <Text className="mt-1 text-[10px] text-muted-foreground">{v.duration}</Text>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>
    </ScrollView>
    <AddNoteButton
      contextLabel={`Vidéo : ${video.title}`}
      contextHref={`/app/videos/${video.id}`}
    />
    </View>
  );
}

function ActionBtn({
  icon,
  label,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      role="button"
      onPress={onPress}
      className="flex-1 items-center gap-1 rounded-2xl border border-border bg-card py-3"
    >
      {icon}
      <Text className="text-[10px] font-medium text-foreground">{label}</Text>
    </Pressable>
  );
}
