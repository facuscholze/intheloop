"use client";

import { useEffect, useRef, useState } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useQualityStore } from "@/stores/qualityStore";
import { audioEngine } from "@/lib/audio-engine";
import { gsap } from "@/lib/motion";

export function EnterScreen() {
  const hasEntered = useUIStore((s) => s.hasEntered);
  const setHasEntered = useUIStore((s) => s.setHasEntered);
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const setReducedMotion = useUIStore((s) => s.setReducedMotion);
  const tier = useQualityStore((s) => s.tier);
  const setTier = useQualityStore((s) => s.setTier);

  const [eqBars, setEqBars] = useState<number[]>(Array.from({ length: 32 }, () => Math.random()));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const enterButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (hasEntered) return;
    const interval = setInterval(() => {
      setEqBars((prev) => prev.map(() => 0.2 + Math.random() * 0.8));
    }, 100);
    return () => clearInterval(interval);
  }, [hasEntered]);

  useEffect(() => {
    if (hasEntered) return;
    if (!titleRef.current) return;
    if (reducedMotion) return; // Skip animation if reduced motion

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current!.querySelectorAll(".enter-char"),
        { y: 80, opacity: 0, rotateX: -45 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1, stagger: 0.04, ease: "club" }
      );
    });
    return () => ctx.revert();
  }, [hasEntered, reducedMotion]);

  useEffect(() => {
    if (hasEntered || tier === "low" || reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    let raf = 0;
    let t = 0;
    const draw = () => {
      t += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgba(255,90,31,0.08)`;
      for (let i = 0; i < 60; i++) {
        const x = (Math.sin(t + i) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(t * 0.7 + i * 1.3) * 0.5 + 0.5) * canvas.height;
        const r = Math.sin(t + i) * 1.5 + 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [hasEntered, tier, reducedMotion]);

  // Focus management
  useEffect(() => {
    if (!hasEntered) {
      const timeout = setTimeout(() => {
        enterButtonRef.current?.focus();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [hasEntered]);

  if (hasEntered) return null;

  const handleEnter = async (withSound: boolean) => {
    try {
      if (withSound && audioEngine) {
        audioEngine.init();
        await audioEngine.resume();
      }
    } catch (e) {
      console.warn("AudioContext init failed", e);
    }
    if (titleRef.current && !reducedMotion) {
      gsap.to(titleRef.current, {
        y: -100,
        opacity: 0,
        duration: 0.6,
        ease: "club",
        onComplete: () => setHasEntered(true),
      });
    } else {
      setHasEntered(true);
    }
    useQualityStore.getState().init();
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--fg)]"
      role="dialog"
      aria-modal="true"
      aria-label="Pantalla de bienvenida"
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[90vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(255,90,31,0.18),_transparent_60%)] blur-[80px]" aria-hidden="true" />
      <div className="pointer-events-none absolute left-[15%] top-[15%] h-[50vh] w-[50vw] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(255,46,147,0.14),_transparent_60%)] blur-[60px]" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[10%] bottom-[10%] h-[40vh] w-[40vw] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(200,255,0,0.08),_transparent_60%)] blur-[50px]" aria-hidden="true" />

      <div ref={titleRef} className="relative z-10 flex w-full max-w-5xl flex-col items-center px-6 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-2)] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[var(--fg-muted)]" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent-lime)]" aria-hidden="true" />
          IN THE LOOP AGENCY • ENTER EXPERIENCE
        </div>

        <h1 className="font-display text-[clamp(48px,14vw,160px)] font-extrabold leading-[0.85] tracking-[-0.04em]">
          <span className="block overflow-hidden">
            {"TOMMY".split("").map((c, i) => (
              <span key={i} className="enter-char inline-block" aria-hidden="true">
                {c}
              </span>
            ))}
            <span className="sr-only">Tommy</span>
          </span>
          <span className="block overflow-hidden bg-gradient-to-r from-[var(--accent-fire)] via-[var(--accent-magenta)] to-[var(--accent-gold)] bg-clip-text text-transparent">
            {"PETERSEN".split("").map((c, i) => (
              <span key={i} className="enter-char inline-block" aria-hidden="true">
                {c}
              </span>
            ))}
            <span className="sr-only">Petersen</span>
          </span>
        </h1>

        <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-[var(--fg-muted)]">TRIBAL HOUSE / HOUSE / LATIN GROOVES — ARGENTINA</p>

        <div className="mt-12 flex h-24 items-end gap-[3px]" aria-hidden="true" role="presentation">
          {eqBars.map((h, i) => (
            <div
              key={i}
              className="w-[3px] bg-gradient-to-t from-[var(--accent-fire)] to-[var(--accent-magenta)] transition-all duration-100 md:w-[4px]"
              style={{
                height: `${h * 100}%`,
                opacity: 0.5 + h * 0.5,
                transform: `scaleY(${0.8 + h * 0.4})`,
                filter: `hue-rotate(${h * 20}deg)`,
              }}
            />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <button
            ref={enterButtonRef}
            onClick={() => handleEnter(true)}
            data-cursor="play"
            className="group relative overflow-hidden rounded-full bg-[var(--accent-fire)] px-10 py-4 font-bold uppercase tracking-widest text-black transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-lime)]"
            aria-label="Entrar con sonido - desbloquea audio reactivo"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span aria-hidden="true">▶</span> ENTRAR CON SONIDO
            </span>
            <div className="absolute inset-0 -translate-x-full bg-[var(--accent-gold)] transition-transform duration-700 group-hover:translate-x-0" aria-hidden="true" />
          </button>
          <button
            onClick={() => handleEnter(false)}
            className="rounded-full border border-[var(--border-strong)] px-10 py-4 font-bold uppercase tracking-widest text-[var(--fg)] transition-all hover:border-[var(--fg)] hover:bg-[var(--fg)] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-lime)]"
            aria-label="Entrar sin sonido - experiencia visual sin audio"
          >
            ENTRAR SIN SONIDO
          </button>
        </div>

        <p className="mt-6 max-w-md font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)]">Toca para desbloquear el audio • El sitio late con la música • WebGL + audio reactivo</p>

        <label className="mt-10 flex cursor-pointer items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-2)] px-4 py-2 text-xs uppercase tracking-widest text-[var(--fg-muted)] transition-colors hover:border-[var(--accent-lime)] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--accent-lime)]">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => {
              setReducedMotion(e.target.checked);
              if (e.target.checked) setTier("low");
            }}
            className="h-4 w-4 accent-[var(--accent-lime)]"
            aria-label="Reducir efectos intensos y flashes"
          />
          Reducir efectos intensos (sin flashes)
        </label>

        <div className="mt-4 font-mono text-[10px] text-[var(--fg-dim)]" aria-live="polite">
          Efectos: {tier.toUpperCase()} • Optimizado para tu dispositivo
        </div>
      </div>

      <div className="absolute bottom-0 w-full overflow-hidden border-t border-[var(--border)] bg-[var(--bg-2)]/50 py-2 backdrop-blur" aria-hidden="true">
        <div className="animate-marquee whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--fg-dim)]">
          IN THE LOOP AGENCY — EVERY DANCEFLOOR HAS ITS OWN STORY — TRIBAL HOUSE — SUNSET SESSIONS — BEACH PARTY — UNDERGROUND CLUB — IN THE LOOP AGENCY — EVERY DANCEFLOOR HAS ITS OWN STORY — TRIBAL HOUSE — SUNSET SESSIONS — BEACH PARTY — UNDERGROUND CLUB —
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          display: inline-block;
          padding-left: 100%;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
