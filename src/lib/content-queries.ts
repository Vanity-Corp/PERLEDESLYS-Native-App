import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

import { contentApi } from "@/lib/content-api";
import { reviewsApi, type SubmitReviewInput } from "@/lib/reviews-api";
import { fetchLanding, type LandingContent } from "@/lib/landing-api";
import { fetchLegal } from "@/lib/legal-api";
import { useAuth } from "@/lib/auth-store";
import type {
  About,
  FounderInfo,
  Legal,
  WelcomeMessage,
  WhoAmI,
} from "@/types/content";

// TanStack Query hooks over the content API. Two flavours per collection:
//   • use<X>()      → the array directly (defaults to [] while loading), so
//                     existing screens keep using `.map`/`.find` unchanged.
//   • use<X>Query() → the raw query result, for screens that need first-load
//                     skeletons / a network-error state (isLoading/isError/
//                     refetch). Both share the same query key (react-query
//                     dedupes — no extra network).
// All are gated on an auth token being present (content is members-only).

function useToken() {
  return useAuth((s) => s.token);
}

export function useRecipesQuery() {
  const token = useToken();
  return useQuery({
    queryKey: ["recipes"],
    queryFn: contentApi.recipes,
    enabled: !!token,
  });
}
export function useRecipes() {
  return useRecipesQuery().data ?? [];
}

// Dashboard-managed category names for a given scope ("recipe" | "video"),
// mapped to a plain `string[]` for the filter pills. Empty while loading or
// when the dashboard has no categories yet (callers fall back to the distinct
// categories present in the loaded content).
export function useCategories(scope: string): string[] {
  const token = useToken();
  const { data } = useQuery({
    queryKey: ["categories", scope],
    queryFn: () => contentApi.categories(scope),
    enabled: !!token,
  });
  return (data ?? []).map((c) => c.name);
}

export function useRecipe(id?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["recipe", id],
    queryFn: () => contentApi.recipe(id!),
    enabled: !!token && !!id,
  });
}

export function useVideosQuery() {
  const token = useToken();
  return useQuery({
    queryKey: ["videos"],
    queryFn: contentApi.videos,
    enabled: !!token,
  });
}
export function useVideos() {
  return useVideosQuery().data ?? [];
}

export function useVideo(id?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["video", id],
    queryFn: () => contentApi.video(id!),
    enabled: !!token && !!id,
  });
}

export function useArticlesQuery() {
  const token = useToken();
  return useQuery({
    queryKey: ["articles"],
    queryFn: contentApi.articles,
    enabled: !!token,
  });
}
export function useArticles() {
  return useArticlesQuery().data ?? [];
}

// Full article (incl. the rich-text `content` body) from the detail endpoint.
// The list endpoint omits `content` for a lighter payload, so the article
// screen fetches the complete row by id here.
export function useArticle(id?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["article", id],
    queryFn: () => contentApi.article(id!),
    enabled: !!token && !!id,
  });
}

export function useLivesQuery() {
  const token = useToken();
  return useQuery({
    queryKey: ["lives"],
    queryFn: contentApi.lives,
    enabled: !!token,
  });
}
export function useLives() {
  return useLivesQuery().data ?? [];
}

export function useEventsQuery() {
  const token = useToken();
  return useQuery({
    queryKey: ["events"],
    queryFn: contentApi.events,
    enabled: !!token,
  });
}
export function useEvents() {
  return useEventsQuery().data ?? [];
}

export function useFaqQuery() {
  const token = useToken();
  return useQuery({
    queryKey: ["faq"],
    queryFn: contentApi.faq,
    enabled: !!token,
  });
}
export function useFaq() {
  return useFaqQuery().data ?? [];
}

export function useWelcomeMessageQuery() {
  const token = useToken();
  return useQuery({
    queryKey: ["welcome-message"],
    queryFn: contentApi.welcomeMessage,
    enabled: !!token,
  });
}
const EMPTY_WELCOME: WelcomeMessage = {
  introTitle: "",
  introContent: "",
  subject: "",
  body: "",
  steps: [],
};
export function useWelcomeMessage(): WelcomeMessage {
  return useWelcomeMessageQuery().data ?? EMPTY_WELCOME;
}

