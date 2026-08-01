import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { asyncStorage } from "@/lib/storage";

// Tracks the in-app notification center's unread state. `lastSeenAt` drives the
// unread dot (any recent item newer than it is unread); it's cleared when the
// user opens the notifications screen. Remote delivery is handled separately by
// Expo push (see src/lib/push.ts) — this store is purely the unread badge.
interface NotificationsState {
  lastSeenAt: number;
  markSeen: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      lastSeenAt: 0,
      markSeen: () => set({ lastSeenAt: Date.now() }),
    }),
    {
      name: "pdl.notifications",
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
);
