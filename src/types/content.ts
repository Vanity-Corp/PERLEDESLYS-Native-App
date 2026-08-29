import type { ImageSourcePropType } from "react-native";

// An image reference that works for BOTH a bundled asset (require(...) →
// ImageSourcePropType, used by mock-data) and a remote URL string (returned by
// the backend content API — Phase 5c). expo-image's `source` prop accepts both,
// so widening the content types this way lets the app consume real API content
// with no component changes.
export type ImageRef = ImageSourcePropType | string;

// Envelope returned by the list endpoints' paginated branch (cursor/keyset
// pagination for the Recipes/Videos/Lives/Tips screens' infinite-scroll
// lists). The same endpoints still return a bare `T[]` when called with no
// `limit` param (search, home previews, the AI chat, and the video/live
// detail screens rely on that). `nextCursor` is `null` once the last page has
// been reached; pass it back as `cursor` to fetch the next page. `total` is
// the count of all rows matching the current filters (regardless of cursor
// position) — used for e.g. the Lives screen's tab counts.
export type CursorPage<T> = {
  items: T[];
  nextCursor: string | null;
  total: number;
};

export type Recipe = {
  id: string;
  title: string;
  image: ImageRef;
  time: string;
  difficulty: "Facile" | "Moyen" | "Avancé";
  category: string;
  portions: number;
  description: string;
  cookidooUrl: string;
  isNew?: boolean;
  // ISO timestamp; drives the automatic "Nouveau" badge (recipe < 5 days old),
  // replacing the manual `isNew` flag.
  createdAt?: string;
  // The single "recette signature" featured on the home screen.
  signature?: boolean;
  // Optional tutorial video link. Named `vimeoUrl` for historical reasons but
  // it actually holds a YouTube URL (same as Video/Live). Drives the
  // "Voir le tutoriel vidéo" button on the recipe detail screen.
  vimeoUrl?: string | null;
  ingredients: { label: string; qty: string }[];
  steps: string[];
};

export type Video = {
  id: string;
  title: string;
  image: ImageRef;
  // Optional: the dashboard no longer sets a manual duration; the video detail
  // screen reads it from the YouTube player at runtime instead.
  duration?: string;
  category: string;
  description: string;
  vimeoUrl?: string | null;
  progress?: number;
};

// Dashboard-managed category, scoped per content kind (recipe/video).
export type Category = {
  id: string;
  scope: string;
  name: string;
};

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  image: ImageRef;
  readTime: string;
  category: string;
  content?: string;
};

export type Live = {
  id: string;
  title: string;
  date: string;
  time: string;
  image: ImageRef;
  status: "À venir" | "En direct" | "Replay";
  description: string;
  platform: string;
  vimeoUrl?: string | null;
};

export type AppEvent = {
  id: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  time: string;
  type: "live" | "atelier" | "publication" | "rappel";
  description?: string | null;
  remindMinutesBefore?: number | null;
  liveId?: string | null; // set when auto-created from a Live (deep-link target)
};

export type UserProduct = {
  id: string;
  name: string;
  purchasedAt: string;
  image: ImageRef;
};

export type AppUser = {
  name: string;
  firstName: string;
  email: string;
  phone: string;
  avatar: string; // remote URL
  memberSince: string;
  invitation: string;
  products: UserProduct[];
};

export type FounderInfo = {
  name: string;
  fullName: string;
  bio: string;
  avatar: ImageRef;
};

export type FaqItem = {
  q: string;
  a: string;
};

export type WelcomeMessage = {
  introTitle: string; // "Mise en service du TM7…"
  introContent: string; // text under the video
  subject: string; // Mot de Ghania — objet
  body: string; // Mot de Ghania — message
  steps: string[]; // "Vos prochaines étapes"
  image?: string | null;
};

// An approved customer review shown publicly (home testimonials). The app only
// ever receives approved reviews; moderation happens in the dashboard.
export type Review = {
  id: string;
  username: string;
  rating: number; // 1..5
  comment: string;
  createdAt: string;
};

// "À propos" page content.
export type About = {
  image?: string | null;
  body: string; // rich-text HTML
};

// "Qui suis-je ?" page content.
export type Stat = { value: string; label: string };
export type WhoAmI = {
  bio: string; // "Mon histoire"
  why: string; // "Pourquoi cette application ?"
  stats: Stat[];
  gridImages: string[];
  carouselImages: string[];
  storyImage: string; // image shown next to "Mon histoire"
  quote: string; // "Un mot de Ghania" (reused on Astuces)
  // Testimonials are shown via the shared "Avis de nos clientes" carousel
  // (approved reviews), not a per-page field.
};

// Legal texts shown in popups + at signup (rich-text HTML).
export type Legal = {
  privacy: string;
  terms: string;
};

// A "recently added content" item for the in-app notification center.
export type RecentItem = {
  type: "recipe" | "video" | "live" | "article";
  id: string;
  title: string;
  image: ImageRef;
  createdAt: string;
};

// A backend-driven notification (GET /api/content/notifications). The server
// prunes to the last 14 days. `data` carries a deep-link target when present.
export type NotificationItem = {
  id: string;
  type: "recipe" | "video" | "live" | "replay" | "article" | "ramadan" | "promo";
  title: string;
  body: string;
  data?: { type?: string; id?: string };
  createdAt: string;
};
