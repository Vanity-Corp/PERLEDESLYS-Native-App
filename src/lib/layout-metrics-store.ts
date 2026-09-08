import { create } from "zustand";

// In-memory (not persisted — these are measured fresh every launch) layout
// metrics shared between components that don't have a parent/child
// relationship. Currently just the bottom tab bar's real rendered height:
// BottomNav (src/components/bottom-nav.tsx) measures itself and writes here,
// GlobalFabs (src/components/global-fabs.tsx) reads it to keep the
// draggable FAB pair from being dropped underneath the tab bar — insets.bottom
// alone (the OS safe-area inset) isn't enough since the custom tab bar is
// taller than that.
type LayoutMetricsState = {
  bottomNavHeight: number;
  setBottomNavHeight: (height: number) => void;
};

export const useLayoutMetricsStore = create<LayoutMetricsState>()((set) => ({
  bottomNavHeight: 0,
  setBottomNavHeight: (height) =>
    set((state) => (state.bottomNavHeight === height ? state : { bottomNavHeight: height })),
}));
