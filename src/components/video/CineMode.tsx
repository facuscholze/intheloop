"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion";
import { useVideoStore } from "@/stores/videoStore";
import { getMediaUrl } from "@/lib/media";
import { audioEngine } from "@/lib/audio-engine";
import { useQualityStore } from "@/stores/qualityStore";
import { useUIStore } from "@/stores/uiStore";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { Ambilight } from "./Ambilight";
import { VideoControls } from "./VideoControls";
import { useHLS } from "@/hooks/useHLS";

export function CineMode() {
  const activeVideo = useVideoStore((s) => s.activeVideo);
  const activeElement = useVideoStore((s) => s.activeElement);
  const isCineMode = useVideoStore((s) => s.isCineMode);
  const tier = useQualityStore((s) => s.tier);
  const setCineMode = useUIStore((s) => s.setCineMode);

  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const scrollTokenRef = useRef<symbol | null>(null);
  const closingRef = useRef(false);
  const handleCloseRef = useRef<() => void>(() => {});

  const [isYoutube, setIsYoutube] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const videoSrc = activeVideo ? getMediaUrl(activeVideo.src) : null;
  const youtubeId = activeVideo?.youtubeId;

  useHLS(videoRef, videoSrc);

  useEffect(() => {
    setIsYoutube(!!youtubeId);
  }, [youtubeId]);

  /**
   * Close — idempotent and animation-safe. Every path (button, Esc, swipe,
   * browser Back, safety timeouts) funnels here, and a safety timer guarantees
   * the overlay always goes away even if GSAP's onComplete never fires.
   */
  const finishClose = (fromHistory?: boolean) => {
    const overlay = overlayRef.current;
    if (overlay) gsap.set(overlay, { display: "none" });
    setShowContent(false);

    const store = useVideoStore.getState();
    if (store.isCineMode) store.closeVideo();
    setCineMode(false);

    audioEngine?.unduck(1, 0.6);

    // Put the browser Back button back to the pre-cine entry so "Atrás"
    // doesn't leave the site on the next press.
    if (!fromHistory && window.history.state?.itlCine) {
      try {
        window.history.back();
      } catch {}
    }
    closingRef.current = false;
  };

  const handleClose = (fromHistory = false) => {
    if (closingRef.current) return;
    if (!useVideoStore.getState().isCineMode) return;
    closingRef.current = true;

    // Stop any in-flight open animation so both timelines don't fight
    openTlRef.current?.kill();
    openTlRef.current = null;

    const overlay = overlayRef.current;
    const container = containerRef.current;
    const source = useVideoStore.getState().activeElement;

    let cardRect: DOMRect | null = null;
    try {
      cardRect = source && source.isConnected ? source.getBoundingClientRect() : null;
    } catch {
      cardRect = null;
    }

    // No animation possible → close immediately (never trap the user)
    if (!overlay || !container || !cardRect || cardRect.width === 0) {
      finishClose(fromHistory);
      return;
    }

    // Guarantee the close completes even if the animation is interrupted
    const safety = window.setTimeout(() => finishClose(fromHistory), 1500);

    const tl = gsap.timeline({
      onComplete: () => {
        window.clearTimeout(safety);
        finishClose(fromHistory);
      },
    });

    // Reverse letterbox
    const letterboxTop = overlay.querySelector(".letterbox-top") as HTMLElement | null;
    const letterboxBottom = overlay.querySelector(".letterbox-bottom") as HTMLElement | null;
    if (letterboxTop && letterboxBottom) {
      tl.to(
        [letterboxTop, letterboxBottom],
        { y: (i: number) => (i === 0 ? "-100%" : "100%"), duration: 0.4, ease: "club" },
        0
      );
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

  // Keep latest handleClose available to long-lived listeners
  handleCloseRef.current = () => handleClose();

  // Open effect: flip animation + history entry + scroll lock
  useEffect(() => {
    if (
      !isCineMode ||
      !activeVideo ||
      !activeElement ||
      !containerRef.current ||
      !overlayRef.current
    )
      return;

    setCineMode(true);
    closingRef.current = false;
    setShowContent(false);

    // Browser Back now exits cine mode instead of leaving the site
    if (!window.history.state?.itlCine) {
      try {
        window.history.pushState({ ...(window.history.state || {}), itlCine: true }, "");
      } catch {}
    }

    const overlay = overlayRef.current;
    const container = containerRef.current;

    let cardRect: DOMRect | null = null;
    try {
      cardRect = activeElement.isConnected ? activeElement.getBoundingClientRect() : null;
    } catch {
      cardRect = null;
    }

    // Initial state: container at card position (or fullscreen if unknown)
    gsap.set(overlay, { display: "flex", opacity: 0 });
    if (cardRect && cardRect.width > 0) {
      gsap.set(container, {
        x: cardRect.left,
        y: cardRect.top,
        width: cardRect.width,
        height: cardRect.height,
        borderRadius: "1.5rem",
      });
    } else {
      gsap.set(container, { x: 0, y: 0, width: "100vw", height: "100vh", borderRadius: "0rem" });
    }

    // Duck global player
    audioEngine?.duck(0.12, 0.5);

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

    openTlRef.current = tl;

    // Letterbox bars animation
    const letterboxTop = overlay.querySelector(".letterbox-top") as HTMLElement | null;
    const letterboxBottom = overlay.querySelector(".letterbox-bottom") as HTMLElement | null;
    if (letterboxTop && letterboxBottom) {
      gsap.fromTo(
        letterboxTop,
        { y: "-100%" },
        { y: "0%", duration: 0.6, ease: "club", delay: 0.3 }
      );
      gsap.fromTo(
        letterboxBottom,
        { y: "100%" },
        { y: "0%", duration: 0.6, ease: "club", delay: 0.3 }
      );
    }

    // Lock scroll (released by this cleanup on every close path)
    scrollTokenRef.current = lockScroll();

    // Safety: reveal controls even if GSAP's onComplete never fires
    const safety = window.setTimeout(() => setShowContent(true), 2200);

    return () => {
      window.clearTimeout(safety);
      tl.kill();
      if (openTlRef.current === tl) openTlRef.current = null;
      if (scrollTokenRef.current) {
        unlockScroll(scrollTokenRef.current);
        scrollTokenRef.current = null;
      }
    };
  }, [isCineMode, activeVideo, activeElement, setCineMode]);

  // Browser Back closes cine mode
  useEffect(() => {
    if (!isCineMode) return;
    const onPop = (e: PopStateEvent) => {
      if (!e.state?.itlCine) handleClose(true);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCineMode]);

  // Keyboard Esc + swipe down
  useEffect(() => {
    if (!isCineMode) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseRef.current();
    };

    const handleTouchStart = (e: TouchEvent) => {
      const startY = e.touches[0].clientY;
      const handleTouchMove = (moveE: TouchEvent) => {
        const deltaY = moveE.touches[0].clientY - startY;
        if (deltaY > 100) {
          handleCloseRef.current();
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
  }, [isCineMode]);

  if (!isCineMode || !activeVideo) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] h-[100svh] w-screen flex-col bg-black"
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

      {/* Letterbox bars (pointer-events-none: never block the UI below) */}
      <div className="letterbox-top pointer-events-none absolute top-0 left-0 z-20 h-[8vh] w-full bg-black" />
      <div className="letterbox-bottom pointer-events-none absolute bottom-0 left-0 z-20 h-[8vh] w-full bg-black" />

      {/* Chromatic aberration portal effect */}
      <div className="pointer-events-none absolute inset-0 z-10 opacity-30 mix-blend-screen">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-fire)]/20 via-transparent to-[var(--accent-magenta)]/20" />
      </div>

      {/* Video container - Flip target */}
      <div
        ref={containerRef}
        className="relative z-10 flex h-screen w-screen items-center justify-center bg-black"
      >
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
          // Placeholder when no src — click to go back
          <div
            onClick={() => handleClose()}
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center bg-gradient-to-br from-[var(--bg-2)] to-black p-10 text-center"
          >
            <div className="font-display text-4xl font-bold text-white">{activeVideo.title}</div>
            <div className="mt-4 font-mono text-xs tracking-widest text-white/60 uppercase">
              {activeVideo.venue} • {activeVideo.date} • Video placeholder
            </div>
            <div className="mt-8 max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 font-mono text-xs leading-relaxed text-white/60 backdrop-blur">
              Agregá video real en <code>media-src/video/live/</code> y poster en{" "}
              <code>media-src/images/posters/</code>. El modo cine ya funciona con Flip, letterbox,
              ambilight y ducking del player global. Soporta MP4/WebM/HLS y YouTube facade.
            </div>
            <div className="mt-8 flex gap-4">
              <div className="h-1 w-12 rounded bg-[var(--accent-fire)]" />
              <div className="h-1 w-12 rounded bg-[var(--accent-magenta)]" />
              <div className="h-1 w-12 rounded bg-[var(--accent-lime)]" />
            </div>
          </div>
        )}
      </div>

      {/* ── Controls layer: ABOVE the letterbox bars (z-30 > z-20).
          Before this fix every close button lived inside the container
          (z-10) and was painted over by the black bars. ── */}

      {/* Always-visible back button */}
      {showContent && (
        <button
          onClick={() => handleClose()}
          className="absolute top-4 left-4 z-30 flex items-center gap-2 rounded-full bg-black/70 px-5 py-2.5 font-mono text-xs font-bold tracking-widest text-white uppercase backdrop-blur transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] md:top-6 md:left-6"
          aria-label="Volver a la grilla de videos"
        >
          <span aria-hidden="true">←</span> VOLVER
        </button>
      )}

      {showContent && !isYoutube && videoSrc && (
        <VideoControls
          videoRef={videoRef}
          onClose={() => handleClose()}
          title={activeVideo.title}
        />
      )}

      {showContent && isYoutube && (
        <div className="absolute right-0 bottom-0 left-0 z-30 flex justify-end p-4">
          <button
            onClick={() => handleClose()}
            className="rounded-full bg-white px-6 py-2 font-mono text-xs font-bold tracking-widest text-black uppercase hover:bg-[var(--accent-fire)]"
          >
            Cerrar (Esc)
          </button>
        </div>
      )}
    </div>
  );
}
