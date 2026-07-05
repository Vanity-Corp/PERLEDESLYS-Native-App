import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Compass,
  Heart,
  HelpCircle,
  History as HistoryIcon,
  KeyRound,
  LogOut,
  Mail,
  Settings as SettingsIcon,
  ShoppingBag,
  StickyNote,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { user } from "@/lib/mock-data";

// Web source: kitchen-haven-club/src/routes/app/profile/index.tsx
export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="pb-16" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 px-5 pb-2 pt-2">
          <Link href="/app" asChild>
            <Pressable className="-ml-2 rounded-full p-2">
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </Pressable>
          </Link>
          <Text className="font-display text-2xl font-medium tracking-tight text-foreground">
            Mon espace
          </Text>
        </View>

        {/* User card */}
        <GradientView tone="luxe" className="mx-5 mt-4 flex-row items-center gap-4 rounded-3xl p-5">
          <Image
            source={{ uri: user.avatar }}
            contentFit="cover"
            style={{ width: 64, height: 64, borderRadius: 32 }}
            accessibilityLabel={user.name}
          />
          <View className="min-w-0 flex-1">
            <Text className="font-italiana text-xl leading-tight tracking-wide text-primary-foreground">
              {user.name}
            </Text>
            <Text className="mt-0.5 text-[11px] text-primary-foreground opacity-90">
              Cliente PERLEDESLYS · depuis {user.memberSince}
            </Text>
            <View className="mt-1 flex-row items-center gap-1">
              <Icon as={KeyRound} size={12} className="text-primary-foreground opacity-80" />
              <Text className="text-[10px] text-primary-foreground opacity-80">
                Code privé · {user.invitation}
              </Text>
            </View>
          </View>
        </GradientView>

        {/* Quick access grid */}
        <View className="mt-4 flex-row flex-wrap gap-3 px-5">
          <Tile
            href="/app/profile/favorites"
            icon={Heart}
            title="Favoris"
            // Hardcoded in the web version too, not derived from real data.
            subtitle="6 enregistrées"
          />
          <Tile href="/app/profile/history" icon={HistoryIcon} title="Historique" subtitle="Reprendre" />
          <Tile href="/app/profile/notes" icon={StickyNote} title="Mes notes" subtitle="Toutes mes idées" />
          <Tile href="/app/first-steps" icon={Compass} title="Premiers pas" subtitle="TM7 — 35 min" />
        </View>

        <SectionTitle>Mon compte</SectionTitle>
        <View className="mx-5 divide-y divide-border rounded-2xl border border-border bg-card">
          <Row href="/app/profile/settings" icon={SettingsIcon} label="Paramètres" value="Nom, email, préférences" />
          <Row href="/app/calendar" icon={CalendarDays} label="Calendrier" value="Lives & ateliers" />
          <Row
            href="/app/profile/history"
            icon={HistoryIcon}
            label="Historique de visionnage"
            value="Reprendre où vous étiez"
          />
          <Row href="/app/profile/notes" icon={StickyNote} label="Mes notes" value="Vos prises de notes" />
        </View>

        {/* Purchases */}
        <SectionTitle>Mon Thermomix</SectionTitle>
        <View className="mx-5 gap-3">
          {user.products.map((p) => (
            <View key={p.id} className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <Image
                source={p.image}
                contentFit="cover"
                style={{ width: 64, height: 64, borderRadius: 12 }}
                accessibilityLabel={p.name}
              />
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground">{p.name}</Text>
                <View className="mt-0.5 flex-row items-center gap-1">
                  <Icon as={ShoppingBag} size={12} className="text-muted-foreground" />
                  <Text className="text-[11px] text-muted-foreground">Acheté le {p.purchasedAt}</Text>
                </View>
              </View>
              <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
            </View>
          ))}
        </View>

        <SectionTitle>Support</SectionTitle>
        <View className="mx-5 divide-y divide-border rounded-2xl border border-border bg-card">
          <Row href="/app/profile/faq" icon={HelpCircle} label="FAQ" value="Toutes les réponses" />
          <Row href="/app/profile/settings" icon={Mail} label="Newsletter" value="Gérer mes préférences" />
        </View>

        <Pressable
          onPress={() => router.replace("/(auth)")}
          className="mx-5 mt-7 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-card py-4"
        >
          <Icon as={LogOut} size={16} className="text-destructive" />
          <Text className="font-medium text-destructive">Se déconnecter</Text>
        </Pressable>

        <Text className="mt-4 text-center font-italiana text-[10px] tracking-[0.3em] text-muted-foreground">
          PERLEDESLYS · v1.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Tile({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href as never} asChild>
      <Pressable style={{ width: "47%" }} className="gap-2 rounded-2xl border border-border bg-card p-4">
        <GradientView tone="luxe" className="h-10 w-10 items-center justify-center rounded-xl">
          <Icon as={icon} size={20} className="text-primary-foreground" />
        </GradientView>
        <View>
          <Text className="text-sm font-medium leading-tight text-foreground">{title}</Text>
          <Text className="mt-0.5 text-[10px] text-muted-foreground">{subtitle}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text className="mb-2 mt-7 px-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
      {children}
    </Text>
  );
}

function Row({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <Link href={href as never} asChild>
      <Pressable className="flex-row items-center gap-3 px-4 py-3.5">
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-secondary">
          <Icon as={icon} size={16} className="text-primary" />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</Text>
          <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
            {value}
          </Text>
        </View>
        <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
      </Pressable>
    </Link>
  );
}
