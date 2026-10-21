"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Volume2, VolumeX, Menu as MenuIcon, X } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { usePlayerStore } from "@/stores/playerStore";
import { MagneticButton } from "./magnetic-button";

export function Header() {
  const isMenuOpen = useUIStore((s) => s.isMenuOpen);
  const setMenuOpen = useUIStore((s) => s.setMenuOpen);
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const muted = usePlayerStore((s) => s.muted);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-40 flex h-[var(--header-h)] w-full items-center justify-between border-b px-6 backdrop-blur-xl transition-all md:px-10 ${
        scrolled
          ? "border-[var(--border)] bg-[var(--bg)]/90"
          : "border-transparent bg-[var(--bg)]/50"
      }`}
      role="banner"
    >
      <Link
        href="/"
        className="font-display text-lg font-bold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
        aria-label="In The Loop - Inicio"
      >
        IN THE LOOP<span className="text-[var(--accent-fire)]">.</span>
      </Link>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Mute - always accessible (global, persists) */}
        <button
          onClick={toggleMute}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)] text-xs transition-colors hover:border-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] md:h-9 md:w-9"
          aria-label={muted ? "Activar sonido" : "Silenciar"}
          aria-pressed={muted}
          title={muted ? "Activar sonido" : "Silenciar (siempre accesible)"}
        >
          {muted ? (
            <VolumeX className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Volume2 className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        {/* Book CTA - magnetic on desktop */}
        <div className="hidden md:block">
          <MagneticButton
            href="#booking"
            ariaLabel="Ir a formulario de booking para contratar a Tommy"
            className="bg-[var(--accent-fire)] px-5 py-3 text-xs text-black hover:bg-[var(--accent-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            BOOK TOMMY
          </MagneticButton>
        </div>

        {/* Mobile book */}
        <a
          href="#booking"
          className="cta flex h-11 items-center justify-center rounded-full bg-[var(--accent-fire)] px-4 py-2 text-[10px] font-bold tracking-widest text-black uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] sm:px-5 md:hidden"
          aria-label="Ir a formulario de booking"
        >
          BOOK
        </a>

        {/* Menu toggle */}
        <button
          onClick={() => setMenuOpen(!isMenuOpen)}
          className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--bg-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] md:h-9 md:w-9"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMenuOpen}
          aria-controls="main-menu"
          aria-haspopup="true"
        >
          <span className="relative block h-4 w-4" aria-hidden="true">
            <MenuIcon
              className="absolute inset-0 h-4 w-4"
              style={{
                opacity: isMenuOpen ? 0 : 1,
                transform: isMenuOpen ? "rotate(90deg) scale(0.6)" : "rotate(0deg) scale(1)",
                transition: reducedMotion ? "none" : "opacity 300ms ease, transform 300ms cubic-bezier(.22,1,.36,1)",
              }}
            />
            <X
              className="absolute inset-0 h-4 w-4"
              style={{
                opacity: isMenuOpen ? 1 : 0,
                transform: isMenuOpen ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.6)",
                transition: reducedMotion ? "none" : "opacity 300ms ease, transform 300ms cubic-bezier(.22,1,.36,1)",
              }}
            />
          </span>
        </button>
      </div>
    </header>
  );
}
