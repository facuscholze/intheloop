"use client";

import { useEffect, useState } from "react";
import { useQualityStore } from "@/stores/qualityStore";

interface PerfMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fps: number | null;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerfMetrics>({ lcp: null, fid: null, cls: null, fps: null });
  const [isVisible, setIsVisible] = useState(false);
  const tier = useQualityStore((s) => s.tier);

  useEffect(() => {
    // Only in dev
    if (process.env.NODE_ENV !== "development") return;

    // Web Vitals
    if ("PerformanceObserver" in window) {
      try {
        // LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          setMetrics((m) => ({ ...m, lcp: lastEntry.startTime }));
        });
        lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

        // CLS
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries() as any) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          setMetrics((m) => ({ ...m, cls: clsValue }));
        });
        clsObserver.observe({ type: "layout-shift", buffered: true });

        // FPS measurement
        let frameCount = 0;
        let lastTime = performance.now();
        const measureFPS = () => {
          frameCount++;
          const now = performance.now();
          if (now - lastTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (now - lastTime));
            setMetrics((m) => ({ ...m, fps }));
            frameCount = 0;
            lastTime = now;
          }
          requestAnimationFrame(measureFPS);
        };
        requestAnimationFrame(measureFPS);

        return () => {
          lcpObserver.disconnect();
          clsObserver.disconnect();
        };
      } catch (e) {
        console.warn("PerformanceObserver failed", e);
      }
    }
  }, []);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50 rounded-full bg-black/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur"
        aria-label="Toggle performance monitor"
      >
        Perf {tier} {metrics.fps ? `${metrics.fps}fps` : ""}
      </button>

      {isVisible && (
        <div className="fixed bottom-12 left-4 z-50 rounded-xl border border-white/10 bg-black/90 p-4 font-mono text-xs text-white backdrop-blur-xl">
          <div className="mb-2 font-bold">Performance Monitor (dev only)</div>
          <div className="space-y-1 text-[10px]">
            <div className={metrics.lcp && metrics.lcp < 2500 ? "text-green-400" : "text-red-400"}>LCP: {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : "—"} (target &lt;2500ms)</div>
            <div>CLS: {metrics.cls !== null ? metrics.cls.toFixed(3) : "—"} (target &lt;0.1)</div>
            <div className={metrics.fps && metrics.fps >= 55 ? "text-green-400" : metrics.fps && metrics.fps >= 30 ? "text-yellow-400" : "text-red-400"}>
              FPS: {metrics.fps || "—"} (target 60fps)
            </div>
            <div>Tier: {tier}</div>
            <div className="mt-2 text-[9px] text-white/60">Bundle: 32.7kB /[locale] + 103kB shared + Three dynamic</div>
            <div className="text-[9px] text-white/60">LCP text SSR sin JS, grain 6%, pause RAF outside viewport</div>
          </div>
        </div>
      )}
    </>
  );
}
