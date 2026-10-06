"use client";

import { memo, useRef, useEffect, useState, useCallback, KeyboardEvent } from "react";
import { Play } from "lucide-react";
import { useVideoStore } from "@/stores/videoStore";
import { useIntersectionPause } from "@/hooks/useIntersectionPause";
import { getMediaUrl } from "@/lib/media";
import { useUIStore } from "@/stores/uiStore";
import type { Video } from "@/lib/content";

interface VideoCardProps {
  video: Video;
}

export const VideoCard = memo(function VideoCard({ video }: VideoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const { ref: intersectionRef, isVisible } = useIntersectionPause<HTMLDivElement>();
  const openVideo = useVideoStore((s) => s.openVideo);
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const [isHovered, setIsHovered] = useState(false);
  const [mouseX, setMouseX] = useState(0.5);
  const scrubRaf = useRef(0);
  const pendingX = useRef<number | null>(null);

  const posterUrl = getMediaUrl(video.poster);
  const previewSrc = getMediaUrl(video.previewSrc) || getMediaUrl(video.src);
  const isYoutube = !!video.youtubeId;

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    if (!previewSrc || isYoutube) return;
    if (reducedMotion) return;

    if (isVisible && isHovered) {
      preview.play().catch(() => {});
    } else {
      preview.pause();
    }
  }, [isVisible, isHovered, previewSrc, isYoutube, reducedMotion]);

  // Scrub: rAF-throttled — the old code set currentTime + React state on
  // EVERY mousemove event (seek thrash + re-renders at event rate)
  useEffect(() => () => cancelAnimationFrame(scrubRaf.current), []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    pendingX.current = x;

    if (scrubRaf.current) return;
    scrubRaf.current = requestAnimationFrame(() => {
      scrubRaf.current = 0;
      const px = pendingX.current;
      if (px == null) return;
      setMouseX(px);

      const preview = previewRef.current;
      if (preview && preview.duration) {
        preview.currentTime = px * preview.duration;
      }
    });
  };

  const handleClick = useCallback(() => {
    if (!cardRef.current) return;
    openVideo(video, cardRef.current);
  }, [openVideo, video]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      ref={(el) => {
        (cardRef as any).current = el;
        (intersectionRef as any).current = el;
      }}
      className="group relative aspect-video cursor-pointer overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--bg-2)] transition-all duration-500 hover:border-[var(--accent-magenta)] hover:shadow-[0_0_40px_rgba(255,46,147,0.15)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-cursor="view"
      role="button"
      tabIndex={0}
      aria-label={`Ver video ${video.title} en modo cine - ${video.venue} ${video.date}`}
      style={{
        // CSS-var driven: no audio-rate re-renders
        transform: !reducedMotion && isHovered ? "scale(calc(1 + var(--bass) * 0.02))" : "scale(1)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at calc(${mouseX * 100}% ) 50%, ${video.colorAccent || "var(--accent-magenta)"}30, transparent 70%), linear-gradient(135deg, var(--bg-2), var(--bg))`,
        }}
        aria-hidden="true"
      />

      {isYoutube ? (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
            alt={`Miniatura del video ${video.title}`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            decoding="async"
          />
          <div
            className="absolute inset-0 bg-black/20 group-hover:bg-black/10"
            aria-hidden="true"
          />
        </div>
      ) : previewSrc ? (
        <video
          ref={previewRef}
          src={previewSrc}
          poster={posterUrl || undefined}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{
            filter:
              !reducedMotion && isHovered
                ? "hue-rotate(calc(var(--bass) * 20deg)) contrast(calc(1 + var(--bass) * 0.2))"
                : undefined,
          }}
          aria-label={`Preview del video ${video.title}`}
        />
      ) : (
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-magenta)]/20 via-[var(--bg-2)] to-[var(--accent-fire)]/20" />
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background: `radial-gradient(circle at calc(${mouseX * 100}%) 50%, ${video.colorAccent}40, transparent 50%)`,
            }}
          />
          <div className="absolute right-0 bottom-0 left-0 flex h-12 items-end gap-[2px] p-3 opacity-60">
            {Array.from({ length: 40 }).map((_, i) => {
              // Deterministic pseudo-random height (Math.random() here made
              // the bars jump around on every render)
              const r = (Math.sin(i * 12.9898 + video.id.length * 7.13) * 43758.5453) % 1;
              const h = 20 + Math.sin(i * 0.5 + mouseX * 10) * 30 + Math.abs(r) * 20;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-full bg-white/30"
                  style={{
                    height: `${h}%`,
                    transform: "scaleY(calc(1 + var(--beat) * 0.5))",
                  }}
                  aria-hidden="true"
                />
              );
            })}
          </div>
        </div>
      )}

      {!reducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='distort'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02' numOctaves='3'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23distort)'/%3E%3C/svg%3E")`,
            mixBlendMode: "overlay",
          }}
          aria-hidden="true"
        />
      )}

      <div className="absolute inset-0 flex flex-col justify-between p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] tracking-widest text-white uppercase backdrop-blur">
              {isYoutube ? "YouTube" : "Live"} • {video.date}
            </div>
            {isHovered && (
              <div
                className="hidden rounded-full bg-[var(--accent-magenta)] px-2 py-1 font-mono text-[9px] font-bold text-black uppercase md:block"
                aria-hidden="true"
              >
                Scrub ← → {Math.round(mouseX * 100)}%
              </div>
            )}
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-transform group-hover:scale-110 group-hover:bg-[var(--accent-magenta)] group-hover:text-black md:h-8 md:w-8"
            style={{
              transform:
                !reducedMotion && isHovered ? "scale(calc(1 + var(--beat) * 0.2))" : undefined,
            }}
            aria-hidden="true"
          >
            <Play className="ml-0.5 h-4 w-4" />
          </div>
        </div>

        <div>
          <div className="font-display text-xl leading-tight font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {video.title}
          </div>
          <div className="font-mono text-xs tracking-widest text-white/70 uppercase">
            {video.venue} • {video.date} • Modo Cine
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 rounded-[1.5rem] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1px ${video.colorAccent || "var(--accent-magenta)"}, 0 0 30px ${video.colorAccent || "var(--accent-magenta)"}40`,
        }}
        aria-hidden="true"
      />
    </div>
  );
});
