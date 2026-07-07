import { Image } from "expo-image";
import { Link } from "expo-router";
import { ArrowLeft, Clock, Heart, Play } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientButton } from "@/components/ui/gradient-button";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { useFavorites } from "@/lib/local-store";

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
export default function FavoritesScreen() {
  const { favoriteRecipes, favoriteVideos, toggle } = useFavorites();
  const total = favoriteRecipes.length + favoriteVideos.length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="pb-16" showsVerticalScrollIndicator={false}>
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
              Appuyez sur le cœur d'une recette ou d'une vidéo pour l'ajouter ici.
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
            {favoriteRecipes.length > 0 && (
              <View className="mt-5">
                <Text className="mb-3 px-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Recettes ({favoriteRecipes.length})
                </Text>
                <View className="flex-row flex-wrap gap-3 px-5">
                  {favoriteRecipes.map((r) => (
                    // The heart toggle is a sibling of the navigation Pressable
                    // below (not nested inside it) — Task 19 already hit a
                    // nested-touchable conflict from putting an interactive
                    // control inside another Pressable's hit area; this avoids
                    // repeating that bug.
                    <View key={r.id} className="relative" style={{ width: "47%" }}>
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
                            <Text
                              className="text-sm font-medium leading-snug text-foreground"
                              numberOfLines={2}
                            >
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
                        onPress={() => toggle(r.id, "recipe")}
                        className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-background/95"
                      >
                        <Icon as={Heart} size={16} className="text-primary" fill="currentColor" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {favoriteVideos.length > 0 && (
              <View className="mt-7">
                <Text className="mb-3 px-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Vidéos ({favoriteVideos.length})
                </Text>
                <View className="flex-row flex-wrap gap-3 px-5">
                  {favoriteVideos.map((v) => (
                    <View key={v.id} className="relative" style={{ width: "47%" }}>
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
                              <Icon
                                as={Play}
                                size={18}
                                className="text-primary-foreground"
                                fill="currentColor"
                              />
                            </View>
                          </View>
                          <View className="mt-2">
                            <Text
                              className="text-sm font-medium leading-snug text-foreground"
                              numberOfLines={2}
                            >
                              {v.title}
                            </Text>
                            <Text className="mt-1 text-[10px] text-muted-foreground">
                              {v.duration}
                            </Text>
                          </View>
                        </Pressable>
                      </Link>
                      <Pressable
                        onPress={() => toggle(v.id, "video")}
                        className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-background/95"
                      >
                        <Icon as={Heart} size={16} className="text-primary" fill="currentColor" />
                      </Pressable>
                    </View>
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
