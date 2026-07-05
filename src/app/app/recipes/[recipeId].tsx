import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

// Web source: kitchen-haven-club/src/routes/app/recipes/$recipeId.tsx
// Stub only — real recipe detail UI lands in Task 19.
export default function RecipeDetailScreen() {
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-foreground">Recette: {recipeId}</Text>
    </View>
  );
}
