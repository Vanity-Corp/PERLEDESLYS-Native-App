import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { ArrowLeft, Bell, ImageIcon, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ReviewCarousel } from "@/components/review-carousel";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { useHardRefresh, useReviews, useWhoAmIQuery } from "@/lib/content-queries";

// "Qui suis-je ?" — Mon histoire, Pourquoi cette application, Statistiques,
// Mes photos and client reviews. Faithful to the design; images come from the
// dashboard (storyImage / carouselImages) with placeholders as fallback.
// Text/stats are editable from the dashboard, with the screenshot content as
// built-in defaults so the page is never empty.

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
  const onRefresh = useHardRefresh([["who-am-i"], ["reviews"]]);

  // Full-screen image viewer: holds the tapped carousel image uri (null closed).
  const [viewer, setViewer] = useState<string | null>(null);

  // Fall back to the screenshot content when a field hasn't been filled in the
  // dashboard yet.
  const bio = who?.bio?.trim() ? who.bio : DEFAULT_STORY;
  const why = who?.why?.trim() ? who.why : DEFAULT_WHY;
  const stats = who?.stats?.length ? who.stats : DEFAULT_STATS;
  const storyImage = who?.storyImage?.trim() ? who.storyImage : null;
  const carouselImages = who?.carouselImages ?? [];

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
          <RefreshControl refreshing={whoQ.isFetching} onRefresh={onRefresh} />
        }
      >
        {/* Mon histoire */}
        <SectionTitle>Mon histoire</SectionTitle>
        <View className="flex-row gap-4">
          <Text className="flex-1 text-[13px] leading-relaxed text-foreground">
            {bio}
          </Text>
          {storyImage ? (
            <View
              className="overflow-hidden rounded-2xl bg-secondary"
              style={{ width: 120, height: 120 }}
            >
              <Image
                source={storyImage}
                contentFit="cover"
                style={{ width: "100%", height: "100%" }}
                accessibilityLabel="Mon histoire"
              />
            </View>
          ) : (
            <ImagePlaceholder size={120} />
          )}
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

        {/* Mes photos — real dashboard images (tappable → full-screen viewer)
            or neutral placeholders when none are set yet. */}
        <SectionTitle>Mes photos</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3"
        >
          {carouselImages.length > 0
            ? carouselImages.map((uri, i) => (
                <Pressable
                  key={i}
                  onPress={() => setViewer(uri)}
                  accessibilityRole="imagebutton"
                  accessibilityLabel="Agrandir la photo"
                >
                  <View
                    className="overflow-hidden rounded-2xl bg-secondary"
                    style={{ width: 150, height: 150 }}
                  >
                    <Image
                      source={uri}
                      contentFit="cover"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </View>
                </Pressable>
              ))
            : Array.from({ length: 4 }).map((_, i) => (
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

      {/* Full-screen image viewer — dimmed backdrop, contained image, dismiss
          on backdrop tap or the top-right close button. */}
      <Modal
        visible={viewer !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setViewer(null)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/90"
          onPress={() => setViewer(null)}
        >
          {viewer && (
            <Image
              source={viewer}
              contentFit="contain"
              style={{ width: "100%", height: "100%" }}
              accessibilityLabel="Photo en plein écran"
            />
          )}
          <SafeAreaView className="absolute inset-x-0 top-0" edges={["top"]}>
            <Pressable
              onPress={() => setViewer(null)}
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              className="m-4 h-10 w-10 items-center justify-center self-end rounded-full bg-white/15"
            >
              <Icon as={X} size={22} className="text-white" />
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Modal>
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

// Neutral rounded placeholder box (shown when no dashboard image is set).
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
