import { useEffect } from "react";
import { View, type ViewProps } from "react-native";

import { cn } from "@/lib/utils";
import {
  buildPlayerHtml,
  parseVimeo,
  type VimeoMessage,
} from "./vimeo-embed.shared";

// Web (Expo RN-Web) fallback for VimeoEmbed — react-native-webview does not run
// on web, so we render a real <iframe> with the same player HTML via srcDoc.
// The bridge posts to window.parent, which we listen for here, so "resume"
// (startAt) and progress reporting work on web too (best-effort). WIRING_PLAN B4.
type VimeoEmbedProps = ViewProps & {
  vimeoUrl?: string | null;
  videoId?: string;
  title?: string;
  startAt?: number;
  onProgress?: (seconds: number, duration: number) => void;
  onEnded?: () => void;
};

function VimeoEmbed({
  vimeoUrl,
  videoId,
  title,
  startAt = 0,
  onProgress,
  onEnded,
  className,
  ...props
}: VimeoEmbedProps) {
  const ref = parseVimeo(vimeoUrl ?? videoId ?? null);

  useEffect(() => {
    function handler(e: MessageEvent) {
      let msg: VimeoMessage;
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
      {ref && (
        <iframe
          title={title ?? "Vimeo"}
          srcDoc={buildPlayerHtml(ref, startAt)}
          style={{ border: 0, width: "100%", height: "100%" }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )}
    </View>
  );
}

export { VimeoEmbed };
export type { VimeoEmbedProps };
