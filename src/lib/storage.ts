import { createMMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

// Single MMKV instance backing all locally-persisted app state
// (notes, watch history, settings) — the RN replacement for the web
// app's `window.localStorage`.
export const mmkv = createMMKV({ id: "perledeslys" });

// Adapts MMKV's synchronous get/set/remove API to zustand's `persist`
// middleware `StateStorage` shape, so stores can do:
//   persist(..., { storage: createJSONStorage(() => mmkvStorage) })
export const mmkvStorage: StateStorage = {
  getItem: (key) => mmkv.getString(key) ?? null,
  setItem: (key, value) => {
    mmkv.set(key, value);
  },
  removeItem: (key) => {
    mmkv.remove(key);
  },
};
