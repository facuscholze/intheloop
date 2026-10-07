"use client";

import { useRef, useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { audioEngine } from "@/lib/audio-engine";
import { useUIStore } from "@/stores/uiStore";
import { useQualityStore } from "@/stores/qualityStore";
import { useIntersectionPause } from "@/hooks/useIntersectionPause";

interface MarqueeProps {
  text: string;
  speed?: number;
  className?: string;
}

export function Marquee({ text, speed = 1, className = "" }: MarqueeProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  // Audio read inside the animation loop — the old version had bpm/beat in
  // the effect deps and restarted the rAF loop on EVERY audio frame.
  const audioRef = useRef({ bpm: 124, beat: 0 });
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const tier = useQualityStore((s) => s.tier);
  const [isPaused, setIsPaused] = useState(false);
  const { ref: visRef, isVisible } = useIntersectionPause<HTMLDivElement>();
  const scrollVelocityRef = useRef(0);
  const lastScrollY = useRef(0);
  const xRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Merge the intersection observer ref with our own container ref
  const setContainerRef = (el: HTMLDivElement | null) => {
    (visRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };

  useEffect(() => {
    const unsub = audioEngine?.subscribe((a) => {
      audioRef.current.bpm = a.bpm;
      audioRef.current.beat = a.beat;
    });
    if (audioEngine)
      audioRef.current = { bpm: audioEngine.analysis.bpm, beat: audioEngine.analysis.beat };
    return unsub;
  }, []);

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
    // Seamless loop: reset by the real advance of ONE copy (offsetLeft of the
    // next sibling accounts for margins). The old code snapped at an
    // arbitrary -1000px, which made the text visibly jump.
    const copyWidth = () => {
      const a = content.children[0] as HTMLElement | undefined;
      const b = content.children[1] as HTMLElement | undefined;
      if (a && b) return b.offsetLeft - a.offsetLeft;
      return a?.offsetWidth || 1000;
    };

    const animate = (now: number) => {
      const delta = Math.min(now - lastTime, 50);
      lastTime = now;

      const { bpm, beat } = audioRef.current;
      const bpmFactor = bpm / 124;
      const scrollInfluence = Math.abs(scrollVelocityRef.current) * 0.05;
      const beatPulse = beat * 3;
      const currentSpeed = (speed * bpmFactor + scrollInfluence + beatPulse) * (delta / 16);

      xRef.current -= currentSpeed;
      const w = copyWidth();
      if (xRef.current <= -w) xRef.current += w;

      content.style.transform = `translate3d(${xRef.current}px, 0, 0)`;

      scrollVelocityRef.current *= 0.95;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed, reducedMotion, isPaused, isVisible, tier]);

  if (reducedMotion) {
    return (
      <div
        className={`overflow-hidden border-y border-[var(--border)] bg-[var(--bg)] py-3 ${className}`}
        role="marquee"
        aria-label={text}
      >
        <div className="flex justify-center whitespace-nowrap">
          <span className="mx-8 flex items-center gap-8 font-mono text-xs tracking-[0.3em] text-[var(--fg-dim)] uppercase">
            <span className="text-[var(--accent-fire)]" aria-hidden="true">
              ✦
            </span>
            {text}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setContainerRef}
      className={`group relative overflow-hidden border-y border-[var(--border)] bg-[var(--bg)] py-3 ${className}`}
      role="marquee"
      aria-label={text}
    >
      <div ref={contentRef} className="flex whitespace-nowrap will-change-transform">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="mx-8 flex items-center gap-8 font-mono text-xs tracking-[0.3em] text-[var(--fg-dim)] uppercase"
          >
            <span className="text-[var(--accent-fire)]" aria-hidden="true">
              ✦
            </span>
            {text}
          </span>
        ))}
      </div>
      {/* Pause control - visible on hover/focus */}
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--bg-2)] opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 md:h-7 md:w-7"
        aria-label={isPaused ? "Reanudar animación" : "Pausar animación"}
        aria-pressed={isPaused}
      >
        {isPaused ? (
          <Play className="h-3 w-3" aria-hidden="true" />
        ) : (
          <Pause className="h-3 w-3" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export function MarqueeGiant({ text }: { text: string }) {
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const [isPaused, setIsPaused] = useState(false);
  const { ref: containerRef, isVisible } = useIntersectionPause<HTMLDivElement>();

  if (reducedMotion) {
    return (
      <div
        className="relative overflow-hidden border-y border-[var(--border)] bg-[var(--bg-2)] py-6"
        role="marquee"
        aria-label={text}
      >
        <div className="flex justify-center whitespace-nowrap">
          <span
            className="font-display mx-8 text-[clamp(40px,10vw,104px)] leading-none font-bold tracking-tight text-transparent uppercase"
            style={{ WebkitTextStroke: "1px var(--border-strong)" }}
          >
            {text}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="group relative overflow-hidden border-y border-[var(--border)] bg-[var(--bg-2)] py-6"
      role="marquee"
      aria-label={text}
    >
      <div
        className={`flex whitespace-nowrap ${!isPaused && isVisible ? "animate-marquee-slow" : ""}`}
        style={{ animationPlayState: isPaused || !isVisible ? "paused" : "running" }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="font-display mx-8 text-[clamp(40px,10vw,104px)] leading-none font-bold tracking-tight text-transparent uppercase"
            style={{ WebkitTextStroke: "1px var(--border-strong)" }}
          >
            {text}
          </span>
        ))}
      </div>
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="absolute top-1/2 right-4 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--bg)] opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100"
        aria-label={isPaused ? "Reanudar animación" : "Pausar animación"}
        aria-pressed={isPaused}
      >
        {isPaused ? (
          <Play className="h-3 w-3" aria-hidden="true" />
        ) : (
          <Pause className="h-3 w-3" aria-hidden="true" />
        )}
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
