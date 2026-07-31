import { Image } from "expo-image";
import { Link, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Clock,
  Download,
  Heart,
  Maximize2,
  Play,
  RotateCcw,
  Share2,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddNoteButton } from "@/components/add-note-button";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { VideoEmbed } from "@/components/video-embed";
import { youTubeWatchUrl } from "@/components/video-embed.shared";
import { useVideo, useVideos } from "@/lib/content-queries";
import { formatSeconds, useFavorites, useHistory } from "@/lib/local-store";
import type { Video } from "@/types/content";

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
export default function VideoDetailScreen() {
  const { videoId } = useLocalSearchParams<{ videoId: string }>();
  const { data: video, isLoading, isFetching, refetch } = useVideo(videoId);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!video) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Vidéo introuvable.</Text>
      </SafeAreaView>
    );
  }

  return (
    <VideoDetail
      video={video}
      refreshing={isFetching}
      onRefresh={() => refetch()}
    />
  );
}

// Split out so the player only mounts once the video is loaded — its position
// state initialises from stored history at mount, which requires the video to
// be present (async fetch would otherwise init to 0 and lose the resume point).
function VideoDetail({
  video,
  refreshing,
  onRefresh,
}: {
  video: Video;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const videos = useVideos();
  const similar = videos.filter((v) => v.id !== video.id).slice(0, 4);

  const { get, upsert } = useHistory();
  const stored = get(video.id, "video");
  const { isFavorite, toggle } = useFavorites();
  const favVideo = isFavorite(video.id, "video");

  // Resume: the Vimeo player seeks to `startAt` on mount (the stored position);
  // it reports playback progress via onProgress, which we persist (throttled)
  // to local history. "Recommencer" remounts the player at 0 (playerKey bump).
  const [startAt, setStartAt] = useState(stored?.positionSec ?? 0);
  const [playerKey, setPlayerKey] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showResume, setShowResume] = useState((stored?.positionSec ?? 0) > 5);
  const progressRef = useRef({
    sec: stored?.positionSec ?? 0,
    dur: stored?.totalSec ?? 0,
  });

  const persist = useCallback(() => {
    const { sec, dur } = progressRef.current;
    if (sec <= 0 || dur <= 0) return;
    upsert({
      kind: "video",
      id: video.id,
      title: video.title,
      image: video.image,
      category: video.category,
      duration: video.duration,
      positionSec: Math.round(sec),
      totalSec: Math.round(dur),
      progress: Math.round((sec / dur) * 100),
      updatedAt: Date.now(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.id]);

  // Save periodically while watching + once on unmount.
  useEffect(() => {
    const iv = setInterval(persist, 5000);
    return () => {
      clearInterval(iv);
      persist();
    };
  }, [persist]);

  const onProgress = (sec: number, dur: number) => {
    progressRef.current = { sec, dur };
  };

  const restart = () => {
    progressRef.current = { sec: 0, dur: progressRef.current.dur };
    setStartAt(0);
    setShowResume(false);
    setPlaying(true);
    setPlayerKey((k) => k + 1);
  };

  const resumePct =
    stored && stored.totalSec > 0
      ? Math.round((stored.positionSec / stored.totalSec) * 100)
      : 0;
  const watchUrl = youTubeWatchUrl(video.vimeoUrl);

  return (
    <View className="flex-1 bg-background">
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Player. Keeps the poster + custom luxe play button (the original
          wrapper design); tapping play reveals the real Vimeo embed, which
          seeks to the stored resume position and reports progress (B4). */}
      {playing ? (
        <View className="relative">
          <VideoEmbed
            key={playerKey}
            url={video.vimeoUrl}
            title={video.title}
            startAt={startAt}
            autoplay
            onProgress={onProgress}
          />
          <SafeAreaView
            className="absolute inset-x-0 top-0"
            edges={["top"]}
            pointerEvents="box-none"
          >
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
              onPress={() => setPlaying(true)}
              accessibilityRole="button"
              accessibilityLabel="Lire la vidéo"
              className="h-16 w-16 items-center justify-center rounded-full"
            >
              <GradientView tone="luxe" className="h-16 w-16 items-center justify-center rounded-full">
                <Icon as={Play} size={28} className="text-primary-foreground" fill="currentColor" />
              </GradientView>
            </Pressable>
          </View>
        </View>
      )}

      {/* Fullscreen is unreliable inside the in-app player, so offer a reliable
          path: open the video on YouTube. */}
      {watchUrl && (
        <Pressable
          onPress={() => Linking.openURL(watchUrl)}
          className="mx-5 mt-4 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3"
        >
          <Icon as={Maximize2} size={16} className="text-primary" />
          <Text className="text-sm font-medium text-foreground">
            Regarder la vidéo en plein écran sur YouTube
          </Text>
        </Pressable>
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

        {showResume && stored && (
          <View className="mt-3 flex-row items-center gap-2 rounded-xl bg-secondary p-3">
            <Icon as={RotateCcw} size={14} className="text-primary" />
            <Text className="flex-1 text-xs text-foreground">
              Reprise à <Text className="font-semibold">{formatSeconds(stored.positionSec)}</Text> (
              {resumePct}%)
            </Text>
            <Pressable onPress={restart}>
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
