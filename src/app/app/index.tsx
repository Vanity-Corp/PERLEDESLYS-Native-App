import { Image } from "expo-image";
import { Link } from "expo-router";
import {
  Bell,
  BookOpen,
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  Flame,
  Play,
  Radio,
  Search,
  Sparkles,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MiniCalendar } from "@/components/mini-calendar";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { articles, founderInfo, lives, recipes, videos } from "@/lib/mock-data";

// Web source: kitchen-haven-club/src/routes/app/index.tsx (Dashboard)
export default function DashboardScreen() {
  const continueWatching = videos.filter((v) => v.progress).slice(0, 3);
  const newRecipes = recipes.filter((r) => r.isNew);
  const popularRecipes = recipes.slice(0, 6);
  const nextLive = lives.find((l) => l.status === "À venir");
  const featured = recipes[0];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pb-2 pt-2">
          <View className="flex-row items-center gap-3">
            <Text className="text-primary font-display text-3xl font-semibold tracking-tight ">
              Accueil
            </Text>
          </View>
          <Pressable
            role="button"
            className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
          >
            <Icon as={Bell} size={20} className="text-foreground" />
            <View className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-primary" />
          </Pressable>
        </View>

        {/* Search */}
        <View className="mt-4 px-5">
          <Link href="/app/search" asChild>
            <Pressable className="relative">
              <View className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
                <Icon as={Search} size={16} className="text-muted-foreground" />
              </View>
              <View className="w-full rounded-2xl border border-border bg-card py-3.5 pl-11 pr-4">
                <Text className="text-sm text-muted-foreground">
                  Rechercher une recette, un tutoriel TM7…
                </Text>
              </View>
            </Pressable>
          </Link>
        </View>

        {/* Live banner */}
        {nextLive && (
          <Link href="/app/lives" asChild>
            <Pressable className="mx-5 mt-5 overflow-hidden rounded-3xl">
              <View className="relative h-32 w-full">
                <Image
                  source={nextLive.image}
                  contentFit="cover"
                  style={{ width: "100%", height: "100%" }}
                  accessibilityLabel={nextLive.title}
                />
                <GradientView tone="roseOverlay" className="absolute inset-0" />
                <View className="absolute inset-0 flex-col justify-between p-4">
                  <View className="flex-row items-center gap-1.5 self-start rounded-full bg-background/95 px-2.5 py-1">
                    <Icon as={Radio} size={12} className="text-primary" />
                    <Text className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
                      Prochain live
                    </Text>
                  </View>
                  <View>
                    <Text className="text-[11px] uppercase tracking-wider text-primary-foreground opacity-90">
                      {nextLive.date} · {nextLive.time}
                    </Text>
                    <Text className="mt-0.5 font-display text-base leading-tight text-primary-foreground">
                      {nextLive.title}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </Link>
        )}

        <MiniCalendar />

        {/* Mes premiers pas */}
        <Section title="Mes premiers pas">
          <View className="px-5">
            <Link href="/app/first-steps" asChild>
              <Pressable className="overflow-hidden rounded-3xl">
                <GradientView
                  tone="luxe"
                  className="flex-row items-center gap-4 p-5"
                >
                  <View className="h-14 w-14 items-center justify-center rounded-2xl bg-background/20">
                    <Icon
                      as={Compass}
                      size={28}
                      className="text-primary-foreground"
                    />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground opacity-90">
                      Pour bien démarrer
                    </Text>
                    <Text className="mt-0.5 font-display text-xl leading-tight text-primary-foreground">
                      Mes premiers pas avec le TM7
                    </Text>
                    <View className="mt-1 flex-row items-center gap-2">
                      <View className="flex-row items-center gap-1">
                        <Icon
                          as={Play}
                          size={12}
                          className="text-primary-foreground"
                          fill="currentColor"
                        />
                        <Text className="text-[11px] text-primary-foreground opacity-90">
                          Vidéo 35 min
                        </Text>
                      </View>
                      <Text className="text-[11px] text-primary-foreground opacity-90">
                        ·
                      </Text>
                      <Text className="text-[11px] text-primary-foreground opacity-90">
                        Mot de Ghania inclus
                      </Text>
                    </View>
                  </View>
                  <Icon
                    as={ChevronRight}
                    size={20}
                    className="text-primary-foreground opacity-80"
                  />
                </GradientView>
              </Pressable>
            </Link>
          </View>
        </Section>

        {/* Featured recipe */}
        <Section title="Recette signature" href="/app/recipes">
          <View className="px-5">
            <Link
              href={{
                pathname: "/app/recipes/[recipeId]",
                params: { recipeId: featured.id },
              }}
              asChild
            >
              <Pressable className="aspect-[16/10] overflow-hidden rounded-3xl">
                <View className="relative h-full w-full">
                  <Image
                    source={featured.image}
                    contentFit="cover"
                    style={{ width: "100%", height: "100%" }}
                    accessibilityLabel={featured.title}
                  />
                  <GradientView tone="overlay" className="absolute inset-0" />
                  {featured.isNew && (
                    <GradientView
                      tone="gold"
                      className="absolute left-3 top-3 rounded-full px-2.5 py-1"
                    >
                      <Text className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
                        ✨ Nouveau
                      </Text>
                    </GradientView>
                  )}
                  <View className="absolute bottom-4 left-4 right-4">
                    <Text className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground opacity-90">
                      {featured.category}
                    </Text>
                    <Text className="mt-0.5 font-display text-2xl leading-tight text-primary-foreground">
                      {featured.title}
                    </Text>
                    <View className="mt-2 flex-row items-center gap-3">
                      <View className="flex-row items-center gap-1">
                        <Icon
                          as={Clock}
                          size={12}
                          className="text-primary-foreground"
                        />
                        <Text className="text-[11px] text-primary-foreground opacity-95">
                          {featured.time}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Icon
                          as={Flame}
                          size={12}
                          className="text-primary-foreground"
                        />
                        <Text className="text-[11px] text-primary-foreground opacity-95">
                          {featured.difficulty}
                        </Text>
                      </View>
                      <View className="ml-auto flex-row items-center gap-1 rounded-full bg-background/95 px-2 py-0.5">
                        <Icon
                          as={ExternalLink}
                          size={12}
                          className="text-foreground"
                        />
                        <Text className="text-[11px] text-foreground">
                          Cookidoo
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            </Link>
          </View>
        </Section>

        {/* Continue watching */}
        {continueWatching.length > 0 && (
          <Section title="Reprendre la formation" href="/app/tutorials">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3 px-5"
            >
              {continueWatching.map((v) => (
                <Link
                  key={v.id}
                  href={{
                    pathname: "/app/videos/[videoId]",
                    params: { videoId: v.id },
                  }}
                  asChild
                >
                  <Pressable className="w-64">
                    {/* v2 rebrand (dashboard-page.png): category/title moved
                        onto the image itself (over the existing overlay
                        scrim) and the progress bar is a bold overlay strip
                        at the image's bottom edge, replacing the old
                        below-image text block + thin progress hairline. */}
                    <View className="relative aspect-video overflow-hidden rounded-2xl">
                      <Image
                        source={v.image}
                        contentFit="cover"
                        style={{ width: "100%", height: "100%" }}
                        accessibilityLabel={v.title}
                      />
                      <GradientView
                        tone="overlay"
                        className="absolute inset-0"
                      />
                      <View className="absolute inset-0 items-center justify-center">
                        <View className="h-12 w-12 items-center justify-center rounded-full bg-background/95">
                          <Icon
                            as={Play}
                            size={20}
                            className="text-primary"
                            fill="currentColor"
                          />
                        </View>
                      </View>
                      <View className="absolute right-2 top-2 rounded-full bg-background/95 px-2 py-0.5">
                        <Text className="text-[10px] font-medium text-foreground">
                          {v.duration}
                        </Text>
                      </View>
                      <View className="absolute bottom-3 left-2 right-2">
                        <Text className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary-foreground">
                          {v.category}
                        </Text>
                        <Text
                          className="mt-0.5 text-sm font-medium leading-snug text-primary-foreground"
                          numberOfLines={2}
                        >
                          {v.title}
                        </Text>
                      </View>
                      {v.progress ? (
                        <Progress
                          value={v.progress}
                          className="absolute inset-x-0 bottom-0 h-1.5"
                        />
                      ) : null}
                    </View>
                  </Pressable>
                </Link>
              ))}
            </ScrollView>
          </Section>
        )}

        {/* New recipes */}
        {newRecipes.length > 0 && (
          <Section title="Nouveautés de la semaine" href="/app/recipes">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3 px-5"
            >
              {newRecipes.map((r) => (
                <Link
                  key={r.id}
                  href={{
                    pathname: "/app/recipes/[recipeId]",
                    params: { recipeId: r.id },
                  }}
                  asChild
                >
                  <Pressable className="w-44">
                    <View className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                      <Image
                        source={r.image}
                        contentFit="cover"
                        style={{ width: "100%", height: "100%" }}
                        accessibilityLabel={r.title}
                      />
                      <GradientView
                        tone="overlay"
                        className="absolute inset-0"
                      />
                      <GradientView
                        tone="gold"
                        className="absolute left-2 top-2 rounded-full px-2 py-0.5"
                      >
                        <Text className="text-[9px] font-semibold uppercase text-foreground">
                          Nouveau
                        </Text>
                      </GradientView>
                      <View className="absolute bottom-2 left-2 right-2">
                        <Text className="text-[9px] uppercase tracking-wider text-primary-foreground opacity-80">
                          {r.category}
                        </Text>
                        <Text
                          className="mt-0.5 text-xs font-medium leading-tight text-primary-foreground"
                          numberOfLines={2}
                        >
                          {r.title}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                </Link>
              ))}
            </ScrollView>
          </Section>
        )}

        {/* Quick access tiles */}
        <Section title="Votre univers TM7">
          <View className="flex-row gap-3 px-5">
            <Link href="/app/tutorials" asChild>
              <Pressable className="flex-1">
                <GradientView
                  tone="luxe"
                  className="aspect-square flex-col justify-between rounded-2xl p-4"
                >
                  <Icon
                    as={Play}
                    size={24}
                    className="text-primary-foreground"
                  />
                  <View>
                    <Text className="font-display text-lg leading-tight text-primary-foreground">
                      Tutoriels
                    </Text>
                    <Text className="mt-0.5 text-[10px] text-primary-foreground opacity-90">
                      {videos.length} vidéos TM7
                    </Text>
                  </View>
                </GradientView>
              </Pressable>
            </Link>
            <Link href="/app/profile/tips" asChild>
              <Pressable className="flex-1">
                <View className="aspect-square flex-col justify-between rounded-2xl border border-border bg-card p-4">
                  <Icon as={Sparkles} size={24} className="text-primary" />
                  <View>
                    <Text className="font-display text-lg leading-tight text-foreground">
                      Astuces
                    </Text>
                    <Text className="mt-0.5 text-[10px] text-muted-foreground">
                      Conseils & batch cooking
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Link>
          </View>
        </Section>

        {/* Popular recipes */}
        <Section title="Recettes populaires" href="/app/recipes">
          <View className="flex-row flex-wrap gap-3 px-5">
            {popularRecipes.map((r) => (
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
                      <Text className="text-[10px] text-muted-foreground">
                        ·
                      </Text>
                      <Text className="text-[10px] text-muted-foreground">
                        {r.difficulty}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </Link>
            ))}
          </View>
        </Section>

        {/* Founder card */}
        <Section title="Votre conseillère">
          <GradientView
            tone="luxe"
            className="mx-5 flex-row items-center gap-4 rounded-3xl p-5"
          >
            <Image
              source={founderInfo.avatar}
              contentFit="cover"
              style={{ width: 64, height: 64, borderRadius: 32 }}
              accessibilityLabel={founderInfo.name}
            />
            <View className="min-w-0 flex-1">
              <Text className="font-italiana text-xl tracking-wide text-primary-foreground">
                {founderInfo.fullName}
              </Text>
              <Text className="mt-1 text-[11px] leading-snug text-primary-foreground opacity-90">
                {founderInfo.bio}
              </Text>
            </View>
          </GradientView>
        </Section>

        {/* Articles */}
        <Section title="Astuces & conseils" href="/app/profile/tips">
          <View className="gap-3 px-5">
            {articles.slice(0, 3).map((a) => (
              <View
                key={a.id}
                className="flex-row gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <Image
                  source={a.image}
                  contentFit="cover"
                  style={{ width: 80, height: 80, borderRadius: 12 }}
                  accessibilityLabel={a.title}
                />
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
                  <View className="mt-1.5 flex-row items-center gap-1">
                    <Icon
                      as={BookOpen}
                      size={12}
                      className="text-muted-foreground"
                    />
                    <Text className="text-[10px] text-muted-foreground">
                      {a.readTime} de lecture
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <View className="mt-7">
      <View className="mb-3 flex-row items-center justify-between px-5">
        <Text className="font-display text-xl font-medium tracking-tight text-primary">
          {title}
        </Text>
        {href && (
          <Link href={href as never} asChild>
            <Pressable className="flex-row items-center gap-0.5">
              <Text className="text-xs font-medium text-primary">
                Tout voir
              </Text>
              <Icon as={ChevronRight} size={12} className="text-primary" />
            </Pressable>
          </Link>
        )}
      </View>
      {children}
    </View>
  );
}
