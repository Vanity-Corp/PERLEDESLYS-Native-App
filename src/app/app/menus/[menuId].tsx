import { Image } from "expo-image";
import { Link, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Clock } from "lucide-react-native";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { useHardRefresh, useMenu } from "@/lib/content-queries";

// Mirrors recipes/[recipeId].tsx's hero shell; the recipe grid below reuses
// the home page's "Recettes" tile layout (index.tsx) for `menu.recipes`,
// already resolved server-side in the menu's stored order.
export default function MenuDetailScreen() {
  const { menuId } = useLocalSearchParams<{ menuId: string }>();
  const { data: menu, isLoading, isFetching } = useMenu(menuId);
  const onRefresh = useHardRefresh([["menu", menuId]]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!menu) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Menu introuvable.</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={onRefresh} />
        }
      >
        <View className="relative aspect-[4/5]">
          <Image
            source={menu.image}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
            accessibilityLabel={menu.title}
          />
          <GradientView tone="overlay" className="absolute inset-0" />
          <SafeAreaView className="absolute inset-x-0 top-0" edges={["top"]}>
            <View className="px-5 pt-2">
              <Link href="/app/menus" asChild>
                <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-background/95">
                  <Icon as={ArrowLeft} size={20} className="text-foreground" />
                </Pressable>
              </Link>
            </View>
          </SafeAreaView>
          <View className="absolute bottom-6 left-5 right-5">
            <Text className="text-[10px] uppercase tracking-[0.3em] text-primary-foreground opacity-90">
              {menu.recipes.length} recettes
            </Text>
            <Text className="mt-1.5 font-display text-3xl font-medium leading-tight text-primary-foreground">
              {menu.title}
            </Text>
          </View>
        </View>

        <View className="-mt-6 rounded-t-[2rem] bg-background px-5 pb-8 pt-6">
          {menu.description ? (
            <Text className="text-sm leading-relaxed text-muted-foreground">
              {menu.description}
            </Text>
          ) : null}

          <Text className="mt-5 mb-3 font-display text-xl font-semibold text-foreground">
            Recettes du menu
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {menu.recipes.map((r) => (
              <Link
                key={r.id}
                href={{ pathname: "/app/recipes/[recipeId]", params: { recipeId: r.id } }}
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
                        <Icon as={Clock} size={10} className="text-muted-foreground" />
                        <Text className="text-[10px] text-muted-foreground">{r.time}</Text>
                      </View>
                      <Text className="text-[10px] text-muted-foreground">·</Text>
                      <Text className="text-[10px] text-muted-foreground">{r.difficulty}</Text>
                    </View>
                  </View>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
