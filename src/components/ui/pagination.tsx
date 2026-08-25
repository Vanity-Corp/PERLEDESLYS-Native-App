import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

// Page numbers to render around the current page, with "…" gaps — e.g.
// [1, "ellipsis", 4, 5, 6, "ellipsis", 12] for page 5 of 12.
function pageWindow(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const kept = [...new Set([1, totalPages, page - 1, page, page + 1])]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  kept.forEach((p, i) => {
    if (i > 0 && p - kept[i - 1] > 1) result.push("ellipsis");
    result.push(p);
  });
  return result;
}

// Numbered pager for the Recipes/Vidéos/Lives/Astuces list screens, styled
// like the app's existing category-filter pills (rounded-full border-border
// bg-card, active state bg-accent + white text).
export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <View className={cn("flex-row flex-wrap items-center justify-center gap-2 px-5 py-6", className)}>
      <Pressable
        onPress={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={cn(
          "h-9 w-9 items-center justify-center rounded-full border border-border bg-card",
          page <= 1 && "opacity-40",
        )}
      >
        <Icon as={ChevronLeft} size={16} className="text-foreground" />
      </Pressable>

      {pageWindow(page, totalPages).map((p, i) =>
        p === "ellipsis" ? (
          <Text key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">
            …
          </Text>
        ) : (
          <Pressable
            key={p}
            onPress={() => onPageChange(p)}
            className={cn(
              "h-9 w-9 items-center justify-center rounded-full border border-border bg-card",
              p === page && "border-transparent bg-accent",
            )}
          >
            <Text className={cn("text-xs font-medium text-foreground", p === page && "text-white")}>
              {p}
            </Text>
          </Pressable>
        ),
      )}

      <Pressable
        onPress={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={cn(
          "h-9 w-9 items-center justify-center rounded-full border border-border bg-card",
          page >= totalPages && "opacity-40",
        )}
      >
        <Icon as={ChevronRight} size={16} className="text-foreground" />
      </Pressable>
    </View>
  );
}
