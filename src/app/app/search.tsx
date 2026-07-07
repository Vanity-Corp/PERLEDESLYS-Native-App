import { Image } from "expo-image";
import { Link } from "expo-router";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  HelpCircle,
  PlayCircle,
  Search,
  Sparkles,
} from "lucide-react-native";
import { useMemo, useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { articles, faqItems, recipes, videos } from "@/lib/mock-data";

// Web source: kitchen-haven-club/src/routes/app/search/index.tsx
const SUGGESTIONS = ["poulet", "couscous", "ramadan", "nettoyage", "varoma"];

type Tab = "all" | "recipes" | "videos" | "articles" | "faq";

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
}

export default function SearchScreen() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const results = useMemo(() => {
    const needle = norm(q.trim());
    if (!needle) return { recipes: [], videos: [], articles: [], faq: [] as typeof faqItems };
    return {
      recipes: recipes.filter((r) =>
        [r.title, r.category, r.description, ...r.ingredients.map((i) => i.label)]
          .map(norm)
          .some((t) => t.includes(needle)),
      ),
      videos: videos.filter((v) =>
        [v.title, v.category, v.description].map(norm).some((t) => t.includes(needle)),
      ),
      articles: articles.filter((a) =>
        [a.title, a.category, a.excerpt].map(norm).some((t) => t.includes(needle)),
      ),
      faq: faqItems.filter((f) => [f.q, f.a].map(norm).some((t) => t.includes(needle))),
    };
  }, [q]);

  const total =
    results.recipes.length + results.videos.length + results.articles.length + results.faq.length;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "Tout", count: total },
    { id: "recipes", label: "Recettes", count: results.recipes.length },
    { id: "videos", label: "Vidéos", count: results.videos.length },
    { id: "articles", label: "Articles", count: results.articles.length },
    { id: "faq", label: "FAQ", count: results.faq.length },
  ];

  const showRecipes = tab === "all" || tab === "recipes";
  const showVideos = tab === "all" || tab === "videos";
  const showArticles = tab === "all" || tab === "articles";
  const showFaq = tab === "all" || tab === "faq";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="pb-16" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 px-5 pb-2 pt-6">
          <Link href="/app" asChild>
            <Pressable className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card">
              <Icon as={ArrowLeft} size={16} className="text-foreground" />
            </Pressable>
          </Link>
          <View>
            <Text className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Recherche
            </Text>
            <Text className="font-display text-2xl leading-tight text-foreground">
              Trouver dans l'app
            </Text>
          </View>
        </View>

        <View className="mt-4 px-5">
          <View className="justify-center">
            <View className="pointer-events-none absolute left-4 z-10">
              <Icon as={Search} size={16} className="text-muted-foreground" />
            </View>
            <Input
              autoFocus
              value={q}
              onChangeText={setQ}
              placeholder="Recettes, vidéos, FAQ…"
              className="rounded-2xl py-3.5 pl-11 pr-4 h-fit"
            />
          </View>
        </View>

        {q.trim().length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 px-5 pb-1"
            className="mt-4"
          >
            <ToggleGroup type="single" value={tab} onValueChange={(v) => v && setTab(v as Tab)}>
              {tabs.map((t) => (
                <ToggleGroupItem
                  key={t.id}
                  value={t.id}
                  className="mr-2 h-auto min-w-0 rounded-full border border-border bg-card px-3.5 py-1.5"
                >
                  <Text className="text-xs font-medium">
                    {t.label} <Text className="opacity-70">{t.count}</Text>
                  </Text>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </ScrollView>
        )}

        <View className="mt-5 gap-5 px-5">
          {q.trim().length === 0 && (
            <View className="items-center rounded-3xl border border-border bg-card p-5">
              <Icon as={Sparkles} size={24} className="text-primary" />
              <Text className="mt-2 font-display text-lg text-foreground">Que cherches-tu ?</Text>
              <Text className="mt-1 text-center text-xs text-muted-foreground">
                Recettes, ingrédients, tutoriels TM7, articles, FAQ…
              </Text>
              <View className="mt-4 flex-row flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setQ(s)}
                    className="rounded-full bg-secondary px-2.5 py-1"
                  >
                    <Text className="text-[11px] text-foreground">{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {q.trim().length > 0 && total === 0 && (
            <View className="items-center rounded-3xl border border-border bg-card p-6">
              <Text className="font-display text-lg text-foreground">Aucun résultat</Text>
              <Text className="mt-1 text-center text-xs text-muted-foreground">
                Demande à l'assistante IA de te proposer une recette compatible TM7 ✨
              </Text>
            </View>
          )}

          {showRecipes && results.recipes.length > 0 && (
            <ResultSection title="Recettes" icon={BookOpen}>
              <View className="gap-2.5">
                {results.recipes.map((r) => (
                  <Link
                    key={r.id}
                    href={{ pathname: "/app/recipes/[recipeId]", params: { recipeId: r.id } }}
                    asChild
                  >
                    <Pressable className="flex-row gap-3 rounded-2xl border border-border bg-card p-2.5">
                      <Image
                        source={r.image}
                        contentFit="cover"
                        style={{ width: 64, height: 64, borderRadius: 12 }}
                        accessibilityLabel={r.title}
                      />
                      <View className="min-w-0 flex-1 justify-center">
                        <Text className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
                          {r.category}
                        </Text>
                        <Text
                          className="mt-0.5 text-sm font-medium leading-snug text-foreground"
                          numberOfLines={2}
                        >
                          {r.title}
                        </Text>
                        <View className="mt-1 flex-row items-center gap-1.5">
                          <Icon as={Clock} size={10} className="text-muted-foreground" />
                          <Text className="text-[10px] text-muted-foreground">
                            {r.time} · {r.difficulty}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  </Link>
                ))}
              </View>
            </ResultSection>
          )}

          {showVideos && results.videos.length > 0 && (
            <ResultSection title="Vidéos & tutoriels" icon={PlayCircle}>
              <View className="gap-2.5">
                {results.videos.map((v) => (
                  <Link
                    key={v.id}
                    href={{ pathname: "/app/videos/[videoId]", params: { videoId: v.id } }}
                    asChild
                  >
                    <Pressable className="flex-row gap-3 rounded-2xl border border-border bg-card p-2.5">
                      <Image
                        source={v.image}
                        contentFit="cover"
                        style={{ width: 64, height: 64, borderRadius: 12 }}
                        accessibilityLabel={v.title}
                      />
                      <View className="min-w-0 flex-1 justify-center">
                        <Text className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
                          {v.category}
                        </Text>
                        <Text
                          className="mt-0.5 text-sm font-medium leading-snug text-foreground"
                          numberOfLines={2}
                        >
                          {v.title}
                        </Text>
                        <Text className="mt-1 text-[10px] text-muted-foreground">{v.duration}</Text>
                      </View>
                    </Pressable>
                  </Link>
                ))}
              </View>
            </ResultSection>
          )}

          {showArticles && results.articles.length > 0 && (
            <ResultSection title="Articles & astuces" icon={FileText}>
              <View className="gap-2.5">
                {results.articles.map((a) => (
                  <View
                    key={a.id}
                    className="flex-row gap-3 rounded-2xl border border-border bg-card p-2.5"
                  >
                    <Image
                      source={a.image}
                      contentFit="cover"
                      style={{ width: 64, height: 64, borderRadius: 12 }}
                      accessibilityLabel={a.title}
                    />
                    <View className="min-w-0 flex-1 justify-center">
                      <Text className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
                        {a.category}
                      </Text>
                      <Text
                        className="mt-0.5 text-sm font-medium leading-snug text-foreground"
                        numberOfLines={2}
                      >
                        {a.title}
                      </Text>
                      <Text className="mt-1 text-[10px] text-muted-foreground">
                        {a.readTime} de lecture
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ResultSection>
          )}

          {showFaq && results.faq.length > 0 && (
            <ResultSection title="FAQ" icon={HelpCircle}>
              <View className="gap-2.5">
                {results.faq.map((f, i) => (
                  <Link key={i} href="/app/profile/faq" asChild>
                    <Pressable className="rounded-2xl border border-border bg-card p-3">
                      <Text className="text-sm font-medium text-foreground">{f.q}</Text>
                      <Text className="mt-1 text-xs text-muted-foreground" numberOfLines={2}>
                        {f.a}
                      </Text>
                    </Pressable>
                  </Link>
                ))}
              </View>
            </ResultSection>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ResultSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: typeof BookOpen;
  children: ReactNode;
}) {
  return (
    <View>
      <View className="mb-2.5 flex-row items-center gap-2">
        <Icon as={icon} size={16} className="text-primary" />
        <Text className="font-display text-lg text-foreground">{title}</Text>
      </View>
      {children}
    </View>
  );
}
