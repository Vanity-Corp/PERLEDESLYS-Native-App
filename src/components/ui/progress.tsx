import { View, type ViewProps } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

import { cn } from "@/lib/utils";

// RNR has no Progress primitive, so this mirrors a typical RNR/shadcn
// component shape (`value` + `className` passthrough) instead. Base
// styling matches the web app's actual usage — `h-1 bg-background/30`
// track, `bg-primary` fill — used as an absolute-positioned overlay on
// video cards (Dashboard, Tutorials list) and History rows, not the
// unused shadcn `ui/progress.tsx` scaffold's generic `h-2`/`rounded-full`
// defaults. Positioning (e.g. `absolute inset-x-0 bottom-0`) is left to
// the caller via `className`, same as the web's raw `<div>` markup.
type ProgressProps = ViewProps & {
  value?: number; // 0-100
};

function Progress({ className, value = 0, ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const fillStyle = useAnimatedStyle(() => ({
    width: `${withTiming(clamped, { duration: 300 })}%`,
  }));

  return (
    <View
      className={cn("h-1 w-full overflow-hidden bg-background/30", className)}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
      {...props}
    >
      <Animated.View className="h-full bg-primary" style={fillStyle} />
    </View>
  );
}

export { Progress };
export type { ProgressProps };
