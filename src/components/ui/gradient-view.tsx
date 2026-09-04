import {
  LinearGradient,
  type LinearGradientPoint,
  type LinearGradientProps,
} from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { GRADIENTS } from "@/constants/theme";

// RNR has no gradient primitive, so this wraps expo-linear-gradient — the RN
// replacement for every web `bg-gradient-*` utility. Stop colors come from
// `GRADIENTS` (src/constants/theme.ts).
//
// IMPORTANT (New Architecture / Fabric): the gradient is rendered as an
// absolute-fill background BEHIND a plain <View>, never as the container
// itself. A `LinearGradientView` used as a screen/layout root crashes the app
// when react-native-screens re-parents it during a navigation transition:
//   "addViewAt: ... The specified child already has a parent"
//   (ReactClippingViewManager.addView → SurfaceMountingManager).
// A plain View re-parents cleanly, so it becomes the container and the gradient
// stays a stable, non-reparented child. `collapsable={false}` keeps the wrapper
// a real native view (Android view-flattening would otherwise drop it and
// expose the gradient as the reparent boundary again). `overflow: hidden`
// clips the fill to the container's border radius (e.g. gradient buttons).
//
// Directions mirror the web's CSS angles (kitchen-haven-club `--gradient-*`):
// `luxe`/`rose`/`gold` are 135deg (diagonal); `cream`/overlays are 180deg
// (vertical).

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
  bordeauxOverlay: VERTICAL,
  cardFadeTop: VERTICAL,
  cardFadeBottom: VERTICAL,
};

type GradientViewProps = Omit<
  LinearGradientProps,
  "colors" | "start" | "end"
> & {
  tone: GradientTone;
  className?: string;
};

function GradientView({
  tone,
  style,
  className,
  children,
  ...rest
}: GradientViewProps) {
  const { start, end } = DIRECTIONS[tone];

  return (
    <View
      collapsable={false}
      className={className}
      style={[{ overflow: "hidden" }, style]}
      {...rest}
    >
      <LinearGradient
        colors={GRADIENTS[tone]}
        start={start}
        end={end}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

export { GradientView };
export type { GradientViewProps };
