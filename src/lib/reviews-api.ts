import { ApiError } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-store";
import type { Review } from "@/types/content";

// Client for the backend reviews API. Members submit a review (POST) and read
// approved ones (GET) — both members-only, so requests carry the JWT from the
// auth store. Base URL comes from EXPO_PUBLIC_API_URL (see .env). Routes live
// under /api/reviews (not /api/content).
const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function req<T>(
  method: "GET" | "POST",
  path = "",
  body?: unknown,
): Promise<T> {
  const token = useAuth.getState().token;
  const res = await fetch(`${API_URL}/api/reviews${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    // Preserve the backend's machine `code` (e.g. ACCOUNT_SUSPENDED) so the
    // global query error handler can bounce a suspended member.
    const json = (await res.json().catch(() => null)) as { code?: string } | null;
    throw new ApiError(
      `Action indisponible (${res.status}).`,
      res.status,
      json?.code,
    );
  }
  return (await res.json()) as T;
}

export interface SubmitReviewInput {
  rating: number;
  comment: string;
}

export const reviewsApi = {
  listApproved: () => req<Review[]>("GET"),
  submit: (input: SubmitReviewInput) => req<Review>("POST", "", input),
  // The current member's own review (approved or pending), or null if none.
  mine: () => req<{ review: Review | null }>("GET", "/mine"),
};
