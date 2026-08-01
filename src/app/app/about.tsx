import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { ArrowLeft, Bell, ImageIcon } from "lucide-react-native";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PerleDesLysLogo from "@/assets/perledeslys/perle-des-lys-log-with-text.svg";
import { LegalLink } from "@/components/legal-dialog";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { useAboutQuery } from "@/lib/content-queries";

// "À propos" — a branded maroon card (logo + heading + message + signature +
// photo), with legal links below. Faithful to the design; images are
// placeholders. Editable from the dashboard.
export default function AboutScreen() {
  const router = useRouter();
  const aboutQ = useAboutQuery();
  const about = aboutQ.data ?? { image: null, title: "", body: "", signature: "" };

  const paragraphs = about.body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

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
          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Icon as={Bell} size={18} className="text-primary-foreground" />
          </Pressable>
        </Link>
      </View>

      <ScrollView
        contentContainerClassName="px-5 pb-16"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={aboutQ.isFetching} onRefresh={() => aboutQ.refetch()} />
        }
      >
        <GradientView tone="luxe" className="mt-2 rounded-3xl p-6">
          <View className="items-center">
            <PerleDesLysLogo width={150} height={92} />
          </View>

          {about.title ? (
            <Text className="mt-5 font-display text-xl font-semibold text-primary-foreground">
              {about.title}
            </Text>
          ) : null}

          {paragraphs.map((p, i) => (
            <Text
              key={i}
              className="mt-3 text-[13px] leading-relaxed text-primary-foreground/90"
            >
              {p}
            </Text>
          ))}

          {about.signature ? (
            <Text className="mt-5 text-[13px] leading-relaxed text-primary-foreground/90">
              {about.signature}
            </Text>
          ) : null}

          <View className="mt-5 items-end">
            {about.image ? (
              <Image
                source={{ uri: about.image }}
                contentFit="cover"
                style={{ width: 130, height: 130, borderRadius: 20 }}
                accessibilityLabel="Photo"
              />
            ) : (
              <View
                className="items-center justify-center rounded-2xl bg-primary-foreground/15"
                style={{ width: 130, height: 130 }}
              >
                <Icon as={ImageIcon} size={28} className="text-primary-foreground/60" />
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
