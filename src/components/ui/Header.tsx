"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Volume2, VolumeX, Menu as MenuIcon, X } from "lucide-react";
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
      role="banner"
    >
      <Link href="/" className="font-display text-lg font-bold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]" aria-label="In The Loop - Inicio">
        IN THE LOOP<span className="text-[var(--accent-fire)]">.</span>
      </Link>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Quality toggle - desktop */}
        <div className="hidden items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-2)] p-1 md:flex" role="group" aria-label="Calidad de efectos visuales">
          {([
            { id: "high", label: "Max", aria: "Calidad máxima, todos los efectos" },
            { id: "medium", label: "Normal", aria: "Calidad normal, balance rendimiento" },
            { id: "low", label: "Min", aria: "Calidad mínima, máximo rendimiento, sin efectos" },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTier(t.id as any)}
              className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent-lime)] ${
                tier === t.id ? "bg-[var(--fg)] text-black" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
              aria-pressed={tier === t.id}
              aria-label={t.aria}
              title={t.aria}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Mute - always accessible */}
        <button
          onClick={toggleMute}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)] text-xs transition-colors hover:border-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] md:h-9 md:w-9"
          aria-label={isMuted ? "Activar sonido" : "Silenciar"}
          aria-pressed={isMuted}
          title={isMuted ? "Activar sonido" : "Silenciar (siempre accesible)"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
        </button>

        {/* Book CTA - magnetic on desktop */}
        <div className="hidden md:block">
          <MagneticButton className="bg-[var(--accent-fire)] text-black text-xs">
            <a href="#booking" className="px-2 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black rounded-full">
              BOOK TOMMY
            </a>
          </MagneticButton>
        </div>

        {/* Mobile book */}
        <a
          href="#booking"
          className="flex h-11 items-center justify-center rounded-full bg-[var(--accent-fire)] px-5 py-2 font-bold text-[10px] uppercase tracking-widest text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] md:hidden"
          aria-label="Ir a formulario de booking"
        >
          BOOK
        </a>

        {/* Menu toggle */}
        <button
          onClick={() => setMenuOpen(!isMenuOpen)}
          className="relative flex h-11 w-11 flex-col items-center justify-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] md:h-9 md:w-9"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMenuOpen}
          aria-controls="main-menu"
          aria-haspopup="true"
        >
          {isMenuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <MenuIcon className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
