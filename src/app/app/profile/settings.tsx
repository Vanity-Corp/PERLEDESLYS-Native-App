import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Link } from "expo-router";
import { ArrowLeft, Bell, Camera, Save } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { GradientButton } from "@/components/ui/gradient-button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ApiError, uploadImage } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-store";
import { useSettings } from "@/lib/local-store";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB (matches the backend)
const ALLOWED_AVATAR = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Profile editing: nom, prénom, nom d'utilisateur, email (persisted via
// PATCH /auth/me), plus the push-notifications preference (device-local).
const profileSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  username: z.string().trim().min(3, "Au moins 3 caractères."),
  email: z.union([z.string().email("Email invalide."), z.literal("")]),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsScreen() {
  const user = useAuth((s) => s.user);
  const token = useAuth((s) => s.token);
  const updateProfile = useAuth((s) => s.updateProfile);
  const [settings, setSettings] = useSettings();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const initials = (
    (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "") ||
    user?.username?.slice(0, 2) ||
    "?"
  ).toUpperCase();

  const pickAvatar = async () => {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Autorisez l'accès aux photos pour changer votre avatar.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const asset = res.assets[0];
    const type = asset.mimeType ?? "image/jpeg";
    if (!ALLOWED_AVATAR.includes(type)) {
      setError("Format non supporté (JPEG, PNG, WebP ou GIF).");
      return;
    }
    if ((asset.fileSize ?? 0) > MAX_AVATAR_BYTES) {
      setError("Image trop volumineuse (max 5 Mo).");
      return;
    }
    if (!token) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadImage(
        {
          uri: asset.uri,
          name: asset.fileName ?? `avatar.${type.split("/")[1] ?? "jpg"}`,
          type,
        },
        token,
      );
      setAvatar(url);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Échec du téléversement.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const { control, handleSubmit } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
    },
  });

  const onSave = handleSubmit(async (draft) => {
    setError(null);
    setSaving(true);
    try {
      await updateProfile({
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        username: draft.username.trim(),
        email: draft.email.trim() || undefined,
        avatar: avatar || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Impossible d'enregistrer.",
      );
    } finally {
      setSaving(false);
    }
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

        <View className="mt-4 items-center gap-3">
          <Pressable onPress={pickAvatar} disabled={uploadingAvatar}>
            <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary">
              {uploadingAvatar ? (
                <ActivityIndicator />
              ) : avatar ? (
                <Image
                  source={{ uri: avatar }}
                  contentFit="cover"
                  style={{ width: "100%", height: "100%" }}
                  accessibilityLabel="Avatar"
                />
              ) : (
                <Text className="font-display text-2xl text-muted-foreground">
                  {initials}
                </Text>
              )}
              <View className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full bg-primary">
                <Icon as={Camera} size={14} className="text-primary-foreground" />
              </View>
            </View>
          </Pressable>
          <Pressable onPress={pickAvatar} disabled={uploadingAvatar}>
            <Text className="text-xs font-medium text-primary">
              Changer la photo
            </Text>
          </Pressable>
        </View>

        <SectionTitle>Mes informations</SectionTitle>
        <View className="mx-5 gap-3 rounded-2xl border border-border bg-card p-4">
          <Field control={control} name="firstName" label="Prénom" />
          <Field control={control} name="lastName" label="Nom" />
          <Field
            control={control}
            name="username"
            label="Nom d'utilisateur"
            autoCapitalize="none"
          />
          <Field
            control={control}
            name="email"
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <SectionTitle>Préférences</SectionTitle>
        <View className="mx-5 rounded-2xl border border-border bg-card">
          <View className="flex-row items-center gap-3 px-4 py-3.5">
            <View className="h-8 w-8 items-center justify-center rounded-lg bg-secondary">
              <Icon as={Bell} size={16} className="text-primary" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground">
                Notifications push
              </Text>
              <Text className="mt-0.5 text-[11px] text-muted-foreground">
                Recevoir les annonces de lives et nouvelles recettes
              </Text>
            </View>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(v) =>
                setSettings((prev) => ({ ...prev, notifications: v }))
              }
            />
          </View>
        </View>

        {error && (
          <Text className="mt-4 px-5 text-center text-sm text-destructive">
            {error}
          </Text>
        )}

        <GradientButton
          tone="luxe"
          onPress={onSave}
          disabled={saving}
          className="mx-5 mt-7"
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon as={Save} size={16} className="text-primary-foreground" />
              <Text className="font-semibold text-primary-foreground">
                {saved ? "Enregistré ✓" : "Enregistrer les modifications"}
              </Text>
            </>
          )}
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
  control,
  name,
  label,
  autoCapitalize,
  keyboardType,
}: {
  control: ReturnType<typeof useForm<ProfileFormValues>>["control"];
  name: keyof ProfileFormValues;
  label: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
}) {
  return (
    <View className="gap-1.5">
      <Label>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            <Input
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize={autoCapitalize}
              keyboardType={keyboardType}
            />
            {fieldState.error && (
              <Text className="text-xs text-destructive">
                {fieldState.error.message}
              </Text>
            )}
          </>
        )}
      />
    </View>
  );
}
