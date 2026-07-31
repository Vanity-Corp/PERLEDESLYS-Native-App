import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AtSign, KeyRound, User } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import OgeeArch from "@/assets/perledeslys/ogee-arch.svg";
import { LegalLink } from "@/components/legal-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GradientButton } from "@/components/ui/gradient-button";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError, type UserStatus } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-store";

// Real auth wired to the PERLEDESLYS backend (see BACKEND_PLAN.md Phase 3).
// The v2-rebrand visuals (ogee arch, cream gradient, tab switcher, gradient
// CTA) are preserved from the previous cosmetic version — only the submit
// handlers changed from `router.replace("/app")` to real login/register.
//
// "Se connecter" → login(identifier, password): ACTIVE → /app, PENDING →
// activation screen. "S'inscrire" → register(...) → always PENDING → activation.
const loginSchema = z.object({
  identifier: z.string().min(1, "Identifiant requis."),
  password: z.string().min(1, "Mot de passe requis."),
});
type LoginValues = z.infer<typeof loginSchema>;

// Sign-up is username + password only (privacy — WIRING_PLAN B1). No name or
// email is collected; the activation code is entered on the next screen.
const registerSchema = z.object({
  username: z.string().min(3, "Au moins 3 caractères."),
  password: z.string().min(6, "Au moins 6 caractères."),
});
type RegisterValues = z.infer<typeof registerSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const register = useAuth((s) => s.register);

  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<"login" | "register">(
    tabParam === "register" ? "register" : "login",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "" },
  });

  // ACTIVE → app. PENDING (and SUSPENDED) → activation screen; the app layout
  // guard also enforces this, and the backend blocks a suspended account from
  // reactivating via the code.
  const routeByStatus = (status: UserStatus) => {
    router.replace(status === "ACTIVE" ? "/app" : "/(auth)/activate");
  };

  const onLogin = loginForm.handleSubmit(async (values) => {
    setError(null);
    setLoading(true);
    try {
      const user = await login(values.identifier.trim(), values.password);
      routeByStatus(user.status);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  });

  const onRegister = registerForm.handleSubmit(async (values) => {
    setError(null);
    setLoading(true);
    try {
      const user = await register({
        username: values.username.trim(),
        password: values.password,
      });
      routeByStatus(user.status); // always PENDING → activation
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
                Ça fait plaisir{"\n"}de vous revoir !
              </Text>
            </View>
          </View>

          <Tabs
            value={tab}
            onValueChange={(value) => {
              setTab(value as "login" | "register");
              setError(null);
            }}
            className="mt-4"
          >
            <TabsList className="h-fit w-full flex-row rounded-2xl bg-secondary/60 p-1">
              <TabsTrigger value="login" className="h-fit flex-1 rounded-xl py-2.5">
                <Text className="text-xs font-medium">Se connecter</Text>
              </TabsTrigger>
              <TabsTrigger value="register" className="h-fit flex-1 rounded-xl py-2.5">
                <Text className="text-xs font-medium">S'inscrire</Text>
              </TabsTrigger>
            </TabsList>

            <Text className="mt-4 text-center text-sm text-muted-foreground">
              Cette application est réservée uniquement à mes clientes
            </Text>

            {/* Se connecter */}
            <TabsContent value="login" className="mt-5 gap-4">
              <FieldRow icon={User}>
                <Controller
                  control={loginForm.control}
                  name="identifier"
                  render={({ field }) => (
                    <Input
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      autoCapitalize="none"
                      placeholder="Identifiant"
                      className="h-fit rounded-full py-3.5 pl-11 pr-4 tracking-wide"
                    />
                  )}
                />
              </FieldRow>
              <FieldRow icon={KeyRound}>
                <Controller
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <Input
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      secureTextEntry
                      placeholder="Mot de passe"
                      className="h-fit rounded-full py-3.5 pl-11 pr-4 tracking-wide"
                    />
                  )}
                />
              </FieldRow>
            </TabsContent>

            {/* S'inscrire — username + password only (privacy) */}
            <TabsContent value="register" className="mt-5 gap-3">
              <FieldRow icon={AtSign}>
                <Controller
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <Input
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      autoCapitalize="none"
                      placeholder="Nom d'utilisateur"
                      className="h-fit rounded-full py-3.5 pl-11 pr-4"
                    />
                  )}
                />
              </FieldRow>
              <FieldRow icon={KeyRound}>
                <Controller
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <Input
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      secureTextEntry
                      placeholder="Mot de passe"
                      className="h-fit rounded-full py-3.5 pl-11 pr-4"
                    />
                  )}
                />
              </FieldRow>

              {/* Required: accept the terms before creating an account. */}
              <View className="mt-1 flex-row items-start gap-2.5 px-1">
                <Checkbox
                  checked={acceptedTerms}
                  onCheckedChange={setAcceptedTerms}
                  className="mt-0.5"
                />
                <View className="flex-1 flex-row flex-wrap items-center gap-x-1">
                  <Text className="text-xs text-muted-foreground">J'accepte les</Text>
                  <LegalLink doc="terms">conditions générales</LegalLink>
                  <Text className="text-xs text-muted-foreground">et la</Text>
                  <LegalLink doc="privacy">politique de confidentialité</LegalLink>
                  <Text className="text-xs text-muted-foreground">.</Text>
                </View>
              </View>
            </TabsContent>
          </Tabs>

          {error && (
            <Text className="mt-4 text-center text-sm text-destructive">{error}</Text>
          )}

          <GradientButton
            tone="luxe"
            onPress={tab === "login" ? onLogin : onRegister}
            disabled={loading || (tab === "register" && !acceptedTerms)}
            className="mt-8"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="font-medium text-primary-foreground">
                {tab === "login" ? "Se connecter" : "Créer mon compte"}
              </Text>
            )}
          </GradientButton>

          {tab === "login" && (
            <View className="mt-auto items-center pt-8">
              <Button variant="link" size="sm">
                <Text className="text-xs font-medium text-muted-foreground">
                  Mot de passe oublié ?
                </Text>
              </Button>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientView>
  );
}

// Shared input row: leading icon overlaid on a pill-shaped Input.
function FieldRow({
  icon,
  children,
}: {
  icon: React.ComponentProps<typeof Icon>["as"];
  children: React.ReactNode;
}) {
  return (
    <View className="justify-center">
      <Icon as={icon} size={16} className="absolute left-4 z-10 text-muted-foreground" />
      {children}
    </View>
  );
}
