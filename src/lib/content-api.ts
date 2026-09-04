import { ApiError } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-store";
import type {
  About,
  Article,
  AppEvent,
  Category,
  CursorPage,
  FaqItem,
  FounderInfo,
  Live,
  Menu,
  MenuDetail,
  NotificationItem,
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

// Builds a `?a=1&b=2` query string, skipping undefined/empty values.
function qs(params: Record<string, string | number | undefined>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") usp.set(key, String(value));
  }
  const s = usp.toString();
  return s ? `?${s}` : "";
}

export const contentApi = {
  recipes: () => get<Recipe[]>("/recipes"),
  recipe: (id: string) => get<Recipe>(`/recipes/${id}`),
  // Cursor-paginated variant for the Recipes list screen's infinite scroll —
  // the plain `recipes()` above (no query params) still returns the full
  // array for search.tsx/the AI chat, which must not be paginated.
  recipesPaged: (params: {
    cursor?: string;
    limit?: number;
    category?: string;
    search?: string;
  }) => get<CursorPage<Recipe>>(`/recipes${qs(params)}`),
  menus: () => get<Menu[]>("/menus"),
  menu: (id: string) => get<MenuDetail>(`/menus/${id}`),
  videos: () => get<Video[]>("/videos"),
  video: (id: string) => get<Video>(`/videos/${id}`),
  videosPaged: (params: { cursor?: string; limit?: number; category?: string; search?: string }) =>
    get<CursorPage<Video>>(`/videos${qs(params)}`),
  articles: () => get<Article[]>("/articles"),
  article: (id: string) => get<Article>(`/articles/${id}`),
  articlesPaged: (params: { cursor?: string; limit?: number; category?: string; search?: string }) =>
    get<CursorPage<Article>>(`/articles${qs(params)}`),
  lives: () => get<Live[]>("/lives"),
  livesPaged: (params: { cursor?: string; limit?: number; status?: string; search?: string }) =>
    get<CursorPage<Live>>(`/lives${qs(params)}`),
  events: () => get<AppEvent[]>("/events"),
  faq: () => get<FaqItem[]>("/faq"),
  welcomeMessage: () => get<WelcomeMessage>("/welcome-message"),
  founder: () => get<FounderInfo>("/founder"),
  about: () => get<About>("/about"),
  whoAmI: () => get<WhoAmI>("/who-am-i"),
  recent: () => get<RecentItem[]>("/recent"),
  // Backend-driven notification feed (pruned to the last 14 days server-side).
  notifications: () => get<NotificationItem[]>("/notifications"),
  // Dashboard-managed categories, scoped per content kind ("recipe" | "video").
  categories: (scope: string) =>
    get<Category[]>(`/categories?scope=${scope}`),
};
