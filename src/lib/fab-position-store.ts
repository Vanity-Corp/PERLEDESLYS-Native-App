import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/constants/storage";
import { asyncStorage } from "@/lib/storage";

// Persists the dragged offset of the global AI/note FAB pair (global-fabs.tsx)
// from its default docked position, so it reopens wherever the user last left
// it instead of snapping back to the corner. Same Zustand+AsyncStorage
// persistence pattern as notes/history/favorites (see local-store.ts) — just
// its own tiny store since this has nothing to do with app content.
type FabOffset = { dx: number; dy: number };

type FabPositionState = {
  offset: FabOffset | null;
  setOffset: (offset: FabOffset) => void;
};

const useFabPositionStore = create<FabPositionState>()(
  persist(
    (set) => ({
      offset: null,
      setOffset: (offset) => set({ offset }),
    }),
    { name: STORAGE_KEYS.FAB_POSITION, storage: createJSONStorage(() => asyncStorage) },
  ),
);

export function useFabPosition() {
  const offset = useFabPositionStore((s) => s.offset);
  const setOffset = useFabPositionStore((s) => s.setOffset);
  return { offset, setOffset };
}
