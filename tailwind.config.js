const { hairlineWidth } = require('nativewind/theme');
 
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  // Actual source lives under src/ (src/app, src/components, ...) — the
  // default template globs only covered a root-level app/ and components/,
  // which don't exist here, so class scanning was silently missing the
  // whole app.
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // PERLEDESLYS accent tokens — not overridden in the web app's own
        // .dark block either, so no dark-specific values here.
        rose: 'hsl(var(--rose))',
        'rose-deep': 'hsl(var(--rose-deep))',
        gold: 'hsl(var(--gold))',
        'gold-soft': 'hsl(var(--gold-soft))',
        cream: 'hsl(var(--cream))',
        noir: 'hsl(var(--noir))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // Font family name -> string must match the useFonts() map in
      // src/hooks/use-app-fonts.ts. RN has no font-weight-within-a-family
      // like the web does, so each weight is its own family/utility here.
      fontFamily: {
        sans: ['Inter_400Regular'],
        'sans-medium': ['Inter_500Medium'],
        'sans-semibold': ['Inter_600SemiBold'],
        'sans-bold': ['Inter_700Bold'],
        // Web's h1-h4 default to font-display at weight 500.
        display: ['CormorantGaramond_500Medium'],
        'display-regular': ['CormorantGaramond_400Regular'],
        'display-semibold': ['CormorantGaramond_600SemiBold'],
        'display-bold': ['CormorantGaramond_700Bold'],
        italiana: ['Italiana_400Regular'],
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [require('tailwindcss-animate')],
};