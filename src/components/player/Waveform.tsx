"use client";

import { useRef, useEffect, useState } from "react";
import { usePlayerStore } from "@/stores/playerStore";
import { useAudioReactive } from "@/hooks/useAudioReactive";

interface WaveformProps {
  peaks?: number[] | null;
  progress: number;
  onSeek: (progress: number) => void;
  color?: string;
  height?: number;
}

export function Waveform({ peaks, progress, onSeek, color = "var(--accent-fire)", height = 48 }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { bass, beat } = useAudioReactive();
  const [isDragging, setIsDragging] = useState(false);

  // Generate fallback peaks if none
  const displayPeaks = peaks && peaks.length > 0 ? peaks : Array.from({ length: 80 }, () => 0.3 + Math.random() * 0.7);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

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

      // Gradient based on position and audio
      if (isPlayed) {
        ctx.fillStyle = color;
        // Glow on beat for played bars
        if (beat > 0.7 && isPlayed) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 10 * beat;
        } else {
          ctx.shadowBlur = 0;
        }
      } else {
        ctx.fillStyle = "rgba(245,243,239,0.15)";
        ctx.shadowBlur = 0;
      }

      // Rounded bars
      ctx.beginPath();
      ctx.roundRect(x + gap / 2, y, barWidth - gap, barHeight, 2);
      ctx.fill();
    });

    ctx.shadowBlur = 0;
  }, [displayPeaks, progress, bass, beat, color]);

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
  const displayPeaks = peaks && peaks.length > 0 ? peaks.slice(0, 40) : Array.from({ length: 40 }, () => 0.3 + Math.random() * 0.7);

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
