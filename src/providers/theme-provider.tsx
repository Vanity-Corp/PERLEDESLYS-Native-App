import { ThemeProvider } from "expo-router";
import type { PropsWithChildren } from "react";

import { NAV_THEME } from "@/constants/theme";

/**
 * Feeds React Navigation (via expo-router's re-exported `ThemeProvider`)
 * our own Perledeslys `NAV_THEME` instead of the stock `DefaultTheme`, so
 * native chrome that reads the navigation theme (header, tab bar, and any
 * screen using `useTheme()` from `@react-navigation`) gets the app's
 * background/border/card/primary colors, not React Navigation's generic
 * blue/grey defaults. The app is light-only (app.json
 * `userInterfaceStyle: "light"`), so there is a single theme.
 */
export function AppThemeProvider({ children }: PropsWithChildren) {
  return <ThemeProvider value={NAV_THEME}>{children}</ThemeProvider>;
}
