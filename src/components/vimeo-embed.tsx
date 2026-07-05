import { View, type ViewProps } from "react-native";
import { WebView } from "react-native-webview";

import { cn } from "@/lib/utils";

// Web source: the hardcoded Vimeo <iframe> in
// kitchen-haven-club/src/routes/app/first-steps/index.tsx and the
// "Mes premiers pas" special case in .../app/videos/$videoId.tsx —
//   <iframe
//     src="https://player.vimeo.com/video/{id}"
//     allow="autoplay; fullscreen; picture-in-picture"
//     allowFullScreen
//     className="absolute inset-0 w-full h-full"
//   />
// wrapped by both call sites in a `relative aspect-video` container.
//
// `allow="autoplay"` -> `mediaPlaybackRequiresUserAction={false}` (cross
// platform) + `allowsInlineMediaPlayback` (iOS-only prop, per the library's
// own types — Android has no separate flag for this).
// `allowFullScreen`/`allow="fullscreen"` -> `allowsFullscreenVideo`
// (Android-only per the library's types; iOS handles fullscreen video by
// default, no flag needed).
// `allow="picture-in-picture"` -> `allowsPictureInPictureMediaPlayback`
// (macOS-only per the library's types; included anyway since it's a no-op,
// not a risk, on iOS/Android).
// Platform-specific props are safe to set together — each platform simply
// ignores the ones that don't apply to it.
type VimeoEmbedProps = ViewProps & {
  videoId: string;
  title?: string;
};

function VimeoEmbed({ videoId, title, className, ...props }: VimeoEmbedProps) {
  return (
    <View className={cn("aspect-video w-full overflow-hidden bg-foreground", className)} {...props}>
      <WebView
        source={{ uri: `https://player.vimeo.com/video/${videoId}` }}
        accessibilityLabel={title}
        style={{ flex: 1, backgroundColor: "transparent" }}
        javaScriptEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        allowsPictureInPictureMediaPlayback
      />
    </View>
  );
}

export { VimeoEmbed };
export type { VimeoEmbedProps };
