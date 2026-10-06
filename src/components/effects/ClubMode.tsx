"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useAudioReactive } from "@/hooks/useAudioReactive";

export function ClubModeToggle() {
  const isClubMode = useUIStore((s) => s.isClubMode);
  const toggle = useUIStore((s) => s.toggleClubMode);

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-[calc(var(--player-h)+16px)] right-4 z-20 flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-widest backdrop-blur-xl transition-all md:right-6 ${
        isClubMode ? "border-[var(--accent-fire)] bg-[var(--accent-fire)] text-black" : "border-[var(--border)] bg-[var(--bg-2)]/80 text-[var(--fg-muted)] hover:border-[var(--fg)] hover:text-[var(--fg)]"
      }`}
      aria-pressed={isClubMode}
      data-cursor="view"
    >
      <span className={`h-2 w-2 rounded-full ${isClubMode ? "animate-pulse bg-black" : "bg-[var(--fg-dim)]"}`} />
      {isClubMode ? "MODO CLUB ON" : "MODO CLUB"}
    </button>
  );
}

export function ClubModeEffect() {
  const isClubMode = useUIStore((s) => s.isClubMode);
  const { bass, beat } = useAudioReactive();

  useEffect(() => {
    const root = document.documentElement;
    if (isClubMode) {
      root.classList.add("club-mode");
    } else {
      root.classList.remove("club-mode");
    }
  }, [isClubMode]);

  if (!isClubMode) return null;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-10 bg-black transition-opacity"
        style={{ opacity: 0.7 - bass * 0.3 }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.9) 80%)`,
          opacity: 0.8,
        }}
      />
      {/* Beat flash */}
      <div
        className="pointer-events-none fixed inset-0 z-10 bg-[var(--accent-fire)] mix-blend-screen"
        style={{ opacity: beat * 0.15 }}
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
      `}</style>
    </>
  );
}
