"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "@/lib/motion";
import { useUIStore } from "@/stores/uiStore";
import { useQualityStore } from "@/stores/qualityStore";

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
          { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.06, ease: "power3.out", delay: 0.2 }
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

  if (typeof window !== "undefined") {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 hidden h-[100svh] w-full flex-col bg-[var(--bg)]"
      style={{ display: "none" }}
    >
      {/* Background shader */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,_rgba(255,90,31,0.15),_transparent_60%),radial-gradient(ellipse_at_80%_80%,_rgba(255,46,147,0.12),_transparent_60%)]" />

      <div className="relative flex h-full flex-col p-6 md:p-10">
        <div className="flex items-center justify-between">
          <div className="font-display text-lg font-bold">IN THE LOOP.</div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)] text-lg"
          >
            ✕
          </button>
        </div>

        <div ref={linksRef} className="mt-20 flex flex-1 flex-col gap-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="menu-link group flex items-baseline gap-6 overflow-hidden"
              data-cursor="view"
            >
              <span className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight transition-colors group-hover:text-[var(--accent-fire)]">
                {link.label}
              </span>
              <span className="hidden font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)] md:block">
                {link.sub}
              </span>
            </a>
          ))}
        </div>

        <div className="flex flex-col gap-6 border-t border-[var(--border)] pt-8 md:flex-row md:items-end md:justify-between">
          <div className="font-mono text-xs uppercase leading-relaxed text-[var(--fg-muted)]">
            <div>TOMMY PETERSEN</div>
            <div>TRIBAL HOUSE / ARGENTINA</div>
            <div className="mt-2 text-[var(--fg-dim)]">Every dancefloor has its own story.</div>
          </div>
          <div className="flex gap-4 font-mono text-xs uppercase">
            <a href="https://www.instagram.com/tommypetersen/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-fire)]">
              Instagram
            </a>
            <a href="https://soundcloud.com/tommypetersendj" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-fire)]">
              SoundCloud
            </a>
            <a href="https://www.youtube.com/@InTheLoopAgency" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-fire)]">
              YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
