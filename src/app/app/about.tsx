import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { ArrowLeft, Bell, ImageIcon } from "lucide-react-native";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PerleDesLysLogo from "@/assets/perledeslys/perle-des-lys-log-with-text.svg";
import { LegalLink } from "@/components/legal-dialog";
import { RichTextView } from "@/components/rich-text-view";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { useAboutQuery, useHardRefresh } from "@/lib/content-queries";

// "À propos" — a branded header (logo or image) + rich-text content edited from
// the dashboard, with legal links (privacy / terms) at the bottom.
export default function AboutScreen() {
  const router = useRouter();
  const aboutQ = useAboutQuery();
  const about = aboutQ.data ?? { image: null, body: "" };
  const onRefresh = useHardRefresh([["about"]]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
        <Pressable onPress={() => router.back()} className="-ml-2 rounded-full p-2">
          <Icon as={ArrowLeft} size={20} className="text-foreground" />
        </Pressable>
        <Text className="flex-1 font-display text-2xl font-medium tracking-tight text-foreground">
          À propos
        </Text>
        <Link href="/app/notifications" asChild>
          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-accent">
            <Icon as={Bell} size={18} className="text-white" />
          </Pressable>
        </Link>
      </View>

      <ScrollView
        contentContainerClassName="px-5 pb-16"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={aboutQ.isFetching} onRefresh={onRefresh} />
        }
      >
        {/* Maroon "À propos" card: logo at top, the rich-text body (light text
            on the dark card), and a placeholder image (or about.image) at the
            bottom-right — faithful to the design. */}
        <GradientView tone="luxe" className="mt-2 rounded-3xl p-6">
          <View className="items-center">
            <PerleDesLysLogo width={200} height={120} />
          </View>

          {about.body?.trim() ? (
            <View className="mt-4">
              <RichTextView html={about.body} onDark />
            </View>
          ) : null}

          <View className="mt-6 items-end">
            {about.image ? (
              <Image
                source={{ uri: about.image }}
                contentFit="cover"
                style={{ width: 140, height: 140, borderRadius: 20 }}
                accessibilityLabel="À propos"
              />
            ) : (
              <View
                className="items-center justify-center rounded-[20px] bg-background/20"
                style={{ width: 140, height: 140 }}
              >
                <Icon as={ImageIcon} size={32} className="text-primary-foreground opacity-80" />
              </View>
            )}
          </View>
        </GradientView>

        <View className="mt-8 items-center gap-3">
          <LegalLink doc="privacy">Politique de confidentialité</LegalLink>
          <LegalLink doc="terms">Conditions générales</LegalLink>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
