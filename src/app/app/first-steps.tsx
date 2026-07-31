import { Image } from "expo-image";
import { Link } from "expo-router";
import { ArrowLeft, Clock, Heart, Lock, MessageCircle, Sparkles } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { VideoEmbed } from "@/components/video-embed";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { useVideo, useWelcomeMessage } from "@/lib/content-queries";
import { FIRST_STEPS_VIDEO_ID } from "@/lib/mock-data";

// Web source: kitchen-haven-club/src/routes/app/first-steps/index.tsx
const NEXT_STEPS = [
  "Regardez la vidéo en entier, idéalement TM7 à proximité.",
  "Lancez une première recette simple (ex : Baghrir ou Thé à la menthe).",
  "Notez vos questions au fur et à mesure avec le bouton note.",
  "Envoyez-moi votre retour écrit pour que je m'assure que tout va bien.",
];

export default function FirstStepsScreen() {
  // The "first steps" video is a fixed, hardcoded Vimeo embed; its text
  // metadata comes from the content API when present, with fallbacks so the
  // screen never depends on that specific record existing.
  const { data: video } = useVideo(FIRST_STEPS_VIDEO_ID);
  const welcomeMessage = useWelcomeMessage();
  const title = video?.title ?? "Mes premiers pas";
  const duration = video?.duration ?? "";
  const description =
    video?.description ??
    "La vidéo de mise en service de votre Thermomix TM7.";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="pb-16" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
          <Link href="/app" asChild>
            <Pressable className="-ml-2 rounded-full p-2">
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </Pressable>
          </Link>
          <View>
            <Text className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
              Catégorie exclusive
            </Text>
            <Text className="font-display text-2xl font-medium tracking-tight text-foreground">
              Mes premiers pas
            </Text>
          </View>
        </View>

        <View className="mx-5 mt-4">
          <VideoEmbed url={video?.vimeoUrl} title={title} className="rounded-3xl" />
        </View>

        <View className="px-5 mt-4">
          <View className="flex-row items-center gap-2">
            <Icon as={Clock} size={12} className="text-muted-foreground" />
            <Text className="text-[11px] text-muted-foreground">{duration}</Text>
            <Text className="text-[11px] text-muted-foreground">·</Text>
            <Icon as={Lock} size={12} className="text-muted-foreground" />
            <Text className="text-[11px] text-muted-foreground">Vidéo privée intégrée</Text>
          </View>
          <Text className="mt-2 font-display text-xl leading-tight text-foreground">{title}</Text>
          <Text className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</Text>
        </View>

        {/* Message de Ghania */}
        <View className="mx-5 mt-6 overflow-hidden rounded-3xl">
          <GradientView tone="luxe" className="p-5">
            <Text className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground opacity-90">
              Mot de Ghania
            </Text>
            <Text className="mt-1 font-italiana text-2xl text-primary-foreground">
              {welcomeMessage.subject}
            </Text>
          </GradientView>
          {welcomeMessage.image ? (
            <Image
              source={welcomeMessage.image}
              contentFit="cover"
              style={{ width: "100%", height: 180 }}
              accessibilityLabel="Message d'accueil"
            />
          ) : null}
          <View className="border border-t-0 border-border bg-card p-5">
            <Text className="text-sm leading-relaxed text-foreground/90">{welcomeMessage.body}</Text>
          </View>
        </View>

        {/* Next steps */}
        <View className="px-5 mt-7">
          <View className="mb-3 flex-row items-center gap-2">
            <Icon as={Sparkles} size={16} className="text-primary" />
            <Text className="font-display text-lg text-foreground">Vos prochaines étapes</Text>
          </View>
          <View className="gap-2">
            {NEXT_STEPS.map((step, i) => (
              <View
                key={step}
                className="flex-row gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Text className="text-xs font-semibold text-primary-foreground">{i + 1}</Text>
                </View>
                <Text className="flex-1 pt-0.5 text-sm leading-snug text-foreground">{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions. "Ajouter aux favoris" stays a non-functional placeholder
            (as in the web version). "Envoyer mon retour" now opens the customer
            review form (replaces the old dead Send-Feedback placeholder). */}
        <View className="px-5 mt-6 flex-row gap-3">
          <Pressable role="button" className="flex-1 items-center gap-1 rounded-2xl border border-border bg-card py-4">
            <Icon as={Heart} size={20} className="text-primary" />
            <Text className="text-xs font-medium text-foreground">Ajouter aux favoris</Text>
          </Pressable>
          <Link href="/app/reviews" asChild>
            <Pressable role="button" className="flex-1">
              <GradientView tone="luxe" className="items-center gap-1 rounded-2xl py-4">
                <Icon as={MessageCircle} size={20} className="text-primary-foreground" />
                <Text className="text-xs font-semibold text-primary-foreground">Donner mon avis</Text>
              </GradientView>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
