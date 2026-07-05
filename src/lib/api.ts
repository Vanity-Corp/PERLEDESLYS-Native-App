import { z } from "zod";

// RN-side mirror of the web app's `aiChat` server-function call signature
// (kitchen-haven-club/src/lib/ai.functions.ts) — the RN app has no
// TanStack Start runtime to call a server function through, so this hits
// the plain HTTP endpoint Task 8 added to the same Worker instead
// (POST /api/ai-chat). Screens (Task 32, AI Chat) call `aiChat({ messages
// })` without needing to know any of this is a `fetch()` underneath.
//
// The endpoint always responds with a valid `{ok,...}` JSON body — even
// for its own 400/405/500 cases (see Task 8) — so parsing the body is
// safe regardless of HTTP status; no separate `res.ok` branch is needed.

const ChatResultSchema = z.union([
  z.object({ ok: z.literal(true), content: z.string() }),
  z.object({ ok: z.literal(false), error: z.string() }),
]);

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type ChatResult = z.infer<typeof ChatResultSchema>;

// Exact wording from the web's AIChat.tsx catch block, so the future RN
// screen shows the identical fallback copy.
const NETWORK_ERROR_MESSAGE =
  "😔 Je n'ai pas pu joindre l'assistance. Vérifie ta connexion et réessaie.";

export async function aiChat({ messages }: { messages: ChatMessage[] }): Promise<ChatResult> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) {
    return { ok: false, error: "L'URL de l'API n'est pas configurée (EXPO_PUBLIC_API_URL)." };
  }

  try {
    const res = await fetch(`${apiUrl}/api/ai-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    const parsed = ChatResultSchema.safeParse(await res.json());
    return parsed.success ? parsed.data : { ok: false, error: NETWORK_ERROR_MESSAGE };
  } catch {
    return { ok: false, error: NETWORK_ERROR_MESSAGE };
  }
}
