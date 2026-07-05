import type { Tabs } from "expo-router";
import { BookOpen, Home, PlayCircle, Radio, User, type LucideIcon } from "lucide-react-native";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";

// Web source: kitchen-haven-club/src/components/BottomNav.tsx
//
// v2 client rebrand (assets/new-assets/dashboard-page.png): the nav is no
// longer a floating rounded pill inset from the screen edges — it's now a
// full-width, solid-`bg-primary` bar flush against the bottom and both
// side edges ("glued to the bottom" per the client's own wording). Pixel-
// sampled from the mockup: solid `#b75469` (exact match to the new
// `--primary`) with no rounding of its own — the rounded-corner look in
// the raw screenshot is the phone-mockup frame's bezel, confirmed by the
// same rounding appearing at the screenshot's top corners too, nothing to
// do with the nav bar's actual shape.
//
// Not `position: absolute` (unlike the old floating pill): a normal
// in-flow element is what lets React Navigation's `<Tabs>` reserve space
// for it automatically, so every screen's content stops short of the bar
// on its own — no per-screen bottom-padding math needed to avoid content
// being hidden underneath it, which is the "elements aren't hidden by the
// navbar" requirement addressed at the layout level rather than per-screen.
//
// `state.routes` includes every screen registered on the Tabs navigator,
// including the `href: null` ones (search/calendar/first-steps) — those
// are hidden from the *default* tab bar by expo-router, but a fully custom
// `tabBar` render prop receives the raw navigator state, so this list is
// filtered explicitly to the 5 real tabs rather than relying on that.
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
      className="w-full flex-row items-center justify-around bg-primary pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
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
            className={cn("items-center gap-0.5 px-2.5 py-1.5", !isFocused && "opacity-70")}
          >
            <Icon size={22} strokeWidth={isFocused ? 2.4 : 2} color="#fffafa" />
            <Text className="text-[10px] font-medium tracking-wide text-primary-foreground">
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
