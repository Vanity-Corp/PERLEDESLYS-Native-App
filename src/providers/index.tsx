import type { PropsWithChildren } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { QueryProvider } from "./query-provider";
import { AppThemeProvider } from "./theme-provider";

/**
 * Single composition root for every cross-cutting provider, mirroring the
 * web app's root component (which just wraps `<Outlet />` in
 * `QueryClientProvider`) — `_layout.tsx` stays a thin shell that only
 * decides *what* to render, not how each provider nests.
 *
 * Nesting order matters for two of these:
 *  - `GestureHandlerRootView` MUST be the outermost element (per
 *    react-native-gesture-handler's own setup docs) so it can attach its
 *    root-level gesture responder before anything else mounts.
 *  - `AppThemeProvider` wraps the navigator itself, since React
 *    Navigation reads the nav theme from context at the point the
 *    navigator (Stack/Tabs) renders.
 * `SafeAreaProvider` and `QueryProvider` are independent of both and of
 * each other; they're ordered here for readability, not correctness.
 */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <AppThemeProvider>{children}</AppThemeProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
