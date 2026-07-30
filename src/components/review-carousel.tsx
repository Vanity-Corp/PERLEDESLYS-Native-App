import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import { StarRating } from "@/components/star-rating";
import { Icon } from "@/components/ui/icon";
import type { Review } from "@/types/content";

// Auto-advancing, looping carousel of approved reviews with manual controls
// (prev/next arrows + dot indicators). One review per page.
const AUTO_ADVANCE_MS = 5000;

export function ReviewCarousel({ reviews }: { reviews: Review[] }) {
  const scrollRef = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const count = reviews.length;

  const goTo = (i: number) => {
    if (count === 0 || width === 0) return;
    const next = (i + count) % count; // wrap around (loop)
    setIndex(next);
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
  };

  // Auto-advance. Restarts whenever the index changes (so a manual tap resets
  // the timer) or the page count changes.
  useEffect(() => {
    if (count <= 1 || width === 0) return;
    const id = setInterval(() => goTo(index + 1), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, count, width]);

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(e.nativeEvent.layout.width);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  if (count === 0) return null;

  return (
    <View className="px-5" onLayout={onLayout}>
      <View className="relative">
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumEnd}
          scrollEventThrottle={16}
        >
          {reviews.map((r) => (
            <View key={r.id} style={{ width }} className="pr-0">
              <View className="rounded-2xl border border-border bg-card p-4">
                <StarRating value={r.rating} size={16} readOnly />
                <Text className="mt-2 text-sm leading-snug text-foreground">
                  {r.comment}
                </Text>
                <Text className="mt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  @{r.username}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {count > 1 && (
          <>
            <Pressable
              onPress={() => goTo(index - 1)}
              hitSlop={8}
              className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full bg-background/90 border border-border"
            >
              <Icon as={ChevronLeft} size={18} className="text-foreground" />
            </Pressable>
            <Pressable
              onPress={() => goTo(index + 1)}
              hitSlop={8}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full bg-background/90 border border-border"
            >
              <Icon as={ChevronRight} size={18} className="text-foreground" />
            </Pressable>
          </>
        )}
      </View>

      {count > 1 && (
        <View className="mt-3 flex-row items-center justify-center gap-1.5">
          {reviews.map((r, i) => (
            <Pressable key={r.id} onPress={() => goTo(i)} hitSlop={6}>
              <View
                className={`h-1.5 rounded-full ${
                  i === index ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
