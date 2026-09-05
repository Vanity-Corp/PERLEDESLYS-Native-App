import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import OgeeArch from "@/assets/perledeslys/ogee-arch.svg";
import { GradientButton } from "@/components/ui/gradient-button";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { authApi, ApiError } from "@/lib/auth-api";

// Only members who've set an email (Profil › Paramètres) can use this — the
// backend silently no-ops for accounts without one, so the confirmation
// message never reveals whether the email exists (privacy, matches the
// dashboard's own forgot-password flow).
const schema = z.object({
  email: z.string().trim().min(1, "Email requis.").email("Email invalide."),
});
type Values = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setLoading(true);
    try {
      await authApi.forgotPassword(values.email.trim());
      setSent(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  });

  return (
    <GradientView tone="cream" className="flex-1">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <ScrollView
          contentContainerClassName="px-6 pb-10 pt-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Retour"
            className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-white/70"
          >
            <Icon as={ArrowLeft} size={18} className="text-primary" />
          </Pressable>

          <View className="relative items-center">
            <OgeeArch width={280} height={241} />
            <View className="absolute bottom-6 items-center px-8">
              <Text className="text-center font-display text-2xl font-bold leading-tight text-primary">
                Mot de passe{"\n"}oublié ?
              </Text>
            </View>
          </View>

          {sent ? (
            <View className="mt-6 items-center gap-4 px-2">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-secondary">
                <Icon as={CheckCircle2} size={26} className="text-primary" />
              </View>
              <Text className="text-center text-sm leading-relaxed text-muted-foreground">
                Si un compte est associé à cet email, un lien de
                réinitialisation vient de lui être envoyé. Ouvre-le depuis ton
                téléphone pour choisir ton nouveau mot de passe — pense à
                vérifier tes spams.
              </Text>
              <GradientButton
                tone="luxe"
                onPress={() => router.replace("/(auth)")}
                className="mt-2 w-full"
              >
                <Text className="font-medium text-primary-foreground">
                  Retour à la connexion
                </Text>
              </GradientButton>
            </View>
          ) : (
            <View className="mt-6 gap-4">
              <Text className="text-center text-sm text-muted-foreground">
                Indique l'email associé à ton compte. Si tu n'en as pas
                renseigné dans Profil › Paramètres, contacte la conseillère.
              </Text>

              <View className="justify-center">
                <Icon
                  as={Mail}
                  size={16}
                  className="absolute left-4 z-10 text-muted-foreground"
                />
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <Input
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      placeholder="Adresse email"
                      className="h-fit rounded-full py-3.5 pl-11 pr-4 tracking-wide bg-white"
                    />
                  )}
                />
              </View>
              {form.formState.errors.email && (
                <Text className="px-1 text-xs text-destructive">
                  {form.formState.errors.email.message}
                </Text>
              )}
              {error && (
                <Text className="px-1 text-center text-sm text-destructive">
                  {error}
                </Text>
              )}

              <GradientButton
                tone="luxe"
                onPress={onSubmit}
                disabled={loading}
                className="mt-2"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="font-medium text-primary-foreground">
                    Envoyer le lien
                  </Text>
                )}
              </GradientButton>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientView>
  );
}
