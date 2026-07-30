import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { contentApi } from "@/lib/content-api";
import { reviewsApi, type SubmitReviewInput } from "@/lib/reviews-api";
import { useAuth } from "@/lib/auth-store";
import type { FounderInfo, WelcomeMessage } from "@/types/content";

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

const EMPTY_WELCOME: WelcomeMessage = { subject: "", body: "" };
export function useWelcomeMessage(): WelcomeMessage {
  const token = useToken();
  const { data } = useQuery({
    queryKey: ["welcome-message"],
    queryFn: contentApi.welcomeMessage,
    enabled: !!token,
  });
  return data ?? EMPTY_WELCOME;
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

// Submit (or re-submit) the member's review. On success the reviews list is
// refetched; the new review stays hidden until the founder approves it.
export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitReviewInput) => reviewsApi.submit(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
