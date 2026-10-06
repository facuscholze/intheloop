"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion";
import { useVideoStore } from "@/stores/videoStore";
import { getMediaUrl } from "@/lib/media";
import { audioEngine } from "@/lib/audio-engine";
import { useQualityStore } from "@/stores/qualityStore";
import { useUIStore } from "@/stores/uiStore";
import { Ambilight } from "./Ambilight";
import { VideoControls } from "./VideoControls";
import { useHLS } from "@/hooks/useHLS";

export function CineMode() {
  const activeVideo = useVideoStore((s) => s.activeVideo);
  const activeElement = useVideoStore((s) => s.activeElement);
  const isCineMode = useVideoStore((s) => s.isCineMode);
  const closeVideo = useVideoStore((s) => s.closeVideo);
  const tier = useQualityStore((s) => s.tier);
  const setCineMode = useUIStore((s) => s.setCineMode);

  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isYoutube, setIsYoutube] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const videoSrc = activeVideo ? getMediaUrl(activeVideo.src) : null;
  const youtubeId = activeVideo?.youtubeId;

  useHLS(videoRef, videoSrc);

  useEffect(() => {
    setIsYoutube(!!youtubeId);
  }, [youtubeId]);

  // Flip animation open/close
  useEffect(() => {
    if (!isCineMode || !activeVideo || !activeElement || !containerRef.current || !overlayRef.current) return;

    setCineMode(true);
    const overlay = overlayRef.current;
    const container = containerRef.current;
    const cardRect = activeElement.getBoundingClientRect();

    // Initial state: container at card position
    gsap.set(overlay, { display: "flex", opacity: 0 });
    gsap.set(container, {
      x: cardRect.left,
      y: cardRect.top,
      width: cardRect.width,
      height: cardRect.height,
      borderRadius: "1.5rem",
    });

    // Duck global player
    if (audioEngine) {
      audioEngine.duck(0.12, 0.5);
    }

    const tl = gsap.timeline({
      onComplete: () => setShowContent(true),
    });

    tl.to(overlay, { opacity: 1, duration: 0.4, ease: "power2.out" })
      .to(
        container,
        {
          x: 0,
          y: 0,
          width: "100vw",
          height: "100vh",
          borderRadius: "0rem",
          duration: 0.8,
          ease: "club",
        },
        "-=0.2"
      )
      .fromTo(
        container,
        { filter: "blur(10px) hue-rotate(90deg)" },
        { filter: "blur(0px) hue-rotate(0deg)", duration: 0.5, ease: "power2.out" },
        "-=0.4"
      );

    // Letterbox bars animation
    const letterboxTop = overlay.querySelector(".letterbox-top") as HTMLElement;
    const letterboxBottom = overlay.querySelector(".letterbox-bottom") as HTMLElement;
    if (letterboxTop && letterboxBottom) {
      gsap.fromTo(letterboxTop, { y: "-100%" }, { y: "0%", duration: 0.6, ease: "club", delay: 0.3 });
      gsap.fromTo(letterboxBottom, { y: "100%" }, { y: "0%", duration: 0.6, ease: "club", delay: 0.3 });
    }

    // Lock scroll
    document.body.style.overflow = "hidden";

    return () => {
      // Cleanup handled in close
    };
  }, [isCineMode, activeVideo, activeElement, setCineMode]);

  const handleClose = () => {
    if (!activeElement || !containerRef.current || !overlayRef.current) {
      closeVideo();
      setCineMode(false);
      document.body.style.overflow = "";
      if (audioEngine) audioEngine.unduck(1, 0.6);
      return;
    }

    const overlay = overlayRef.current;
    const container = containerRef.current;
    const cardRect = activeElement.getBoundingClientRect();

    setShowContent(false);

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { display: "none" });
        closeVideo();
        setCineMode(false);
        document.body.style.overflow = "";
        if (audioEngine) audioEngine.unduck(1, 0.6);
      },
    });

    // Reverse letterbox
    const letterboxTop = overlay.querySelector(".letterbox-top") as HTMLElement;
    const letterboxBottom = overlay.querySelector(".letterbox-bottom") as HTMLElement;
    if (letterboxTop && letterboxBottom) {
      tl.to([letterboxTop, letterboxBottom], { y: (i) => (i === 0 ? "-100%" : "100%"), duration: 0.4, ease: "club" }, 0);
    }

    tl.to(
      container,
      {
        x: cardRect.left,
        y: cardRect.top,
        width: cardRect.width,
        height: cardRect.height,
        borderRadius: "1.5rem",
        duration: 0.7,
        ease: "club",
      },
      0
    )
      .to(overlay, { opacity: 0, duration: 0.4, ease: "power2.in" }, 0.3)
      .to(container, { filter: "blur(10px)", duration: 0.3 }, 0);
  };

  // Keyboard Esc + swipe down
  useEffect(() => {
    if (!isCineMode) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    const handleTouchStart = (e: TouchEvent) => {
      const startY = e.touches[0].clientY;
      const handleTouchMove = (moveE: TouchEvent) => {
        const deltaY = moveE.touches[0].clientY - startY;
        if (deltaY > 100) {
          handleClose();
          window.removeEventListener("touchmove", handleTouchMove);
        }
      };
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      const handleTouchEnd = () => {
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };
      window.addEventListener("touchend", handleTouchEnd);
    };

    window.addEventListener("keydown", handleKey);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("touchstart", handleTouchStart);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCineMode]);

  if (!isCineMode || !activeVideo) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] hidden h-[100svh] w-screen flex-col bg-black"
      style={{ display: "none" }}
      role="dialog"
      aria-modal="true"
      aria-label={`Video ${activeVideo.title}`}
    >
      {/* Ambilight background */}
      <div className="absolute inset-0 overflow-hidden">
        <Ambilight videoRef={videoRef} enabled={tier !== "low"} />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[20px]" />
      </div>

      {/* Letterbox bars */}
      <div className="letterbox-top pointer-events-none absolute left-0 top-0 z-20 h-[8vh] w-full bg-black" />
      <div className="letterbox-bottom pointer-events-none absolute bottom-0 left-0 z-20 h-[8vh] w-full bg-black" />

      {/* Chromatic aberration portal effect */}
      <div className="pointer-events-none absolute inset-0 z-10 opacity-30 mix-blend-screen">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-fire)]/20 via-transparent to-[var(--accent-magenta)]/20" />
      </div>

      {/* Video container - Flip target */}
      <div ref={containerRef} className="relative z-10 flex h-screen w-screen items-center justify-center bg-black">
        {isYoutube && youtubeId ? (
          <div className="relative h-full w-full">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0`}
              title={activeVideo.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : videoSrc ? (
          <video
            ref={videoRef}
            controls={false}
            autoPlay
            playsInline
            className="h-full w-full object-contain"
            poster={getMediaUrl(activeVideo.poster) || undefined}
          />
        ) : (
          // Placeholder when no src
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[var(--bg-2)] to-black p-10 text-center">
            <div className="font-display text-4xl font-bold text-white">{activeVideo.title}</div>
            <div className="mt-4 font-mono text-xs uppercase tracking-widest text-white/60">
              {activeVideo.venue} • {activeVideo.date} • Video placeholder
            </div>
            <div className="mt-8 max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 font-mono text-xs leading-relaxed text-white/60 backdrop-blur">
              Agregá video real en <code>media-src/video/live/</code> y poster en <code>media-src/images/posters/</code>. El modo cine ya funciona con Flip,
              letterbox, ambilight y ducking del player global. Soporta MP4/WebM/HLS y YouTube facade.
            </div>
            <div className="mt-8 flex gap-4">
              <div className="h-1 w-12 rounded bg-[var(--accent-fire)]" />
              <div className="h-1 w-12 rounded bg-[var(--accent-magenta)]" />
              <div className="h-1 w-12 rounded bg-[var(--accent-lime)]" />
            </div>
          </div>
        )}

        {/* Controls */}
        {showContent && !isYoutube && videoSrc && (
          <VideoControls videoRef={videoRef} onClose={handleClose} title={activeVideo.title} />
        )}

        {showContent && isYoutube && (
          <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-end p-4">
            <button
              onClick={handleClose}
              className="rounded-full bg-white px-6 py-2 font-mono text-xs font-bold uppercase tracking-widest text-black hover:bg-[var(--accent-fire)]"
            >
              Cerrar (Esc)
            </button>
          </div>
        )}

        {/* Close button top-right always visible */}
        {showContent && (
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-white hover:text-black md:right-6 md:top-6"
            aria-label="Close video"
          >
            ✕
          </button>
        )}
      </div>

      {/* Click outside to close */}
      <div className="absolute inset-0 z-0" onClick={handleClose} aria-hidden="true" />
    </div>
  );
}
