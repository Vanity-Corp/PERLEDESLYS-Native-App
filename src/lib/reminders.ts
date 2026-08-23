import { Platform } from "react-native";

import { isExpoGo } from "@/lib/runtime";
import type { AppEvent } from "@/types/content";

// Local event reminders (WIRING_PLAN B2). Native uses expo-notifications to
// schedule a local notification per upcoming event. Web (Expo RN-Web) doesn't
// support it → graceful no-op. `expo-notifications` is loaded via a guarded
// require so the app still runs if it hasn't been installed yet
// (run: `npx expo install expo-notifications`).
//
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NotificationsModule = any;

let Notifications: NotificationsModule = null;
// Expo Go (SDK 53+) throws on importing expo-notifications, so skip it there.
if (Platform.OS !== "web" && !isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Notifications = require("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {
    Notifications = null;
  }
}

export function notificationsAvailable(): boolean {
  return !!Notifications;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return !!req.granted;
  } catch {
    return false;
  }
}

// Read-only permission check (never prompts). Event reminders use this so
// scheduling on mount can't trigger the OS permission dialog on the
// post-login navigation path — the deferred push hook owns the actual prompt.
async function hasNotificationPermission(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    return !!current.granted;
  } catch {
    return false;
  }
}

// Local date/time of an event minus its lead time, as an epoch ms (or null).
function eventFireTime(ev: AppEvent): number | null {
  const [y, m, d] = (ev.date ?? "").split("-").map(Number);
  const [hh, mm] = (ev.time ?? "00:00").split(":").map(Number);
  if (!y || !m || !d) return null;
  const at = new Date(y, m - 1, d, hh || 0, mm || 0, 0).getTime();
  const lead = (ev.remindMinutesBefore ?? 0) * 60_000;
  return at - lead;
}

// Cancel every previously-scheduled reminder and reschedule from the current
// events. Called whenever events or the notifications setting change.
export async function syncEventReminders(
  events: AppEvent[],
  enabled: boolean,
): Promise<void> {
  if (!Notifications) return; // web / not installed → no-op
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!enabled) return;
    // Don't prompt here — only schedule if permission was already granted
    // (the push hook requests it, deferred, off the navigation path).
    if (!(await hasNotificationPermission())) return;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("events", {
        name: "Événements",
        importance: Notifications.AndroidImportance?.DEFAULT ?? 3,
      });
    }

    const now = Date.now();
    for (const ev of events) {
      const fireAt = eventFireTime(ev);
      if (fireAt == null || fireAt <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: ev.title,
          body: ev.description ?? "C'est bientôt !",
          data: { eventId: ev.id, liveId: ev.liveId ?? null },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes?.DATE ?? "date",
          date: new Date(fireAt),
          ...(Platform.OS === "android" ? { channelId: "events" } : {}),
        },
      });
    }
  } catch {
    // Best-effort: never crash the app over reminder scheduling.
  }
}

// Present an immediate local notification (used to "mirror push" when new
// content appears). Best-effort; no-op on web / when not installed / no perms.
export async function presentLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<void> {
  if (!Notifications) return;
  try {
    if (!(await ensureNotificationPermission())) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: data ?? {} },
      trigger: null, // fire now
    });
  } catch {
    // never crash over a notification
  }
}

// Subscribe to reminder taps; returns an unsubscribe fn. `onLive` fires with a
// liveId when the tapped reminder was for a live (to deep-link the player).
export function addReminderTapListener(
  onLive: (liveId: string) => void,
): () => void {
  if (!Notifications) return () => {};
  try {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (resp: {
        notification?: { request?: { content?: { data?: { liveId?: string | null } } } };
      }) => {
        const liveId = resp?.notification?.request?.content?.data?.liveId;
        if (liveId) onLive(liveId);
      },
    );
    return () => sub?.remove?.();
  } catch {
    return () => {};
  }
}
