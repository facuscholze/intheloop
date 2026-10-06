"use client";

import { useRef, useEffect, useState } from "react";
import { usePlayerStore } from "@/stores/playerStore";
import { useAudioReactive } from "@/hooks/useAudioReactive";
import { gsap } from "@/lib/motion";

interface VinylProps {
  size?: number;
  interactive?: boolean;
  cover?: string | null;
}

export function Vinyl({ size = 48, interactive = true, cover }: VinylProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const progress = usePlayerStore((s) => s.progress);
  const { bass, beat } = useAudioReactive();
  const [isDragging, setIsDragging] = useState(false);
  const rotationRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Continuous rotation based on progress and playing
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const animate = () => {
      if (!isDragging) {
        if (isPlaying) {
          rotationRef.current += 0.5 + bass * 1.5; // faster with bass
        }
        // Add progress-based rotation too
        const progressRotation = progress * 360 * 2; // 2 full rotations per track
        el.style.transform = `rotate(${rotationRef.current + progressRotation}deg) scale(${1 + beat * 0.05})`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, progress, bass, beat, isDragging]);

  // Draggable scratch
  useEffect(() => {
    if (!interactive || !ref.current) return;

    const el = ref.current;
    let startAngle = 0;
    let startRotation = 0;

    const getAngle = (e: MouseEvent | TouchEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      setIsDragging(true);
      startAngle = getAngle(e);
      startRotation = rotationRef.current;
      gsap.to(el, { scale: 1.1, duration: 0.2, ease: "power2.out" });
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const currentAngle = getAngle(e);
      const delta = currentAngle - startAngle;
      rotationRef.current = startRotation + delta;

      // Scratch effect - manipulate audio currentTime based on drag
      const audio = document.querySelector("audio") as HTMLAudioElement;
      if (audio && audio.duration) {
        const scratchDelta = delta / 360;
        const newTime = Math.max(0, Math.min(audio.duration, audio.currentTime + scratchDelta * 2));
        // Only scratch when dragging fast
        if (Math.abs(delta) > 5) {
          audio.currentTime = newTime;
        }
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      if (el) gsap.to(el, { scale: 1, duration: 0.4, ease: "elastic.out(1,0.5)" });
    };

    el.addEventListener("mousedown", handleStart as any);
    window.addEventListener("mousemove", handleMove as any);
    window.addEventListener("mouseup", handleEnd);
    el.addEventListener("touchstart", handleStart as any, { passive: false });
    window.addEventListener("touchmove", handleMove as any, { passive: false });
    window.addEventListener("touchend", handleEnd);

    return () => {
      el.removeEventListener("mousedown", handleStart as any);
      window.removeEventListener("mousemove", handleMove as any);
      window.removeEventListener("mouseup", handleEnd);
      el.removeEventListener("touchstart", handleStart as any);
      window.removeEventListener("touchmove", handleMove as any);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [interactive, isDragging]);

  return (
    <div
      ref={ref}
      className="relative select-none rounded-full will-change-transform"
      style={{ width: size, height: size }}
      data-cursor="drag"
    >
      {/* Vinyl record */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-800 to-black shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)]">
        {/* Grooves */}
        <div className="absolute inset-[4px] rounded-full border border-white/[0.05]" />
        <div className="absolute inset-[8px] rounded-full border border-white/[0.03]" />
        <div className="absolute inset-[12px] rounded-full border border-white/[0.05]" />
        <div className="absolute inset-[16px] rounded-full border border-white/[0.02]" />

        {/* Label */}
        <div
          className="absolute left-1/2 top-1/2 flex h-[45%] w-[45%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-black/50"
          style={{
            background: cover
              ? `url(${cover}) center/cover`
              : `radial-gradient(circle, var(--accent-fire) 0%, var(--accent-magenta) 100%)`,
          }}
        >
          <div className="h-2 w-2 rounded-full bg-black shadow-[0_0_0_2px_rgba(255,255,255,0.2)]" />
        </div>

        {/* Shine */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent" />

        {/* Bass reactive glow */}
        <div
          className="absolute inset-0 rounded-full transition-opacity"
          style={{
            background: `radial-gradient(circle, rgba(255,90,31,${bass * 0.3}) 0%, transparent 70%)`,
            opacity: isPlaying ? 1 : 0,
          }}
        />
      </div>

      {/* Beat pulse ring */}
      {isPlaying && (
        <div
          className="pointer-events-none absolute inset-0 rounded-full border border-[var(--accent-fire)]"
          style={{
            transform: `scale(${1 + beat * 0.3})`,
            opacity: beat * 0.6,
            transition: "transform 0.1s linear, opacity 0.1s linear",
          }}
        />
      )}
    </div>
  );
}
