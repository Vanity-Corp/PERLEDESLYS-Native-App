import type { ThemePreference } from '@/types/domain';

type Listener = () => void;
type UiState = { theme: ThemePreference };

let state: UiState = { theme: 'system' };
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((listener) => listener());

export const uiStore = {
  getSnapshot: () => state,
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setTheme(theme: ThemePreference) {
    if (state.theme === theme) return;
    state = { ...state, theme };
    emit();
  },
};
