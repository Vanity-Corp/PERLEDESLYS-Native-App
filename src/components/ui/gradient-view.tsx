import { LinearGradient, type LinearGradientPoint, type LinearGradientProps } from "expo-linear-gradient";

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
export type GradientTone = keyof typeof GRADIENTS;

const DIAGONAL: { start: LinearGradientPoint; end: LinearGradientPoint } = {
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};
const VERTICAL: { start: LinearGradientPoint; end: LinearGradientPoint } = {
  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
};

const DIRECTIONS: Record<GradientTone, { start: LinearGradientPoint; end: LinearGradientPoint }> = {
  luxe: DIAGONAL,
  rose: DIAGONAL,
  gold: DIAGONAL,
  cream: VERTICAL,
  overlay: VERTICAL,
  roseOverlay: VERTICAL,
};

type GradientViewProps = Omit<LinearGradientProps, "colors" | "start" | "end"> & {
  tone: GradientTone;
};

function GradientView({ tone, ...props }: GradientViewProps) {
  const { start, end } = DIRECTIONS[tone];

  return <LinearGradient colors={GRADIENTS[tone]} start={start} end={end} {...props} />;
}

export { GradientView };
export type { GradientViewProps };
