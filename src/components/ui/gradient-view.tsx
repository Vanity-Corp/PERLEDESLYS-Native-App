import {
  LinearGradient,
  type LinearGradientPoint,
  type LinearGradientProps,
} from "expo-linear-gradient";
import { cssInterop } from "nativewind";

import { GRADIENTS } from "@/constants/theme";

// RNR has no gradient primitive, so this wraps expo-linear-gradient instead
// — the RN replacement for every web `bg-gradient-*` utility class. Stop
// colors come from `GRADIENTS` (src/constants/theme.ts), already converted
// from the same oklch source values as the rest of the palette.
//
// Directions mirror the web's actual CSS angles (kitchen-haven-club's
// styles.css `--gradient-*` tokens) rather than expo-linear-gradient's
// {x:0.5,y:0}->{x:0.5,y:1} default: `luxe`/`rose`/`gold` are 135deg
// (top-left -> bottom-right diagonal), `cream`/`overlay`/`roseOverlay` are
// 180deg (straight down).
//
// NativeWind has no built-in awareness of expo-linear-gradient's
// LinearGradient (confirmed: nothing in its source even mentions it) — on
// native, an unregistered third-party component's `className` prop is a
// no-op (it just gets passed through as a meaningless string), even though
// it *looks* like it works when only checked via a web build (react-native-
// web compiles className to real CSS regardless of the component). This
// bit us for real: the cream/luxe backgrounds rendered as plain black on an
// actual Android device (className="flex-1" etc. silently doing nothing)
// despite verifying fine via `expo start --web`. `cssInterop` registration
// is the fix — same pattern `ui/icon.tsx` already uses for lucide icons.
cssInterop(LinearGradient, { className: "style" });

export type GradientTone = keyof typeof GRADIENTS;

const DIAGONAL: { start: LinearGradientPoint; end: LinearGradientPoint } = {
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};
const VERTICAL: { start: LinearGradientPoint; end: LinearGradientPoint } = {
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
};

const DIRECTIONS: Record<
  GradientTone,
  { start: LinearGradientPoint; end: LinearGradientPoint }
> = {
  luxe: DIAGONAL,
  rose: DIAGONAL,
  gold: DIAGONAL,
  cream: VERTICAL,
  overlay: VERTICAL,
  roseOverlay: VERTICAL,
  creamOverlay: VERTICAL,
};

type GradientViewProps = Omit<
  LinearGradientProps,
  "colors" | "start" | "end"
> & {
  tone: GradientTone;
};

function GradientView({ tone, ...props }: GradientViewProps) {
  const { start, end } = DIRECTIONS[tone];

  return (
    <LinearGradient
      colors={GRADIENTS[tone]}
      start={start}
      end={end}
      {...props}
    />
  );
}

export { GradientView };
export type { GradientViewProps };
