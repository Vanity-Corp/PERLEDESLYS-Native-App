import { usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { useWindowDimensions, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddNoteButton } from "@/components/add-note-button";
import { AIChat } from "@/components/ai-chat";
import { useFabPosition } from "@/lib/fab-position-store";
import { useRecipe, useVideo } from "@/lib/content-queries";

// AI assistant + "add note" FABs, mounted once at the app root (AppLayout)
// and stacked in a single flex column instead of each computing its own
// absolute pixel offset to sit above the other. The note button only shows
// on single-item content pages (recipe detail, video detail, tips) — same
// scope those 3 screens used to enforce themselves by each rendering their
// own <AddNoteButton>, now driven off the current route instead so both FABs
// can live together here.
//
// The whole pair is drag-and-drop repositionable (holds its stacked
// order/gap while dragging) and remembers where the user leaves it via
// useFabPosition (AsyncStorage), instead of always snapping back to this
// default bottom-right dock.

// Matches the pair's previous static `bottom-44 right-4` — the docked
// position dragging is an offset from.
const DEFAULT_RIGHT = 16;
const DEFAULT_BOTTOM = 176;

function useNoteContext(): { contextLabel: string; contextHref: string } | null {
  const pathname = usePathname();
  const recipeId = pathname.match(/^\/app\/recipes\/([^/]+)$/)?.[1];
  const videoId = pathname.match(/^\/app\/videos\/([^/]+)$/)?.[1];

  // Same query hooks/keys the detail screens themselves use, so this reads
  // from the query cache they already populated instead of firing a second
  // network request.
  const { data: recipe } = useRecipe(recipeId);
  const { data: video } = useVideo(videoId);

  if (recipeId && recipe) {
    return {
      contextLabel: `Recette : ${recipe.title}`,
      contextHref: `/app/recipes/${recipe.id}`,
    };
  }
  if (videoId && video) {
    return {
      contextLabel: `Vidéo : ${video.title}`,
      contextHref: `/app/videos/${video.id}`,
    };
  }
  if (pathname === "/app/tips") {
    return { contextLabel: "Astuces & conseils", contextHref: "/app/tips" };
  }
  return null;
}

export function GlobalFabs() {
  const noteContext = useNoteContext();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { offset, setOffset } = useFabPosition();

  // Measured after first paint — starts at the single-button size so bounds
  // math below is sane even before onLayout fires.
  const [size, setSize] = useState({ width: 52, height: 52 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const dragStartTx = useSharedValue(0);
  const dragStartTy = useSharedValue(0);

  // Apply the persisted offset once useFabPosition's AsyncStorage-backed
  // store finishes rehydrating (it starts at `offset: null` synchronously,
  // then flips once loaded — see fab-position-store.ts).
  useEffect(() => {
    if (offset) {
      tx.value = offset.dx;
      ty.value = offset.dy;
    }
  }, [offset, tx, ty]);

  // Absolute top-left of the *undragged* dock, used to convert the drag's
  // translateX/Y into screen-edge clamps below.
  const defaultX = screenWidth - DEFAULT_RIGHT - size.width;
  const defaultY = screenHeight - DEFAULT_BOTTOM - size.height;
  const minX = -defaultX;
  const maxX = screenWidth - size.width - defaultX;
  const minY = insets.top - defaultY;
  const maxY = screenHeight - insets.bottom - size.height - defaultY;

  const persist = (dx: number, dy: number) => setOffset({ dx, dy });

  const pan = Gesture.Pan()
    // Only arms after a genuine hold — a quick swipe starting on/near the
    // FABs (e.g. a nearby carousel or horizontal scroll) never activates
    // this, so it can't steal that gesture. Plain taps are unaffected
    // either way (they never move far enough to matter).
    .activateAfterLongPress(350)
    .onStart(() => {
      dragStartTx.value = tx.value;
      dragStartTy.value = ty.value;
    })
    .onUpdate((e) => {
      tx.value = Math.min(Math.max(dragStartTx.value + e.translationX, minX), maxX);
      ty.value = Math.min(Math.max(dragStartTy.value + e.translationY, minY), maxY);
    })
    .onEnd((_e, success) => {
      // Only a completed drag (moved past the gesture's activation
      // threshold) should write — a plain tap on either button still passes
      // through onEnd but never actually moved anything.
      if (success) runOnJS(persist)(tx.value, ty.value);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        onLayout={onLayout}
        className="absolute bottom-44 right-4 z-40 items-end gap-2"
        style={animatedStyle}
      >
        <AIChat />
        {noteContext && (
          <AddNoteButton
            contextLabel={noteContext.contextLabel}
            contextHref={noteContext.contextHref}
          />
        )}
      </Animated.View>
    </GestureDetector>
  );
}
