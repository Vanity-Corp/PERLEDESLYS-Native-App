import { Link } from "expo-router";
import { ArrowLeft, ExternalLink, StickyNote, Trash2 } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/ui/icon";
import { useNotes } from "@/lib/local-store";

// Web source: kitchen-haven-club/src/routes/app/notes/index.tsx
//
// The web's empty state points at a global floating "+" button (NotesFAB,
// Task 31, not built — the user asked for note-taking scoped to single-item
// content pages instead, see `add-note-button.tsx`). The empty-state copy
// below is adapted accordingly rather than pointing at a button that doesn't
// exist in this app's version of the feature.
function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotesScreen() {
  const { notes, remove } = useNotes();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView contentContainerClassName="pb-16" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 px-5 pb-2 pt-6">
          <Link href="/app/profile" asChild>
            <Pressable className="-ml-2 rounded-full p-2">
              <Icon as={ArrowLeft} size={20} className="text-foreground" />
            </Pressable>
          </Link>
          <View>
            <Text className="font-display text-2xl font-medium tracking-tight text-foreground">
              Mes notes
            </Text>
            <Text className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {notes.length} note{notes.length > 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {notes.length === 0 ? (
          <View className="mx-5 mt-10 items-center rounded-3xl border border-border bg-card p-10">
            <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-secondary">
              <Icon as={StickyNote} size={24} className="text-primary" />
            </View>
            <Text className="font-display text-lg text-foreground">Vos notes apparaîtront ici</Text>
            <Text className="mt-1 text-center text-sm text-muted-foreground">
              Touchez l'icône note sur une recette ou une vidéo pour créer votre première note.
            </Text>
          </View>
        ) : (
          <View className="mt-4 gap-3 px-5">
            {notes.map((n) => (
              <View key={n.id} className="rounded-2xl border border-border bg-card p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[10px] font-medium uppercase tracking-wider text-primary">
                    {formatDate(n.createdAt)}
                  </Text>
                  <Pressable onPress={() => remove(n.id)} accessibilityLabel="Supprimer">
                    <Icon as={Trash2} size={14} className="text-muted-foreground" />
                  </Pressable>
                </View>
                <Text className="mt-2 text-sm leading-relaxed text-foreground">{n.text}</Text>
                <Link href={n.contextHref as never} asChild>
                  <Pressable className="mt-3 flex-row items-center gap-1 self-start">
                    <Icon as={ExternalLink} size={12} className="text-primary" />
                    <Text className="text-[11px] font-medium text-primary">{n.contextLabel}</Text>
                  </Pressable>
                </Link>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
