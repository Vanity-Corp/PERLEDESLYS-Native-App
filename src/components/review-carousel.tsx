import { ChevronLeft, ChevronRight, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
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
  // The review whose full text is shown in the modal (null = closed).
  const [expanded, setExpanded] = useState<Review | null>(null);
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
    <View className="px-5">
      {/* [◀]  [ paging carousel ]  [▶] — arrows flank the card, never cover it. */}
      <View className="flex-row items-center gap-2">
        {count > 1 && (
          <Pressable
            onPress={() => goTo(index - 1)}
            hitSlop={8}
            className="h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background"
          >
            <Icon as={ChevronLeft} size={18} className="text-foreground" />
          </Pressable>
        )}

        <View className="flex-1" onLayout={onLayout}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumEnd}
            scrollEventThrottle={16}
          >
            {reviews.map((r) => (
              <View key={r.id} style={{ width }}>
                {/* Tap the card to read the full review in a modal (the text
                    itself is capped to 4 lines here). */}
                <Pressable
                  onPress={() => setExpanded(r)}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <StarRating value={r.rating} size={16} readOnly />
                  <Text
                    className="mt-2 text-sm leading-snug text-foreground"
                    numberOfLines={4}
                  >
                    {r.comment}
                  </Text>
                  <Text className="mt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    @{r.username}
                  </Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>

        {count > 1 && (
          <Pressable
            onPress={() => goTo(index + 1)}
            hitSlop={8}
            className="h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background"
          >
            <Icon as={ChevronRight} size={18} className="text-foreground" />
          </Pressable>
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

      {/* Full-review modal — dimmed backdrop (tap to close), card with the
          author + stars + the full comment in a ScrollView so long reviews
          scroll, plus an explicit close button. */}
      <Modal
        visible={expanded !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setExpanded(null)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/60 p-6"
          onPress={() => setExpanded(null)}
        >
          {expanded && (
            <Pressable
              onPress={() => {}}
              className="w-full max-w-md rounded-3xl border border-border bg-card p-5"
              style={{ maxHeight: "75%" }}
            >
              <View className="flex-row items-start justify-between">
                <StarRating value={expanded.rating} size={18} readOnly />
                <Pressable
                  onPress={() => setExpanded(null)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Fermer"
                  className="-mr-1 -mt-1 h-8 w-8 items-center justify-center rounded-full bg-secondary"
                >
                  <Icon as={X} size={16} className="text-foreground" />
                </Pressable>
              </View>
              <ScrollView
                className="mt-3"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-1"
              >
                <Text className="text-sm leading-relaxed text-foreground">
                  {expanded.comment}
                </Text>
              </ScrollView>
              <Text className="mt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                @{expanded.username}
              </Text>
            </Pressable>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}
