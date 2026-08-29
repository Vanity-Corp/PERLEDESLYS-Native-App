import { ActivityIndicator, View } from "react-native";

// Small loading footer for the infinite-scroll list screens (Recipes,
// Vidéos, Astuces, Lives) — shown under the last loaded page while the next
// one is being fetched, replacing the old numbered `Pagination` footer.
export function InfiniteScrollFooter({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View className="items-center py-6">
      <ActivityIndicator size="small" />
    </View>
  );
}
