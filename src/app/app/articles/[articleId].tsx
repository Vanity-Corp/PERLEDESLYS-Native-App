import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, BookOpen } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RichTextView } from "@/components/rich-text-view";
import { Icon } from "@/components/ui/icon";
import { useArticlesQuery, useHardRefresh } from "@/lib/content-queries";

// Article ("Astuce") detail. Resolves from the shared articles list query (same
// pattern as the live detail) and renders the rich HTML `content` via the
// shared RichTextView (auto-height so the full article is shown, never clipped).
export default function ArticleDetailScreen() {
  const { articleId } = useLocalSearchParams<{ articleId: string }>();
  const router = useRouter();
  const articlesQ = useArticlesQuery();
  const articles = articlesQ.data ?? [];
  const article = articles.find((a) => a.id === articleId);
  const onRefresh = useHardRefresh([["articles"]]);

  if (articles.length === 0 && !article) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }
  if (!article) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Article introuvable.</Text>
      </SafeAreaView>
    );
  }

  const hasContent = !!article.content?.trim();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={articlesQ.isFetching}
            onRefresh={onRefresh}
          />
        }
      >
        <View className="relative">
          <Image
            source={article.image}
            contentFit="cover"
            style={{ width: "100%", height: 220 }}
            accessibilityLabel={article.title}
          />
          <SafeAreaView
            className="absolute inset-x-0 top-0"
            edges={["top"]}
            pointerEvents="box-none"
          >
            <Pressable
              onPress={() => router.back()}
              className="ml-5 mt-5 h-10 w-10 items-center justify-center rounded-full bg-background/95"
            >
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </Pressable>
          </SafeAreaView>
        </View>

        <View className="px-5 pb-12 pt-5">
          <Text className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
            {article.category}
          </Text>
          <Text className="mt-1 font-display text-2xl font-medium leading-tight text-foreground">
            {article.title}
          </Text>
          <View className="mt-2 flex-row items-center gap-1">
            <Icon as={BookOpen} size={12} className="text-muted-foreground" />
            <Text className="text-xs text-muted-foreground">
              {article.readTime} de lecture
            </Text>
          </View>

          {hasContent ? (
            <View className="mt-4">
              <RichTextView html={article.content ?? ""} />
            </View>
          ) : (
            <Text className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {article.excerpt}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
