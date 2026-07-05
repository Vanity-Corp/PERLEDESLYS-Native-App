import { Image } from "expo-image";
import { Link } from "expo-router";
import { ArrowLeft, Play } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { videos } from "@/lib/mock-data";

// Web source: kitchen-haven-club/src/routes/app/tutorials/index.tsx
const TABS = ["Tout", "Mes premiers pas", "Premier démarrage", "Tutoriel TM7", "Recette vidéo", "Astuces"];

export default function TutorialsScreen() {
  const [tab, setTab] = useState("Tout");
  const filtered = videos.filter((v) => tab === "Tout" || v.category === tab);

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
            <Text className="font-display text-2xl font-medium tracking-tight text-foreground">Vidéos</Text>
            <Text className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Formations exclusives Thermomix TM7
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-5 pb-1"
          className="mt-4"
        >
          <ToggleGroup type="single" value={tab} onValueChange={(v) => v && setTab(v)}>
            {TABS.map((t) => (
              <ToggleGroupItem
                key={t}
                value={t}
                className="mr-2 h-auto min-w-0 rounded-full border border-border bg-card px-4 py-2"
              >
                <Text className="text-xs font-medium">{t}</Text>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </ScrollView>

        <View className="mt-5 gap-4 px-5">
          {filtered.map((v) => (
            <Link key={v.id} href={{ pathname: "/app/videos/[videoId]", params: { videoId: v.id } }} asChild>
              <Pressable>
                <View className="relative aspect-video overflow-hidden rounded-2xl">
                  <Image
                    source={v.image}
                    contentFit="cover"
                    style={{ width: "100%", height: "100%" }}
                    accessibilityLabel={v.title}
                  />
                  <GradientView tone="overlay" className="absolute inset-0" />
                  <View className="absolute inset-0 items-center justify-center">
                    <View className="h-14 w-14 items-center justify-center rounded-full bg-background/95">
                      <Icon as={Play} size={24} className="text-primary" fill="currentColor" />
                    </View>
                  </View>
                  <View className="absolute bottom-2 right-2 rounded-full bg-background/95 px-2 py-0.5">
                    <Text className="text-[10px] font-medium text-foreground">{v.duration}</Text>
                  </View>
                  {v.progress ? (
                    <Progress value={v.progress} className="absolute inset-x-0 bottom-0" />
                  ) : null}
                </View>
                <View className="mt-2">
                  <Text className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
                    {v.category}
                  </Text>
                  <Text className="mt-0.5 text-sm font-medium leading-snug text-foreground">{v.title}</Text>
                  <Text className="mt-1 text-xs text-muted-foreground" numberOfLines={1}>
                    {v.description}
                  </Text>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
