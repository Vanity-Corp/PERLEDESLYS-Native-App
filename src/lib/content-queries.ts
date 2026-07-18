import { useQuery } from "@tanstack/react-query";

import { contentApi } from "@/lib/content-api";
import { useAuth } from "@/lib/auth-store";
import type { FounderInfo, WelcomeMessage } from "@/types/content";

// TanStack Query hooks over the content API (BACKEND_PLAN.md Phase 5c). List
// hooks return the array directly (defaulting to [] while loading) so screens
// keep using `.map`/`.find` exactly as they did with mock-data. Detail hooks
// return the full query result (so screens can show a loading state). All are
// gated on an auth token being present (content is members-only).

function useToken() {
  return useAuth((s) => s.token);
}

export function useRecipes() {
  const token = useToken();
  const { data } = useQuery({
    queryKey: ["recipes"],
    queryFn: contentApi.recipes,
    enabled: !!token,
  });
  return data ?? [];
}

export function useRecipe(id?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["recipe", id],
    queryFn: () => contentApi.recipe(id!),
    enabled: !!token && !!id,
  });
}

export function useVideos() {
  const token = useToken();
  const { data } = useQuery({
    queryKey: ["videos"],
    queryFn: contentApi.videos,
    enabled: !!token,
  });
  return data ?? [];
}

export function useVideo(id?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ["video", id],
    queryFn: () => contentApi.video(id!),
    enabled: !!token && !!id,
  });
}

export function useArticles() {
  const token = useToken();
  const { data } = useQuery({
    queryKey: ["articles"],
    queryFn: contentApi.articles,
    enabled: !!token,
  });
  return data ?? [];
}

export function useLives() {
  const token = useToken();
  const { data } = useQuery({
    queryKey: ["lives"],
    queryFn: contentApi.lives,
    enabled: !!token,
  });
  return data ?? [];
}

export function useEvents() {
  const token = useToken();
  const { data } = useQuery({
    queryKey: ["events"],
    queryFn: contentApi.events,
    enabled: !!token,
  });
  return data ?? [];
}

export function useFaq() {
  const token = useToken();
  const { data } = useQuery({
    queryKey: ["faq"],
    queryFn: contentApi.faq,
    enabled: !!token,
  });
  return data ?? [];
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
