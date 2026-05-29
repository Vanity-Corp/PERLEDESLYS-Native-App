import type { ThemePreference } from '@/types/domain';
type Listener = () => void;
let theme: ThemePreference = 'system';
const listeners = new Set<Listener>();
export const uiStore = {
  getSnapshot: () => ({ theme }),
  subscribe(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); },
  setTheme(value: ThemePreference) { theme = value; listeners.forEach((listener) => listener()); },
};
