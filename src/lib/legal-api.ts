import type { Legal } from "@/types/content";

// Public (unauthenticated) fetch of the legal texts — shown at signup BEFORE
// login (terms checkbox) as well as inside the app. Needs no token. Route lives
// under /api/content/legal (public, like landing).
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function fetchLegal(): Promise<Legal> {
  const res = await fetch(`${API_URL}/api/content/legal`);
  if (!res.ok) {
    throw new Error(`Mentions légales indisponibles (${res.status}).`);
  }
  return (await res.json()) as Legal;
}
