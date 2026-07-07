import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/constants/storage";
import { asyncStorage } from "@/lib/storage";
import { recipes, user, videos } from "@/lib/mock-data";
import { generateId } from "@/lib/utils";
import type { Recipe, Video } from "@/types/content";
import type { HistoryEntry, Note, UserSettings } from "@/types/local-store";

/**
 * RN port of the web app's `lib/local-store.ts`.
 *
 * The web version kept plain hooks backed by `window.localStorage` and
 * synchronized across components with a `window.dispatchEvent(CustomEvent)`
 * bus — neither API exists in React Native. Here the same three hooks
 * (`useNotes`, `useHistory`, `useSettings`) are re-implemented on top of
 * zustand stores persisted to AsyncStorage (see `storage.ts`), which gives
 * the same "read/write from any screen, stays in sync everywhere" behavior
 * natively.
 */

/* ---------- Notes ---------- */

type NotesState = {
  notes: Note[];
  add: (note: Omit<Note, "id" | "createdAt">) => void;
  remove: (id: string) => void;
};

const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      notes: [],
      add: (note) =>
        set((state) => ({
          notes: [{ ...note, id: generateId(), createdAt: Date.now() }, ...state.notes],
        })),
      remove: (id) => set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
    }),
    { name: STORAGE_KEYS.NOTES, storage: createJSONStorage(() => asyncStorage) },
  ),
);

export function useNotes() {
  const notes = useNotesStore((s) => s.notes);
  const add = useNotesStore((s) => s.add);
  const remove = useNotesStore((s) => s.remove);
  return { notes, add, remove };
}

/* ---------- Historique (vidéos + recettes consultées) ---------- */

// Entries are de-duped/looked-up by (id, kind) together, not just id — a
// video and a recipe could in principle share an id string (same reasoning
// already applied to `useFavorites` when it was extended to cover videos).
type HistoryState = {
  history: HistoryEntry[];
  upsert: (entry: HistoryEntry) => void;
  clear: () => void;
  remove: (id: string, kind: HistoryEntry["kind"]) => void;
};

const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      upsert: (entry) =>
        set((state) => ({
          history: [
            entry,
            ...state.history.filter((h) => !(h.id === entry.id && h.kind === entry.kind)),
          ].slice(0, 50),
        })),
      clear: () => set({ history: [] }),
      remove: (id, kind) =>
        set((state) => ({
          history: state.history.filter((h) => !(h.id === id && h.kind === kind)),
        })),
    }),
    { name: STORAGE_KEYS.HISTORY, storage: createJSONStorage(() => asyncStorage) },
  ),
);

export function useHistory() {
  const history = useHistoryStore((s) => s.history);
  const upsert = useHistoryStore((s) => s.upsert);
  const clear = useHistoryStore((s) => s.clear);
  const remove = useHistoryStore((s) => s.remove);
  // Narrows by the passed `kind` literal so callers get back the specific
  // entry shape (e.g. a video's `positionSec`) instead of the full union.
  function get<K extends HistoryEntry["kind"]>(
    id: string,
    kind: K,
  ): Extract<HistoryEntry, { kind: K }> | undefined {
    return history.find((h) => h.id === id && h.kind === kind) as
      | Extract<HistoryEntry, { kind: K }>
      | undefined;
  }
  return { history, upsert, get, clear, remove };
}

/* ---------- Favoris ---------- */

// Recipes and videos are separate id spaces, so a favorite needs its `kind`
// alongside its `id` — a flat `string[]` (the original single-kind shape)
// couldn't tell which collection to resolve an id against once videos were
// added too.
type FavoriteKind = "recipe" | "video";
type FavoriteEntry = { id: string; kind: FavoriteKind };

type FavoritesState = {
  favoriteEntries: FavoriteEntry[];
  toggle: (id: string, kind: FavoriteKind) => void;
};

const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favoriteEntries: [],
      toggle: (id, kind) =>
        set((state) => {
          const isFav = state.favoriteEntries.some((f) => f.id === id && f.kind === kind);
          return {
            favoriteEntries: isFav
              ? state.favoriteEntries.filter((f) => !(f.id === id && f.kind === kind))
              : [{ id, kind }, ...state.favoriteEntries],
          };
        }),
    }),
    { name: STORAGE_KEYS.FAVORITES, storage: createJSONStorage(() => asyncStorage) },
  ),
);

const recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
const videosById = new Map(videos.map((video) => [video.id, video]));

export function useFavorites() {
  const favoriteEntries = useFavoritesStore((s) => s.favoriteEntries);
  const toggle = useFavoritesStore((s) => s.toggle);
  const isFavorite = (id: string, kind: FavoriteKind) =>
    favoriteEntries.some((f) => f.id === id && f.kind === kind);

  const favoriteRecipes = favoriteEntries
    .filter((f) => f.kind === "recipe")
    .map((f) => recipesById.get(f.id))
    .filter((recipe): recipe is Recipe => Boolean(recipe));

  const favoriteVideos = favoriteEntries
    .filter((f) => f.kind === "video")
    .map((f) => videosById.get(f.id))
    .filter((video): video is Video => Boolean(video));

  return { favoriteRecipes, favoriteVideos, toggle, isFavorite };
}

/* ---------- Settings ---------- */

// zustand stores are created once at module load, so — unlike the web hook,
// which took an `initial` argument per call — defaults are fixed here.
const DEFAULT_SETTINGS: UserSettings = {
  name: user.name,
  firstName: user.firstName,
  email: user.email,
  phone: user.phone,
  notifications: true,
  darkTheme: false,
  newsletter: true,
};

type SettingsState = {
  settings: UserSettings;
  setSettings: (next: UserSettings | ((prev: UserSettings) => UserSettings)) => void;
};

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      setSettings: (next) =>
        set((state) => ({
          settings:
            typeof next === "function"
              ? (next as (p: UserSettings) => UserSettings)(state.settings)
              : next,
        })),
    }),
    { name: STORAGE_KEYS.SETTINGS, storage: createJSONStorage(() => asyncStorage) },
  ),
);

export function useSettings() {
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);
  return [settings, setSettings] as const;
}

export { formatSeconds } from "@/lib/utils";
