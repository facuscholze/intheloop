"use client";

import { useRef, useEffect, useState } from "react";
import { useVideoStore } from "@/stores/videoStore";
import { useIntersectionPause } from "@/hooks/useIntersectionPause";
import { getMediaUrl } from "@/lib/media";
import { useAudioReactive } from "@/hooks/useAudioReactive";
import type { Video } from "@/lib/content";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const { ref: intersectionRef, isVisible } = useIntersectionPause<HTMLDivElement>();
  const openVideo = useVideoStore((s) => s.openVideo);
  const { bass, beat } = useAudioReactive();
  const [isHovered, setIsHovered] = useState(false);
  const [mouseX, setMouseX] = useState(0.5);

  const posterUrl = getMediaUrl(video.poster);
  const previewSrc = getMediaUrl(video.previewSrc) || getMediaUrl(video.src);
  const isYoutube = !!video.youtubeId;

  // IntersectionObserver for preview autoplay
  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    if (!previewSrc || isYoutube) return;

    if (isVisible && isHovered) {
      preview.play().catch(() => {});
    } else {
      preview.pause();
    }
  }, [isVisible, isHovered, previewSrc, isYoutube]);

  // Scrub preview based on mouse X
  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    setMouseX(x);

    const preview = previewRef.current;
    if (preview && preview.duration) {
      preview.currentTime = x * preview.duration;
    }
  };

  const handleClick = () => {
    if (!cardRef.current) return;
    openVideo(video, cardRef.current);
  };

  return (
    <div
      ref={(el) => {
        (cardRef as any).current = el;
        (intersectionRef as any).current = el;
      }}
      className="group relative aspect-video cursor-pointer overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--bg-2)] transition-all duration-500 hover:border-[var(--accent-magenta)] hover:shadow-[0_0_40px_rgba(255,46,147,0.15)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      data-cursor="view"
      style={{
        transform: isHovered ? `scale(${1 + bass * 0.02})` : "scale(1)",
      }}
    >
      {/* Background gradient placeholder */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at ${mouseX * 100}% 50%, ${video.colorAccent || "var(--accent-magenta)"}30, transparent 70%), linear-gradient(135deg, var(--bg-2), var(--bg))`,
        }}
      />

      {/* Poster / Preview */}
      {isYoutube ? (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10" />
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
            filter: isHovered ? `hue-rotate(${bass * 20}deg) contrast(${1 + bass * 0.2})` : undefined,
          }}
        />
      ) : (
        // Placeholder animated gradient when no video file
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-magenta)]/20 via-[var(--bg-2)] to-[var(--accent-fire)]/20" />
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background: `radial-gradient(circle at ${mouseX * 100}% 50%, ${video.colorAccent}40, transparent 50%)`,
            }}
          />
          {/* Simulated waveform preview */}
          <div className="absolute bottom-0 left-0 right-0 flex h-12 items-end gap-[2px] p-3 opacity-60">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-full bg-white/30"
                style={{
                  height: `${20 + Math.sin(i * 0.5 + mouseX * 10) * 30 + Math.random() * 20}%`,
                  transform: `scaleY(${1 + (isHovered ? beat * 0.5 : 0)})`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Distortion shader overlay on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='distort'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02' numOctaves='3'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='${bass * 10}'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23distort)'/%3E%3C/svg%3E")`,
          mixBlendMode: "overlay",
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur">
              {isYoutube ? "YouTube" : "Live"} • {video.date}
            </div>
            {isHovered && (
              <div className="hidden rounded-full bg-[var(--accent-magenta)] px-2 py-1 font-mono text-[9px] font-bold uppercase text-black md:block">
                Scrub ← → {Math.round(mouseX * 100)}%
              </div>
            )}
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-transform group-hover:scale-110 group-hover:bg-[var(--accent-magenta)] group-hover:text-black"
            style={{ transform: isHovered ? `scale(${1 + beat * 0.2})` : undefined }}
          >
            ▶
          </div>
        </div>

        <div>
          <div className="font-display text-xl font-bold leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{video.title}</div>
          <div className="font-mono text-xs uppercase tracking-widest text-white/70">
            {video.venue} • {video.date} • Modo Cine
          </div>
        </div>
      </div>

      {/* Hover border glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[1.5rem] opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1px ${video.colorAccent || "var(--accent-magenta)"}, 0 0 30px ${video.colorAccent || "var(--accent-magenta)"}40`,
        }}
      />

      {/* RGB-split on beat */}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-screen opacity-0 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${video.colorAccent}20, transparent)`,
          transform: `translateX(${bass * 10}px)`,
          transition: "transform 0.1s linear",
        }}
      />
    </div>
  );
}
