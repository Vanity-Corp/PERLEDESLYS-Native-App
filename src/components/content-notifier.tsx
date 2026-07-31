import { useEffect } from "react";

import { useRecentQuery } from "@/lib/content-queries";
import { useNotificationsStore } from "@/lib/notifications-store";
import { presentLocalNotification } from "@/lib/reminders";

// Mirrors "push" locally: when the recent-content feed advances past what we've
// already alerted on, present a local notification. On first run it just sets a
// baseline (no alert for pre-existing content). Renders nothing.
const LABEL = {
  recipe: "Nouvelle recette",
  video: "Nouvelle vidéo",
  live: "Nouveau live",
  article: "Nouvel article",
} as const;

export function ContentNotifier() {
  const { data: recent } = useRecentQuery();
  const lastNotifiedAt = useNotificationsStore((s) => s.lastNotifiedAt);
  const markNotified = useNotificationsStore((s) => s.markNotified);

  useEffect(() => {
    if (!recent || recent.length === 0) return;
    const times = recent
      .map((r) => new Date(r.createdAt).getTime())
      .filter((n) => !Number.isNaN(n));
    if (times.length === 0) return;
    const newest = Math.max(...times);

    // First run → baseline only, don't alert about existing content.
    if (lastNotifiedAt === 0) {
      markNotified(newest);
      return;
    }
    if (newest <= lastNotifiedAt) return;

    const fresh = recent.find(
      (r) => new Date(r.createdAt).getTime() > lastNotifiedAt,
    );
    if (fresh) {
      void presentLocalNotification(
        "Perle de Lys",
        `${LABEL[fresh.type]} : ${fresh.title}`,
        { type: fresh.type, id: fresh.id },
      );
    }
    markNotified(newest);
  }, [recent, lastNotifiedAt, markNotified]);

  return null;
}
