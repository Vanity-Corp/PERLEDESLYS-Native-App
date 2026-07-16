import * as DialogPrimitive from "@rn-primitives/dialog";
import { Link } from "expo-router";
import {
  BookOpen,
  Bot,
  PlayCircle,
  Send,
  Sparkles,
  User as UserIcon,
  X,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Dialog, DialogPortal } from "@/components/ui/dialog";
import { GradientView } from "@/components/ui/gradient-view";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import { aiChat } from "@/lib/api";
import { recipes, videos } from "@/lib/mock-data";

// Web source: kitchen-haven-club/src/components/AIChat.tsx
//
// Mounted globally in `app/_layout.tsx` (a floating overlay above every /app/*
// screen, matching the web's globally-mounted <AIChat />). Uses the RNR dialog
// primitives directly (rather than the `DialogContent` wrapper) so the sheet
// can be edge-to-edge with its own gradient header + close button, instead of
// the wrapper's padded card + built-in top-right X.
//
// `parseReferences` / `cleanContent` / the FormattedMessage line parser are
// ported verbatim from the web; only the DOM markup becomes RN
// View/Text/Icon. Copy note: "l'IA de Lys" → "l'IA de Ghania" per the v2
// client rebrand (founder renamed), consistent with every other screen.
//
// `aiChat()` (Task 9) already returns the raw error string; the web's `😔 `
// prefix is added here at render time, matching the web's own separation.

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "As-tu une recette de pizza ?",
  "Quelle recette contient du poulet ?",
  "Comment nettoyer mon TM7 ?",
  "Convertis cette recette au Thermomix : …",
];

function parseReferences(text: string) {
  // Find [RECETTE id:xxx] / [VIDEO id:xxx]
  const refs: { type: "recipe" | "video"; id: string; title: string }[] = [];
  const re = /\[(RECETTE|VIDEO)\s+id:([a-z0-9-]+)\]/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m[1].toUpperCase() === "RECETTE") {
      const r = recipes.find((x) => x.id === m![2]);
      if (r && !refs.find((x) => x.id === r.id))
        refs.push({ type: "recipe", id: r.id, title: r.title });
    } else {
      const v = videos.find((x) => x.id === m![2]);
      if (v && !refs.find((x) => x.id === v.id))
        refs.push({ type: "video", id: v.id, title: v.title });
    }
  }
  return refs;
}

function cleanContent(text: string) {
  return text.replace(/\s*\[(RECETTE|VIDEO)\s+id:[a-z0-9-]+\]/gi, "").trim();
}

// Light markdown: **bold**, ### title, lists — ported line-for-line from web.
// RN nested <Text> inherits size/color from its parent <Text>, so each line's
// wrapping Text carries the color/size and the inline bold/plain spans inherit.
function renderInline(s: string) {
  return s.split(/(\*\*[^*]+\*\*)/g).map((p, k) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <Text key={k} className="font-semibold">
        {p.slice(2, -2)}
      </Text>
    ) : (
      <Text key={k}>{p}</Text>
    ),
  );
}

function FormattedMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <View className="gap-1.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <View key={i} className="h-1" />;
        if (line.startsWith("### "))
          return (
            <Text
              key={i}
              className="mt-2 font-display text-base text-foreground"
            >
              {line.slice(4)}
            </Text>
          );
        if (line.startsWith("## "))
          return (
            <Text key={i} className="mt-2 font-display text-lg text-foreground">
              {line.slice(3)}
            </Text>
          );
        const bullet = /^(\s*[-*]\s+|\s*\d+\.\s+)/.exec(line);
        if (bullet)
          return (
            <View key={i} className="flex-row gap-2 pl-1">
              <Text className="mt-0.5 text-primary">•</Text>
              <Text className="flex-1 text-[13.5px] leading-relaxed text-foreground">
                {renderInline(line.replace(/^(\s*[-*]\s+|\s*\d+\.\s+)/, ""))}
              </Text>
            </View>
          );
        return (
          <Text
            key={i}
            className="text-[13.5px] leading-relaxed text-foreground"
          >
            {renderInline(line)}
          </Text>
        );
      })}
    </View>
  );
}

