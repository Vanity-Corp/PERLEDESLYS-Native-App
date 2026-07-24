import { useAuth } from "@/lib/auth-store";
import type { Review } from "@/types/content";

// Client for the backend reviews API. Members submit a review (POST) and read
// approved ones (GET) — both members-only, so requests carry the JWT from the
// auth store. Base URL comes from EXPO_PUBLIC_API_URL (see .env). Routes live
// under /api/reviews (not /api/content).
const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function req<T>(method: "GET" | "POST", body?: unknown): Promise<T> {
  const token = useAuth.getState().token;
  const res = await fetch(`${API_URL}/api/reviews`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`Action indisponible (${res.status}).`);
  }
  return (await res.json()) as T;
}

export interface SubmitReviewInput {
  rating: number;
  comment: string;
}

export const reviewsApi = {
  listApproved: () => req<Review[]>("GET"),
  submit: (input: SubmitReviewInput) => req<Review>("POST", input),
};
