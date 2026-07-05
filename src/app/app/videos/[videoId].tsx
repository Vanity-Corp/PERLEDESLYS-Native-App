import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

// Web source: kitchen-haven-club/src/routes/app/videos/$videoId.tsx
// Stub only — real player/history UI lands in Tasks 21-22.
export default function VideoDetailScreen() {
  const { videoId } = useLocalSearchParams<{ videoId: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-foreground">Vidéo: {videoId}</Text>
    </View>
  );
}
