import {
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from "@expo-google-fonts/cormorant-garamond";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { Italiana_400Regular } from "@expo-google-fonts/italiana";
import { useFonts } from "expo-font";

/**
 * Loads the same three type families as the web app (Cormorant Garamond,
 * Italiana, Inter — see kitchen-haven-club's Google Fonts `<link>` in
 * __root.tsx) via @expo-google-fonts, so RN screens can reference them
 * through the `font-*` classes configured in tailwind.config.js.
 *
 * Each weight is registered as its own family name (RN has no
 * font-weight-within-a-family like the web does), matching the weights the
 * web app actually pulls: Cormorant Garamond 400/500/600/700, Inter
 * 400/500/600/700, and Italiana's single weight. Italic cuts weren't
 * loaded — the web app's own markup never applies `italic` to Cormorant
 * Garamond directly (script-style text instead switches to the Italiana
 * family), so no screen has needed them so far.
 */
export function useAppFonts() {
  return useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    Italiana_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
}
