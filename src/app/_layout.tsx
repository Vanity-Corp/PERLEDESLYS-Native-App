import { PortalHost } from "@rn-primitives/portal";
import * as ScreenOrientation from "expo-screen-orientation";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { useAppFonts } from "@/hooks/use-app-fonts";
import { AppProviders } from "@/providers";
import "../global.css";

// Keep the native splash screen up until fonts are ready — called once at
// module scope, before this component's first render.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      if (fontError) console.error("Font loading failed:", fontError);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // The app is portrait-only everywhere except the video fullscreen viewer
  // (VideoFullscreenModal), which briefly unlocks to landscape. app.json's
  // `orientation` had to move from "portrait" to "default" to allow that at
  // all, so this re-asserts portrait as the app's actual resting state on
  // every native platform (web has no orientation lock to fight).
  useEffect(() => {
    if (Platform.OS === "web") return;
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  // Render nothing (native splash stays up) until fonts have resolved,
  // one way or the other.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppProviders>
      <AnimatedSplashOverlay />
      {/* `app` is a REAL path segment (not a route group) so it resolves to
          "/app", matching the web app's own "/app/*" URL prefix — distinct
          from "(auth)"'s "/". The migration plan originally spec'd "(app)"
          as a cosmetic group, but that made both "(auth)/index" and
          "(app)/index" resolve to the identical path "/", a genuine
          collision `initialRouteName` cannot fix (confirmed by testing:
          "/" kept resolving to the Dashboard). There's no real auth state
          yet: Login just `router.replace`s into /app, and Profile's logout
          replaces back into (auth) — matches the web app, which also has
          no real auth. */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="app" />
      </Stack>
      <PortalHost />
    </AppProviders>
  );
}
