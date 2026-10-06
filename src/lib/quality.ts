"use client";

export type QualityTier = "high" | "medium" | "low";

export interface QualityState {
  tier: QualityTier;
  manualOverride: QualityTier | null;
  gpuTier: number;
  fps: number;
  reducedMotion: boolean;
  saveData: boolean;
}

export async function detectInitialTier(): Promise<QualityState> {
  if (typeof window === "undefined") {
    return { tier: "medium", manualOverride: null, gpuTier: 2, fps: 60, reducedMotion: false, saveData: false };
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = (navigator as any).connection?.saveData || false;

  if (reducedMotion || saveData) {
    return { tier: "low", manualOverride: null, gpuTier: 0, fps: 30, reducedMotion, saveData };
  }

  let gpuTier = 2;
  try {
    const { getGPUTier } = await import("detect-gpu");
    const gpu = await getGPUTier();
    gpuTier = gpu.tier;
  } catch {
    gpuTier = 2;
  }

  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as any).deviceMemory || 4;

  let tier: QualityTier = "high";
  if (gpuTier < 2 || cores <= 4 || mem <= 4) tier = "medium";
  if (gpuTier === 0 || cores <= 2) tier = "low";

  // Check localStorage override
  const stored = localStorage.getItem("itl-quality") as QualityTier | null;
  if (stored && ["high", "medium", "low"].includes(stored)) {
    return { tier: stored, manualOverride: stored, gpuTier, fps: 60, reducedMotion, saveData };
  }

  return { tier, manualOverride: null, gpuTier, fps: 60, reducedMotion, saveData };
}

// FPS measurement first 3 seconds
export function measureFPS(durationMs = 3000): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(60);
    let frames = 0;
    let start = performance.now();
    function tick() {
      frames++;
      const elapsed = performance.now() - start;
      if (elapsed < durationMs) {
        requestAnimationFrame(tick);
      } else {
        const fps = Math.round((frames / elapsed) * 1000);
        resolve(fps);
      }
    }
    requestAnimationFrame(tick);
  });
}
