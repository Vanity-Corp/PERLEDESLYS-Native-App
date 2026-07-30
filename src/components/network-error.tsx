import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

// Shown when a content query fails (e.g. no network). Displays the broken-
// thermomix illustration + a retry button.
const BROKEN = require("../../assets/new-assets/broken-thermomix.png");

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-8 py-16">
      <Image
        source={BROKEN}
        contentFit="contain"
        style={{ width: 180, height: 180 }}
        accessibilityLabel="Problème de connexion"
      />
      <Text className="text-center font-display text-lg font-medium text-foreground">
        Oups, connexion perdue
      </Text>
      <Text className="text-center text-sm text-muted-foreground">
        Impossible de charger le contenu. Vérifiez votre connexion internet et
        réessayez.
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="mt-2 rounded-2xl border border-border bg-card px-6 py-3"
        >
          <Text className="text-sm font-medium text-primary">Réessayer</Text>
        </Pressable>
      )}
    </View>
  );
}
