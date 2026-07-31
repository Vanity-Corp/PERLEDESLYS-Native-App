import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { useFounder, useWhoAmIQuery } from "@/lib/content-queries";

// "Qui suis-je ?" — founder bio + an image grid + a horizontal photo carousel +
// the "Un mot de Ghania" testimonial. All editable from the dashboard.
export default function WhoAmIScreen() {
  const router = useRouter();
  const whoQ = useWhoAmIQuery();
  const who = whoQ.data ?? {
    bio: "",
    gridImages: [] as string[],
    carouselImages: [] as string[],
    quote: "",
  };
  const founder = useFounder();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
        <Pressable onPress={() => router.back()} className="-ml-2 rounded-full p-2">
          <Icon as={ArrowLeft} size={20} className="text-foreground" />
        </Pressable>
        <Text className="font-display text-2xl font-medium tracking-tight text-foreground">
          Qui suis-je ?
        </Text>
      </View>

      <ScrollView
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={whoQ.isFetching}
            onRefresh={() => whoQ.refetch()}
          />
        }
      >
        {who.bio ? (
          <Text className="px-5 pt-2 text-sm leading-relaxed text-foreground">
            {who.bio}
          </Text>
        ) : null}

        {who.gridImages.length > 0 && (
          <View className="mt-6 flex-row flex-wrap gap-3 px-5">
            {who.gridImages.map((url, i) => (
              <View
                key={i}
                className="overflow-hidden rounded-2xl"
                style={{ width: "47%", aspectRatio: 1 }}
              >
                <Image
                  source={{ uri: url }}
                  contentFit="cover"
                  style={{ width: "100%", height: "100%" }}
                  accessibilityLabel="Photo"
                />
              </View>
            ))}
          </View>
        )}

        {who.carouselImages.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3 px-5"
            className="mt-6"
          >
            {who.carouselImages.map((url, i) => (
              <View
                key={i}
                className="overflow-hidden rounded-2xl"
                style={{ width: 260, height: 180 }}
              >
                <Image
                  source={{ uri: url }}
                  contentFit="cover"
                  style={{ width: "100%", height: "100%" }}
                  accessibilityLabel="Photo"
                />
              </View>
            ))}
          </ScrollView>
        )}

        {who.quote ? (
          <GradientView
            tone="luxe"
            className="mx-5 mt-6 flex-row items-center gap-4 rounded-3xl p-5"
          >
            {founder.avatar ? (
              <Image
                source={founder.avatar}
                contentFit="cover"
                style={{ width: 48, height: 48, borderRadius: 24 }}
                accessibilityLabel={founder.name}
              />
            ) : null}
            <View className="min-w-0 flex-1">
              <Text className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground opacity-90">
                Un mot de Ghania
              </Text>
              <Text className="mt-1 text-sm leading-snug text-primary-foreground">
                {who.quote}
              </Text>
            </View>
          </GradientView>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
