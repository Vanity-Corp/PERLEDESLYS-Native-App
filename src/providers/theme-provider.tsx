import { ThemeProvider } from "expo-router";
import { colorScheme } from "nativewind";
import type { PropsWithChildren } from "react";
import { Platform } from "react-native";

import { NAV_THEME } from "@/constants/theme";

// kitchen-haven-club has no theme toggle anywhere (no next-themes, no
// darkMode state, nothing that ever adds a `.dark` class) — its `.dark`
// CSS block in styles.css is dead code no real visitor ever triggers, so
// the web app is always light. Forced here on native rather than left to
// follow the OS setting: NativeWind's `dark:` variants (baked into every
// RNR CLI-generated component — Input, TabsList, TabsTrigger, etc.) and
// React Navigation's theme both default to tracking system appearance on
// native, which on a device with OS dark mode on produced a mismatched
// half-dark UI the web app never actually has. Web is skipped: with
// `darkMode: "class"` it already always resolves "light" (nothing ever
// adds the class), and calling this during SSR throws ("Cannot manually
// set color scheme while not in a browser environment").
if (Platform.OS !== "web") {
  colorScheme.set("light");
}

/**
 * Feeds React Navigation (via expo-router's re-exported `ThemeProvider`)
 * our own PERLEDESLYS `NAV_THEME` instead of the stock `DefaultTheme` /
 * `DarkTheme`, so native chrome that reads the navigation theme (header,
 * tab bar, and any screen using `useTheme()` from `@react-navigation`)
 * gets the same background/border/card/primary colors as the web app,
 * not React Navigation's generic blue/grey defaults.
 */
export function AppThemeProvider({ children }: PropsWithChildren) {
  return <ThemeProvider value={NAV_THEME.light}>{children}</ThemeProvider>;
}
