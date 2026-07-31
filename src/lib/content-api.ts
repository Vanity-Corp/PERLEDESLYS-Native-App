import { ApiError } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-store";
import type {
  About,
  Article,
  AppEvent,
  FaqItem,
  FounderInfo,
  Live,
  Recipe,
  RecentItem,
  Video,
  WelcomeMessage,
  WhoAmI,
} from "@/types/content";

// Client for the backend content API (BACKEND_PLAN.md Phase 5). All content is
// ACTIVE-member-only, so every request carries the JWT from the auth store.
// Base URL comes from EXPO_PUBLIC_API_URL (see .env).
const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function get<T>(path: string): Promise<T> {
  const token = useAuth.getState().token;
  const res = await fetch(`${API_URL}/api/content${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    // Preserve the backend's machine `code` (e.g. ACCOUNT_SUSPENDED) so the
    // global query error handler can bounce a suspended member.
    const json = (await res.json().catch(() => null)) as { code?: string } | null;
    throw new ApiError(
      `Contenu indisponible (${res.status}).`,
      res.status,
      json?.code,
    );
  }
  return (await res.json()) as T;
}

export const contentApi = {
  recipes: () => get<Recipe[]>("/recipes"),
  recipe: (id: string) => get<Recipe>(`/recipes/${id}`),
  videos: () => get<Video[]>("/videos"),
  video: (id: string) => get<Video>(`/videos/${id}`),
  articles: () => get<Article[]>("/articles"),
  lives: () => get<Live[]>("/lives"),
  events: () => get<AppEvent[]>("/events"),
  faq: () => get<FaqItem[]>("/faq"),
  welcomeMessage: () => get<WelcomeMessage>("/welcome-message"),
  founder: () => get<FounderInfo>("/founder"),
  about: () => get<About>("/about"),
  whoAmI: () => get<WhoAmI>("/who-am-i"),
  recent: () => get<RecentItem[]>("/recent"),
};
