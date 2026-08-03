import { Link, useRouter } from "expo-router";
import { ArrowLeft, Bell, ImageIcon } from "lucide-react-native";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ReviewCarousel } from "@/components/review-carousel";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { useReviews, useWhoAmIQuery } from "@/lib/content-queries";

// "Qui suis-je ?" — Mon histoire, Pourquoi cette application, Statistiques,
// Mes photos and client reviews. Faithful to the design; images are
// placeholders. Text/stats are editable from the dashboard, with the
// screenshot content as built-in defaults so the page is never empty.

const DEFAULT_STORY =
  "Je m'appelle Ghania. Passionnée de cuisine algérienne depuis toujours, j'ai souhaité moderniser les recettes traditionnelles grâce au Thermomix TM7 tout en conservant leur authenticité.";
const DEFAULT_WHY =
  "J'ai créé PERLEDESLYS afin d'offrir à mes clientes un espace privé regroupant toutes mes recettes, astuces, vidéos et accompagnements.";
const DEFAULT_STATS = [
  { value: "3 Ans", label: "d'expérience" },
  { value: "+3000", label: "Clientes Accompagnées" },
  { value: "+ 200", label: "Recettes" },
  { value: "3ème", label: "en France" },
];

export default function WhoAmIScreen() {
  const router = useRouter();
  const whoQ = useWhoAmIQuery();
  const who = whoQ.data;
  const reviews = useReviews();

  // Fall back to the screenshot content when a field hasn't been filled in the
  // dashboard yet.
  const bio = who?.bio?.trim() ? who.bio : DEFAULT_STORY;
  const why = who?.why?.trim() ? who.why : DEFAULT_WHY;
  const stats = who?.stats?.length ? who.stats : DEFAULT_STATS;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
        <Pressable onPress={() => router.back()} className="-ml-2 rounded-full p-2">
          <Icon as={ArrowLeft} size={20} className="text-foreground" />
        </Pressable>
        <Text className="flex-1 font-display text-2xl font-medium tracking-tight text-foreground">
          Qui suis-je ?
        </Text>
        <Link href="/app/notifications" asChild>
          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Icon as={Bell} size={18} className="text-primary-foreground" />
          </Pressable>
        </Link>
      </View>

      <ScrollView
        contentContainerClassName="px-5 pb-16"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={whoQ.isFetching} onRefresh={() => whoQ.refetch()} />
        }
      >
        {/* Mon histoire */}
        <SectionTitle>Mon histoire</SectionTitle>
        <View className="flex-row gap-4">
          <Text className="flex-1 text-[13px] leading-relaxed text-foreground">
            {bio}
          </Text>
          <ImagePlaceholder size={120} />
        </View>

        {/* Pourquoi cette application */}
        <SectionTitle>Pourquoi cette application ?</SectionTitle>
        <Text className="text-[13px] leading-relaxed text-foreground">{why}</Text>

        {/* Statistiques */}
        <SectionTitle>Statistiques</SectionTitle>
        <View className="flex-row flex-wrap gap-3">
          {stats.map((s, i) => (
            <GradientView
              key={i}
              tone="luxe"
              className="items-center justify-center rounded-2xl px-4 py-6"
              style={{ width: "47.5%" }}
            >
              <Text className="text-center font-display text-2xl font-bold text-primary-foreground">
                {s.value}
              </Text>
              <Text className="mt-1 text-center text-xs text-primary-foreground/90">
                {s.label}
              </Text>
            </GradientView>
          ))}
        </View>

        {/* Mes photos (placeholders) */}
        <SectionTitle>Mes photos</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <ImagePlaceholder key={i} size={150} />
          ))}
        </ScrollView>

        {/* Témoignage clients — reuses the home "Avis de nos clientes" carousel. */}
        <SectionTitle>Témoignage clients</SectionTitle>
        {reviews.length > 0 ? (
          <ReviewCarousel reviews={reviews} />
        ) : (
          <Text className="text-sm text-muted-foreground">
            Aucun avis pour le moment.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text className="mb-3 mt-7 font-display text-lg font-semibold text-primary">
      {children}
    </Text>
  );
}

// Neutral rounded placeholder box (design uses placeholder imagery for now).
function ImagePlaceholder({ size }: { size: number }) {
  return (
    <View
      className="items-center justify-center overflow-hidden rounded-2xl bg-secondary"
      style={{ width: size, height: size }}
    >
      <Icon as={ImageIcon} size={26} className="text-muted-foreground" />
    </View>
  );
}
