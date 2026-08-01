import { Link, useRouter } from "expo-router";
import { ArrowLeft, Bell, ImageIcon, User } from "lucide-react-native";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { useWhoAmIQuery } from "@/lib/content-queries";

// "Qui suis-je ?" — Mon histoire, Pourquoi cette application, Statistiques,
// Mes photos and a client testimonial. Faithful to the design; images are
// placeholders. All text is editable from the dashboard.
export default function WhoAmIScreen() {
  const router = useRouter();
  const whoQ = useWhoAmIQuery();
  const who = whoQ.data ?? {
    bio: "",
    why: "",
    stats: [] as { value: string; label: string }[],
    gridImages: [] as string[],
    carouselImages: [] as string[],
    quote: "",
    testimonialName: "",
    testimonialText: "",
  };

  // "Mes photos" uses placeholders (design uses placeholder imagery for now).
  const photoCount = 4;

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
            {who.bio}
          </Text>
          <ImagePlaceholder size={120} />
        </View>

        {/* Pourquoi cette application */}
        {who.why ? (
          <>
            <SectionTitle>Pourquoi cette application ?</SectionTitle>
            <Text className="text-[13px] leading-relaxed text-foreground">
              {who.why}
            </Text>
          </>
        ) : null}

        {/* Statistiques */}
        {who.stats.length > 0 && (
          <>
            <SectionTitle>Statistiques</SectionTitle>
            <View className="flex-row flex-wrap gap-3">
              {who.stats.map((s, i) => (
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
          </>
        )}

        {/* Mes photos (placeholders) */}
        <SectionTitle>Mes photos</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3"
        >
          {Array.from({ length: photoCount }).map((_, i) => (
            <ImagePlaceholder key={i} size={150} />
          ))}
        </ScrollView>

        {/* Témoignage clients */}
        {who.testimonialText ? (
          <>
            <SectionTitle>Témoignage clients</SectionTitle>
            <GradientView
              tone="luxe"
              className="flex-row items-center gap-4 rounded-3xl p-5"
            >
              <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/20">
                <Icon as={User} size={24} className="text-primary-foreground" />
              </View>
              <View className="min-w-0 flex-1">
                {who.testimonialName ? (
                  <Text className="font-display text-lg text-primary-foreground">
                    {who.testimonialName}
                  </Text>
                ) : null}
                <Text className="mt-0.5 text-xs leading-snug text-primary-foreground/90">
                  {who.testimonialText}
                </Text>
              </View>
            </GradientView>
          </>
        ) : null}
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
