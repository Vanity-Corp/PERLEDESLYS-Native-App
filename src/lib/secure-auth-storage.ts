import * as SecureStore from "expo-secure-store";
import type { StateStorage } from "zustand/middleware";

import { asyncStorage } from "@/lib/storage";

// Auth-only storage: the session token is sensitive, so it goes in the
// platform keychain/keystore via expo-secure-store rather than plain
// AsyncStorage (CLAUDE.md's localStorage→SecureStore rule). Every other
// locally-persisted store (notes, favorites, history, settings) stays on
// AsyncStorage — SecureStore is unnecessary overhead for non-sensitive data.
//
// One-time migration: sessions saved before this change live under the same
// key in AsyncStorage. On first read, if SecureStore has nothing yet, pull
// the value from AsyncStorage (if present), copy it into SecureStore, and
// clear the old copy — so upgrading the app doesn't silently log everyone
// out.
export const secureAuthStorage: StateStorage = {
  getItem: async (key) => {
    const fromSecure = await SecureStore.getItemAsync(key);
    if (fromSecure !== null) return fromSecure;

    const legacy = await asyncStorage.getItem(key);
    if (legacy !== null) {
      await SecureStore.setItemAsync(key, legacy);
      await asyncStorage.removeItem(key);
    }
    return legacy;
  },
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};
