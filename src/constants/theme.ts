import {
  DarkTheme,
  DefaultTheme,
  type Theme,
} from "expo-router/react-navigation";

// PERLEDESLYS palette — converted 1:1 from the web app's oklch tokens
// (kitchen-haven-club/src/styles.css) to hsl via the OKLab matrices, so the
// hue/chroma/lightness match exactly rather than being eyeballed. `rose` /
// `goldSoft` / `cream` etc. aren't redefined by the web app's `.dark` block
// either, so `dark` reuses the same values here for parity.
const roseGoldCream = {
  rose: "hsl(357.2 54.4% 84.3%)",
  roseDeep: "hsl(355.5 36.1% 61.1%)",
  gold: "hsl(38.2 64.0% 62.2%)",
  goldSoft: "hsl(40.3 59.7% 79.3%)",
  cream: "hsl(37.1 53.9% 95.2%)",
};

export const THEME = {
  light: {
    background: "hsl(6.4 100.0% 98.5%)",
    foreground: "hsl(9.1 22.4% 9.1%)",
    card: "hsl(9.2 100.0% 99.3%)",
    cardForeground: "hsl(9.1 22.4% 9.1%)",
    popover: "hsl(9.2 100.0% 99.3%)",
    popoverForeground: "hsl(9.1 22.4% 9.1%)",
    primary: "hsl(355.5 36.1% 61.1%)",
    primaryForeground: "hsl(6.1 100.0% 99.0%)",
    secondary: "hsl(5.9 66.9% 94.7%)",
    secondaryForeground: "hsl(9.1 17.7% 16.7%)",
    muted: "hsl(5.9 43.4% 93.2%)",
    mutedForeground: "hsl(5.7 8.3% 40.0%)",
    accent: "hsl(37.5 58.1% 70.6%)",
    accentForeground: "hsl(8.9 25.5% 13.9%)",
    destructive: "hsl(358.6 67.3% 52.3%)",
    destructiveForeground: "hsl(6.1 100.0% 99.0%)",
    border: "hsl(5.9 19.3% 87.8%)",
    input: "hsl(5.9 24.6% 90.4%)",
    ring: "hsl(355.5 36.1% 61.1%)",
    radius: "1rem",
    ...roseGoldCream,
  },
  dark: {
    background: "hsl(5.5 20.6% 7.3%)",
    foreground: "hsl(5.9 54.2% 95.6%)",
    card: "hsl(5.5 18.0% 11.0%)",
    cardForeground: "hsl(5.9 54.2% 95.6%)",
    popover: "hsl(5.5 18.0% 11.0%)",
    popoverForeground: "hsl(5.9 54.2% 95.6%)",
    primary: "hsl(356.0 65.4% 77.4%)",
    primaryForeground: "hsl(5.5 20.6% 7.3%)",
    secondary: "hsl(5.6 14.1% 14.8%)",
    secondaryForeground: "hsl(5.9 54.2% 95.6%)",
    muted: "hsl(5.6 14.1% 14.8%)",
    mutedForeground: "hsl(5.9 7.4% 63.0%)",
    accent: "hsl(38.2 64.0% 62.2%)",
    accentForeground: "hsl(5.5 20.6% 7.3%)",
    destructive: "hsl(0.4 85.1% 62.1%)",
    destructiveForeground: "hsl(5.9 54.2% 95.6%)",
    border: "hsl(5.6 11.6% 18.6%)",
    input: "hsl(5.6 11.6% 18.6%)",
    ring: "hsl(356.0 65.4% 77.4%)",
    radius: "1rem",
    ...roseGoldCream,
  },
};

// Gradient stops matching the web app's `--gradient-*` tokens (styles.css).
// Not native `background` CSS — these are plain color arrays meant to be
// passed to `expo-linear-gradient`'s `colors` prop once screens are built.
export const GRADIENTS = {
  rose: ["hsl(357.2, 59.5%, 85.6%)", "hsl(4.9, 67.7%, 76.5%)"],
  gold: ["hsl(37.8, 69.2%, 68.5%)", "hsl(28.1, 58.2%, 53.8%)"],
  luxe: ["hsl(357.2, 54.4%, 84.3%)", "hsl(38.2, 64.0%, 62.2%)"],
  cream: ["hsl(8.1, 100.0%, 98.2%)", "hsl(2.0, 78.3%, 94.1%)"],
  overlay: ["transparent", "hsla(8.9, 29.2%, 9.2%, 0.85)"],
  roseOverlay: ["transparent", "hsla(354.5, 30.6%, 37.0%, 0.85)"],
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
