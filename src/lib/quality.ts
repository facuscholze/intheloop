"use client";

export type QualityTier = "high" | "medium" | "low";

// FPS measurement (informativo — el tier es siempre "high" / MAX)
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
