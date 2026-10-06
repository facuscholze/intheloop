"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QualityTier } from "@/lib/quality";
import { detectInitialTier, measureFPS } from "@/lib/quality";

interface QualityStore {
  tier: QualityTier;
  manualOverride: QualityTier | null;
  fps: number;
  gpuTier: number;
  reducedMotion: boolean;
  initialized: boolean;
  setTier: (tier: QualityTier, manual?: boolean) => void;
  init: () => Promise<void>;
}

// Guard against concurrent init() calls (EnterScreen + Providers can both
// trigger it on the same commit — previously they raced and measured FPS twice)
let initPromise: Promise<void> | null = null;

export const useQualityStore = create<QualityStore>()(
  persist(
    (set, get) => ({
      tier: "medium",
      manualOverride: null,
      fps: 60,
      gpuTier: 2,
      reducedMotion: false,
      initialized: false,

      setTier: (tier, manual = true) => {
        if (manual) localStorage.setItem("itl-quality", tier);
        set({ tier, manualOverride: manual ? tier : get().manualOverride });
      },

      init: async () => {
        if (get().initialized || initPromise) return initPromise ?? Promise.resolve();
        initPromise = (async () => {
          try {
            const detected = await detectInitialTier();
            // If manual override exists, keep it
            if (get().manualOverride) {
              set({ ...detected, tier: get().manualOverride!, initialized: true });
            } else {
              set({ ...detected, initialized: true });
            }

            // Measure FPS after init
            const fps = await measureFPS(2500);
            const currentTier = get().tier;
            let adjustedTier = currentTier;
            if (!get().manualOverride) {
              if (fps < 30 && currentTier !== "low") adjustedTier = "low";
              else if (fps < 45 && currentTier === "high") adjustedTier = "medium";
            }
            set({ fps, tier: adjustedTier });
          } finally {
            initPromise = null;
          }
        })();
        return initPromise;
      },
    }),
    {
      name: "itl-quality",
      partialize: (s) => ({ manualOverride: s.manualOverride, tier: s.tier }),
    }
  )
);
