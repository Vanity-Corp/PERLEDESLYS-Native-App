import {
  DarkTheme,
  DefaultTheme,
  type Theme,
} from "expo-router/react-navigation";

// Perledeslys palette — converted 1:1 from the web app's oklch tokens
// (kitchen-haven-club/src/styles.css) to hsl via the OKLab matrices, so the
// hue/chroma/lightness match exactly rather than being eyeballed. `rose` /
// `goldSoft` / `cream` etc. aren't redefined by the web app's `.dark` block
// either, so `dark` reuses the same values here for parity.
const roseGoldCream = {
  rose: "hsl(357.2 54.4% 84.3%)",
  roseDeep: "hsl(355.5 36.1% 61.1%)",
  gold: "hsl(26.5 78.9% 57.3%)",
  goldSoft: "hsl(30.3 80.1% 72.4%)",
  cream: "hsl(37.1 53.9% 95.2%)",
};

// v2 client rebrand values (see the matching comment block in global.css)
// mirrored here since NAV_THEME/GRADIENTS/ICON_TINT need real resolved
// strings, not `hsl(var(--x))` references.
export const THEME = {
  light: {
    background: "hsl(33 41.7% 90.6%)",
    foreground: "hsl(351.8 34.4% 12.5%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(351.8 34.4% 12.5%)",
    popover: "hsl(0 0% 100%)",
    popoverForeground: "hsl(351.8 34.4% 12.5%)",
    primary: "hsl(354.3 74.6% 13.9%)",
    primaryForeground: "hsl(18 100.0% 98.0%)",
    secondary: "hsl(35 46.2% 84.7%)",
    secondaryForeground: "hsl(354.3 74.6% 13.9%)",
    muted: "hsl(34.3 39.6% 89.6%)",
    mutedForeground: "hsl(27.5 9.5% 49.4%)",
    accent: "hsl(26.5 78.9% 57.3%)",
    accentForeground: "hsl(18 100.0% 98.0%)",
    destructive: "hsl(5.6 63.4% 46.1%)",
    destructiveForeground: "hsl(18 100.0% 98.0%)",
    border: "hsl(33.3 33.3% 84.1%)",
    input: "hsl(33.3 33.3% 84.1%)",
    ring: "hsl(354.3 74.6% 13.9%)",
    radius: "1rem",
    ...roseGoldCream,
  },
  dark: {
    background: "hsl(352 40.5% 7.3%)",
    foreground: "hsl(33 41.7% 90.6%)",
    card: "hsl(354 38.5% 10.2%)",
    cardForeground: "hsl(33 41.7% 90.6%)",
    popover: "hsl(354 38.5% 10.2%)",
    popoverForeground: "hsl(33 41.7% 90.6%)",
    primary: "hsl(354.7 42.3% 57.8%)",
    primaryForeground: "hsl(352 40.5% 7.3%)",
    secondary: "hsl(353.1 34.2% 14.9%)",
    secondaryForeground: "hsl(33 41.7% 90.6%)",
    muted: "hsl(352.8 37.3% 13.1%)",
    mutedForeground: "hsl(23.6 16.5% 66.7%)",
    accent: "hsl(26.5 78.9% 57.3%)",
    accentForeground: "hsl(352 40.5% 7.3%)",
    destructive: "hsl(3.1 74.8% 59.6%)",
    destructiveForeground: "hsl(33 41.7% 90.6%)",
    border: "hsl(355.7 31.8% 17.3%)",
    input: "hsl(355.7 31.8% 17.3%)",
    ring: "hsl(354.7 42.3% 57.8%)",
    radius: "1rem",
    ...roseGoldCream,
  },
};

// Gradient stops matching the web app's `--gradient-*` tokens (styles.css).
// Not native `background` CSS — these are plain color arrays meant to be
// passed to `expo-linear-gradient`'s `colors` prop once screens are built.
//
// `luxe` was a rose→gold two-stop gradient in v1. The v2 rebrand assets show
// no gradient anywhere — confirmed by pixel-sampling the "Se connecter"
// button in auth-page.png at 5 points (left/mid/right/top/bottom): all
// exactly `#b75469`, zero variation. Rather than rip out every screen's
// `<GradientView tone="luxe">` usage (BottomNav's active pill, Dashboard's
// cards, Recipe Detail's Cookidoo CTA, Lives, Profile — all built against
// mockups from before this rebrand), both stops are set to the same new
// primary color, so it renders visually solid through the existing
// gradient-based architecture rather than requiring an app-wide refactor
// this rebrand's own assets don't give evidence for beyond these 3 screens.
export const GRADIENTS = {
  rose: ["hsl(357.2, 59.5%, 85.6%)", "hsl(4.9, 67.7%, 76.5%)"],
  gold: ["hsl(30.3, 80.1%, 72.4%)", "hsl(26.5, 78.9%, 57.3%)"],
  luxe: ["hsl(354.3, 74.6%, 13.9%)", "hsl(354.3, 74.6%, 13.9%)"],
  cream: ["hsl(8.1, 100.0%, 98.2%)", "hsl(2.0, 78.3%, 94.1%)"],
  overlay: ["transparent", "hsla(8.9, 29.2%, 9.2%, 0.85)"],
  roseOverlay: ["transparent", "hsla(354.3, 74.6%, 13.9%, 0.85)"],
  creamOverlay: ["transparent", "hsla(10, 100.0%, 98.2%, 0.90)"],
} as const;

// Hex fallbacks for props that need a real resolved color rather than a
// `hsl(var(--x))` string — e.g. SVG icon `color` props, which NativeWind's
// className pipeline doesn't reach. Light-mode only for now: no screen has
// real dark-mode switching wired yet (matches the web app, whose own
// "Thème sombre" setting is stored but never applied anywhere).
export const ICON_TINT = {
  primaryForeground: "#fff8f5",
  mutedForeground: "#8a7d72",
} as const;

export const NAV_THEME: Record<"light" | "dark", Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
