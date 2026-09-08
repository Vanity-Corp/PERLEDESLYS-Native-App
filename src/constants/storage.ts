// Keys under which local-only app state is persisted (MMKV).
// Kept identical to the web app's localStorage keys ("pdl.*") for parity.
export const STORAGE_KEYS = {
  NOTES: "pdl.notes",
  HISTORY: "pdl.history",
  SETTINGS: "pdl.settings",
  FAVORITES: "pdl.favorites",
  // Native-only addition, no web equivalent: the dragged offset of the
  // global AI/note FAB pair from its default position (see global-fabs.tsx).
  FAB_POSITION: "pdl.fabPosition",
} as const;
