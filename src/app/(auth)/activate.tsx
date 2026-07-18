import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect, useRouter } from "expo-router";
import { KeyRound } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import OgeeArch from "@/assets/perledeslys/ogee-arch.svg";
import { GradientButton } from "@/components/ui/gradient-button";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-store";

// Activation screen (BACKEND_PLAN.md Phase 3). Reached after a PENDING user
// logs in or registers. The founder sends the global activation code over
// WhatsApp; entering the correct one flips the account to ACTIVE forever.
const schema = z.object({ code: z.string().min(1, "Code requis.") });
type Values = z.infer<typeof schema>;

export default function ActivateScreen() {
  const router = useRouter();
  const { token, user, hydrated, activate, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { code: "" },
  });

  // Guards: nobody should reach activation without a session; an already-active
  // user belongs in the app.
  if (hydrated && !token) return <Redirect href="/(auth)" />;
  if (hydrated && user?.status === "ACTIVE") return <Redirect href="/app" />;

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setLoading(true);
    try {
      await activate(values.code.trim());
      router.replace("/app");
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Une erreur est survenue.",
      );
    } finally {
      setLoading(false);
    }
  });

  const onLogout = () => {
    logout();
    router.replace("/(auth)");
  };

  return (
    <GradientView tone="cream" className="flex-1">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <View className="flex-1 px-6 pb-10 pt-6">
          <View className="relative items-center">
            <OgeeArch width={280} height={241} />
            <View className="absolute bottom-6 items-center px-8">
              <Text className="text-center font-display text-2xl font-bold leading-tight text-primary">
                Plus qu'une{"\n"}étape !
              </Text>
            </View>
          </View>

          <Text className="mt-4 text-center text-sm text-muted-foreground">
            {user?.firstName ? `Bonjour ${user.firstName}, ` : ""}entrez le code
            d'activation que Ghania vous a transmis pour accéder à votre espace.
          </Text>

          <View className="mt-6 gap-1.5">
            <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Code d'activation
            </Label>
            <View className="justify-center">
              <Icon
                as={KeyRound}
                size={16}
                className="absolute left-4 z-10 text-muted-foreground"
              />
              <Controller
                control={control}
                name="code"
                render={({ field }) => (
                  <Input
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    autoCapitalize="characters"
                    autoFocus
                    placeholder="VOTRE CODE"
                    className="h-fit rounded-full py-3.5 pl-11 pr-4 font-medium tracking-widest"
                  />
                )}
              />
            </View>
            <Text className="text-[11px] text-muted-foreground">
              Le code que Ghania vous a envoyé personnellement (par WhatsApp).
            </Text>
          </View>

          {error && (
            <Text className="mt-4 text-center text-sm text-destructive">{error}</Text>
          )}

          <GradientButton
            tone="luxe"
            onPress={onSubmit}
            disabled={loading}
            className="mt-8"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="font-medium text-primary-foreground">Activer mon compte</Text>
            )}
          </GradientButton>

          <View className="mt-auto items-center pt-8">
            <Pressable onPress={onLogout}>
              <Text className="text-xs font-medium text-muted-foreground">
                Se déconnecter
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </GradientView>
  );
}
