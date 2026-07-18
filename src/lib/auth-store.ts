import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { asyncStorage } from "@/lib/storage";
import { authApi, type AuthUser, type RegisterInput } from "@/lib/auth-api";

// Auth session store. Persisted (token + user) via the same AsyncStorage engine
// as the rest of the app (see storage.ts — MMKV was dropped for Expo-Go
// compatibility; a future hardening step could move the token to
// expo-secure-store, per CLAUDE.md's localStorage→SecureStore rule).
//
// `hydrated` guards against a first-render flash: zustand's persist rehydrates
// asynchronously, so layouts wait for `hydrated` before deciding auth routes.

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setHydrated: () => void;
  register: (input: RegisterInput) => Promise<AuthUser>;
  login: (identifier: string, password: string) => Promise<AuthUser>;
  activate: (code: string) => Promise<AuthUser>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),

      register: async (input) => {
        const { token, user } = await authApi.register(input);
        set({ token, user });
        return user;
      },

      login: async (identifier, password) => {
        const { token, user } = await authApi.login(identifier, password);
        set({ token, user });
        return user;
      },

      // Activation requires the token issued at register/login (the pending
      // user calls this authenticated). On success the user becomes ACTIVE.
      activate: async (code) => {
        const token = get().token;
        if (!token) {
          throw new Error("Session expirée. Reconnecte-toi.");
        }
        const { token: next, user } = await authApi.activate(code, token);
        set({ token: next, user });
        return user;
      },

      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "pdl.auth",
      storage: createJSONStorage(() => asyncStorage),
      // Only the session is persisted; `hydrated`/actions come from the creator.
      partialize: (state) => ({ token: state.token, user: state.user }),
      // Fires once rehydration settles (even with nothing stored) — flip the
      // flag so route guards stop waiting.
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
