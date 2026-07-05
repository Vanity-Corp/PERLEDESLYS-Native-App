// Keys under which local-only app state is persisted (MMKV).
// Kept identical to the web app's localStorage keys ("pdl.*") for parity.
export const STORAGE_KEYS = {
  NOTES: "pdl.notes",
  HISTORY: "pdl.history",
  SETTINGS: "pdl.settings",
  FAVORITES: "pdl.favorites",
} as const;