export function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Bonjour 🌸 Je suis l'assistante IA de Ghania. Pose-moi une question sur une recette, une astuce TM7 ou colle-moi une recette à convertir au Thermomix.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  async function send(text: string) {
    const value = text.trim();
    if (!value || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: value }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await aiChat({
        messages: next.map(({ role, content }) => ({ role, content })),
      });
      if (res.ok) {
        setMessages([...next, { role: "assistant", content: res.content }]);
      } else {
        setMessages([...next, { role: "assistant", content: `😔 ${res.error}` }]);
      }
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "😔 Je n'ai pas pu joindre l'assistance. Vérifie ta connexion et réessaie.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityLabel="Ouvrir l'assistante IA"
        className="absolute bottom-44 right-4 z-40"
      >
        <GradientView
          tone="gold"
          className="items-center justify-center rounded-full shadow-lg shadow-black/20"
          style={{ width: 52, height: 52 }}
        >
          <Icon as={Sparkles} size={20} className="text-foreground" />
        </GradientView>
        <View className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5">
          <Text className="text-[9px] font-bold text-primary-foreground">IA</Text>
        </View>
      </Pressable>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          {/* Self-contained overlay — deliberately NOT the shared DialogOverlay.
              On iOS that wraps content in react-native-screens' FullWindowOverlay
              (a separate native window), and KeyboardAvoidingView cannot measure
              the keyboard from inside it, so the input stayed hidden behind the
              keyboard. Here the KeyboardAvoidingView wraps the sheet directly in
              the app's own window: on iOS `behavior="padding"` lifts the sheet
              above the keyboard; on Android it's left to the OS's default
              adjustResize (Expo's default) so adding padding wouldn't double up. */}
          <View
            className="absolute bottom-0 left-0 right-0 top-0"
            style={{ pointerEvents: "box-none" }}
          >
            <Pressable
              className="absolute bottom-0 left-0 right-0 top-0 bg-black/50"
              onPress={() => setOpen(false)}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              className="flex-1 justify-end"
              style={{ pointerEvents: "box-none" }}
            >
              <DialogPrimitive.Content className="mx-auto h-[85%] w-full max-w-md overflow-hidden rounded-t-3xl bg-background sm:rounded-3xl">
                {/* Header */}
                <GradientView
                  tone="luxe"
                  className="flex-row items-center gap-3 px-5 py-4"
                >
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-background/20">
                    <Icon as={Sparkles} size={20} className="text-primary-foreground" />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground opacity-90">
                      Assistante IA
                    </Text>
                    <Text className="font-display text-lg leading-tight text-primary-foreground">
                      Perle, l'IA de Ghania
                    </Text>
                  </View>
                  <DialogPrimitive.Close asChild>
                    <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-background/20">
                      <Icon as={X} size={16} className="text-primary-foreground" />
                    </Pressable>
                  </DialogPrimitive.Close>
                </GradientView>

                {/* Messages */}
                <ScrollView
                  ref={scrollRef}
                  className="flex-1 bg-secondary/30"
                  contentContainerClassName="gap-3 px-4 py-4"
                  showsVerticalScrollIndicator={false}
                >
                  {messages.map((m, i) => {
                    const refs =
                      m.role === "assistant" ? parseReferences(m.content) : [];
                    const clean =
                      m.role === "assistant"
                        ? cleanContent(m.content)
                        : m.content;
                    return (
                      <View
                        key={i}
                        className={`flex-row gap-2 ${
                          m.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {m.role === "assistant" && (
                          <GradientView
                            tone="luxe"
                            className="h-7 w-7 shrink-0 items-center justify-center rounded-full"
                          >
                            <Icon as={Bot} size={14} className="text-primary-foreground" />
                          </GradientView>
                        )}
                        <View
                          className={
                            m.role === "user"
                              ? "max-w-[82%] rounded-2xl rounded-tr-sm"
                              : "max-w-[82%] rounded-2xl rounded-tl-sm border border-border bg-card px-3.5 py-2.5"
                          }
                        >
                          {m.role === "user" ? (
                            <GradientView
                              tone="luxe"
                              className="rounded-2xl rounded-tr-sm px-3.5 py-2.5"
                            >
                              <Text className="text-[13.5px] text-primary-foreground">
                                {m.content}
                              </Text>
                            </GradientView>
                          ) : (
                            <FormattedMessage content={clean} />
                          )}
                          {refs.length > 0 && (
                            <View className="mt-2.5 gap-1.5 border-t border-border/60 pt-2.5">
                              {refs.map((r) => (
                                <Link
                                  key={r.id}
                                  href={
                                    r.type === "recipe"
                                      ? {
                                          pathname: "/app/recipes/[recipeId]",
                                          params: { recipeId: r.id },
                                        }
                                      : {
                                          pathname: "/app/videos/[videoId]",
                                          params: { videoId: r.id },
                                        }
                                  }
                                  asChild
                                >
                                  <Pressable
                                    onPress={() => setOpen(false)}
                                    className="flex-row items-center gap-2 rounded-xl bg-secondary/60 px-2.5 py-1.5"
                                  >
                                    <Icon
                                      as={r.type === "recipe" ? BookOpen : PlayCircle}
                                      size={14}
                                      className="text-primary"
                                    />
                                    <Text
                                      className="flex-1 text-[12px] font-medium text-primary"
                                      numberOfLines={1}
                                    >
                                      {r.title}
                                    </Text>
                                  </Pressable>
                                </Link>
                              ))}
                            </View>
                          )}
                        </View>
                        {m.role === "user" && (
                          <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-secondary">
                            <Icon as={UserIcon} size={14} className="text-foreground" />
                          </View>
                        )}
                      </View>
                    );
                  })}
                  {loading && (
                    <View className="flex-row justify-start gap-2">
                      <GradientView
                        tone="luxe"
                        className="h-7 w-7 items-center justify-center rounded-full"
                      >
                        <Icon as={Bot} size={14} className="text-primary-foreground" />
                      </GradientView>
                      <View className="flex-row items-center gap-2 rounded-2xl rounded-tl-sm border border-border bg-card px-3.5 py-2.5">
                        <ActivityIndicator size="small" />
                        <Text className="text-xs text-muted-foreground">
                          L'assistante réfléchit…
                        </Text>
                      </View>
                    </View>
                  )}
                </ScrollView>

                {/* Suggestions */}
                {messages.length <= 1 && !loading && (
                  <View className="flex-row flex-wrap gap-2 border-t border-border bg-background px-4 py-2">
                    {SUGGESTIONS.map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => send(s)}
                        className="rounded-full bg-secondary px-2.5 py-1.5"
                      >
                        <Text className="text-[11px] text-foreground/80">{s}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* Input */}
                <View className="flex-row items-end gap-2 border-t border-border bg-background p-3">
                  <Textarea
                    value={input}
                    onChangeText={setInput}
                    placeholder="Écris ta question ou colle une recette…"
                    className="max-h-32 min-h-0 flex-1 rounded-2xl"
                    numberOfLines={3}
                  />
                  <Pressable
                    onPress={() => send(input)}
                    disabled={!input.trim() || loading}
                    className={`h-10 w-10 items-center justify-center rounded-full ${
                      !input.trim() || loading ? "opacity-50" : ""
                    }`}
                  >
                    <GradientView
                      tone="luxe"
                      className="h-10 w-10 items-center justify-center rounded-full"
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Icon as={Send} size={16} className="text-primary-foreground" />
                      )}
                    </GradientView>
                  </Pressable>
                </View>
              </DialogPrimitive.Content>
            </KeyboardAvoidingView>
          </View>
        </DialogPortal>
      </Dialog>
    </>
  );
}
