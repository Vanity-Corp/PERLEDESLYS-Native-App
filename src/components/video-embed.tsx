import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, View, type LayoutChangeEvent, type ViewProps } from "react-native";
import YoutubePlayer, { type YoutubeIframeRef } from "react-native-youtube-iframe";

import { cn } from "@/lib/utils";
import type { ImageRef } from "@/types/content";
import { DEFAULT_YOUTUBE_URL, parseYouTube } from "./video-embed.shared";

// Native (iOS/Android) YouTube player using react-native-youtube-iframe (pure
// JS over react-native-webview). We measure the container width and render the
// player at an exact 16:9 height so it always fits its frame. The web build
// uses video-embed.web.tsx (an <iframe>) — Metro resolves the platform file.
//
// Accepts a `url` (from content, historically named vimeoUrl) or a bare id.
// Falls back to the default video when the url is empty/unparseable.
type VideoEmbedProps = ViewProps & {
  url?: string | null;
  videoId?: string;
  title?: string;
  startAt?: number;
  autoplay?: boolean;
  onProgress?: (seconds: number, duration: number) => void;
  onEnded?: () => void;
  // Fills its container's full measured height instead of forcing 16:9 — for
  // VideoFullscreenModal, where the container is the whole (landscape) screen.
  fullscreen?: boolean;
  // Shown in place of the YouTube WebView's own blank loading state — the
  // embed has to spin up a whole WebView + load youtube.com before it can
  // paint anything, which otherwise reads as a stuck black box.
  posterUri?: ImageRef | null;
};

function VideoEmbed({
  url,
  videoId,
  title,
  startAt = 0,
  autoplay = false,
  onProgress,
  onEnded,
  fullscreen = false,
  posterUri,
  className,
  ...props
}: VideoEmbedProps) {
  const id =
    parseYouTube(url ?? videoId ?? null) ?? parseYouTube(DEFAULT_YOUTUBE_URL)!;

  const playerRef = useRef<YoutubeIframeRef>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [playing, setPlaying] = useState(autoplay);
  const [ready, setReady] = useState(false);
  const width = size.width;
  const height = fullscreen ? size.height : Math.round((width * 9) / 16);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setSize((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
  };

  // Poll the player for playback position while it's playing (drives the
  // "resume" feature on the video detail screen).
  useEffect(() => {
    if (!onProgress || !playing) return;
    const iv = setInterval(async () => {
      try {
        const [sec, dur] = await Promise.all([
          playerRef.current?.getCurrentTime(),
          playerRef.current?.getDuration(),
        ]);
        if (typeof sec === "number" && typeof dur === "number" && dur > 0) {
          onProgress(sec, dur);
        }
      } catch {
        // ignore transient bridge errors
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [onProgress, playing]);

  const onChangeState = useCallback(
    (state: string) => {
      if (state === "playing") setPlaying(true);
      else if (state === "paused") setPlaying(false);
      else if (state === "ended") onEnded?.();
    },
    [onEnded],
  );

  return (
    <View
      className={cn(
        fullscreen ? "w-full flex-1 overflow-hidden bg-foreground" : "aspect-video w-full overflow-hidden bg-foreground",
        className
      )}
      onLayout={onLayout}
      accessibilityLabel={title}
      {...props}
    >
      {width > 0 && height > 0 && (
        <YoutubePlayer
          ref={playerRef}
          height={height}
          width={width}
          videoId={id}
          play={playing}
          onReady={() => setReady(true)}
          onChangeState={onChangeState}
          initialPlayerParams={{
            start: Math.max(0, Math.floor(startAt)),
            rel: false,
            modestbranding: true,
          }}
          webViewProps={{ allowsInlineMediaPlayback: true, allowsFullscreenVideo: true }}
          webViewStyle={{ backgroundColor: "transparent" }}
        />
      )}
      {!ready && (
        <View className="absolute inset-0 items-center justify-center bg-foreground">
          {posterUri && (
            <Image
              source={posterUri}
              contentFit="cover"
              style={{ position: "absolute", inset: 0, opacity: 0.8 }}
            />
          )}
          <ActivityIndicator color="#fff" />
        </View>
      )}
    </View>
  );
}

export { VideoEmbed };
export type { VideoEmbedProps };
