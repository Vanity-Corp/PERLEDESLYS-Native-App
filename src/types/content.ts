import type { ImageSourcePropType } from "react-native";

// An image reference that works for BOTH a bundled asset (require(...) →
// ImageSourcePropType, used by mock-data) and a remote URL string (returned by
// the backend content API — Phase 5c). expo-image's `source` prop accepts both,
// so widening the content types this way lets the app consume real API content
// with no component changes.
export type ImageRef = ImageSourcePropType | string;

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
  // The single "recette signature" featured on the home screen.
  signature?: boolean;
  ingredients: { label: string; qty: string }[];
  steps: string[];
};

export type Video = {
  id: string;
  title: string;
  image: ImageRef;
  duration: string;
  category: string;
  description: string;
  vimeoUrl?: string | null;
  progress?: number;
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
  subject: string;
  body: string;
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
  title: string;
  body: string;
  signature: string;
};

// "Qui suis-je ?" page content.
export type Stat = { value: string; label: string };
export type WhoAmI = {
  bio: string; // "Mon histoire"
  why: string; // "Pourquoi cette application ?"
  stats: Stat[];
  gridImages: string[];
  carouselImages: string[];
  quote: string; // "Un mot de Ghania"
  testimonialName: string;
  testimonialText: string;
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
