import { Image } from "expo-image";
import { Link } from "expo-router";
import { ArrowLeft, Clock, Flame, Search, Sparkles } from "lucide-react-native";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NetworkError } from "@/components/network-error";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  useCategories,
  useHardRefresh,
  useRecipesQuery,
} from "@/lib/content-queries";
import { useDebounce } from "@/hooks/use-debounce";
import { isRecent } from "@/lib/utils";

// Web source: kitchen-haven-club/src/routes/app/recipes/index.tsx
export default function RecipesScreen() {
  const recipesQ = useRecipesQuery();
  const recipes = recipesQ.data ?? [];
  const onRefresh = useHardRefresh([["recipes"]]);
  // Filter pills come from the dashboard-managed categories; if that endpoint
  // is empty, fall back to the distinct categories present in the loaded
  // recipes so the tabs are never blank.
  const managedCategories = useCategories("recipe");
  const CATEGORIES = [
    "Tout",
    ...(managedCategories.length > 0
      ? managedCategories
      : [...new Set(recipes.map((r) => r.category))]),
  ];
  const [active, setActive] = useState("Tout");
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q);
  const filtered = recipes.filter(
    (r) =>
      (active === "Tout" || r.category === active) &&
      r.title.toLowerCase().includes(debouncedQ.toLowerCase()),
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={recipesQ.isFetching}
            onRefresh={onRefresh}
          />
        }
      >
        <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
          <Link href="/app" asChild>
            <Pressable className="-ml-2 rounded-full p-2">
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </Pressable>
          </Link>
          <View>
            <Text className="text-primary font-display text-3xl font-semibold tracking-tight ">
              Recettes
            </Text>
            <Text className="text-[11px] uppercase tracking-wider text-muted-foreground">
              La touche algérienne au TM7
            </Text>
          </View>
        </View>

        <View className="mt-4 px-5">
          <View className="justify-center">
            <View className="pointer-events-none absolute left-4 z-10">
              <Icon as={Search} size={16} className="text-muted-foreground" />
            </View>
            <Input
              value={q}
              onChangeText={setQ}
              placeholder="Rechercher une recette..."
              className="rounded-2xl py-3.5 pl-11 pr-4 h-fit"
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-5 pb-1"
          className="mt-4"
        >
          <ToggleGroup
            type="single"
            value={active}
            onValueChange={(v) => v && setActive(v)}
          >
            {CATEGORIES.map((c) => (
              <ToggleGroupItem
                key={c}
                value={c}
                className="mr-2 h-auto min-w-0 rounded-full border border-border bg-card px-4 py-2"
              >
                <Text className="text-xs font-medium">{c}</Text>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </ScrollView>

        {recipesQ.isError ? (
          <NetworkError onRetry={() => void recipesQ.refetch()} />
        ) : recipesQ.isLoading ? (
          <View className="mt-5 flex-row flex-wrap gap-3 px-5">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-40 w-[47%] rounded-2xl" />
            ))}
          </View>
        ) : (
        <>
        <View className="mt-5 flex-row flex-wrap gap-3 px-5">
          {filtered.map((r) => (
            <Link
              key={r.id}
              href={{
                pathname: "/app/recipes/[recipeId]",
                params: { recipeId: r.id },
              }}
              asChild
            >
              <Pressable style={{ width: "47%" }}>
                <View className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image
                    source={r.image}
                    contentFit="cover"
                    style={{ width: "100%", height: "100%" }}
                    accessibilityLabel={r.title}
                  />
                  <View className="absolute left-2 top-2 rounded-full bg-background/95 px-2 py-0.5">
                    <Text className="text-[9px] font-semibold uppercase text-foreground">
                      {r.category}
                    </Text>
                  </View>
                  {isRecent(r.createdAt) && (
                    <GradientView
                      tone="gold"
                      className="absolute right-2 top-2 flex-row items-center gap-1 rounded-full px-2 py-0.5"
                    >
                      <Icon
                        as={Sparkles}
                        size={10}
                        className="text-foreground"
                      />
                      <Text className="text-[9px] font-semibold uppercase text-foreground">
                        New
                      </Text>
                    </GradientView>
                  )}
                </View>
                <View className="mt-2">
                  <Text
                    className="text-sm font-medium leading-snug text-foreground"
                    numberOfLines={2}
                  >
                    {r.title}
                  </Text>
                  <View className="mt-1 flex-row items-center gap-2">
                    <View className="flex-row items-center gap-0.5">
                      <Icon
                        as={Clock}
                        size={10}
                        className="text-muted-foreground"
                      />
                      <Text className="text-[10px] text-muted-foreground">
                        {r.time}
                      </Text>
                    </View>
                    <Text className="text-[10px] text-muted-foreground">·</Text>
                    <View className="flex-row items-center gap-0.5">
                      <Icon
                        as={Flame}
                        size={10}
                        className="text-muted-foreground"
                      />
                      <Text className="text-[10px] text-muted-foreground">
                        {r.difficulty}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>

        {filtered.length === 0 && (
          <Text className="mt-10 px-6 text-center text-sm text-muted-foreground">
            Aucune recette ne correspond à votre recherche.
          </Text>
        )}
        </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
