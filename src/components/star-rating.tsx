import { Star } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Icon } from "@/components/ui/icon";

// Star rating control. Interactive by default (tap a star to set the value);
// pass `readOnly` to render a static rating (e.g. in the home testimonials).
export function StarRating({
  value,
  onChange,
  size = 28,
  readOnly = false,
}: {
  value: number;
  onChange?: (rating: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  return (
    <View className="flex-row items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        const star = (
          <Icon
            as={Star}
            size={size}
            className={filled ? "text-amber-400" : "text-muted-foreground/30"}
            fill={filled ? "#fbbf24" : "transparent"}
          />
        );
        if (readOnly) return <View key={n}>{star}</View>;
        return (
          <Pressable
            key={n}
            onPress={() => onChange?.(n)}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={`${n} étoile${n > 1 ? "s" : ""}`}
          >
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}
