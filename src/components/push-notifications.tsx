import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { InteractionManager } from "react-native";

import { useAuth } from "@/lib/auth-store";
import { useSettings } from "@/lib/local-store";
import {
  getNotifications,
  hrefForPushData,
  registerPushToken,
  unregisterPushToken,
} from "@/lib/push";

// Mounted inside the (ACTIVE-only) app tab tree. Owns the whole remote-push
// lifecycle: registers/unregisters the device token with the backend (gated on
// the "Notifications push" preference), deep-links when a notification is
// tapped, and refreshes the in-app notification center when a push arrives
// while the app is foregrounded. Renders nothing.
export function PushNotifications() {
  const token = useAuth((s) => s.token);
  const [settings] = useSettings();
  const enabled = settings.notifications;
  const router = useRouter();
  const queryClient = useQueryClient();

  // Register (or unregister) for push — deferred until after interactions so
  // the first OS permission prompt never races the post-login navigation. That
  // race is what crashed release builds on the very first login.
  useEffect(() => {
    if (!token) return;
    const task = InteractionManager.runAfterInteractions(() => {
      if (enabled) void registerPushToken(token);
      else void unregisterPushToken(token);
    });
    return () => task.cancel();
  }, [token, enabled]);

  // Tapping a notification (foreground, background, or cold-start) → route to
  // the content it points at.
  useEffect(() => {
    const Notifications = getNotifications();
    if (!Notifications) return;
    const route = (data: unknown) => {
      const href = hrefForPushData(data);
      if (href) router.push(href);
    };
    let mounted = true;
    void Notifications.getLastNotificationResponseAsync()
      .then((resp) => {
        if (mounted && resp) route(resp.notification.request.content.data);
      })
      .catch(() => undefined);
    const sub = Notifications.addNotificationResponseReceivedListener((resp) =>
      route(resp.notification.request.content.data),
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, [router]);

  // A push received while the app is open → refresh the recent feed so the
  // notification center updates live (no pull-to-refresh needed).
  useEffect(() => {
    const Notifications = getNotifications();
    if (!Notifications) return;
    const sub = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: ["recent"] });
    });
    return () => sub.remove();
  }, [queryClient]);

  return null;
}
