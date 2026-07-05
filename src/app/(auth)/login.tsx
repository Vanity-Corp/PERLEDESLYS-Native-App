import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { ArrowLeft, ArrowRight, KeyRound, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Web source: kitchen-haven-club/src/routes/login.tsx
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
        <View className="flex-1 px-6 pb-10 pt-2">
          <Link href="/(auth)" asChild>
            <Pressable className="-ml-2 self-start rounded-full p-2">
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </Pressable>
          </Link>

          <View className="mt-4 flex-row items-center gap-2.5">
            <GradientView tone="luxe" className="h-11 w-11 items-center justify-center rounded-full">
              <Text className="font-italiana text-xl text-primary-foreground">P</Text>
            </GradientView>
            <View>
              <Text className="font-italiana text-base tracking-[0.2em] text-foreground">
                PERLEDESLYS
              </Text>
              <Text className="text-[9px] uppercase tracking-[0.25em] text-primary/80">
                Espace privé
              </Text>
            </View>
          </View>

          <View className="mt-8">
            <Text className="font-display text-[2.2rem] leading-tight tracking-tight text-foreground">
              Bon retour{"\n"}
              <Text className="font-italiana italic text-primary">parmi nous.</Text>
            </Text>
            <Text className="mt-3 text-sm text-muted-foreground">
              Retrouvez vos recettes, lives et tutoriels TM7 exclusifs.
            </Text>
          </View>

          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as "login" | "invite")}
            className="mt-6"
          >
            <TabsList className="w-full flex-row rounded-2xl bg-secondary/60 p-1">
              <TabsTrigger value="login" className="flex-1 rounded-xl py-2.5">
                <Text className="text-xs font-medium">Identifiants</Text>
              </TabsTrigger>
              <TabsTrigger value="invite" className="flex-1 rounded-xl py-2.5">
                <Text className="text-xs font-medium">Code d'invitation</Text>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6 gap-4">
              <View className="gap-1.5">
                <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Email
                </Label>
                <View className="justify-center">
                  <Icon
                    as={Mail}
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
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="rounded-2xl py-3.5 pl-11 pr-4"
                      />
                    )}
                  />
                </View>
              </View>

              <View className="gap-1.5">
                <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Mot de passe
                </Label>
                <View className="justify-center">
                  <Icon
                    as={Lock}
                    size={16}
                    className="absolute left-4 z-10 text-muted-foreground"
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
                        className="rounded-2xl py-3.5 pl-11 pr-4"
                      />
                    )}
                  />
                </View>
              </View>

              <View className="items-end">
                <Button variant="link" size="sm">
                  <Text className="text-xs font-medium text-primary">Mot de passe oublié ?</Text>
                </Button>
              </View>
            </TabsContent>

            <TabsContent value="invite" className="mt-6 gap-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Code d'invitation privée
              </Label>
              <View className="justify-center">
                <Icon as={KeyRound} size={16} className="absolute left-4 z-10 text-muted-foreground" />
                <Controller
                  control={control}
                  name="code"
                  render={({ field }) => (
                    <Input
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      autoCapitalize="characters"
                      className="rounded-2xl py-3.5 pl-11 pr-4 font-medium tracking-widest"
                    />
                  )}
                />
              </View>
              <Text className="text-[11px] text-muted-foreground">
                Le code unique que Lys vous a transmis personnellement.
              </Text>
            </TabsContent>
          </Tabs>

          <GradientButton tone="luxe" onPress={onSubmit} className="mt-6">
            <Text className="font-medium text-primary-foreground">Entrer dans mon espace</Text>
            <Icon as={ArrowRight} size={16} className="text-primary-foreground" />
          </GradientButton>

          <View className="mt-auto items-center gap-1 pt-8">
            <Text className="text-center text-xs text-muted-foreground">
              Vous êtes cliente Thermomix et n'avez pas encore d'accès ?
            </Text>
            <Button variant="link" size="sm">
              <Text className="text-xs font-medium text-primary">Demander une invitation à Lys</Text>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </GradientView>
  );
}
