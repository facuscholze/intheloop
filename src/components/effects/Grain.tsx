"use client";

import { useEffect, useRef } from "react";
import { useQualityStore } from "@/stores/qualityStore";
import { useAudioReactive } from "@/hooks/useAudioReactive";

export function Grain() {
  const tier = useQualityStore((s) => s.tier);
  const { high } = useAudioReactive();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tier === "low") return;
    const el = ref.current;
    if (!el) return;

    // Animate grain opacity based on high frequencies
    const animate = () => {
      if (el) {
        const base = tier === "high" ? 0.06 : 0.04;
        el.style.opacity = `${base + high * 0.08}`;
      }
      requestAnimationFrame(animate);
    };
    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [tier, high]);

  if (tier === "low") {
    // CSS only grain for low tier
    return <div className="grain" style={{ opacity: 0.03 }} />;
  }

  return (
    <>
      <div ref={ref} className="grain" />
      {/* Additional canvas grain for high tier */}
      {tier === "high" && (
        <div className="pointer-events-none fixed inset-0 z-[1] opacity-[0.015] mix-blend-soft-light">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
      )}
    </>
  );
}
