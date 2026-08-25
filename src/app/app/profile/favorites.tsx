import { Image } from "expo-image";
import { Link } from "expo-router";
import { ArrowLeft, Clock, Heart, Play } from "lucide-react-native";
import { memo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientButton } from "@/components/ui/gradient-button";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { useFavorites } from "@/lib/local-store";
import type { Recipe, Video } from "@/types/content";

// Web source: kitchen-haven-club/src/routes/app/favorites/index.tsx
//
// The web version is a disconnected mock (`recipes.slice(0, 6)`, its heart
// button has no onClick) — flagged in the migration report. This screen
// reads the real `useFavorites` store (Task 5, since extended to also cover
// videos — see `local-store.ts`), so both hearts here are wired to `toggle()`
// for real (matching the already-real hearts on Recipe Detail and Video
// Detail) rather than kept as inert placeholders. The web only ever favorited
// recipes, so the Recettes/Vidéos split below has no web counterpart to
// mirror — a reasonable extension now that favoriting covers both kinds.
//
// The two grids below are independently-shaped sections (recipe cards are
// square, video cards are 16:9) in a single scroll — a `FlatList` per section
// would nest two same-orientation VirtualizedLists inside one ScrollView (an
// RN anti-pattern), so "scroll to load more" is done by hand here: watching
// scroll position and raising each section's own visible-count as the user
// nears the bottom, rather than switching to FlatList.
const PAGE_SIZE = 12;
const NEAR_BOTTOM_PX = 200;

const FavoriteRecipeCard = memo(function FavoriteRecipeCard({
  recipe: r,
  onToggle,
}: {
  recipe: Recipe;
  onToggle: () => void;
}) {
  return (
    // The heart toggle is a sibling of the navigation Pressable below (not
    // nested inside it) — Task 19 already hit a nested-touchable conflict
    // from putting an interactive control inside another Pressable's hit
    // area; this avoids repeating that bug.
    <View className="relative" style={{ width: "47%" }}>
      <Link
        href={{ pathname: "/app/recipes/[recipeId]", params: { recipeId: r.id } }}
        asChild
      >
        <Pressable>
          <View className="relative aspect-square overflow-hidden rounded-2xl">
            <Image
              source={r.image}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
              accessibilityLabel={r.title}
            />
          </View>
          <View className="mt-2">
            <Text className="text-sm font-medium leading-snug text-foreground" numberOfLines={2}>
              {r.title}
            </Text>
            <View className="mt-1 flex-row items-center gap-1">
              <Icon as={Clock} size={10} className="text-muted-foreground" />
              <Text className="text-[10px] text-muted-foreground">{r.time}</Text>
            </View>
          </View>
        </Pressable>
      </Link>
      <Pressable
        onPress={onToggle}
        className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-background/95"
      >
        <Icon as={Heart} size={16} className="text-primary" fill="currentColor" />
      </Pressable>
    </View>
  );
});

const FavoriteVideoCard = memo(function FavoriteVideoCard({
  video: v,
  onToggle,
}: {
  video: Video;
  onToggle: () => void;
}) {
  return (
    <View className="relative" style={{ width: "47%" }}>
      <Link
        href={{ pathname: "/app/videos/[videoId]", params: { videoId: v.id } }}
        asChild
      >
        <Pressable>
          <View className="relative aspect-video overflow-hidden rounded-2xl">
            <Image
              source={v.image}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
              accessibilityLabel={v.title}
            />
            <GradientView tone="overlay" className="absolute inset-0" />
            <View className="absolute inset-0 items-center justify-center">
              <Icon as={Play} size={18} className="text-primary-foreground" fill="currentColor" />
            </View>
          </View>
          <View className="mt-2">
            <Text className="text-sm font-medium leading-snug text-foreground" numberOfLines={2}>
              {v.title}
            </Text>
            <Text className="mt-1 text-[10px] text-muted-foreground">{v.duration}</Text>
          </View>
        </Pressable>
      </Link>
      <Pressable
        onPress={onToggle}
        className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-background/95"
      >
        <Icon as={Heart} size={16} className="text-primary" fill="currentColor" />
      </Pressable>
    </View>
  );
});

export default function FavoritesScreen() {
  const { favoriteRecipes, favoriteVideos, toggle } = useFavorites();
  const total = favoriteRecipes.length + favoriteVideos.length;
  const [visibleRecipes, setVisibleRecipes] = useState(PAGE_SIZE);
  const [visibleVideos, setVisibleVideos] = useState(PAGE_SIZE);
  const shownRecipes = favoriteRecipes.slice(0, visibleRecipes);
  const shownVideos = favoriteVideos.slice(0, visibleVideos);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const nearBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - NEAR_BOTTOM_PX;
    if (!nearBottom) return;
    setVisibleRecipes((v) => Math.min(v + PAGE_SIZE, favoriteRecipes.length));
    setVisibleVideos((v) => Math.min(v + PAGE_SIZE, favoriteVideos.length));
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={200}
      >
        <View className="flex-row items-center gap-3 px-5 pb-2 pt-6">
          <Link href="/app/profile" asChild>
            <Pressable className="-ml-2 rounded-full p-2">
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </Pressable>
          </Link>
          <Text className="font-display text-2xl font-medium tracking-tight text-foreground">
            Mes favoris
          </Text>
        </View>

        {total === 0 ? (
          <View className="mx-5 mt-5 items-center rounded-3xl border border-border bg-card p-6">
            <Icon as={Heart} size={24} className="text-primary" />
            <Text className="mt-2 font-display text-lg text-foreground">
              Aucun favori pour le moment
            </Text>
            <Text className="mt-1 text-center text-xs text-muted-foreground">
              Appuyez sur le cœur d'une recette ou d'une vidéo pour l'ajouter
              ici.
            </Text>
            <Link href="/app/recipes" asChild>
              <GradientButton tone="luxe" className="mt-4">
                <Text className="font-medium text-primary-foreground">
                  Découvrir les recettes
                </Text>
              </GradientButton>
            </Link>
          </View>
        ) : (
          <>
            {shownRecipes.length > 0 && (
              <View className="mt-5">
                <Text className="mb-3 px-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Recettes ({favoriteRecipes.length})
                </Text>
                <View className="flex-row flex-wrap gap-3 px-5">
                  {shownRecipes.map((r) => (
                    <FavoriteRecipeCard key={r.id} recipe={r} onToggle={() => toggle(r.id, "recipe")} />
                  ))}
                </View>
              </View>
            )}

            {shownVideos.length > 0 && (
              <View className="mt-7">
                <Text className="mb-3 px-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Vidéos ({favoriteVideos.length})
                </Text>
                <View className="flex-row flex-wrap gap-3 px-5">
                  {shownVideos.map((v) => (
                    <FavoriteVideoCard key={v.id} video={v} onToggle={() => toggle(v.id, "video")} />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
