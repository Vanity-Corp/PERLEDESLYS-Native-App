import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle2, KeyRound } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import OgeeArch from "@/assets/perledeslys/ogee-arch.svg";
import { GradientButton } from "@/components/ui/gradient-button";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { authApi, ApiError } from "@/lib/auth-api";

// Reached via the deep link in the reset email: perledelys://reset-password?token=…
// (see AuthService.forgotPassword on the backend). No auth token needed — the
// reset token IS the credential.
const schema = z
  .object({
    password: z.string().min(6, "Au moins 6 caractères."),
    confirm: z.string().min(1, "Confirme ton mot de passe."),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirm"],
  });
type Values = z.infer<typeof schema>;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!token) {
      setError("Lien invalide. Demande un nouveau lien depuis l'écran de connexion.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authApi.resetPassword(token, values.password);
      setDone(true);
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
          <View className="relative items-center">
            <OgeeArch width={280} height={241} />
            <View className="absolute bottom-6 items-center px-8">
              <Text className="text-center font-display text-2xl font-bold leading-tight text-primary">
                Nouveau mot{"\n"}de passe
              </Text>
            </View>
          </View>

          {!token && !done && (
            <Text className="mt-6 text-center text-sm text-destructive">
              Lien invalide ou expiré. Demande un nouveau lien depuis l'écran
              de connexion.
            </Text>
          )}

          {done ? (
            <View className="mt-6 items-center gap-4 px-2">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-secondary">
                <Icon as={CheckCircle2} size={26} className="text-primary" />
              </View>
              <Text className="text-center text-sm leading-relaxed text-muted-foreground">
                Ton mot de passe a bien été mis à jour. Tu peux maintenant te
                reconnecter.
              </Text>
              <GradientButton
                tone="luxe"
                onPress={() => router.replace("/(auth)")}
                className="mt-2 w-full"
              >
                <Text className="font-medium text-primary-foreground">
                  Se connecter
                </Text>
              </GradientButton>
            </View>
          ) : (
            token && (
              <View className="mt-6 gap-4">
                <View className="justify-center">
                  <Icon
                    as={KeyRound}
                    size={16}
                    className="absolute left-4 z-10 text-muted-foreground"
                  />
                  <Controller
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <Input
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        secureTextEntry
                        placeholder="Nouveau mot de passe"
                        className="h-fit rounded-full py-3.5 pl-11 pr-4 tracking-wide bg-white"
                      />
                    )}
                  />
                </View>
                <View className="justify-center">
                  <Icon
                    as={KeyRound}
                    size={16}
                    className="absolute left-4 z-10 text-muted-foreground"
                  />
                  <Controller
                    control={form.control}
                    name="confirm"
                    render={({ field }) => (
                      <Input
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        secureTextEntry
                        placeholder="Confirme le mot de passe"
                        className="h-fit rounded-full py-3.5 pl-11 pr-4 tracking-wide bg-white"
                      />
                    )}
                  />
                </View>
                {(form.formState.errors.password || form.formState.errors.confirm) && (
                  <Text className="px-1 text-xs text-destructive">
                    {form.formState.errors.password?.message ??
                      form.formState.errors.confirm?.message}
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
                      Réinitialiser
                    </Text>
                  )}
                </GradientButton>
              </View>
            )
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientView>
  );
}
