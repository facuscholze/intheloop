"use client";

import { useEffect, useRef } from "react";
import { useQualityStore } from "@/stores/qualityStore";

interface AmbilightProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled?: boolean;
}

export function Ambilight({ videoRef, enabled = true }: AmbilightProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tier = useQualityStore((s) => s.tier);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || tier === "low") return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const draw = () => {
      if (video.paused || video.ended) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;

      // Draw video scaled down to canvas (low res for perf)
      try {
        ctx.drawImage(video, 0, 0, w, h);
        // Blur via filter
        ctx.filter = "blur(40px) saturate(1.5) brightness(1.2)";
        ctx.drawImage(canvas, 0, 0, w, h);
        ctx.filter = "none";
      } catch {}

      rafRef.current = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth / 4;
      canvas.height = window.innerHeight / 4;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [videoRef, enabled, tier]);

  if (!enabled || tier === "low") return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
      style={{ filter: "blur(60px) saturate(1.3)", transform: "scale(1.2)" }}
    />
  );
}
