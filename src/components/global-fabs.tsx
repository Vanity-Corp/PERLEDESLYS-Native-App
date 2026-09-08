import { usePathname } from "expo-router";
import { View } from "react-native";

import { AddNoteButton } from "@/components/add-note-button";
import { AIChat } from "@/components/ai-chat";
import { useRecipe, useVideo } from "@/lib/content-queries";

// AI assistant + "add note" FABs, mounted once at the app root (AppLayout)
// and stacked in a single flex column instead of each computing its own
// absolute pixel offset to sit above the other. The note button only shows
// on single-item content pages (recipe detail, video detail, tips) — same
// scope those 3 screens used to enforce themselves by each rendering their
// own <AddNoteButton>, now driven off the current route instead so both FABs
// can live together here.
function useNoteContext(): { contextLabel: string; contextHref: string } | null {
  const pathname = usePathname();
  const recipeId = pathname.match(/^\/app\/recipes\/([^/]+)$/)?.[1];
  const videoId = pathname.match(/^\/app\/videos\/([^/]+)$/)?.[1];

  // Same query hooks/keys the detail screens themselves use, so this reads
  // from the query cache they already populated instead of firing a second
  // network request.
  const { data: recipe } = useRecipe(recipeId);
  const { data: video } = useVideo(videoId);

  if (recipeId && recipe) {
    return {
      contextLabel: `Recette : ${recipe.title}`,
      contextHref: `/app/recipes/${recipe.id}`,
    };
  }
  if (videoId && video) {
    return {
      contextLabel: `Vidéo : ${video.title}`,
      contextHref: `/app/videos/${video.id}`,
    };
  }
  if (pathname === "/app/tips") {
    return { contextLabel: "Astuces & conseils", contextHref: "/app/tips" };
  }
  return null;
}

export function GlobalFabs() {
  const noteContext = useNoteContext();
  return (
    <View className="absolute bottom-44 right-4 z-40 items-end gap-2">
      <AIChat />
      {noteContext && (
        <AddNoteButton
          contextLabel={noteContext.contextLabel}
          contextHref={noteContext.contextHref}
        />
      )}
    </View>
  );
}
