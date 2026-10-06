"use client";

import { useEffect } from "react";
import { audioEngine } from "@/lib/audio-engine";
import { useQualityStore } from "@/stores/qualityStore";
import { useUIStore } from "@/stores/uiStore";

/**
 * Screen shake on strong beats. Subscribes directly to the audio engine so
 * the DOM work happens off the React render path (no component re-renders).
 */
export function ScreenShake() {
  const tier = useQualityStore((s) => s.tier);
  const reducedMotion = useUIStore((s) => s.reducedMotion);

  useEffect(() => {
    if (tier === "low" || reducedMotion) return;
    const el = document.documentElement;
    if (!el) return;

    let lastShake = 0;
    let timeout: number | null = null;

    const unsub = audioEngine?.subscribe((a) => {
      const now = performance.now();
      // Only shake on strong beats, at most ~2×/sec
      if (a.beat > 0.85 && a.bass > 0.5 && now - lastShake > 500) {
        lastShake = now;
        const intensity = (a.beat - 0.85) * a.bass * 4; // 0-~1
        const x = (Math.random() - 0.5) * intensity * 3;
        const y = (Math.random() - 0.5) * intensity * 3;
        el.style.transform = `translate(${x}px, ${y}px)`;
        if (timeout) window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          el.style.transform = "translate(0,0)";
        }, 80);
      }
    });

    return () => {
      unsub?.();
      if (timeout) window.clearTimeout(timeout);
      el.style.transform = "translate(0,0)";
    };
  }, [tier, reducedMotion]);

  return null;
}
