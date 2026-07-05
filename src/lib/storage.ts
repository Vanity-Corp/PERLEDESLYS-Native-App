import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StateStorage } from "zustand/middleware";

// Backs all locally-persisted app state (notes, watch history, settings,
// favorites) — the RN replacement for the web app's `window.localStorage`.
//
// Originally `react-native-mmkv` (faster, synchronous), swapped for
// `@react-native-async-storage/async-storage` after a real-device crash:
// react-native-mmkv v4 depends on `react-native-nitro-modules`, which needs
// custom native code Expo Go doesn't ship — it threw immediately on import
// the moment a real screen (Recipe Detail, `useFavorites`) first exercised
// this module at runtime, rather than only in an isolated test script.
// AsyncStorage is plain JS with no native-module requirement, so it works
// in Expo Go with no dev-client rebuild — the tradeoff (async instead of
// sync reads/writes) is irrelevant at this app's data scale. Already one of
// the two options the project's own instructions sanctioned from the start
// ("Replace localStorage with AsyncStorage or MMKV").
//
// `StateStorage` (zustand's `persist` middleware storage shape) supports
// async engines directly, so this needs no adapter beyond matching its
// method names.
export const asyncStorage: StateStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};
