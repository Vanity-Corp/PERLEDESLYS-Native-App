type Listener = () => void;
type State = { favorites: string[]; history: string[]; recentViewed: string[]; offlineMode: boolean };
let state: State = { favorites: ['c-1'], history: ['c-2', 'c-5'], recentViewed: ['c-2'], offlineMode: false };
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((listener) => listener());
const set = (patch: Partial<State>) => { state = { ...state, ...patch }; emit(); };
export const contentStore = {
  getSnapshot: () => state,
  subscribe(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); },
  toggleFavorite(id: string) { set({ favorites: state.favorites.includes(id) ? state.favorites.filter((item) => item !== id) : [id, ...state.favorites] }); },
  trackViewed(id: string) { set({ history: [id, ...state.history.filter((item) => item !== id)].slice(0, 25), recentViewed: [id, ...state.recentViewed.filter((item) => item !== id)].slice(0, 6) }); },
  setOfflineMode(value: boolean) { set({ offlineMode: value }); },
};
