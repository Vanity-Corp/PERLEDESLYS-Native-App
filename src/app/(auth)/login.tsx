import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { KeyRound, User } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import OgeeArch from "@/assets/perledeslys/ogee-arch.svg";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Web source: kitchen-haven-club/src/routes/login.tsx
//
// Rebuilt per the client's v2 rebrand mockup (assets/new-assets/auth-page.png):
// the small logo-circle header + "Bon retour parmi nous." headline are
// replaced by a big ogee-arch graphic with the welcome-back copy set inside
// its lower opening; tabs are relabeled Se connecter/S'inscrire (kept as
// the same internal "login"/"invite" values — no mockup exists for the
// S'inscrire tab's own content, so it reuses the invite-code fields that
// already existed here, which fits an invite-only club's idea of "signing
// up" reasonably well).
//
// The web version has no real validation either — submit always navigates
// regardless of field content. React Hook Form + Zod here is purely for
// form STATE management (this project's chosen stack, per CLAUDE.md), not
// new validation rules — the schema is intentionally permissive so nothing
// that would pass on the web can fail here.
const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
  code: z.string(),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "invite">("login");
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "yasmine.b@email.com",
      password: "••••••••",
      code: "PDL-7821-LYS",
    },
  });

  const onSubmit = handleSubmit(() => {
    router.replace("/app");
  });

  return (
    <GradientView tone="cream" className="flex-1">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <View className="flex-1 px-6 pb-10 pt-6">
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
            onValueChange={(value) => setTab(value as "login" | "invite")}
            className="mt-4"
          >
            <TabsList className="w-full flex-row rounded-2xl bg-secondary/60 p-1 h-fit">
              <TabsTrigger
                value="login"
                className="flex-1 rounded-xl py-2.5 h-fit"
              >
                <Text className="text-xs font-medium">Se connecter</Text>
              </TabsTrigger>
              <TabsTrigger
                value="invite"
                className="flex-1 rounded-xl py-2.5 h-fit"
              >
                <Text className="text-xs font-medium">S'inscrire</Text>
              </TabsTrigger>
            </TabsList>

            <Text className="mt-4 text-center text-sm text-muted-foreground">
              Cette application est réservée uniquement à mes clientes
            </Text>

            <TabsContent value="login" className="mt-5 gap-4">
              <View className="justify-center h-fit">
                <Icon
                  as={User}
                  size={16}
                  className="absolute left-4 z-10 text-muted-foreground"
                />
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <Input
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      autoCapitalize="none"
                      placeholder="IDENTIFIANT"
                      className="rounded-full py-3.5 pl-11 pr-4  h-fit uppercase tracking-wide"
                    />
                  )}
                />
              </View>

              <View className="justify-center">
                <Icon
                  as={KeyRound}
                  size={16}
                  className="absolute left-4 z-10  text-muted-foreground"
                />
                <Controller
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <Input
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      secureTextEntry
                      placeholder="MOT DE PASSE"
                      className="rounded-full py-3.5 pl-11 pr-4  h-fit uppercase tracking-wide"
                    />
                  )}
                />
              </View>
            </TabsContent>

            <TabsContent value="invite" className="mt-5 gap-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Code d'invitation privée
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
                      className="rounded-full py-3.5  h-fit pl-11 pr-4 font-medium tracking-widest"
                    />
                  )}
                />
              </View>
              <Text className="text-[11px] text-muted-foreground">
                Le code unique que Ghania vous a transmis personnellement.
              </Text>
            </TabsContent>
          </Tabs>

          <GradientButton tone="luxe" onPress={onSubmit} className="mt-8">
            <Text className="font-medium text-primary-foreground">
              {tab === "login" ? "Se connecter" : "S'inscrire"}
            </Text>
          </GradientButton>

          <View className="mt-auto items-center pt-8">
            <Button variant="link" size="sm">
              <Text className="text-xs font-medium text-muted-foreground">
                Mot de passe oublié ?
              </Text>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </GradientView>
  );
}
