"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
  hasEntered: boolean;
  isCineMode: boolean;
  reducedMotion: boolean;
  isMenuOpen: boolean;
  isPlayerExpanded: boolean;

  setHasEntered: (v: boolean) => void;
  setCineMode: (v: boolean) => void;
  setReducedMotion: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setPlayerExpanded: (v: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      hasEntered: false,
      isCineMode: false,
      reducedMotion: false,
      isMenuOpen: false,
      isPlayerExpanded: false,

      setHasEntered: (v) => set({ hasEntered: v }),
      setCineMode: (v) => set({ isCineMode: v }),
      setReducedMotion: (v) => set({ reducedMotion: v }),
      setMenuOpen: (v) => set({ isMenuOpen: v }),
      setPlayerExpanded: (v) => set({ isPlayerExpanded: v }),
    }),
    {
      name: "itl-ui",
      partialize: (s) => ({
        hasEntered: s.hasEntered,
        reducedMotion: s.reducedMotion,
      }),
    }
  )
);
