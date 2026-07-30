import type { ImageRef } from "@/types/content";

export type Note = {
  id: string;
  text: string;
  createdAt: number;
  contextLabel: string; // ex: "Vidéo : Mes premiers pas"
  contextHref: string; // expo-router path, ex: "/videos/premiers-pas-tm7"
};

// The web's `useHistory` only ever tracked videos (see kitchen-haven-club's
// local-store.ts) — recipe view-history has no web counterpart. Extended
// here as a discriminated union so both kinds share one list (sorted
// together, most-recent-first) while keeping their kind-specific fields
// (a recipe has no playback position/progress to resume).
export type VideoHistoryEntry = {
  kind: "video";
  id: string;
  title: string;
  image: ImageRef;
  category: string;
  duration: string; // affichage
  progress: number; // 0-100
  positionSec: number; // secondes
  totalSec: number;
  updatedAt: number;
};

export type RecipeHistoryEntry = {
  kind: "recipe";
  id: string;
  title: string;
  image: ImageRef;
  category: string;
  time: string; // affichage, ex: "35 min"
  updatedAt: number;
};

export type HistoryEntry = VideoHistoryEntry | RecipeHistoryEntry;

// Preferences only (device-local). Personal fields (name/email/phone) were
// removed with the privacy change (WIRING_PLAN B1/A2) — accounts are
// username-only and no PII is stored.
export type UserSettings = {
  notifications: boolean;
  darkTheme: boolean;
};
