import { ThemeProvider } from "expo-router";
import type { PropsWithChildren } from "react";
import { useColorScheme } from "react-native";

import { NAV_THEME } from "@/constants/theme";

/**
 * Feeds React Navigation (via expo-router's re-exported `ThemeProvider`)
 * our own PERLEDESLYS `NAV_THEME` instead of the stock `DefaultTheme` /
 * `DarkTheme`, so native chrome that reads the navigation theme (header,
 * tab bar, and any screen using `useTheme()` from `@react-navigation`)
 * gets the same background/border/card/primary colors as the web app,
 * not React Navigation's generic blue/grey defaults.
 */
export function AppThemeProvider({ children }: PropsWithChildren) {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? NAV_THEME.dark : NAV_THEME.light;

  return <ThemeProvider value={theme}>{children}</ThemeProvider>;
}
