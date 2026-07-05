import { Image } from "expo-image";
import { Link } from "expo-router";
import { Heart, Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PerleDesLysText from "@/assets/perledeslys/Logo-rose.svg";
import heroImg from "@/assets/perledeslys/perle-hero-2.png";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";

// Web source: kitchen-haven-club/src/routes/index.tsx (Landing)
//
// Rebuilt per the client's v2 rebrand mockup (assets/new-assets/index-page.png):
// full-bleed hero photo (no side margin/rounding, unlike v1), small
// wordmark+crest lockup overlaid top-right on the photo, then the big
// script wordmark as its own heading below — both using the same
// `perle-des-lys-log-with-text.svg` at different sizes rather than two
// separate assets, since the source file is a single combined lockup.
export default function LandingScreen() {
  return (
    <GradientView tone="cream" className="flex-1">
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        {/* Hero image — full-bleed, extends behind the status bar */}
        <View className="relative  w-full h-[50%]">
          <Image
            source={heroImg}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
            accessibilityLabel="Perle des Lys"
          />
          <GradientView tone="roseOverlay" className="absolute inset-0" />
          {/* <SafeAreaView edges={["top"]}>
            <View className="flex-row items-center justify-end gap-1.5 px-5 pt-3">
              <PerleDesLysWordmark width={72} height={68} />
            </View>
          </SafeAreaView>*/}
          <View className="absolute bottom-4 left-5 flex-row items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5">
            <Icon as={Sparkles} size={12} className="text-primary" />
            <Text className="text-[11px] font-medium text-foreground">
              Accès cliente uniquement
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 items-center px-6 pb-6 pt-6">
          <PerleDesLysText />
          <Text className="-mt-2 text-base font-medium text-foreground">
            Par Ghania
          </Text>
          <Text className="mt-4 text-center text-[14px] leading-relaxed text-muted-foreground">
            Recettes signatures, lives privés et tutoriels exclusifs autour de
            votre TM7, créés avec amour par Ghania - votre conseillère Thermomix
          </Text>

          <View className="mt-auto w-full gap-3 pt-8">
            <Link href="/(auth)/login" asChild>
              <GradientButton tone="luxe">
                <Text className="font-medium tracking-wide text-primary-foreground">
                  J'ai déjà un compte
                </Text>
              </GradientButton>
            </Link>
            <Link href="/(auth)/login" asChild>
              <Button
                variant="outline"
                className="rounded-2xl border-primary/30 bg-card py-4"
              >
                <Text className="font-medium text-foreground/80">
                  Créer un compte
                </Text>
              </Button>
            </Link>
            <View className="flex-row items-center justify-center gap-1.5 pt-2">
              <Icon
                as={Heart}
                size={12}
                className="text-primary"
                fill="currentColor"
              />
              <Text className="text-center text-[11px] text-muted-foreground">
                Réservé aux clientes de Ghania
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </GradientView>
  );
}
