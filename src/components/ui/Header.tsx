"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUIStore } from "@/stores/uiStore";
import { useQualityStore } from "@/stores/qualityStore";
import { usePlayerStore } from "@/stores/playerStore";
import { audioEngine } from "@/lib/audio-engine";
import { MagneticButton } from "./magnetic-button";

export function Header() {
  const isMenuOpen = useUIStore((s) => s.isMenuOpen);
  const setMenuOpen = useUIStore((s) => s.setMenuOpen);
  const tier = useQualityStore((s) => s.tier);
  const setTier = useQualityStore((s) => s.setTier);
  const volume = usePlayerStore((s) => s.volume);
  const [isMuted, setIsMuted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioEngine) {
      audioEngine.setVolume(newMuted ? 0 : volume);
    }
  };

  return (
    <header
      className={`fixed top-0 z-40 flex h-[var(--header-h)] w-full items-center justify-between border-b px-6 backdrop-blur-xl transition-all md:px-10 ${
        scrolled ? "border-[var(--border)] bg-[var(--bg)]/90" : "border-transparent bg-[var(--bg)]/50"
      }`}
    >
      <Link href="/" className="font-display text-lg font-bold tracking-tight">
        IN THE LOOP<span className="text-[var(--accent-fire)]">.</span>
      </Link>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Quality toggle - desktop */}
        <div className="hidden items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-2)] p-1 md:flex">
          {(["high", "medium", "low"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                tier === t ? "bg-[var(--fg)] text-black" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
            >
              {t === "high" ? "Max" : t === "medium" ? "Normal" : "Min"}
            </button>
          ))}
        </div>

        {/* Mute */}
        <button
          onClick={toggleMute}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)] text-xs transition-colors hover:border-[var(--fg)]"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>

        {/* Book CTA - magnetic on desktop */}
        <div className="hidden md:block">
          <MagneticButton className="bg-[var(--accent-fire)] text-black text-xs">
            <a href="mailto:events@intheloop.agency" className="px-2">
              BOOK TOMMY
            </a>
          </MagneticButton>
        </div>

        {/* Mobile book */}
        <a
          href="mailto:events@intheloop.agency"
          className="rounded-full bg-[var(--accent-fire)] px-4 py-2 font-bold text-[10px] uppercase tracking-widest text-black md:hidden"
        >
          BOOK
        </a>

        {/* Menu toggle */}
        <button
          onClick={() => setMenuOpen(!isMenuOpen)}
          className="relative flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-2)]"
          aria-label="Menu"
        >
          <span className={`block h-0.5 w-4 bg-[var(--fg)] transition-all ${isMenuOpen ? "translate-y-1 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-4 bg-[var(--fg)] transition-all ${isMenuOpen ? "-translate-y-1 -rotate-45" : ""}`} />
        </button>
      </div>
    </header>
  );
}
