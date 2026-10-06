"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion";
import { MagneticButton } from "@/components/ui/magnetic-button";

export function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!titleRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current!.querySelectorAll(".char"),
        { y: 120, opacity: 0, rotateX: -90 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.04, ease: "club" }
      );
      gsap.fromTo(
        subRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.6, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[var(--bg)] px-6 py-24 md:px-10">
      {/* Background shader placeholder - will be Three.js in Phase 1 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_rgba(255,90,31,0.18),_transparent_60%),radial-gradient(ellipse_at_80%_80%,_rgba(255,46,147,0.15),_transparent_60%),radial-gradient(ellipse_at_50%_50%,_rgba(200,255,0,0.05),_transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[var(--content-max)]">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-2)] px-4 py-1 font-mono text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent-lime)]" />
          IN THE LOOP AGENCY • ARG → EU → BR
        </div>

        <h1
          ref={titleRef}
          className="font-display text-[clamp(56px,14vw,200px)] font-extrabold leading-[0.85] tracking-[-0.05em] text-[var(--fg)]"
          style={{ perspective: "1000px" }}
        >
          <span className="block overflow-hidden">
            <span className="char inline-block">T</span>
            <span className="char inline-block">O</span>
            <span className="char inline-block">M</span>
            <span className="char inline-block">M</span>
            <span className="char inline-block">Y</span>
          </span>
          <span className="block overflow-hidden bg-gradient-to-r from-[var(--accent-fire)] via-[var(--accent-magenta)] to-[var(--accent-gold)] bg-clip-text text-transparent">
            <span className="char inline-block">P</span>
            <span className="char inline-block">E</span>
            <span className="char inline-block">T</span>
            <span className="char inline-block">E</span>
            <span className="char inline-block">R</span>
            <span className="char inline-block">S</span>
            <span className="char inline-block">E</span>
            <span className="char inline-block">N</span>
          </span>
        </h1>

        <div className="mt-8 flex max-w-2xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p ref={subRef} className="font-sans text-lg leading-relaxed text-[var(--fg-muted)] md:text-xl">
            DJ y productor de Argentina. <span className="text-[var(--fg)]">Tribal House</span> / House / Latin grooves con texturas melódicas.
            Desde los 14 años. <em className="text-[var(--accent-fire)]">Every dancefloor has its own story.</em>
          </p>
          <div className="shrink-0">
            <MagneticButton className="bg-[var(--fg)] text-black hover:bg-[var(--accent-lime)]">BOOK TOMMY</MagneticButton>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 border-t border-[var(--border)] pt-8 font-mono text-xs uppercase tracking-widest text-[var(--fg-dim)] md:grid-cols-4">
          <div>
            <div className="text-[var(--fg)]">5 países</div>
            <div>Argentina, España, Brasil, Francia, Alemania</div>
          </div>
          <div>
            <div className="text-[var(--fg)]">Tribal / House</div>
            <div>Sunset, beach, underground</div>
          </div>
          <div>
            <div className="text-[var(--fg)]">In The Loop</div>
            <div>Agency & events</div>
          </div>
          <div>
            <div className="text-[var(--fg)]">Book</div>
            <div>events@intheloop.agency</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)]">
        <span>Scroll</span>
        <div className="h-12 w-[1px] overflow-hidden bg-[var(--border)]">
          <div className="h-full w-full animate-[scrollDown_1.5s_ease-in-out_infinite] bg-[var(--accent-fire)]" />
        </div>
      </div>

      <style>{`
        @keyframes scrollDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </section>
  );
}