// "À propos" + "Qui suis-je" singletons.
export function useAboutQuery() {
  const token = useToken();
  return useQuery({
    queryKey: ["about"],
    queryFn: contentApi.about,
    enabled: !!token,
  });
}
const EMPTY_ABOUT: About = { image: null, body: "" };
export function useAbout(): About {
  return useAboutQuery().data ?? EMPTY_ABOUT;
}

export function useWhoAmIQuery() {
  const token = useToken();
  return useQuery({
    queryKey: ["who-am-i"],
    queryFn: contentApi.whoAmI,
    enabled: !!token,
  });
}
const EMPTY_WHOAMI: WhoAmI = {
  bio: "",
  why: "",
  stats: [],
  gridImages: [],
  carouselImages: [],
  storyImage: "",
  quote: "",
};
export function useWhoAmI(): WhoAmI {
  return useWhoAmIQuery().data ?? EMPTY_WHOAMI;
}

// Legal texts (public — no token; shown at signup before login).
const EMPTY_LEGAL: Legal = { privacy: "", terms: "" };
export function useLegal(): Legal {
  const { data } = useQuery({ queryKey: ["legal"], queryFn: fetchLegal });
  return data ?? EMPTY_LEGAL;
}

// Recently-added content feed for the in-app notification center.
export function useRecentQuery() {
  const token = useToken();
  return useQuery({
    queryKey: ["recent"],
    queryFn: contentApi.recent,
    enabled: !!token,
  });
}

// Backend-driven notification feed (last 14 days) for the notifications screen
// and the home bell counter.
export function useNotificationsFeedQuery() {
  const token = useToken();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: contentApi.notifications,
    enabled: !!token,
  });
}

const EMPTY_FOUNDER: FounderInfo = { name: "", fullName: "", bio: "", avatar: "" };
export function useFounder(): FounderInfo {
  const token = useToken();
  const { data } = useQuery({
    queryKey: ["founder"],
    queryFn: contentApi.founder,
    enabled: !!token,
  });
  return data ?? EMPTY_FOUNDER;
}

// Approved customer reviews for the home testimonials section.
export function useReviewsQuery() {
  const token = useToken();
  return useQuery({
    queryKey: ["reviews"],
    queryFn: reviewsApi.listApproved,
    enabled: !!token,
  });
}
export function useReviews() {
  return useReviewsQuery().data ?? [];
}

// The current member's own review (approved or pending), or null if they
// haven't submitted one. Used to hide the "Laisser un avis" CTA.
export function useMyReview() {
  const token = useToken();
  return useQuery({
    queryKey: ["my-review"],
    queryFn: reviewsApi.mine,
    enabled: !!token,
  });
}

// Pre-login landing copy (public — no token needed). Falls back to the app's
// built-in strings so the landing renders instantly / offline.
const FALLBACK_LANDING: LandingContent = {
  tagline: "Accès cliente uniquement",
  title: "Par Ghania",
  description:
    "Recettes signatures, lives privés et tutoriels exclusifs autour de votre TM7, créés avec amour par Ghania - votre conseillère Thermomix",
  image: null,
};
export function useLanding(): LandingContent {
  const { data } = useQuery({
    queryKey: ["landing"],
    queryFn: fetchLanding,
  });
  return data ?? FALLBACK_LANDING;
}

// Submit (or re-submit) the member's review. On success the reviews list is
// refetched; the new review stays hidden until the founder approves it.
export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitReviewInput) => reviewsApi.submit(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
      void queryClient.invalidateQueries({ queryKey: ["my-review"] });
    },
  });
}

// Hard pull-to-refresh: resets the given queries so their screens drop cached
// data, return to their pending/skeleton state, and refetch fresh — instead of
// a background `refetch()` that leaves stale content on screen. Returns an
// `onRefresh` handler ready to pass to a RefreshControl.
export function useHardRefresh(keys: QueryKey[]) {
  const queryClient = useQueryClient();
  return () => {
    for (const key of keys) {
      void queryClient.resetQueries({ queryKey: key });
    }
  };
}
