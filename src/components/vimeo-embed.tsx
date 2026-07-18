import { useCallback } from "react";
import { View, type ViewProps } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { cn } from "@/lib/utils";
import {
  buildPlayerHtml,
  parseVimeo,
  type VimeoMessage,
} from "./vimeo-embed.shared";

// Native (iOS/Android) Vimeo player. Loads a small HTML page driving the Vimeo
// Player SDK (see vimeo-embed.shared) so we can seek to `startAt` and report
// playback position back for the "resume" feature (WIRING_PLAN B4). The web
// build uses vimeo-embed.web.tsx (an <iframe>) — Metro resolves the platform
// file automatically.
//
// Accepts either a `vimeoUrl` (preferred, from content) or a bare `videoId`.
type VimeoEmbedProps = ViewProps & {
  vimeoUrl?: string | null;
  videoId?: string;
  title?: string;
  startAt?: number;
  autoplay?: boolean;
  onProgress?: (seconds: number, duration: number) => void;
  onEnded?: () => void;
};

function VimeoEmbed({
  vimeoUrl,
  videoId,
  title,
  startAt = 0,
  autoplay = false,
  onProgress,
  onEnded,
  className,
  ...props
}: VimeoEmbedProps) {
  const ref = parseVimeo(vimeoUrl ?? videoId ?? null);

  const onMessage = useCallback(
    (e: WebViewMessageEvent) => {
      let msg: VimeoMessage;
      try {
        msg = JSON.parse(e.nativeEvent.data) as VimeoMessage;
      } catch {
        return;
      }
      if (msg.type === "progress") onProgress?.(msg.seconds, msg.duration);
      else if (msg.type === "ended") onEnded?.();
    },
    [onProgress, onEnded],
  );

  return (
    <View
      className={cn("aspect-video w-full overflow-hidden bg-foreground", className)}
      {...props}
    >
      {ref && (
        <WebView
          source={{
            html: buildPlayerHtml(ref, startAt, autoplay),
            baseUrl: "https://player.vimeo.com",
          }}
          originWhitelist={["*"]}
          accessibilityLabel={title}
          style={{ flex: 1, backgroundColor: "transparent" }}
          javaScriptEnabled
          domStorageEnabled
          onMessage={onMessage}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          allowsPictureInPictureMediaPlayback
        />
      )}
    </View>
  );
}

export { VimeoEmbed };
export type { VimeoEmbedProps };
