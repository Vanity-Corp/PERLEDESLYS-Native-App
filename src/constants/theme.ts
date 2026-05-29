import { Platform } from 'react-native';

export const palette = {
  rose: '#D99AA5',
  roseDeep: '#A85D6F',
  gold: '#C9A24A',
  goldSoft: '#E8D7A2',
  cream: '#FBF6EF',
  ivory: '#FFFDFC',
  noir: '#2E2528',
  muted: '#8E7B7F',
  border: '#ECDDE0',
  darkBackground: '#241D20',
  darkCard: '#30272B',
} as const;

export const Colors = {
  light: {
    text: palette.noir,
    background: '#FCF6F3',
    backgroundElement: '#F6E9E7',
    backgroundSelected: '#F0D7DB',
    textSecondary: palette.muted,
    card: palette.ivory,
    primary: palette.roseDeep,
    primaryForeground: '#FFFFFF',
    accent: palette.gold,
    border: palette.border,
    destructive: '#B94242',
  },
  dark: {
    text: '#FFF8F6',
    background: palette.darkBackground,
    backgroundElement: '#3A3034',
    backgroundSelected: '#49353B',
    textSecondary: '#D4BEC3',
    card: palette.darkCard,
    primary: '#E7A9B4',
    primaryForeground: '#241D20',
    accent: '#E0BD62',
    border: '#4C3A40',
    destructive: '#F07A7A',
  },
} as const;

export type ColorSchemeName = keyof typeof Colors;
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  android: { sans: 'sans', serif: 'serif', rounded: 'sans', mono: 'monospace' },
  web: {
    sans: 'Inter, system-ui, sans-serif',
    serif: 'Cormorant Garamond, Georgia, serif',
    rounded: 'Inter, system-ui, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
});

export const Spacing = { half: 2, one: 4, two: 8, three: 12, four: 16, five: 24, six: 32, seven: 48, eight: 64 } as const;
export const Radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 } as const;
export const MaxContentWidth = 920;
export const BottomTabInset = Platform.select({ ios: 50, android: 76 }) ?? 0;
