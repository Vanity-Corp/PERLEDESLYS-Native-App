import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { asyncStorage } from "@/lib/storage";

// Tracks the in-app notification center state (client-side — there's no remote
// push). `lastSeenAt` drives the unread dot (any recent item newer than it is
// unread); `lastNotifiedAt` prevents re-firing a local notification for content
// we've already alerted on.
interface NotificationsState {
  lastSeenAt: number;
  lastNotifiedAt: number;
  markSeen: () => void;
  markNotified: (at: number) => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      lastSeenAt: 0,
      lastNotifiedAt: 0,
      markSeen: () => set({ lastSeenAt: Date.now() }),
      markNotified: (at) => set({ lastNotifiedAt: at }),
    }),
    {
      name: "pdl.notifications",
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
);
