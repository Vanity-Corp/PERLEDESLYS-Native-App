import { fetch as streamFetch } from "expo/fetch";
import { z } from "zod";

// Client for the PERLEDESLYS backend's AI-chat endpoints (backend/src/ai).
// Member-only (JWT + ActiveUserGuard): the backend calls a paid OpenAI/Groq
// API per request, so a token is required.
//
// The chat endpoint streams its reply as newline-delimited JSON (not classic
// SSE) rather than a single `{ok,...}` body — `expo/fetch` is used instead of
// the global `fetch` specifically for this call because it's the one that
// exposes a real, readable `Response.body` stream on-device (RN's built-in
// fetch does not reliably support incremental body reads).

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type StreamEvent =
  | { type: "delta"; text: string }
  | { type: "done"; messageId: string }
  | { type: "error"; error: string };

const StreamEventSchema = z.union([
  z.object({ type: z.literal("delta"), text: z.string() }),
  z.object({ type: z.literal("done"), messageId: z.string() }),
  z.object({ type: z.literal("error"), error: z.string() }),
]);

// Exact wording from the web's AIChat.tsx catch block, so the RN screen
// shows the identical fallback copy.
const NETWORK_ERROR_MESSAGE =
  "Je n'ai pas pu joindre l'assistance. Vérifie ta connexion et réessaie.";

export async function streamAiChat({
  messages,
  token,
  onEvent,
}: {
  messages: ChatMessage[];
  token: string;
  onEvent: (event: StreamEvent) => void;
}): Promise<void> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) {
    onEvent({
      type: "error",
      error: "L'URL de l'API n'est pas configurée (EXPO_PUBLIC_API_URL).",
    });
    return;
  }

  try {
    const res = await streamFetch(`${apiUrl}/api/ai-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages }),
    });
    if (!res.body) {
      onEvent({ type: "error", error: NETWORK_ERROR_MESSAGE });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line) continue;
        try {
          const parsed = StreamEventSchema.safeParse(JSON.parse(line));
          if (parsed.success) onEvent(parsed.data);
        } catch {
          // Malformed line — skip it rather than aborting the whole stream.
        }
      }
    }
  } catch {
    onEvent({ type: "error", error: NETWORK_ERROR_MESSAGE });
  }
}

const HistoryMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  feedback: z.enum(["up", "down"]).nullable(),
});
export type HistoryMessage = z.infer<typeof HistoryMessageSchema>;

// Seeds the chat on mount so history survives an app restart. Best-effort —
// an empty array on any failure just means the screen falls back to the
// hardcoded greeting, same as before this existed.
export async function fetchAiHistory({ token }: { token: string }): Promise<HistoryMessage[]> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) return [];
  try {
    const res = await fetch(`${apiUrl}/api/ai-chat/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const parsed = z.array(HistoryMessageSchema).safeParse(await res.json());
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

// Thumbs up/down on an assistant reply. Best-effort (fire-and-forget from the
// caller) — a failed rating isn't worth surfacing an error for.
export async function rateAiMessage({
  token,
  messageId,
  feedback,
}: {
  token: string;
  messageId: string;
  feedback: "up" | "down" | null;
}): Promise<void> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) return;
  try {
    await fetch(`${apiUrl}/api/ai-chat/messages/${messageId}/feedback`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ feedback }),
    });
  } catch {
    // Best-effort — see doc comment above.
  }
}
