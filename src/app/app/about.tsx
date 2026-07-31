import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PerleDesLysLogo from "@/assets/perledeslys/perle-des-lys-log-with-text.svg";
import { LegalLink } from "@/components/legal-dialog";
import { RichTextView } from "@/components/rich-text-view";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "react-native";
import { useAboutQuery } from "@/lib/content-queries";

// "À propos" — a branded card + rich-text body, with legal links (privacy /
// terms) at the bottom that open dialogs. Editable from the dashboard.
export default function AboutScreen() {
  const router = useRouter();
  const aboutQ = useAboutQuery();
  const about = aboutQ.data ?? { image: null, body: "" };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
        <Pressable onPress={() => router.back()} className="-ml-2 rounded-full p-2">
          <Icon as={ArrowLeft} size={20} className="text-foreground" />
        </Pressable>
        <Text className="font-display text-2xl font-medium tracking-tight text-foreground">
          À propos
        </Text>
      </View>

      <ScrollView
        contentContainerClassName="px-5 pb-16"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={aboutQ.isFetching}
            onRefresh={() => aboutQ.refetch()}
          />
        }
      >
        <GradientView
          tone="luxe"
          className="mt-2 items-center justify-center overflow-hidden rounded-3xl p-8"
          style={{ minHeight: 220 }}
        >
          {about.image ? (
            <Image
              source={{ uri: about.image }}
              contentFit="cover"
              style={{ width: "100%", height: 220, borderRadius: 16 }}
              accessibilityLabel="À propos"
            />
          ) : (
            <PerleDesLysLogo width={200} height={120} />
          )}
        </GradientView>

        {about.body?.trim() ? (
          <View className="mt-4">
            <RichTextView html={about.body} />
          </View>
        ) : null}

        <View className="mt-8 items-center gap-3">
          <LegalLink doc="privacy">Politique de confidentialité</LegalLink>
          <LegalLink doc="terms">Conditions générales</LegalLink>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
