"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { usePlayerStore } from "@/stores/playerStore";
import { audioEngine, type AudioAnalysis } from "@/lib/audio-engine";

interface WaveformProps {
  peaks?: number[] | null;
  progress: number;
  onSeek: (progress: number) => void;
  color?: string;
  height?: number;
}

/** Stable fallback peaks (Math.random() per render made the bars flicker). */
function makeFallbackPeaks(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const s = Math.sin(i * 12.9898) * 43758.5453;
    return 0.3 + (s - Math.floor(s)) * 0.6;
  });
}
const FALLBACK_80 = makeFallbackPeaks(80);
const FALLBACK_40 = makeFallbackPeaks(40);

export function Waveform({
  peaks,
  progress,
  onSeek,
  color = "var(--accent-fire)",
  height = 48,
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const audioRef = useRef<AudioAnalysis>({ bass: 0, mid: 0, high: 0, level: 0, beat: 0, bpm: 124 });

  // Stable identity across renders
  const displayPeaks = useMemo(() => (peaks && peaks.length > 0 ? peaks : FALLBACK_80), [peaks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const unsub = audioEngine?.subscribe((a) => {
      audioRef.current = a;
    });
    if (audioEngine) audioRef.current = { ...audioEngine.analysis };

    const draw = () => {
      const { bass, beat } = audioRef.current;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.max(1, Math.round(rect.width * dpr));
      const targetH = Math.max(1, Math.round(rect.height * dpr));
      // Only resize when needed: assigning canvas.width resets the bitmap
      // AND the transform state on every single redraw otherwise
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = rect.width;
      const h = rect.height;
      const barWidth = w / displayPeaks.length;
      const gap = 1;

      ctx.clearRect(0, 0, w, h);

      displayPeaks.forEach((peak, i) => {
        const x = i * barWidth;
        const barHeight = peak * h * (0.6 + bass * 0.4 + (i % 8 === 0 ? beat * 0.5 : 0));
        const y = (h - barHeight) / 2;

        const isPlayed = i / displayPeaks.length <= progress;

        if (isPlayed) {
          ctx.fillStyle = color;
          if (beat > 0.7) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 10 * beat;
          } else {
            ctx.shadowBlur = 0;
          }
        } else {
          ctx.fillStyle = "rgba(245,243,239,0.15)";
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.roundRect(x + gap / 2, y, barWidth - gap, barHeight, 2);
        ctx.fill();
      });

      ctx.shadowBlur = 0;
    };

    draw();
    const interval = setInterval(draw, 66); // ~15fps redraw is plenty for a waveform
    return () => {
      clearInterval(interval);
      unsub?.();
    };
  }, [displayPeaks, progress, color]);

  const handleSeek = (e: React.MouseEvent | React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const x = clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, x / rect.width));
    onSeek(newProgress);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSeek(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleSeek(e);
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      ref={containerRef}
      className="relative w-full cursor-pointer select-none"
      style={{ height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleSeek}
      onTouchMove={handleSeek}
      data-cursor="drag"
    >
      <canvas ref={canvasRef} className="h-full w-full" style={{ width: "100%", height: "100%" }} />

      {/* Progress indicator */}
      <div
        className="pointer-events-none absolute top-0 h-full w-0.5 bg-[var(--fg)] mix-blend-difference"
        style={{ left: `${progress * 100}%` }}
      />

      {/* Hover time tooltip could go here */}
    </div>
  );
}

export function MiniWaveform({ peaks, progress }: { peaks?: number[] | null; progress: number }) {
  const displayPeaks = peaks && peaks.length > 0 ? peaks.slice(0, 40) : FALLBACK_40;

  return (
    <div className="flex h-8 items-end gap-[1px]">
      {displayPeaks.map((p, i) => {
        const isPlayed = i / displayPeaks.length <= progress;
        return (
          <div
            key={i}
            className="w-[2px] rounded-full transition-colors"
            style={{
              height: `${p * 100}%`,
              background: isPlayed ? "var(--accent-fire)" : "rgba(245,243,239,0.2)",
              opacity: isPlayed ? 1 : 0.5,
            }}
          />
        );
      })}
    </div>
  );
}
