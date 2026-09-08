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
// current route. This is mounted the same way now — by GlobalFabs
// (src/components/global-fabs.tsx), which resolves contextLabel/contextHref
// from the current route and only renders this at all on the content pages
// where it makes sense (recipe detail, video detail, tips). This component
// itself stays route-agnostic: it just renders the trigger + dialog for
// whatever context it's given. The dialog itself is sized to nearly fill the
// screen rather than the small centered `DialogContent` default.
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
      {/* No absolute positioning — stacked as a plain flex child below the AI
          FAB by GlobalFabs (src/components/global-fabs.tsx). Same 52x52 size
          as the AI button so the two read as one pair. */}
      <Pressable
        onPress={() => setOpen(true)}
        className="h-[52px] w-[52px] items-center justify-center rounded-full bg-accent shadow-lg shadow-black/20"
      >
        <Icon
          as={StickyNotePlus}
          size={20}
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
