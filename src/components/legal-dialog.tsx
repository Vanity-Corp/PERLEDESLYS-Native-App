import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text } from "react-native";

import { RichTextView } from "@/components/rich-text-view";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLegal } from "@/lib/content-queries";

// A tappable inline link that opens a legal document (privacy | terms) in a
// dialog. Used both in the "À propos" page and on the signup screen (the legal
// texts are public, so this works before login too).
export function LegalLink({
  doc,
  children,
}: {
  doc: "privacy" | "terms";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const legal = useLegal();
  const html = doc === "privacy" ? legal.privacy : legal.terms;
  const title =
    doc === "privacy" ? "Politique de confidentialité" : "Conditions générales";

  return (
    <>
      <Pressable onPress={() => setOpen(true)} hitSlop={6}>
        <Text className="text-sm font-medium text-primary underline">
          {children}
        </Text>
      </Pressable>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="h-[80%] w-[94%] max-w-none">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <ScrollView showsVerticalScrollIndicator={false}>
            {html.trim() ? (
              <RichTextView html={html} />
            ) : (
              <Text className="text-sm text-muted-foreground">
                Contenu à venir.
              </Text>
            )}
          </ScrollView>
        </DialogContent>
      </Dialog>
    </>
  );
}
