"use client";

import { useEffect, useRef, useState } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useQualityStore } from "@/stores/qualityStore";
import { audioEngine } from "@/lib/audio-engine";

export function EnterScreen() {
  const hasEntered = useUIStore((s) => s.hasEntered);
  const setHasEntered = useUIStore((s) => s.setHasEntered);
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const setReducedMotion = useUIStore((s) => s.setReducedMotion);
  const tier = useQualityStore((s) => s.tier);
  const setTier = useQualityStore((s) => s.setTier);

  const [eqBars, setEqBars] = useState<number[]>(Array.from({ length: 24 }, () => Math.random()));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (hasEntered) return;
    const interval = setInterval(() => {
      setEqBars((prev) => prev.map(() => 0.2 + Math.random() * 0.8));
    }, 120);
    return () => clearInterval(interval);
  }, [hasEntered]);

  // grain canvas animation (low cost)
  useEffect(() => {
    if (hasEntered || tier === "low") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgba(255,90,31,0.04)`;
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 2;
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
  }, [hasEntered, tier]);

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
    setHasEntered(true);
    // Init quality detection after enter
    useQualityStore.getState().init();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--fg)]">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />

      {/* Glow halos */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[80vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(255,90,31,0.15),_transparent_60%)] blur-[60px]" />
      <div className="pointer-events-none absolute left-[20%] top-[20%] h-[40vh] w-[40vw] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(255,46,147,0.12),_transparent_60%)] blur-[50px]" />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center px-6 text-center">
        {/* Logo / Title */}
        <h1 className="font-display text-[clamp(48px,12vw,140px)] font-extrabold leading-[0.85] tracking-[-0.04em]">
          <span className="block">TOMMY</span>
          <span className="block bg-gradient-to-r from-[var(--accent-fire)] to-[var(--accent-magenta)] bg-clip-text text-transparent">
            PETERSEN
          </span>
        </h1>

        <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-[var(--fg-muted)]">
          TRIBAL HOUSE / HOUSE / LATIN GROOVES — ARGENTINA
        </p>

        {/* EQ */}
        <div className="mt-12 flex h-20 items-end gap-[3px]">
          {eqBars.map((h, i) => (
            <div
              key={i}
              className="w-[4px] bg-gradient-to-t from-[var(--accent-fire)] to-[var(--accent-magenta)] transition-all duration-100"
              style={{ height: `${h * 100}%`, opacity: 0.6 + h * 0.4 }}
            />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <button
            onClick={() => handleEnter(true)}
            className="group relative overflow-hidden rounded-full bg-[var(--accent-fire)] px-10 py-4 font-bold uppercase tracking-widest text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10">ENTRAR CON SONIDO</span>
            <div className="absolute inset-0 -translate-x-full bg-[var(--accent-gold)] transition-transform duration-500 group-hover:translate-x-0" />
          </button>
          <button
            onClick={() => handleEnter(false)}
            className="rounded-full border border-[var(--border-strong)] px-10 py-4 font-bold uppercase tracking-widest text-[var(--fg)] transition-colors hover:border-[var(--fg)] hover:bg-[var(--fg)] hover:text-black"
          >
            ENTRAR SIN SONIDO
          </button>
        </div>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)]">
          Toca para desbloquear el audio • El sitio late con la música
        </p>

        {/* Reduced motion toggle */}
        <label className="mt-10 flex cursor-pointer items-center gap-3 text-xs uppercase tracking-widest text-[var(--fg-muted)]">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => {
              setReducedMotion(e.target.checked);
              if (e.target.checked) setTier("low");
            }}
            className="h-4 w-4 accent-[var(--accent-lime)]"
          />
          Reducir efectos intensos (sin flashes)
        </label>

        {/* Quality hint */}
        <div className="mt-4 font-mono text-[10px] text-[var(--fg-dim)]">
          Efectos: {tier.toUpperCase()} • Optimizado para tu dispositivo
        </div>
      </div>

      {/* Bottom marque subtle */}
      <div className="absolute bottom-0 w-full overflow-hidden border-t border-[var(--border)] py-2">
        <div className="animate-marquee whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--fg-dim)]">
          IN THE LOOP AGENCY — EVERY DANCEFLOOR HAS ITS OWN STORY — TRIBAL HOUSE — SUNSET SESSIONS — BEACH PARTY — UNDERGROUND CLUB —{" "}
          IN THE LOOP AGENCY — EVERY DANCEFLOOR HAS ITS OWN STORY — TRIBAL HOUSE — SUNSET SESSIONS — BEACH PARTY — UNDERGROUND CLUB —
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
      `}</style>
    </div>
  );
}
