"use client";

import { useRef, useEffect } from "react";
import { useAudioReactive } from "@/hooks/useAudioReactive";

interface MarqueeProps {
  text: string;
  speed?: number;
  className?: string;
}

export function Marquee({ text, speed = 1, className = "" }: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { bpm, beat } = useAudioReactive();
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
  }, [bpm, beat, speed]);

  return (
    <div ref={containerRef} className={`overflow-hidden border-y border-[var(--border)] bg-[var(--bg)] py-3 ${className}`}>
      <div ref={contentRef} className="flex whitespace-nowrap will-change-transform">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="mx-8 flex items-center gap-8 font-mono text-xs uppercase tracking-[0.3em] text-[var(--fg-dim)]">
            <span className="text-[var(--accent-fire)]">✦</span>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MarqueeGiant({ text }: { text: string }) {
  return (
    <div className="relative overflow-hidden border-y border-[var(--border)] bg-[var(--bg-2)] py-6">
      <div className="animate-marquee-slow flex whitespace-nowrap">
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
      <style>{`
        @keyframes marqueeSlow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
          animation: marqueeSlow 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
