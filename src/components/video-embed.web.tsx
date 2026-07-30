import { useEffect } from "react";
import { View, type ViewProps } from "react-native";

import { cn } from "@/lib/utils";
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

  useEffect(() => {
    function handler(e: MessageEvent) {
      let msg: VideoMessage;
      try {
        msg = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "progress") onProgress?.(msg.seconds, msg.duration);
      else if (msg.type === "ended") onEnded?.();
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onProgress, onEnded]);

  return (
    <View
      className={cn("aspect-video w-full overflow-hidden bg-foreground", className)}
      {...props}
    >
      <iframe
        title={title ?? "Vidéo"}
        srcDoc={buildPlayerHtml(id, startAt, autoplay)}
        style={{ border: 0, width: "100%", height: "100%" }}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </View>
  );
}

export { VideoEmbed };
export type { VideoEmbedProps };
