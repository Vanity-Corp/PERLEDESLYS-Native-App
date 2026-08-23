import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import type { Href } from "expo-router";
import { Platform } from "react-native";

import { isExpoGo } from "@/lib/runtime";

// Remote push (Expo Push Service). The backend stores each device's Expo push
// token (POST /notifications/register) and sends a push whenever new content is
// published; tapping it deep-links to the item via `hrefForPushData`.
//
// All calls are best-effort and wrapped in try/catch — push must never crash
// the app. Registration only happens for logged-in members who have the
// in-app "Notifications push" preference ON (see PushNotifications component).

const API_URL = process.env.EXPO_PUBLIC_API_URL;
// The Expo push token we last registered, kept so we can unregister it on
// logout / when push is disabled (even after the auth token is gone).
const STORED_TOKEN_KEY = "pdl.pushToken";

// Re-exported for the PushNotifications component. See @/lib/runtime.
export { isExpoGo };

// Lazily load expo-notifications. Importing it at module scope throws in Expo
// Go (SDK 53+), so it's required on demand and only outside Expo Go. Returns
// null when unavailable, so every caller can no-op safely.
function getNotifications(): typeof import("expo-notifications") | null {
  if (isExpoGo) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-notifications");
  } catch {
    return null;
  }
}

export { getNotifications };

function projectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Constants as any).easConfig?.projectId
  );
}

type NotificationsModule = NonNullable<ReturnType<typeof getNotifications>>;

async function ensurePermission(N: NotificationsModule): Promise<boolean> {
  const current = await N.getPermissionsAsync();
  if (current.granted) return true;
  const req = await N.requestPermissionsAsync();
  return !!req.granted;
}

// Android needs a channel for notifications to display. Must match the
// `channelId` the backend sends ("default").
async function ensureAndroidChannel(N: NotificationsModule): Promise<void> {
  if (Platform.OS !== "android") return;
  await N.setNotificationChannelAsync("default", {
    name: "Nouveautés",
    importance: N.AndroidImportance.HIGH,
    lightColor: "#E8883C",
  });
}

// Register this device against the backend. Requests notification permission
// (the OS prompt) the first time. No-op on web / when the API URL is unset.
export async function registerPushToken(authToken: string): Promise<void> {
  if (Platform.OS === "web" || !API_URL || isExpoGo) return;
  const N = getNotifications();
  if (!N) return;
  try {
    if (!(await ensurePermission(N))) return;
    await ensureAndroidChannel(N);
    const pid = projectId();
    const { data: expoToken } = await N.getExpoPushTokenAsync(
      pid ? { projectId: pid } : undefined,
    );
    if (!expoToken) return;
    await AsyncStorage.setItem(STORED_TOKEN_KEY, expoToken);
    await fetch(`${API_URL}/api/notifications/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token: expoToken, platform: Platform.OS }),
    });
  } catch {
    // Never crash over push registration.
  }
}

// Remove this device's token from the backend so it stops receiving pushes
// (member disabled push, or logged out). Call while the auth token is still
// valid — the backend route is member-guarded.
export async function unregisterPushToken(authToken?: string): Promise<void> {
  if (Platform.OS === "web" || !API_URL || isExpoGo) return;
  try {
    const expoToken = await AsyncStorage.getItem(STORED_TOKEN_KEY);
    if (expoToken && authToken) {
      await fetch(`${API_URL}/api/notifications/unregister`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token: expoToken }),
      });
    }
    await AsyncStorage.removeItem(STORED_TOKEN_KEY);
  } catch {
    // Best-effort.
  }
}

// Map a notification's `data` payload ({ type, id }) to an app route.
export function hrefForPushData(data: unknown): Href | null {
  const d = (data ?? {}) as { type?: string; id?: string };
  if (!d.type || !d.id) return null;
  switch (d.type) {
    case "recipe":
      return { pathname: "/app/recipes/[recipeId]", params: { recipeId: d.id } };
    case "video":
      return { pathname: "/app/videos/[videoId]", params: { videoId: d.id } };
    case "live":
      return { pathname: "/app/lives/[liveId]", params: { liveId: d.id } };
    case "article":
      return { pathname: "/app/articles/[articleId]", params: { articleId: d.id } };
    default:
      return null;
  }
}
