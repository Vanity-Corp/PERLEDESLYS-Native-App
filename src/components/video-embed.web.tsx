import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { ActivityIndicator, View, type ViewProps } from "react-native";

import { cn } from "@/lib/utils";
import type { ImageRef } from "@/types/content";
import {
  buildPlayerHtml,
  DEFAULT_YOUTUBE_URL,
  parseYouTube,
  type VideoMessage,
} from "./video-embed.shared";

// Web (Expo RN-Web) fallback for VideoEmbed — react-native-webview does not run
// on web, so we render a real <iframe> with the same player HTML via srcDoc.
// The bridge posts to window.parent, which we listen for here, so "resume"
// (startAt) and progress reporting work on web too (best-effort).
type VideoEmbedProps = ViewProps & {
  url?: string | null;
  videoId?: string;
  title?: string;
  startAt?: number;
  autoplay?: boolean;
  onProgress?: (seconds: number, duration: number) => void;
  onEnded?: () => void;
  fullscreen?: boolean;
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function handler(e: MessageEvent) {
      let msg: VideoMessage;
      try {
        msg = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "ready") setReady(true);
      else if (msg.type === "progress") onProgress?.(msg.seconds, msg.duration);
      else if (msg.type === "ended") onEnded?.();
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onProgress, onEnded]);

  return (
    <View
      className={cn(
        fullscreen ? "w-full flex-1 overflow-hidden bg-foreground" : "aspect-video w-full overflow-hidden bg-foreground",
        className
      )}
      {...props}
    >
      <iframe
        title={title ?? "Vidéo"}
        srcDoc={buildPlayerHtml(id, startAt, autoplay)}
        style={{ border: 0, width: "100%", height: "100%" }}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
      {!ready && (
        <View className="pointer-events-none absolute inset-0 items-center justify-center bg-foreground">
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
