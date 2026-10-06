"use client";

import { useRef, useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useAudioReactive } from "@/hooks/useAudioReactive";
import { useUIStore } from "@/stores/uiStore";
import { useQualityStore } from "@/stores/qualityStore";
import { useIntersectionPause } from "@/hooks/useIntersectionPause";

interface MarqueeProps {
  text: string;
  speed?: number;
  className?: string;
}

export function Marquee({ text, speed = 1, className = "" }: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { bpm, beat } = useAudioReactive();
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const tier = useQualityStore((s) => s.tier);
  const [isPaused, setIsPaused] = useState(false);
  const isVisible = useIntersectionPause(containerRef as any);
  const scrollVelocityRef = useRef(0);
  const lastScrollY = useRef(0);
  const xRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      scrollVelocityRef.current = currentY - lastScrollY.current;
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (reducedMotion || isPaused || !isVisible || tier === "low") return;

    const content = contentRef.current;
    if (!content) return;

    let lastTime = performance.now();

    const animate = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      const bpmFactor = bpm / 124;
      const scrollInfluence = Math.abs(scrollVelocityRef.current) * 0.05;
      const beatPulse = beat * 3;
      const currentSpeed = (speed * bpmFactor + scrollInfluence + beatPulse) * (delta / 16);

      xRef.current -= currentSpeed;
      if (xRef.current <= -1000) xRef.current = 0;

      if (content) {
        content.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
      }

      scrollVelocityRef.current *= 0.95;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [bpm, beat, speed, reducedMotion, isPaused, isVisible, tier]);

  if (reducedMotion) {
    return (
      <div className={`overflow-hidden border-y border-[var(--border)] bg-[var(--bg)] py-3 ${className}`} role="marquee" aria-label={text}>
        <div className="flex justify-center whitespace-nowrap">
          <span className="mx-8 flex items-center gap-8 font-mono text-xs uppercase tracking-[0.3em] text-[var(--fg-dim)]">
            <span className="text-[var(--accent-fire)]" aria-hidden="true">✦</span>
            {text}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`group relative overflow-hidden border-y border-[var(--border)] bg-[var(--bg)] py-3 ${className}`} role="marquee" aria-label={text}>
      <div ref={contentRef} className="flex whitespace-nowrap will-change-transform">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="mx-8 flex items-center gap-8 font-mono text-xs uppercase tracking-[0.3em] text-[var(--fg-dim)]">
            <span className="text-[var(--accent-fire)]" aria-hidden="true">✦</span>
            {text}
          </span>
        ))}
      </div>
      {/* Pause control - visible on hover/focus */}
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--bg-2)] opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 md:h-7 md:w-7"
        aria-label={isPaused ? "Reanudar animación" : "Pausar animación"}
        aria-pressed={isPaused}
      >
        {isPaused ? <Play className="h-3 w-3" aria-hidden="true" /> : <Pause className="h-3 w-3" aria-hidden="true" />}
      </button>
    </div>
  );
}

export function MarqueeGiant({ text }: { text: string }) {
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionPause(containerRef as any);

  if (reducedMotion) {
    return (
      <div className="relative overflow-hidden border-y border-[var(--border)] bg-[var(--bg-2)] py-6" role="marquee" aria-label={text}>
        <div className="flex justify-center whitespace-nowrap">
          <span
            className="mx-8 font-display text-[clamp(32px,8vw,80px)] font-bold uppercase leading-none tracking-tight text-transparent"
            style={{ WebkitTextStroke: "1px var(--border-strong)" }}
          >
            {text}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="group relative overflow-hidden border-y border-[var(--border)] bg-[var(--bg-2)] py-6" role="marquee" aria-label={text}>
      <div className={`flex whitespace-nowrap ${!isPaused && isVisible ? "animate-marquee-slow" : ""}`} style={{ animationPlayState: isPaused || !isVisible ? "paused" : "running" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="mx-8 font-display text-[clamp(32px,8vw,80px)] font-bold uppercase leading-none tracking-tight text-transparent"
            style={{ WebkitTextStroke: "1px var(--border-strong)" }}
          >
            {text}
          </span>
        ))}
      </div>
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--bg)] opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
        aria-label={isPaused ? "Reanudar animación" : "Pausar animación"}
        aria-pressed={isPaused}
      >
        {isPaused ? <Play className="h-3 w-3" aria-hidden="true" /> : <Pause className="h-3 w-3" aria-hidden="true" />}
      </button>
      <style>{`
        @keyframes marqueeSlow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
          animation: marqueeSlow 40s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee-slow {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
