import { Image } from "expo-image";
import { Link } from "expo-router";
import { ArrowRight, Heart, Lock, Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import heroImg from "@/assets/perledeslys/perle-hero.jpg";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";

// Web source: kitchen-haven-club/src/routes/index.tsx (Landing)
export default function LandingScreen() {
  return (
    <GradientView tone="cream" className="flex-1">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pb-2 pt-2">
          <View className="flex-row items-center gap-2.5">
            <GradientView tone="luxe" className="h-10 w-10 items-center justify-center rounded-full">
              <Text className="font-italiana text-lg text-primary-foreground">P</Text>
            </GradientView>
            <View>
              <Text className="font-italiana text-base tracking-[0.2em] text-foreground">
                PERLEDESLYS
              </Text>
              <Text className="text-[9px] font-medium uppercase tracking-[0.25em] text-primary/80">
                Espace privé
              </Text>
            </View>
          </View>
          <Link href="/(auth)/login">
            <Text className="text-xs font-medium tracking-wide text-foreground/70">Connexion</Text>
          </Link>
        </View>

        {/* Hero image */}
        <View className="mt-3 px-5">
          <View className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
            <Image
              source={heroImg}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
              accessibilityLabel="Univers PERLEDESLYS"
            />
            <GradientView tone="roseOverlay" className="absolute inset-0" />
            <View className="absolute left-4 top-4 flex-row items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5">
              <Icon as={Lock} size={12} className="text-primary" />
              <Text className="text-[11px] font-medium text-foreground">
                Accès cliente uniquement
              </Text>
            </View>
            <View className="absolute bottom-5 left-5 right-5">
              <View className="flex-row items-center gap-1.5">
                <Icon as={Sparkles} size={12} className="text-primary-foreground opacity-90" />
                <Text className="text-[10px] uppercase tracking-[0.3em] text-primary-foreground opacity-90">
                  Édition Thermomix TM7
                </Text>
              </View>
              <Text className="mt-1.5 font-italiana text-3xl leading-tight text-primary-foreground">
                Bienvenue dans{"\n"}votre écrin culinaire.
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-6 pb-6 pt-7">
          <Text className="font-display text-[2.6rem] leading-none tracking-tight text-foreground">
            La touche{"\n"}
            <Text className="font-italiana italic text-primary">algérienne</Text>
            {"\n"}du Thermomix.
          </Text>
          <Text className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
            Recettes signatures, lives privés et tutoriels exclusifs autour de votre TM7, créés
            avec amour par Lys — votre conseillère Thermomix.
          </Text>

          <View className="mt-auto gap-3 pt-8">
            <Link href="/(auth)/login" asChild>
              <GradientButton tone="luxe" className="justify-between">
                <Text className="font-medium tracking-wide text-primary-foreground">
                  Accéder à mon espace
                </Text>
                <Icon as={ArrowRight} size={20} className="text-primary-foreground" />
              </GradientButton>
            </Link>
            <Link href="/(auth)/login" asChild>
              <Button variant="outline" className="rounded-2xl border-primary/30 bg-card py-4">
                <Text className="font-medium text-foreground/80">J'ai reçu une invitation</Text>
              </Button>
            </Link>
            <View className="flex-row items-center justify-center gap-1.5 pt-2">
              <Icon as={Heart} size={12} className="text-primary" fill="currentColor" />
              <Text className="text-center text-[11px] text-muted-foreground">
                Réservé aux clientes Thermomix de Lys
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </GradientView>
  );
}
