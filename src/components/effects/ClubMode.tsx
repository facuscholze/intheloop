"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useAudioReactive } from "@/hooks/useAudioReactive";
import { useQualityStore } from "@/stores/qualityStore";

export function ClubModeToggle() {
  const isClubMode = useUIStore((s) => s.isClubMode);
  const toggle = useUIStore((s) => s.toggleClubMode);
  const reducedMotion = useUIStore((s) => s.reducedMotion);

  // Don't show club mode if reduced motion is enabled
  if (reducedMotion) return null;

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-[calc(var(--player-h)+16px)] right-4 z-20 flex h-11 items-center gap-2 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-widest backdrop-blur-xl transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] md:right-6 md:h-auto ${
        isClubMode ? "border-[var(--accent-fire)] bg-[var(--accent-fire)] text-black" : "border-[var(--border)] bg-[var(--bg-2)]/80 text-[var(--fg-muted)] hover:border-[var(--fg)] hover:text-[var(--fg)]"
      }`}
      aria-pressed={isClubMode}
      aria-label={isClubMode ? "Desactivar modo club" : "Activar modo club - efectos visuales intensos"}
      data-cursor="view"
      title={isClubMode ? "Desactivar modo club" : "Activar modo club - baja iluminación + flash al ritmo"}
    >
      <span className={`h-2 w-2 rounded-full ${isClubMode ? "animate-pulse bg-black" : "bg-[var(--fg-dim)]"}`} aria-hidden="true" />
      {isClubMode ? "MODO CLUB ON" : "MODO CLUB"}
    </button>
  );
}

export function ClubModeEffect() {
  const isClubMode = useUIStore((s) => s.isClubMode);
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const tier = useQualityStore((s) => s.tier);
  const { bass, beat } = useAudioReactive();

  useEffect(() => {
    const root = document.documentElement;
    if (isClubMode && !reducedMotion && tier !== "low") {
      root.classList.add("club-mode");
    } else {
      root.classList.remove("club-mode");
    }
    return () => root.classList.remove("club-mode");
  }, [isClubMode, reducedMotion, tier]);

  if (!isClubMode || reducedMotion || tier === "low") return null;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-10 bg-black transition-opacity duration-700"
        style={{ opacity: 0.7 - bass * 0.3 }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.9) 80%)`,
          opacity: 0.8,
        }}
        aria-hidden="true"
      />
      {/* Beat flash - reduced intensity for a11y, max 2Hz */}
      <div
        className="pointer-events-none fixed inset-0 z-10 bg-[var(--accent-fire)] mix-blend-screen transition-opacity duration-200"
        style={{ opacity: Math.min(beat * 0.1, 0.08) }}
        aria-hidden="true"
      />
      <style>{`
        .club-mode {
          --bg: #020208 !important;
        }
        .club-mode main {
          filter: brightness(0.6) contrast(1.2);
        }
        .club-mode header {
          background: rgba(2,2,8,0.9) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .club-mode main {
            filter: none !important;
          }
        }
      `}</style>
    </>
  );
}
