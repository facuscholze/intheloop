"use client";

import { useRef, useEffect } from "react";
import { usePlayerStore } from "@/stores/playerStore";
import { audioEngine, type AudioAnalysis } from "@/lib/audio-engine";
import { gsap } from "@/lib/motion";

interface VinylProps {
  size?: number;
  interactive?: boolean;
  cover?: string | null;
}

export function Vinyl({ size = 48, interactive = true, cover }: VinylProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isDraggingRef = useRef(false);
  const rotationRef = useRef(0);
  const rafRef = useRef<number>(0);
  // Audio values read inside the loop (deps never include them — the old
  // version cancelled + restarted this rAF on every audio frame)
  const audioRef = useRef<AudioAnalysis>({ bass: 0, mid: 0, high: 0, level: 0, beat: 0, bpm: 124 });

  // Continuous rotation based on progress and playing
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const unsub = audioEngine?.subscribe((a) => {
      audioRef.current = a;
    });
    if (audioEngine) audioRef.current = { ...audioEngine.analysis };

    const animate = () => {
      if (!isDraggingRef.current) {
        const { isPlaying, progress } = usePlayerStore.getState();
        const { bass, beat } = audioRef.current;
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
    return () => {
      cancelAnimationFrame(rafRef.current);
      unsub?.();
    };
  }, []);

  // Draggable scratch — listeners bound ONCE (the old version re-bound them
  // on every isDragging toggle, mid-drag)
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
      isDraggingRef.current = true;
      startAngle = getAngle(e);
      startRotation = rotationRef.current;
      gsap.to(el, { scale: 1.1, duration: 0.2, ease: "power2.out", overwrite: "auto" });
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      if ("cancelable" in e && e.cancelable) e.preventDefault(); // don't scroll while scratching
      const currentAngle = getAngle(e);
      const delta = currentAngle - startAngle;
      rotationRef.current = startRotation + delta;

      // Scratch effect - manipulate audio currentTime based on drag
      const audio = document.querySelector("audio") as HTMLAudioElement | null;
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
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      gsap.to(el, { scale: 1, duration: 0.4, ease: "elastic.out(1,0.5)", overwrite: "auto" });
    };

    el.addEventListener("mousedown", handleStart as EventListener);
    window.addEventListener("mousemove", handleMove as EventListener);
    window.addEventListener("mouseup", handleEnd);
    el.addEventListener("touchstart", handleStart as EventListener, { passive: false });
    window.addEventListener("touchmove", handleMove as EventListener, { passive: false });
    window.addEventListener("touchend", handleEnd);

    return () => {
      el.removeEventListener("mousedown", handleStart as EventListener);
      window.removeEventListener("mousemove", handleMove as EventListener);
      window.removeEventListener("mouseup", handleEnd);
      el.removeEventListener("touchstart", handleStart as EventListener);
      window.removeEventListener("touchmove", handleMove as EventListener);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [interactive]);

  return (
    <div
      ref={ref}
      className="relative rounded-full will-change-transform select-none"
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
          className="absolute top-1/2 left-1/2 flex h-[45%] w-[45%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-black/50"
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

        {/* Bass reactive glow — CSS-var driven */}
        <div
          className="absolute inset-0 rounded-full transition-opacity"
          style={{
            background: `radial-gradient(circle, rgba(255,90,31, calc(var(--bass) * 0.3)) 0%, transparent 70%)`,
            opacity: isPlaying ? 1 : 0,
          }}
          aria-hidden="true"
        />
      </div>

      {/* Beat pulse ring — CSS-var driven (only while playing) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full border border-[var(--accent-fire)]"
        style={{
          transform: "scale(calc(1 + var(--beat) * 0.3))",
          opacity: isPlaying ? "calc(var(--beat) * 0.6)" : 0,
          transition: "transform 0.1s linear, opacity 0.1s linear",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
