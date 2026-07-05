import { PortalHost } from "@rn-primitives/portal";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
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

  // Render nothing (native splash stays up) until fonts have resolved,
  // one way or the other.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppProviders>
      <AnimatedSplashOverlay />
      <AppTabs />
      <PortalHost />
    </AppProviders>
  );
}
