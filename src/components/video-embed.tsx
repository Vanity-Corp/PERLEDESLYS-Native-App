import { useCallback, useEffect, useRef, useState } from "react";
import { View, type LayoutChangeEvent, type ViewProps } from "react-native";
import YoutubePlayer, { type YoutubeIframeRef } from "react-native-youtube-iframe";

import { cn } from "@/lib/utils";
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
};

function VideoEmbed({
  url,
  videoId,
  title,
  startAt = 0,
  autoplay = false,
  onProgress,
  onEnded,
  className,
  ...props
}: VideoEmbedProps) {
  const id =
    parseYouTube(url ?? videoId ?? null) ?? parseYouTube(DEFAULT_YOUTUBE_URL)!;

  const playerRef = useRef<YoutubeIframeRef>(null);
  const [width, setWidth] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const height = Math.round((width * 9) / 16);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && w !== width) setWidth(w);
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
      className={cn("aspect-video w-full overflow-hidden bg-foreground", className)}
      onLayout={onLayout}
      accessibilityLabel={title}
      {...props}
    >
      {width > 0 && (
        <YoutubePlayer
          ref={playerRef}
          height={height}
          width={width}
          videoId={id}
          play={playing}
          onChangeState={onChangeState}
          initialPlayerParams={{
            start: Math.max(0, Math.floor(startAt)),
            rel: false,
            modestbranding: true,
          }}
          webViewProps={{ allowsInlineMediaPlayback: true }}
          webViewStyle={{ backgroundColor: "transparent" }}
        />
      )}
    </View>
  );
}

export { VideoEmbed };
export type { VideoEmbedProps };
