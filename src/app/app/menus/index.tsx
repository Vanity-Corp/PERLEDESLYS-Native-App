import { Image } from "expo-image";
import { Link } from "expo-router";
import { ArrowLeft, Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NetworkError } from "@/components/network-error";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useHardRefresh, useMenusQuery } from "@/lib/content-queries";

// Only a handful of menus are expected (curated by the founder in the
// dashboard), so this is a plain scroll list — no infinite scroll needed,
// unlike the Recipes/Vidéos list screens. For the same reason the search box
// filters the already-loaded list locally instead of hitting the API.
export default function MenusScreen() {
  const menusQ = useMenusQuery();
  const [q, setQ] = useState("");
  const menus = useMemo(() => {
    const all = menusQ.data ?? [];
    const needle = normalize(q);
    if (!needle) return all;
    // The query must start at a word boundary, so "4 sept" finds
    // "Semaine 4 sept - 14 sept" but not "Semaine 7 sept - 14 sept".
    const re = new RegExp(`(^|[^a-z0-9])${escapeRegExp(needle)}`);
    return all.filter((m) => re.test(normalize(m.title)));
  }, [menusQ.data, q]);
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

        <View className="mt-4 px-5">
          <View className="justify-center ">
            <View className="pointer-events-none absolute left-4 z-10" style={{ elevation: 4 }}>
              <Icon as={Search} size={16} className="text-muted-foreground" />
            </View>
            <Input
              value={q}
              onChangeText={setQ}
              placeholder="Rechercher une semaine..."
              className="rounded-2xl py-3.5 pl-11 pr-4  bg-white h-fit"
            />
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
            {q.trim() ? "Aucun résultat pour votre recherche." : "Aucun menu pour le moment."}
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
                        {menu.days && menu.days.length > 0
                          ? `${menu.days.length} jour${menu.days.length > 1 ? "s" : ""} · `
                          : ""}
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

// Month names as written in full, mapped to the short forms menu titles use
// ("Semaine 4 sept - 14 sept"), so typing "4 septembre" still matches.
const MONTHS: [RegExp, string][] = [
  [/\bjanvier\b/g, "janv"],
  [/\bfevrier\b/g, "fevr"],
  [/\bavril\b/g, "avr"],
  [/\bjuillet\b/g, "juil"],
  [/\bseptembre\b/g, "sept"],
  [/\boctobre\b/g, "oct"],
  [/\bnovembre\b/g, "nov"],
  [/\bdecembre\b/g, "dec"],
];

// Lowercase, accent-free, single-spaced, months shortened.
function normalize(value: string) {
  let s = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
  for (const [re, short] of MONTHS) s = s.replace(re, short);
  return s;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
