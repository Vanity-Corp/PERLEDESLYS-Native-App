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
};

export function FullscreenVideoButton({ className, ...playerProps }: FullscreenVideoButtonProps) {
  const [open, setOpen] = useState(false);

  const enter = async () => {
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
          <VideoEmbed {...playerProps} fullscreen autoplay />
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
