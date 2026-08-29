import { Image } from "expo-image";
import { Link } from "expo-router";
import { ArrowLeft, BookOpen, Search, Sparkles } from "lucide-react-native";
import { memo, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddNoteButton } from "@/components/add-note-button";
import { NetworkError } from "@/components/network-error";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { InfiniteScrollFooter } from "@/components/ui/infinite-scroll-footer";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useArticlesInfiniteQuery,
  useHardRefresh,
  useWhoAmI,
} from "@/lib/content-queries";
import type { Article } from "@/types/content";

// Web source: kitchen-haven-club/src/routes/app/tips/index.tsx
//
// Category switcher uses the same ToggleGroup-as-independent-pills pattern (and
// the same flat-bg-accent selected-state simplification vs. the web's
// bg-gradient-luxe) already established by the Recipes list (Task 18) — see
// that screen's notes for the full reasoning.
//
// Copy note: the web's "Le carnet de Lys" / "Le mot de Lys" refer to the
// founder, renamed "Ghania" in the v2 client rebrand — updated here for
// consistency with every other rebranded screen, not left as the old "Lys".
//
// Article rows link to the article detail screen (/app/articles/[articleId]),
// which renders the rich-text content authored in the dashboard.
const CATS = [
  "Tout",
  "Ramadan",
  "Organisation",
  "Entretien",
  "Astuces",
  "Techniques",
  "Inspiration",
];

const ArticleCard = memo(function ArticleCard({ article: a }: { article: Article }) {
  return (
    <Link
      href={{
        pathname: "/app/articles/[articleId]",
        params: { articleId: a.id },
      }}
      asChild
    >
      <Pressable className="mx-5 mb-3 flex-row gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm shadow-black/5">
        <View className="h-24 w-24 shrink-0 overflow-hidden rounded-xl">
          <Image
            source={a.image}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
            accessibilityLabel={a.title}
          />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
            {a.category}
          </Text>
          <Text
            className="mt-0.5 text-sm font-medium leading-snug text-foreground"
            numberOfLines={2}
          >
            {a.title}
          </Text>
          <Text
            className="mt-1 text-[11px] leading-snug text-muted-foreground"
            numberOfLines={2}
          >
            {a.excerpt}
          </Text>
          <View className="mt-1.5 flex-row items-center gap-1">
            <Icon as={BookOpen} size={12} className="text-muted-foreground" />
            <Text className="text-[10px] text-muted-foreground">
              {a.readTime} de lecture
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
});

export default function TipsScreen() {
  const who = useWhoAmI();
  const quote =
    who.quote ||
    "Cuisiner, c'est offrir de l'amour. Et le faire au TM7, c'est se libérer du temps pour les siens.";
  const [cat, setCat] = useState("Tout");
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q);
  const onRefresh = useHardRefresh([["articles"]]);

  const articlesQ = useArticlesInfiniteQuery({
    category: cat === "Tout" ? undefined : cat,
    search: debouncedQ || undefined,
  });
  const list = articlesQ.data?.pages.flatMap((p) => p.items) ?? [];

  const Header = (
    <>
      <View className="flex-row items-center gap-3 px-5 pb-2 pt-6">
        <Link href="/app" asChild>
          <Pressable className="-ml-2 rounded-full p-2">
            <Icon as={ArrowLeft} size={20} className="text-foreground" />
          </Pressable>
        </Link>
        <View>
          <Text className="font-display text-2xl font-medium tracking-tight text-foreground">
            Astuces & conseils
          </Text>
          <Text className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Le carnet de Ghania
          </Text>
        </View>
      </View>

      {/* Hero quote */}
      <GradientView
        tone="luxe"
        className="relative mx-5 mt-4 overflow-hidden rounded-3xl p-5 shadow-sm shadow-black/10"
      >
        <View className="absolute -right-4 -top-4 opacity-10">
          <Icon as={Sparkles} size={96} className="text-primary-foreground" />
        </View>
        <Text className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground opacity-90">
          Un mot de Ghania
        </Text>
        <Text className="mt-2 font-italiana text-xl leading-snug text-primary-foreground">
          «&nbsp;{quote}&nbsp;»
        </Text>
      </GradientView>

      <View className="mt-5 px-5">
        <View className="justify-center ">
          <View className="pointer-events-none absolute left-4 z-10">
            <Icon as={Search} size={16} className="text-muted-foreground" />
          </View>
          <Input
            value={q}
            onChangeText={setQ}
            placeholder="Rechercher un article..."
            className="rounded-2xl py-3.5 pl-11 pr-4  bg-white h-fit"
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-5 pb-1"
        className="mt-5"
      >
        <ToggleGroup
          type="single"
          value={cat}
          onValueChange={(v) => v && setCat(v)}
        >
          {CATS.map((c) => (
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
      <View className="mt-5" />
    </>
  );

  const Empty = articlesQ.isError ? (
    <NetworkError onRetry={() => void articlesQ.refetch()} />
  ) : articlesQ.isLoading ? (
    <View className="gap-3 px-5">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
      ))}
    </View>
  ) : (
    <Text className="mt-10 px-6 text-center text-sm text-muted-foreground">
      Aucun article ne correspond à votre recherche.
    </Text>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <FlatList
        data={articlesQ.isLoading || articlesQ.isError ? [] : list}
        renderItem={({ item }) => <ArticleCard article={item} />}
        keyExtractor={(a) => a.id}
        contentContainerClassName="pb-16"
        ListHeaderComponent={Header}
        ListFooterComponent={<InfiniteScrollFooter visible={articlesQ.isFetchingNextPage} />}
        ListEmptyComponent={Empty}
        onEndReached={() => {
          if (articlesQ.hasNextPage && !articlesQ.isFetchingNextPage) void articlesQ.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={7}
        refreshControl={
          <RefreshControl
            refreshing={articlesQ.isFetching && !articlesQ.isFetchingNextPage}
            onRefresh={onRefresh}
          />
        }
      />
      {/* Same note affordance as recipe/video detail, scoped to the tips
          section (reuses the shared notes store + dialog). */}
      <AddNoteButton contextLabel="Astuces & conseils" contextHref="/app/tips" />
    </SafeAreaView>
  );
}
