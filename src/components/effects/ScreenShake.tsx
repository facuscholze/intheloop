"use client";

import { useEffect, useRef } from "react";
import { useAudioReactive } from "@/hooks/useAudioReactive";
import { useQualityStore } from "@/stores/qualityStore";
import { useUIStore } from "@/stores/uiStore";

export function ScreenShake() {
  const { beat, bass } = useAudioReactive();
  const tier = useQualityStore((s) => s.tier);
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tier === "low" || reducedMotion) return;
    const el = document.documentElement;
    if (!el) return;

    // Only shake on strong beats
    if (beat > 0.85 && bass > 0.5) {
      const intensity = (beat - 0.85) * bass * 4; // 0-~1
      const x = (Math.random() - 0.5) * intensity * 3;
      const y = (Math.random() - 0.5) * intensity * 3;
      el.style.transform = `translate(${x}px, ${y}px)`;
      setTimeout(() => {
        el.style.transform = "translate(0,0)";
      }, 80);
    }
  }, [beat, bass, tier, reducedMotion]);

  return null;
}
