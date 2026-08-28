import { z } from "zod";

// Client for the PERLEDESLYS backend's AI-chat endpoint (POST /api/ai-chat —
// backend/src/ai). Member-only (JWT + ActiveUserGuard): the backend calls a
// paid OpenAI/Groq API per request, so a token is required. Screens (AI Chat)
// call `aiChat({ messages, token })` without needing to know any of this is a
// `fetch()` underneath.
//
// The endpoint always responds with a valid `{ok,...}` JSON body — even for
// its own error cases — so parsing the body is safe regardless of HTTP
// status; no separate `res.ok` branch is needed.

const ChatResultSchema = z.union([
  z.object({ ok: z.literal(true), content: z.string() }),
  z.object({ ok: z.literal(false), error: z.string() }),
]);

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type ChatResult = z.infer<typeof ChatResultSchema>;

// Exact wording from the web's AIChat.tsx catch block, so the RN screen
// shows the identical fallback copy.
const NETWORK_ERROR_MESSAGE =
  "😔 Je n'ai pas pu joindre l'assistance. Vérifie ta connexion et réessaie.";

export async function aiChat({
  messages,
  token,
}: {
  messages: ChatMessage[];
  token: string;
}): Promise<ChatResult> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) {
    return { ok: false, error: "L'URL de l'API n'est pas configurée (EXPO_PUBLIC_API_URL)." };
  }

  try {
    const res = await fetch(`${apiUrl}/api/ai-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages }),
    });
    const parsed = ChatResultSchema.safeParse(await res.json());
    return parsed.success ? parsed.data : { ok: false, error: NETWORK_ERROR_MESSAGE };
  } catch {
    return { ok: false, error: NETWORK_ERROR_MESSAGE };
  }
}
