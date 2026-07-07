import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { ArrowLeft, Bell, Mail, Moon, Save } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { GradientButton } from "@/components/ui/gradient-button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/lib/local-store";

// Web source: kitchen-haven-club/src/routes/app/settings/index.tsx
//
// The web has no real validation — submit always saves regardless of field
// content. React Hook Form + Zod here is purely for form STATE management
// (this project's chosen stack, per CLAUDE.md), not new validation rules —
// same permissive-schema reasoning already established by Login (Task 11).
const settingsSchema = z.object({
  name: z.string(),
  firstName: z.string(),
  email: z.string(),
  phone: z.string(),
  notifications: z.boolean(),
  darkTheme: z.boolean(),
  newsletter: z.boolean(),
});
type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsScreen() {
  const [settings, setSettings] = useSettings();
  const [saved, setSaved] = useState(false);
  const { control, handleSubmit } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  const onSave = handleSubmit((draft) => {
    setSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="pb-16" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 px-5 pb-2 pt-6">
          <Link href="/app/profile" asChild>
            <Pressable className="-ml-2 rounded-full p-2">
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </Pressable>
          </Link>
          <Text className="font-display text-2xl font-medium tracking-tight text-foreground">
            Paramètres
          </Text>
        </View>

        <SectionTitle>Informations personnelles</SectionTitle>
        <View className="mx-5 gap-3 rounded-2xl border border-border bg-card p-4">
          <Controller
            control={control}
            name="firstName"
            render={({ field }) => (
              <Field
                label="Prénom"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Field
                label="Nom complet"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Field
                label="Email"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <Field
                label="Téléphone"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                keyboardType="phone-pad"
              />
            )}
          />
        </View>

        <SectionTitle>Préférences</SectionTitle>
        <View className="mx-5 rounded-2xl border border-border bg-card">
          <Controller
            control={control}
            name="notifications"
            render={({ field }) => (
              <ToggleRow
                icon={Bell}
                label="Notifications push"
                desc="Recevoir les annonces de lives et nouvelles recettes"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Separator />
          <Controller
            control={control}
            name="darkTheme"
            render={({ field }) => (
              <ToggleRow
                icon={Moon}
                label="Thème sombre"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Separator />
          <Controller
            control={control}
            name="newsletter"
            render={({ field }) => (
              <ToggleRow
                icon={Mail}
                label="Newsletter hebdomadaire"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </View>

        <SectionTitle>Sécurité</SectionTitle>
        <View className="mx-5 rounded-2xl border border-border bg-card">
          <Pressable role="button" className="px-4 py-3.5">
            <Text className="text-sm font-medium text-foreground">Changer mon mot de passe</Text>
          </Pressable>
        </View>

        <GradientButton tone="luxe" onPress={onSave} className="mx-5 mt-7">
          <Icon as={Save} size={16} className="text-primary-foreground" />
          <Text className="font-semibold text-primary-foreground">
            {saved ? "Enregistré ✓" : "Enregistrer les modifications"}
          </Text>
        </GradientButton>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text className="mb-2 mt-7 px-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
      {children}
    </Text>
  );
}

function Field({
  label,
  value,
  onChangeText,
  onBlur,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur: () => void;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences";
}) {
  return (
    <View>
      <Text className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </Text>
      <Input
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        className="mt-1 rounded-xl px-3 py-2.5 h-fit"
      />
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  desc,
  checked,
  onCheckedChange,
}: {
  icon: typeof Bell;
  label: string;
  desc?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3.5">
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-secondary">
        <Icon as={icon} size={16} className="text-primary" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-foreground">{label}</Text>
        {desc && <Text className="mt-0.5 text-[11px] text-muted-foreground">{desc}</Text>}
      </View>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </View>
  );
}
