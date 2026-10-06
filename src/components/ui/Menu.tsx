"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { gsap } from "@/lib/motion";
import { useUIStore } from "@/stores/uiStore";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

const links = [
  { href: "#music", label: "MUSIC", sub: "Tracks / Sets" },
  { href: "#videos", label: "VISUALS", sub: "Live / Aftermovies" },
  { href: "#shows", label: "SHOWS", sub: "Donde toqué" },
  { href: "#gallery", label: "GALLERY", sub: "Fotos" },
  { href: "#booking", label: "BOOKING", sub: "Contratá" },
];

export function Menu() {
  const isOpen = useUIStore((s) => s.isMenuOpen);
  const setOpen = useUIStore((s) => s.setMenuOpen);
  const containerRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    // Save previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus close button after animation
    const timeout = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 300);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      // Focus trap
      if (e.key === "Tab" && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus
      previousFocusRef.current?.focus();
    };
  }, [isOpen, setOpen]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      if (isOpen) {
        gsap.set(containerRef.current, { display: "flex" });
        gsap.fromTo(
          containerRef.current,
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 0.8, ease: "club" }
        );
        gsap.fromTo(
          linksRef.current?.querySelectorAll(".menu-link") || [],
          { y: 100, opacity: 0, rotateX: -30 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.06,
            ease: "power3.out",
            delay: 0.2,
          }
        );
      } else {
        gsap.to(containerRef.current, {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.6,
          ease: "club",
          onComplete: () => {
            if (containerRef.current) gsap.set(containerRef.current, { display: "none" });
          },
        });
      }
    });
    return () => ctx.revert();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const token = lockScroll();
    return () => unlockScroll(token);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      id="main-menu"
      className="fixed inset-0 z-50 hidden h-[100svh] w-full flex-col bg-[var(--bg)]"
      style={{ display: "none" }}
      role="dialog"
      aria-modal="true"
      aria-label="Menú principal"
      aria-hidden={!isOpen}
    >
      {/* Background shader */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,_rgba(255,90,31,0.15),_transparent_60%),radial-gradient(ellipse_at_80%_80%,_rgba(255,46,147,0.12),_transparent_60%)]"
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col p-6 md:p-10">
        <div className="flex items-center justify-between">
          <div className="font-display text-lg font-bold" aria-hidden="true">
            IN THE LOOP.
          </div>
          <button
            ref={closeButtonRef}
            onClick={() => setOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)] text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav
          ref={linksRef}
          className="mt-20 flex flex-1 flex-col gap-2"
          aria-label="Navegación principal"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="menu-link group flex items-baseline gap-6 overflow-hidden rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-lime)]"
              data-cursor="view"
            >
              <span className="font-display text-[clamp(32px,8vw,96px)] leading-none font-bold tracking-tight transition-colors group-hover:text-[var(--accent-fire)] group-focus-visible:text-[var(--accent-fire)]">
                {link.label}
              </span>
              <span
                className="hidden font-mono text-xs tracking-widest text-[var(--fg-muted)] uppercase md:block"
                aria-hidden="true"
              >
                {link.sub}
              </span>
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-6 border-t border-[var(--border)] pt-8 md:flex-row md:items-end md:justify-between">
          <div className="font-mono text-xs leading-relaxed text-[var(--fg-muted)] uppercase">
            <div>TOMMY PETERSEN</div>
            <div>TRIBAL HOUSE / ARGENTINA</div>
            <div className="mt-2 text-[var(--fg-dim)]">Every dancefloor has its own story.</div>
          </div>
          <div
            className="flex gap-4 font-mono text-xs uppercase"
            role="list"
            aria-label="Redes sociales"
          >
            <a
              href="https://www.instagram.com/tommypetersen/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded px-2 py-2 hover:text-[var(--accent-fire)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
              role="listitem"
              aria-label="Instagram de Tommy Petersen (abre en nueva pestaña)"
            >
              Instagram
            </a>
            <a
              href="https://soundcloud.com/tommypetersendj"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded px-2 py-2 hover:text-[var(--accent-fire)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
              role="listitem"
              aria-label="SoundCloud de Tommy Petersen (abre en nueva pestaña)"
            >
              SoundCloud
            </a>
            <a
              href="https://www.youtube.com/@InTheLoopAgency"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded px-2 py-2 hover:text-[var(--accent-fire)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
              role="listitem"
              aria-label="YouTube de In The Loop Agency (abre en nueva pestaña)"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
