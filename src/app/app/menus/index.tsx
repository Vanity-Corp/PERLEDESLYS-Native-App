import { Image } from "expo-image";
import { Link } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NetworkError } from "@/components/network-error";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useHardRefresh, useMenusQuery } from "@/lib/content-queries";

// Only a handful of menus are expected (curated by the founder in the
// dashboard), so this is a plain scroll list — no infinite scroll needed,
// unlike the Recipes/Vidéos list screens.
export default function MenusScreen() {
  const menusQ = useMenusQuery();
  const menus = menusQ.data ?? [];
  const onRefresh = useHardRefresh([["menus"]]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-16"
        refreshControl={
          <RefreshControl refreshing={menusQ.isFetching} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
          <Link href="/app" asChild>
            <Pressable className="-ml-2 rounded-full p-2">
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </Pressable>
          </Link>
          <View>
            <Text className="font-display text-2xl font-medium tracking-tight text-foreground">
              Menus
            </Text>
            <Text className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Planifiez votre semaine
            </Text>
          </View>
        </View>

        {menusQ.isError ? (
          <View className="px-5 pt-4">
            <NetworkError onRetry={() => void menusQ.refetch()} />
          </View>
        ) : menusQ.isLoading ? (
          <View className="mt-5 gap-4 px-5">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="aspect-video w-full rounded-2xl" />
            ))}
          </View>
        ) : menus.length === 0 ? (
          <Text className="mt-10 px-6 text-center text-sm text-muted-foreground">
            Aucun menu pour le moment.
          </Text>
        ) : (
          <View className="mt-4 gap-4 px-5">
            {menus.map((menu) => (
              <Link
                key={menu.id}
                href={{ pathname: "/app/menus/[menuId]", params: { menuId: menu.id } }}
                asChild
              >
                <Pressable>
                  <View className="relative aspect-video overflow-hidden rounded-2xl">
                    <Image
                      source={menu.image}
                      contentFit="cover"
                      style={{ width: "100%", height: "100%" }}
                      accessibilityLabel={menu.title}
                    />
                    <GradientView tone="overlay" className="absolute inset-0" />
                    <View className="absolute bottom-3 left-4 right-4">
                      <Text className="font-display text-lg font-medium leading-tight text-primary-foreground">
                        {menu.title}
                      </Text>
                      <Text className="mt-0.5 text-[11px] text-primary-foreground opacity-90">
                        {menu.recipeIds.length} recettes
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </Link>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
