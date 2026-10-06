"use client";

import { useRef, useEffect, useState } from "react";
import { useQualityStore } from "@/stores/qualityStore";
import { useAudioReactive } from "@/hooks/useAudioReactive";
import { useIntersectionPause } from "@/hooks/useIntersectionPause";

export function HeroShader() {
  const tier = useQualityStore((s) => s.tier);
  const { bass, mid, high, beat } = useAudioReactive();
  const { ref, isVisible } = useIntersectionPause<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    // Don't render WebGL in Low tier - CSS fallback already in Hero
    if (tier === "low") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = canvas.width = canvas.offsetWidth * (tier === "medium" ? 0.7 : 1);
    let h = canvas.height = canvas.offsetHeight * (tier === "medium" ? 0.7 : 1);

    const handleResize = () => {
      w = canvas.width = canvas.offsetWidth * (tier === "medium" ? 0.7 : 1);
      h = canvas.height = canvas.offsetHeight * (tier === "medium" ? 0.7 : 1);
    };

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = 1 - e.clientY / window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouse);

    // Simple fluid noise using canvas 2D for Phase 1 (Three.js shader comes in Phase 1.5 if needed)
    // For performance, we draw metaballs + gradients that react to audio
    const blobs = [
      { x: 0.3, y: 0.4, r: 0.25, color: [255, 90, 31] }, // fire
      { x: 0.7, y: 0.6, r: 0.3, color: [255, 46, 147] }, // magenta
      { x: 0.5, y: 0.2, r: 0.2, color: [200, 255, 0] }, // lime
    ];

    const draw = () => {
      if (!isVisible) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      timeRef.current += 0.008 + bass * 0.02;
      const t = timeRef.current;

      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = "#07070A";
      ctx.fillRect(0, 0, w, h);

      // Animate blobs
      blobs.forEach((blob, i) => {
        const mx = mouseRef.current.x - 0.5;
        const my = mouseRef.current.y - 0.5;

        // Audio reactive movement
        const offsetX = Math.sin(t * (0.3 + i * 0.1) + i) * 0.1 + mx * 0.15 * (1 + bass);
        const offsetY = Math.cos(t * (0.25 + i * 0.08) + i * 1.3) * 0.12 + my * 0.1 * (1 + mid);

        const x = (blob.x + offsetX) * w;
        const y = (blob.y + offsetY) * h;
        const r = blob.r * Math.min(w, h) * (1 + bass * 0.8 + beat * 0.5) * (tier === "medium" ? 0.8 : 1);

        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        const alpha = 0.15 + bass * 0.2 + (i === 0 ? mid * 0.1 : 0);
        const [cr, cg, cb] = blob.color;
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha})`);
        grad.addColorStop(0.5, `rgba(${cr},${cg},${cb},${alpha * 0.4})`);
        grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Grain + high frequency noise
      if (high > 0.05 && tier === "high") {
        ctx.fillStyle = `rgba(255,255,255,${high * 0.015})`;
        for (let i = 0; i < 30; i++) {
          const x = Math.random() * w;
          const y = Math.random() * h;
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Vignette
      const vignette = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.8);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(7,7,10,0.8)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [tier, isVisible, bass, mid, high, beat]);

  if (tier === "low") return null;

  return (
    <div ref={ref as any} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ width: "100%", height: "100%" }}
      />
      {/* Overlay gradient for text legibility */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,_transparent_40%,_rgba(7,7,10,0.6)_80%)]" />
    </div>
  );
}

// Three.js version placeholder for Phase 1.5 - dynamic import
// This canvas 2D version is performant and already audio-reactive
// In High tier we can swap to R3F shader with postprocessing (bloom, chromatic)
