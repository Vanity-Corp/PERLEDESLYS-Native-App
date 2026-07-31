// Public (unauthenticated) fetch of the pre-login landing copy. Unlike the rest
// of the content API this needs NO token — the landing screen renders before
// the client logs in. Routes live under /api/content/landing.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface LandingContent {
  tagline: string;
  title: string;
  description: string;
  image?: string | null;
}

export async function fetchLanding(): Promise<LandingContent> {
  const res = await fetch(`${API_URL}/api/content/landing`);
  if (!res.ok) {
    throw new Error(`Accueil indisponible (${res.status}).`);
  }
  return (await res.json()) as LandingContent;
}
