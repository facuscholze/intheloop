"use client";

import { memo, useRef, useEffect } from "react";
import { gsap } from "@/lib/motion";
import { getMediaUrl } from "@/lib/media";
import type { Show } from "@/lib/content";

interface ShowRowProps {
  show: Show;
  onHover: (show: Show | null) => void;
}

export const ShowRow = memo(function ShowRow({ show, onHover }: ShowRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (rowRef.current) onHover(show);
  };

  const handleMouseLeave = () => onHover(null);

  return (
    <div
      ref={rowRef}
      className="group relative flex items-center justify-between border-b border-[var(--border)] py-6 transition-all duration-300 hover:bg-[var(--bg)] hover:px-4 md:py-8"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-6">
        <div className="flex items-center gap-3">
          {/* Sin pulso al beat: todas las filas "saltaban" a la vez en cada
              golpe y la lista entera parecía parpadear */}
          <div className="font-display text-2xl font-bold tracking-tight uppercase transition-colors group-hover:text-[var(--accent-fire)] md:text-3xl">
            {show.venue}
          </div>
          {show.featured && (
            <span className="rounded-full bg-[var(--accent-fire)] px-2 py-0.5 font-mono text-[9px] font-bold text-black uppercase">
              Featured
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase">
          {/* needsReview es interno: nunca se renderiza en la UI pública */}
          <span className="text-[var(--fg-muted)]">
            {[show.city, show.country].filter(Boolean).join(" ")} • {show.date}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden font-mono text-[10px] tracking-widest text-[var(--fg-dim)] uppercase group-hover:text-[var(--accent-fire)] md:block">
          {show.galleryUrl ? "Gallery →" : show.instagram ? "IG →" : "→"}
        </div>
        <div
          className="h-2 w-2 rounded-full bg-[var(--border)] transition-colors group-hover:bg-[var(--accent-fire)]"
          style={{
            boxShadow: `0 0 calc(var(--bass) * 10px) var(--accent-fire)`,
          }}
        />
      </div>

      {/* Hover accent line */}
      <div className="absolute bottom-0 left-0 h-px w-0 bg-[var(--accent-fire)] transition-all duration-500 group-hover:w-full" />
    </div>
  );
});

export function FloatingPhoto({ show }: { show: Show | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const photoUrl = show ? getMediaUrl(show.photo) : null;

  // Track the pointer locally (rAF-throttled) instead of pushing every
  // mousemove through React state in the parent list.
  useEffect(() => {
    if (!show || !ref.current) return;
    const el = ref.current;
    let targetX = -500;
    let targetY = -500;
    let raf = 0;
    let queued = false;

    // Cached tweens — one per hover instead of spawning new GSAP tweens
    // on every mousemove event
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });

    const apply = () => {
      queued = false;
      xTo(targetX + 20);
      yTo(targetY - 100);
    };

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!queued) {
        queued = true;
        raf = requestAnimationFrame(apply);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed top-0 left-0 z-30 hidden h-48 w-64 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] shadow-2xl md:block"
      style={{ transform: "translate(0,0)" }}
    >
      <div className="relative h-full w-full">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={show.venue} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[var(--accent-fire)]/30 to-[var(--accent-gold)]/20 p-4 text-center">
            <div className="font-display text-xl font-bold">{show.venue}</div>
            <div className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase">
              {[show.city, show.country].filter(Boolean).join(" • ")}
            </div>
          </div>
        )}

        {/* Distortion overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-fire)]/10 via-transparent to-[var(--accent-magenta)]/10 mix-blend-overlay" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="font-mono text-[10px] tracking-widest text-white/80 uppercase">
          {[show.date, show.city].filter(Boolean).join(" • ")}
        </div>
      </div>
    </div>
  );
}
