import { useCallback } from "react";
import { View, type ViewProps } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { cn } from "@/lib/utils";
import {
  buildPlayerHtml,
  DEFAULT_YOUTUBE_URL,
  parseYouTube,
  type VideoMessage,
} from "./video-embed.shared";

// Native (iOS/Android) YouTube player. Loads a small HTML page driving the
// YouTube IFrame API (see video-embed.shared) so we can seek to `startAt` and
// report playback position back for the "resume" feature. The web build uses
// video-embed.web.tsx (an <iframe>) — Metro resolves the platform file.
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

  const onMessage = useCallback(
    (e: WebViewMessageEvent) => {
      let msg: VideoMessage;
      try {
        msg = JSON.parse(e.nativeEvent.data) as VideoMessage;
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
      className={cn("aspect-video  overflow-hidden w-fit bg-foreground", className)}
      {...props}
    >
      <WebView
        source={{
          html: buildPlayerHtml(id, startAt, autoplay),
          baseUrl: "https://www.youtube.com",
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
    </View>
  );
}

export { VideoEmbed };
export type { VideoEmbedProps };

