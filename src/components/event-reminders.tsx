import { useRouter } from "expo-router";
import { useEffect } from "react";

import { useEvents } from "@/lib/content-queries";
import { useSettings } from "@/lib/local-store";
import { addReminderTapListener, syncEventReminders } from "@/lib/reminders";

// Mounted inside the (ACTIVE-only) app tab tree. Schedules local reminders for
// upcoming events whenever the events list or the notifications setting change,
// and deep-links to the live player when a live reminder is tapped
// (WIRING_PLAN B2). Renders nothing.
export function EventReminders() {
  const events = useEvents();
  const [settings] = useSettings();
  const router = useRouter();

  useEffect(() => {
    void syncEventReminders(events, settings.notifications);
  }, [events, settings.notifications]);

  useEffect(() => {
    return addReminderTapListener((liveId) => {
      router.push({ pathname: "/app/lives/[liveId]", params: { liveId } });
    });
  }, [router]);

  return null;
}
