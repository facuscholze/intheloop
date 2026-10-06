"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
  hasEntered: boolean;
  isClubMode: boolean;
  isCineMode: boolean;
  reducedMotion: boolean;
  cursorType: "default" | "play" | "view" | "drag" | "close";
  isMenuOpen: boolean;
  isPlayerExpanded: boolean;

  setHasEntered: (v: boolean) => void;
  toggleClubMode: () => void;
  setCineMode: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
  setCursorType: (t: UIStore["cursorType"]) => void;
  setMenuOpen: (v: boolean) => void;
  setPlayerExpanded: (v: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      hasEntered: false,
      isClubMode: false,
      isCineMode: false,
      reducedMotion: false,
      cursorType: "default",
      isMenuOpen: false,
      isPlayerExpanded: false,

      setHasEntered: (v) => set({ hasEntered: v }),
      toggleClubMode: () => set((s) => ({ isClubMode: !s.isClubMode })),
      setCineMode: (v) => set({ isCineMode: v }),
      setReducedMotion: (v) => set({ reducedMotion: v }),
      setCursorType: (t) => set({ cursorType: t }),
      setMenuOpen: (v) => set({ isMenuOpen: v }),
      setPlayerExpanded: (v) => set({ isPlayerExpanded: v }),
    }),
    {
      name: "itl-ui",
      partialize: (s) => ({
        hasEntered: s.hasEntered,
        isClubMode: s.isClubMode,
        reducedMotion: s.reducedMotion,
      }),
    }
  )
);
