import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, BookOpen } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { Icon } from "@/components/ui/icon";
import { useArticlesQuery } from "@/lib/content-queries";

// Article ("Astuce") detail. Resolves from the shared articles list query (same
// pattern as the live detail) and renders the rich HTML `content` in a WebView
// with a readable stylesheet and dynamic height (the page posts its scroll
// height so the WebView grows to fit inside the outer ScrollView).
function buildArticleHtml(content: string): string {
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,'Segoe UI',Roboto,sans-serif;color:#2b2b2b;background:transparent;font-size:16px;line-height:1.65;padding:0}
    h2{font-size:20px;margin:18px 0 8px;font-weight:600}
    h3{font-size:17px;margin:16px 0 6px;font-weight:600}
    p{margin:0 0 12px}
    ul,ol{margin:0 0 12px 20px}
    li{margin:0 0 6px}
    img{max-width:100%;height:auto;border-radius:12px;margin:12px 0;display:block}
    a{color:#b06a8f}
  </style></head><body>
    <div id="root">${content}</div>
    <script>
      function postHeight(){
        var h = document.getElementById('root').scrollHeight;
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(String(h));
      }
      window.addEventListener('load', postHeight);
      // Re-measure once images finish loading (they change the height).
      Array.prototype.forEach.call(document.images, function(img){
        if(!img.complete){ img.addEventListener('load', postHeight); img.addEventListener('error', postHeight); }
      });
      setTimeout(postHeight, 300);
    </script>
  </body></html>`;
}

export default function ArticleDetailScreen() {
  const { articleId } = useLocalSearchParams<{ articleId: string }>();
  const router = useRouter();
  const articlesQ = useArticlesQuery();
  const articles = articlesQ.data ?? [];
  const article = articles.find((a) => a.id === articleId);
  const [webHeight, setWebHeight] = useState(200);

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

  const onMessage = (e: WebViewMessageEvent) => {
    const h = Number(e.nativeEvent.data);
    if (!Number.isNaN(h) && h > 0) setWebHeight(h);
  };

  const html = article.content?.trim()
    ? buildArticleHtml(article.content)
    : null;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={articlesQ.isFetching}
            onRefresh={() => articlesQ.refetch()}
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

          {html ? (
            <View className="mt-4" style={{ height: webHeight }}>
              <WebView
                originWhitelist={["*"]}
                source={{ html }}
                style={{ flex: 1, backgroundColor: "transparent" }}
                scrollEnabled={false}
                onMessage={onMessage}
                showsVerticalScrollIndicator={false}
              />
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
