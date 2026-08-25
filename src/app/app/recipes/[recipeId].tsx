import { Image } from "expo-image";
import { Link, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Flame,
  Heart,
  PlayCircle,
  Users,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddNoteButton } from "@/components/add-note-button";
import { Checkbox } from "@/components/ui/checkbox";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { VideoEmbed } from "@/components/video-embed";
import { useHardRefresh, useRecipe } from "@/lib/content-queries";
import { useFavorites, useHistory } from "@/lib/local-store";

// Web source: kitchen-haven-club/src/routes/app/recipes/$recipeId.tsx
//
// Recording a "viewed" entry in `useHistory` has no web counterpart — the
// web's history hook only ever tracked videos (see `local-store.ts`'s own
// notes). Extended here at the user's direct request, so the History screen
// (Task 27) shows recently-viewed recipes alongside recently-watched videos.
export default function RecipeDetailScreen() {
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  const { data: recipe, isLoading, isFetching } = useRecipe(recipeId);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  // Reveals the inline tutorial video player when "Voir le tutoriel vidéo" is
  // tapped (only rendered when the recipe actually has a video link).
  const [showTutorial, setShowTutorial] = useState(false);
  const onRefresh = useHardRefresh([["recipe", recipeId]]);
  const { isFavorite, toggle } = useFavorites();
  const { upsert } = useHistory();

  useEffect(() => {
    if (!recipe) return;
    upsert({
      kind: "recipe",
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      category: recipe.category,
      time: recipe.time,
      updatedAt: Date.now(),
    });
    // Recorded once per recipe view (on mount), not on every re-render —
    // recipe.id is stable for the lifetime of a mounted screen instance
    // (Expo Router mounts a fresh instance per navigation, same reasoning
    // Task 21 already established for the video player's position state).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe?.id]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Recette introuvable.</Text>
      </SafeAreaView>
    );
  }

  const fav = isFavorite(recipe.id, "recipe");

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={onRefresh} />
        }
      >
        {/* Hero image */}
        <View className="relative aspect-[4/5]">
          <Image
            source={recipe.image}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
            accessibilityLabel={recipe.title}
          />
          <GradientView tone="overlay" className="absolute inset-0" />
          <SafeAreaView className="absolute inset-x-0 top-0" edges={["top"]}>
            <View className="flex-row items-center justify-between px-5 pt-2">
              <Link href="/app/recipes" asChild>
                <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-background/95">
                  <Icon as={ArrowLeft} size={20} className="text-foreground" />
                </Pressable>
              </Link>
              <Pressable
                onPress={() => toggle(recipe.id, "recipe")}
                className="h-10 w-10 items-center justify-center rounded-full bg-background/95"
              >
                <Icon
                  as={Heart}
                  size={20}
                  className={fav ? "text-primary" : "text-foreground"}
                  fill={fav ? "currentColor" : "none"}
                />
              </Pressable>
            </View>
          </SafeAreaView>
          <View className="absolute bottom-6 left-5 right-5">
            <Text className="text-[10px] uppercase tracking-[0.3em] text-primary-foreground opacity-90">
              {recipe.category}
            </Text>
            <Text className="mt-1.5 font-display text-3xl font-medium leading-tight text-primary-foreground">
              {recipe.title}
            </Text>
          </View>
        </View>

        {/* Content card */}
        <View className="-mt-6 rounded-t-[2rem] bg-background px-5 pb-8 pt-6">
          <View className="flex-row items-center rounded-2xl border border-border bg-card p-3">
            <Stat icon={<Icon as={Clock} size={16} className="text-primary" />} label="Temps" value={recipe.time} />
            <Stat
              icon={<Icon as={Flame} size={16} className="text-primary" />}
              label="Difficulté"
              value={recipe.difficulty}
            />
            <Stat
              icon={<Icon as={Users} size={16} className="text-primary" />}
              label="Portions"
              value={`${recipe.portions}`}
            />
          </View>

          <Text className="mt-5 text-sm leading-relaxed text-muted-foreground">{recipe.description}</Text>

          {/* Cookidoo CTA — only when the recipe has a Cookidoo link */}
          {recipe.cookidooUrl ? (
            <Pressable onPress={() => Linking.openURL(recipe.cookidooUrl)}>
              <GradientView tone="luxe" className="mt-5 flex-row items-center gap-3 rounded-2xl p-4">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-background/20">
                  <Icon as={ExternalLink} size={20} className="text-primary-foreground" />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground opacity-90">
                    Ouvrir sur
                  </Text>
                  <Text className="text-sm font-medium text-primary-foreground">Cookidoo · Thermomix TM7</Text>
                </View>
                <View className="rounded-full bg-background/20 px-3 py-1.5">
                  <Text className="text-xs font-medium text-primary-foreground">Lancer</Text>
                </View>
              </GradientView>
            </Pressable>
          ) : null}

          {/* Ingredients */}
          <Text className="mt-7 mb-3 font-display text-xl font-semibold text-foreground">Ingrédients</Text>
          <View className="gap-2">
            {recipe.ingredients.map((ing, i) => (
              <Pressable
                key={ing.label}
                onPress={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
                className="flex-row items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
              >
                {/* Purely visual here (pointerEvents="none") — the whole row
                    above is the single tap target, matching the web's one
                    <button> per ingredient row rather than a nested control. */}
                <Checkbox
                  checked={Boolean(checked[i])}
                  pointerEvents="none"
                  onCheckedChange={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
                />
                <Text
                  className={
                    checked[i]
                      ? "flex-1 text-sm text-muted-foreground line-through"
                      : "flex-1 text-sm text-foreground"
                  }
                >
                  {ing.label}
                </Text>
                <Text className="text-xs font-medium text-muted-foreground">{ing.qty}</Text>
              </Pressable>
            ))}
          </View>

          {/* Steps */}
          <Text className="mt-7 mb-3 font-display text-xl font-semibold text-foreground">
            Étapes au Thermomix TM7
          </Text>
          <View className="gap-3">
            {recipe.steps.map((s, i) => (
              <View key={s} className="flex-row gap-3 rounded-2xl border border-border bg-card p-4">
                <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Text className="text-xs font-semibold text-primary-foreground">{i + 1}</Text>
                </View>
                <Text className="flex-1 text-sm leading-relaxed text-foreground">{s}</Text>
              </View>
            ))}
          </View>

          {/* Tutorial video — only shown when the recipe has a video link
              (vimeoUrl holds a YouTube URL). Tapping reveals an inline player. */}
          {recipe.vimeoUrl ? (
            showTutorial ? (
              <View className="mt-7 overflow-hidden rounded-2xl">
                <VideoEmbed url={recipe.vimeoUrl} title={recipe.title} />
              </View>
            ) : (
              <Pressable
                role="button"
                onPress={() => setShowTutorial(true)}
                className="mt-7 flex-row items-center justify-center gap-2 rounded-2xl bg-foreground py-4"
              >
                <Icon as={PlayCircle} size={20} className="text-background" />
                <Text className="font-medium text-background">Voir le tutoriel vidéo</Text>
              </Pressable>
            )
          ) : null}
        </View>
      </ScrollView>
      <AddNoteButton
        contextLabel={`Recette : ${recipe.title}`}
        contextHref={`/app/recipes/${recipe.id}`}
      />
    </View>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <View className="flex-1 items-center">
      {icon}
      <Text className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Text>
      <Text className="mt-0.5 text-sm font-semibold text-foreground">{value}</Text>
    </View>
  );
}
