import { Platform } from "react-native";

// Opens the device's calendar app pre-filled with an event ("Me rappeler").
// expo-calendar is loaded via a guarded require so the app still builds/runs if
// the dep isn't installed yet (run: `npx expo install expo-calendar`, then
// rebuild — the native module needs a dev/production build).
//
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CalendarModule = any;

let Calendar: CalendarModule = null;
if (Platform.OS !== "web") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Calendar = require("expo-calendar");
  } catch {
    Calendar = null;
  }
}

export function calendarAvailable(): boolean {
  return !!Calendar && typeof Calendar.createEventInCalendarAsync === "function";
}

// Parse "yyyy-mm-dd" + "HH:mm" into a local Date (null if the date is invalid).
export function parseEventDate(date: string, time?: string | null): Date | null {
  const [y, m, d] = (date ?? "").split("-").map(Number);
  const [hh, mm] = (time ?? "00:00").split(":").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, hh || 0, mm || 0, 0);
}

// Presents the system calendar's "new event" editor pre-filled. Returns true if
// the UI was shown. The user reviews & saves it themselves (no permission
// needed for createEventInCalendarAsync). Best-effort — never throws.
export async function addToCalendar(opts: {
  title: string;
  start: Date;
  end?: Date;
  notes?: string;
}): Promise<boolean> {
  if (!calendarAvailable()) return false;
  try {
    await Calendar.createEventInCalendarAsync({
      title: opts.title,
      startDate: opts.start,
      endDate: opts.end ?? new Date(opts.start.getTime() + 60 * 60 * 1000),
      notes: opts.notes,
    });
    return true;
  } catch {
    return false;
  }
}
