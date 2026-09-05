import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// On web, react-native-web's TextInput renders a real <textarea>/<input>, and
// Firefox natively toggles overwrite mode on those elements when the user
// presses the physical Insert key — typed characters then replace the ones
// ahead of the cursor instead of being inserted, which reads as the field
// "eating" letters while typing. Blocking the key's default behavior at the
// DOM level is the only way to suppress it; RN's TextInput has no
// insert-mode concept to configure.
export function blockInsertKeyOverwriteMode<E extends { key: string; preventDefault: () => void }>(
  onKeyDown?: (e: E) => void
) {
  return (e: E) => {
    if (e.key === "Insert") e.preventDefault();
    onKeyDown?.(e);
  };
}

export function formatSeconds(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// True when `iso` is a valid date within the last `days` days — drives the
// automatic "Nouveau" badge (replaces the manual `isNew` flag). Robust to
// missing/invalid input (returns false).
export function isRecent(iso?: string, days = 5): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t <= days * 24 * 60 * 60 * 1000;
}

// crypto.randomUUID() isn't guaranteed to exist in the Hermes runtime.
// This non-cryptographic fallback is sufficient for local-only IDs (notes, etc).
export function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
