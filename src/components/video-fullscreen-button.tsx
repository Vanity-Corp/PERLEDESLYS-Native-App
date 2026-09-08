import * as ScreenOrientation from "expo-screen-orientation";
import { Maximize2, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/ui/icon";
import { VideoEmbed, type VideoEmbedProps } from "@/components/video-embed";

// A small round button overlaid on a VideoEmbed that opens a real in-app
// fullscreen player instead of the YouTube WebView's own (unreliable, since
// the app was portrait-locked) fullscreen control. Stays portrait-locked —
// videos always play full-screen in portrait (short-format), never rotate
// the device to landscape.
type FullscreenVideoButtonProps = Omit<VideoEmbedProps, "fullscreen" | "className" | "style"> & {
  className?: string;
  // Called right when the user taps fullscreen, to seed the fullscreen
  // player's start position with the *live* current playback time. The
  // fullscreen player is a separate WebView instance (opening it inside a
  // Modal can't just resize the existing one in place), so without this it
  // fell back to the plain `startAt` prop — a one-time snapshot from
  // whenever the inline player last mounted (0 for a fresh view), never
  // updated as it plays — which read as the video restarting from scratch
  // every time fullscreen was opened instead of continuing.
  getStartAt?: () => number;
};

export function FullscreenVideoButton({
  className,
  getStartAt,
  startAt,
  ...playerProps
}: FullscreenVideoButtonProps) {
  const [open, setOpen] = useState(false);
  const [resumeAt, setResumeAt] = useState(startAt ?? 0);

  const enter = async () => {
    setResumeAt(getStartAt?.() ?? startAt ?? 0);
    setOpen(true);
    if (Platform.OS !== "web") {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
  };

  const exit = async () => {
    if (Platform.OS !== "web") {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={enter}
        accessibilityRole="button"
        accessibilityLabel="Plein écran"
        className={className ?? "absolute bottom-3 right-3 h-9 w-9 items-center justify-center rounded-full bg-background/80"}
      >
        <Icon as={Maximize2} size={16} className="text-foreground" />
      </Pressable>
      <Modal
        visible={open}
        animationType="fade"
        onRequestClose={exit}
        supportedOrientations={["portrait"]}
        statusBarTranslucent
      >
        <SafeAreaView className="flex-1 bg-black">
          <VideoEmbed {...playerProps} startAt={resumeAt} fullscreen autoplay />
          <Pressable
            onPress={exit}
            accessibilityRole="button"
            accessibilityLabel="Quitter le plein écran"
            className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-background/80"
          >
            <Icon as={X} size={16} className="text-foreground" />
          </Pressable>
        </SafeAreaView>
      </Modal>
    </>
  );
}
