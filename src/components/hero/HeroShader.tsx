"use client";

import { useEffect, useRef } from "react";
import { useQualityStore } from "@/stores/qualityStore";
import { audioEngine, type AudioAnalysis } from "@/lib/audio-engine";
import { useIntersectionPause } from "@/hooks/useIntersectionPause";

export function HeroShader() {
  const tier = useQualityStore((s) => s.tier);
  const { ref, isVisible } = useIntersectionPause<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);
  const isVisibleRef = useRef(true);
  isVisibleRef.current = isVisible;
  // Audio values read inside the draw loop — NEVER in effect deps. The old
  // version tore down the whole effect (and reallocated the canvas backing
  // store!) on every single audio frame.
  const audioRef = useRef<AudioAnalysis>({ bass: 0, mid: 0, high: 0, level: 0, beat: 0, bpm: 124 });

  useEffect(() => {
    // Don't render WebGL in Low tier - CSS fallback already in Hero
    if (tier === "low") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // In high tier the R3F shader renders on top — keep the 2D layer smaller.
    const qualityScale = tier === "high" ? 0.5 : 0.7;

    let w = (canvas.width = Math.max(1, Math.round(canvas.offsetWidth * qualityScale)));
    let h = (canvas.height = Math.max(1, Math.round(canvas.offsetHeight * qualityScale)));

    const handleResize = () => {
      w = canvas.width = Math.max(1, Math.round(canvas.offsetWidth * qualityScale));
      h = canvas.height = Math.max(1, Math.round(canvas.offsetHeight * qualityScale));
    };

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = 1 - e.clientY / window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouse);

    const unsub = audioEngine?.subscribe((a) => {
      audioRef.current = a;
    });
    if (audioEngine) audioRef.current = { ...audioEngine.analysis };

    // Simple fluid noise using canvas 2D — metaballs + gradients reacting to audio
    const blobs = [
      { x: 0.3, y: 0.4, r: 0.25, color: [255, 90, 31] }, // fire
      { x: 0.7, y: 0.6, r: 0.3, color: [255, 46, 147] }, // magenta
      { x: 0.5, y: 0.2, r: 0.2, color: [200, 255, 0] }, // lime
    ];

    const draw = () => {
      if (!isVisibleRef.current) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const { bass, mid, high, beat } = audioRef.current;

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
        const r =
          blob.r * Math.min(w, h) * (1 + bass * 0.8 + beat * 0.5) * (tier === "medium" ? 0.8 : 1);

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
      const vignette = ctx.createRadialGradient(
        w / 2,
        h / 2,
        0,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.8
      );
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
      unsub?.();
    };
    // isVisible intentionally read via ref — re-running this effect would
    // reallocate the canvas on every scroll into/out of view
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]);

  if (tier === "low") return null;

  return (
    <div ref={ref as any} className="absolute inset-0">
      <canvas ref={canvasRef} className="h-full w-full" style={{ width: "100%", height: "100%" }} />
      {/* Overlay gradient for text legibility */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,_transparent_40%,_rgba(7,7,10,0.6)_80%)]" />
    </div>
  );
}

// Three.js version placeholder for Phase 1.5 - dynamic import
// This canvas 2D version is performant and already audio-reactive
// In High tier we can swap to R3F shader with postprocessing (bloom, chromatic)
