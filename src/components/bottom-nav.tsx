import type { Tabs } from "expo-router";
import { BookOpen, Home, PlayCircle, Radio, User, type LucideIcon } from "lucide-react-native";
import type { ComponentProps } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ICON_TINT } from "@/constants/theme";
import { cn } from "@/lib/utils";

// Web source: kitchen-haven-club/src/components/BottomNav.tsx
//
// Custom `tabBar` for app/_layout.tsx's <Tabs>, matching the web's floating
// rounded nav: a card of 5 icon+label buttons, active tab gets a filled
// pill background.
//
// Deviation from web (tracked for Task 4): the web's active pill uses the
// `bg-gradient-luxe` gradient. Task 4 (gradient helper + expo-linear-
// gradient) hasn't been built yet, so the active pill here uses a plain
// `bg-primary` fill as a placeholder — swap for <GradientView tone="luxe">
// once Task 4 lands. Everything else (layout, icons, label styling,
// active/inactive states) matches the web version.
//
// `state.routes` includes every screen registered on the Tabs navigator,
// including the `href: null` ones (search/calendar/first-steps) — those
// are hidden from the *default* tab bar by expo-router, but a fully custom
// `tabBar` render prop receives the raw navigator state, so this list is
// filtered explicitly to the 5 real tabs rather than relying on that.
//
// Bottom padding uses the device's safe-area inset (iOS home indicator /
// Android gesture bar) rather than a fixed value, so the bar doesn't get
// clipped or overlap system chrome — the web version has no such concept.
const TAB_ORDER = ["index", "recipes", "tutorials", "lives", "profile"] as const;

const TAB_ICONS: Record<(typeof TAB_ORDER)[number], LucideIcon> = {
  index: Home,
  recipes: BookOpen,
  tutorials: PlayCircle,
  lives: Radio,
  profile: User,
};

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

export function BottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const routes = state.routes.filter((route) =>
    (TAB_ORDER as readonly string[]).includes(route.name),
  );

  return (
    <View
      className="absolute inset-x-0 bottom-0 items-center px-3 pt-2"
      style={{ pointerEvents: "box-none", paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <View
        className="w-full max-w-md flex-row items-center justify-around rounded-3xl border border-border bg-card/95 px-2 py-2"
        style={styles.shadow}
      >
        {routes.map((route) => {
          const routeIndex = state.routes.findIndex((r) => r.key === route.key);
          const isFocused = state.index === routeIndex;
          const { options } = descriptors[route.key];
          const label = typeof options.title === "string" ? options.title : route.name;
          const Icon = TAB_ICONS[route.name as (typeof TAB_ORDER)[number]];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : {}}
              className="items-center gap-0.5 rounded-2xl px-2.5 py-1.5"
            >
              <View className={cn("rounded-xl p-1.5", isFocused && "bg-primary")}>
                <Icon
                  size={20}
                  strokeWidth={isFocused ? 2.4 : 2}
                  color={isFocused ? ICON_TINT.primaryForeground : ICON_TINT.mutedForeground}
                />
              </View>
              <Text
                className={cn(
                  "text-[10px] font-medium tracking-wide",
                  isFocused ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Plain platform shadow (not the web's rose-tinted `shadow-rose` token —
// porting a full shadow-token pipeline wasn't part of this task's scope).
const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: { elevation: 8 },
    default: {},
  }),
});
