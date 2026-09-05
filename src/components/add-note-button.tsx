import { StickyNotePlus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import { useNotes } from "@/lib/local-store";

// The web's NotesFAB (kitchen-haven-club/src/components/NotesFAB.tsx) is a
// floating bottom-right button mounted globally, detecting context from the
// current route for every screen in the app. Per the user's explicit
// direction, note-taking here keeps the floating-button look but is scoped
// to single-item content pages instead (recipe detail, video detail, and
// tips detail once that screen exists) — each page renders its own
// `AddNoteButton` with a fixed context, rather than a route-based global
// affordance. The dialog itself is sized to nearly fill the screen rather
// than the small centered `DialogContent` default.
type AddNoteButtonProps = {
  contextLabel: string;
  contextHref: string;
};

export function AddNoteButton({
  contextLabel,
  contextHref,
}: AddNoteButtonProps) {
  const { add } = useNotes();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const onSave = () => {
    if (!text.trim()) return;
    add({ text: text.trim(), contextLabel, contextHref });
    setText("");
    setOpen(false);
  };

  return (
    <>
      {/* Stacked directly above the global AI FAB (bottom-44 right-4 in
          ai-chat.tsx) — same right offset, one FAB-height + gap higher —
          instead of floating separately at bottom-6, where it used to clash
          with both the AI button and the bottom tab bar underneath it. */}
      <Pressable
        onPress={() => setOpen(true)}
        className="absolute bottom-[15rem] right-4 h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg shadow-black/20"
      >
        <Icon
          as={StickyNotePlus}
          size={24}
          className="text-primary-foreground"
        />
      </Pressable>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setText("");
        }}
      >
        <DialogContent className="w-[94%]">
          <DialogHeader>
            <DialogTitle>Nouvelle note</DialogTitle>
          </DialogHeader>
          <View className="rounded-xl bg-secondary px-3 py-2">
            <Text className="text-[11px] text-muted-foreground">
              {contextLabel}
            </Text>
          </View>
          <Textarea
            value={text}
            onChangeText={setText}
            placeholder="Écrivez votre note..."
            autoFocus
            className="w-fit bg-white"
            multiline
            textAlignVertical="top"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button className="bg-white" variant="outline">
                <Text>Annuler</Text>
              </Button>
            </DialogClose>
            <Button
              variant={"default"}
              onPress={onSave}
              disabled={!text.trim()}
            >
              <Text>Enregistrer</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
