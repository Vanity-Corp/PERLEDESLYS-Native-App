import { Image } from "expo-image";
import { Link, Redirect } from "expo-router";
import { Heart, Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/lib/auth-store";
import { useLanding } from "@/lib/content-queries";

import algerianFlag from "@/assets/perledeslys/algerian-flag.png";
import heroImg from "@/assets/perledeslys/perle-hero-2.png";
import WhiteLogo from "@/assets/perledeslys/White-logo-with-text.svg";
import { Button } from "@/components/ui/button";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";

// Web source: kitchen-haven-club/src/routes/index.tsx (Landing)
//
// Client rebrand: full-bleed hero photo that fades into a solid bordeaux
// (#3E090E) screen. White combined crest+wordmark lockup, amber "Par Ghania",
// cream/white CTAs. A slightly cut-off Algerian flag sits on the left edge.
export default function LandingScreen() {
  // Boot redirect (BACKEND_PLAN.md Phase 3): send an already-logged-in user
  // straight past the landing page — ACTIVE → app, PENDING → activation. Wait
  // for the persisted auth store to rehydrate before deciding.
  const { token, user, hydrated } = useAuth();
  // Editable landing copy (public endpoint) with a built-in fallback. Called
  // before the early return to respect the rules of hooks.
  const landing = useLanding();
  if (hydrated && token) {
    return (
      <Redirect
        href={user?.status === "ACTIVE" ? "/app" : "/(auth)/activate"}
      />
    );
  }

  return (
    <View className="flex-1 bg-primary">
      {/* Hero image — full-bleed, extends behind the status bar, fades to bordeaux */}
      <View className="relative w-full h-[42%]">
        <Image
          source={landing.image ? { uri: landing.image } : heroImg}
          contentPosition="top"
          contentFit="cover"
          style={{ width: "100%", height: "100%" }}
          accessibilityLabel="Perledeslys"
        />
        <GradientView tone="bordeauxOverlay" className="absolute inset-0" />

        {/* Slightly cut-off Algerian flag on the left edge */}
        <Image
          source={algerianFlag}
          contentFit="contain"
          style={{
            position: "absolute",
            left: "-75%",
            top: 0,
            width: 396,
            height: 428,
            opacity: 0.9,
          }}
          accessibilityLabel="Algérie"
        />

        {/* "Accès cliente uniquement" badge, top-right */}
        <SafeAreaView className="absolute right-0 top-0" edges={["top"]}>
          <View className="items-end px-4 pt-2">
            <View className="flex-row items-center gap-1.5 rounded-full bg-background px-3 py-1.5">
              <Icon as={Sparkles} size={16} className="text-accent" />
              <Text className="text-[11px] font-medium text-foreground">
                {landing.tagline}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Content */}
      <SafeAreaView
        className="flex-1 items-center px-6 pb-4"
        edges={["bottom"]}
      >
        <WhiteLogo width={200} height={166} />
        <Text className="text-left font-display text-base italic text-accent w-full">
          {landing.title}
        </Text>
        <Text className="mt-1 text-left text-[14px] leading-relaxed text-primary-foreground/85">
          {landing.description}
        </Text>

        <View className="mt-auto w-full gap-3">
          <Link
            href={{ pathname: "/(auth)/login", params: { tab: "login" } }}
            asChild
          >
            <Button variant="secondary" className="h-12 w-full rounded-full">
              <Text className="font-medium tracking-wide text-primary">
                J'ai déjà un compte
              </Text>
            </Button>
          </Link>
          <Link
            href={{ pathname: "/(auth)/login", params: { tab: "register" } }}
            asChild
          >
            <Button className="h-12 w-full rounded-full bg-card">
              <Text className="font-medium text-primary">Créer un compte</Text>
            </Button>
          </Link>
          <View className="flex-row items-center justify-center gap-1.5 pt-1">
            <Icon
              as={Heart}
              size={12}
              className="text-accent"
              fill="currentColor"
            />
            <Text className="text-center text-[11px] text-primary-foreground/80">
              Réservé aux clientes de Ghania
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
