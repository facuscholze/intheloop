"use client";

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/motion";
import { getMediaUrl } from "@/lib/media";
import { useAudioReactive } from "@/hooks/useAudioReactive";
import type { Show } from "@/lib/content";

interface ShowRowProps {
  show: Show;
  onHover: (show: Show | null, element: HTMLElement | null) => void;
}

export function ShowRow({ show, onHover }: ShowRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const { bass, beat } = useAudioReactive();

  const handleMouseEnter = () => {
    if (rowRef.current) onHover(show, rowRef.current);
  };

  const handleMouseLeave = () => onHover(null, null);

  return (
    <div
      ref={rowRef}
      className="group relative flex items-center justify-between border-b border-[var(--border)] py-6 transition-all duration-300 hover:bg-[var(--bg)] hover:px-4 md:py-8"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-cursor="view"
    >
      <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-6">
        <div className="flex items-center gap-3">
          <div
            className="font-display text-2xl font-bold uppercase tracking-tight transition-colors group-hover:text-[var(--accent-fire)] md:text-3xl"
            style={{
              transform: `scale(${1 + (beat > 0.8 ? beat * 0.02 : 0)})`,
            }}
          >
            {show.venue}
          </div>
          {show.featured && (
            <span className="rounded-full bg-[var(--accent-fire)] px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-black">Featured</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase">
          <span className="text-[var(--fg-muted)]">
            {show.city} {show.country} • {show.date}
          </span>
          {show.needsReview && (
            <span className="rounded-full bg-[var(--accent-gold)]/20 px-2 py-0.5 text-[9px] text-[var(--accent-gold)]">⚠️ {show.needsReview}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)] group-hover:text-[var(--accent-fire)] md:block">
          {show.galleryUrl ? "Gallery →" : show.instagram ? "IG →" : "→"}
        </div>
        <div
          className="h-2 w-2 rounded-full bg-[var(--border)] transition-colors group-hover:bg-[var(--accent-fire)]"
          style={{
            boxShadow: `0 0 ${bass * 10}px var(--accent-fire)`,
          }}
        />
      </div>

      {/* Hover accent line */}
      <div className="absolute bottom-0 left-0 h-px w-0 bg-[var(--accent-fire)] transition-all duration-500 group-hover:w-full" />
    </div>
  );
}

export function FloatingPhoto({ show, mousePos }: { show: Show | null; mousePos: { x: number; y: number } }) {
  const ref = useRef<HTMLDivElement>(null);
  const photoUrl = show ? getMediaUrl(show.photo) : null;

  useEffect(() => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      x: mousePos.x + 20,
      y: mousePos.y - 100,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto",
    });
  }, [mousePos]);

  if (!show) return null;

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 z-30 hidden h-48 w-64 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] shadow-2xl md:block"
      style={{ transform: "translate(0,0)" }}
    >
      <div className="relative h-full w-full">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={show.venue} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[var(--accent-fire)]/30 to-[var(--accent-gold)]/20 p-4 text-center">
            <div className="font-display text-xl font-bold">{show.venue}</div>
            <div className="font-mono text-[10px] uppercase text-[var(--fg-muted)]">
              {show.city} • {show.country}
            </div>
            <div className="mt-2 text-[10px] text-[var(--fg-dim)]">Foto en media-src/images/shows/{show.id}.jpg</div>
          </div>
        )}

        {/* Distortion overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-fire)]/10 via-transparent to-[var(--accent-magenta)]/10 mix-blend-overlay" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      </div>

      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="font-mono text-[10px] uppercase text-white/80">
          {show.date} • {show.city}
        </div>
      </div>
    </div>
  );
}
