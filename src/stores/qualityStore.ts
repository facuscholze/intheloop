"use client";

import { create } from "zustand";
import type { QualityTier } from "@/lib/quality";
import { measureFPS } from "@/lib/quality";

interface QualityStore {
  /** Siempre "high" (MAX) — el sitio corre con todos los efectos activados. */
  tier: QualityTier;
  fps: number;
  gpuTier: number;
  reducedMotion: boolean;
  initialized: boolean;
  init: () => Promise<void>;
}

// Guard against concurrent init() calls (EnterScreen + Providers can both
// trigger it on the same commit — previously they raced and measured FPS twice)
let initPromise: Promise<void> | null = null;

export const useQualityStore = create<QualityStore>()((set, get) => ({
  tier: "high",
  fps: 60,
  gpuTier: 2,
  reducedMotion: false,
  initialized: false,

  init: async () => {
    if (get().initialized || initPromise) return initPromise ?? Promise.resolve();
    initPromise = (async () => {
      try {
        // Modo MAX fijo: sin detección de dispositivo ni degradación por FPS.
        set({ tier: "high", initialized: true });

        // Medimos FPS solo a título informativo (PerformanceMonitor en dev).
        const fps = await measureFPS(2500);
        set({ fps, tier: "high" });
      } finally {
        initPromise = null;
      }
    })();
    return initPromise;
  },
}));
