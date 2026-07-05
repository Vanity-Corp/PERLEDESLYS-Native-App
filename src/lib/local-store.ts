import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/constants/storage";
import { asyncStorage } from "@/lib/storage";
import { recipes, user } from "@/lib/mock-data";
import { generateId } from "@/lib/utils";
import type { Recipe } from "@/types/content";
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

/* ---------- Historique de visionnage ---------- */

type HistoryState = {
  history: HistoryEntry[];
  upsert: (entry: HistoryEntry) => void;
  clear: () => void;
  remove: (videoId: string) => void;
};

const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      upsert: (entry) =>
        set((state) => ({
          history: [entry, ...state.history.filter((h) => h.videoId !== entry.videoId)].slice(
            0,
            50,
          ),
        })),
      clear: () => set({ history: [] }),
      remove: (videoId) =>
        set((state) => ({ history: state.history.filter((h) => h.videoId !== videoId) })),
    }),
    { name: STORAGE_KEYS.HISTORY, storage: createJSONStorage(() => asyncStorage) },
  ),
);

export function useHistory() {
  const history = useHistoryStore((s) => s.history);
  const upsert = useHistoryStore((s) => s.upsert);
  const clear = useHistoryStore((s) => s.clear);
  const remove = useHistoryStore((s) => s.remove);
  const get = (videoId: string) => history.find((h) => h.videoId === videoId);
  return { history, upsert, get, clear, remove };
}

/* ---------- Favoris ---------- */

type FavoritesState = {
  favoriteIds: string[];
  toggle: (id: string) => void;
};

const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favoriteIds: [],
      toggle: (id) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(id)
            ? state.favoriteIds.filter((favoriteId) => favoriteId !== id)
            : [id, ...state.favoriteIds],
        })),
    }),
    { name: STORAGE_KEYS.FAVORITES, storage: createJSONStorage(() => asyncStorage) },
  ),
);

const recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]));

function resolveFavoriteRecipes(favoriteIds: string[]): Recipe[] {
  return favoriteIds
    .map((id) => recipesById.get(id))
    .filter((recipe): recipe is Recipe => Boolean(recipe));
}

export function useFavorites() {
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);
  const toggle = useFavoritesStore((s) => s.toggle);
  const isFavorite = (id: string) => favoriteIds.includes(id);
  const favorites = resolveFavoriteRecipes(favoriteIds);

  return { favorites, toggle, isFavorite };
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
