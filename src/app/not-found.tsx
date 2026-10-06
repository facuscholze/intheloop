"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "@/lib/motion";
import { useUIStore } from "@/stores/uiStore";

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useUIStore((s) => s.reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let raf = 0;
    let t = 0;

    const draw = () => {
      t += 0.02;
      ctx.fillStyle = "rgba(7,7,10,0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 80; i++) {
        const x = (i / 80) * canvas.width;
        const h = Math.sin(i * 0.2 + t * 3) * 80 + Math.cos(i * 0.05 + t) * 40 + 60;
        const hue = (i * 4 + t * 30) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
        ctx.fillRect(x, canvas.height / 2 - h / 2, canvas.width / 80 - 2, h);
      }

      if (Math.random() < 0.05) {
        ctx.fillStyle = `hsl(${Math.random() * 60 + 10}, 100%, 60%)`;
        ctx.font = "bold 120px monospace";
        ctx.fillText("404", canvas.width / 2 - 100 + (Math.random() - 0.5) * 10, canvas.height / 2 + 100);
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    gsap.fromTo(
      ".notfound-char",
      { y: 100, opacity: 0, rotateX: -90 },
      { y: 0, opacity: 1, rotateX: 0, duration: 1, stagger: 0.1, ease: "club" }
    );
  }, [reducedMotion]);

  return (
    <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[var(--bg)] px-6 text-center" role="main" aria-label="Página no encontrada">
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 max-w-2xl">
        <h1 className="font-display text-[clamp(80px,20vw,200px)] font-bold leading-none tracking-tight" aria-label="Error 404">
          <span aria-hidden="true" className="flex justify-center gap-1">
            {"404".split("").map((c, i) => (
              <span key={i} className="notfound-char inline-block bg-gradient-to-r from-[var(--accent-fire)] to-[var(--accent-magenta)] bg-clip-text text-transparent">
                {c}
              </span>
            ))}
          </span>
          <span className="sr-only">404 - Página no encontrada</span>
        </h1>

        <h2 className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-[var(--fg-muted)]">La pista que buscás no existe</h2>
        <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-[var(--fg-dim)]">
          Pero la fiesta sigue. Volvé al inicio y seguí bailando. Probá el Konami code ↑↑↓↓←→←→BA para rave total seguro &lt;3Hz.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/es/"
            className="rounded-full bg-[var(--accent-fire)] px-8 py-4 font-bold uppercase tracking-widest text-black transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
            aria-label="Volver a la página de inicio"
          >
            Volver al inicio
          </Link>
          <Link
            href="/es/#music"
            className="rounded-full border border-[var(--border)] px-8 py-4 font-bold uppercase tracking-widest text-[var(--fg)] transition-colors hover:bg-[var(--fg)] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
            aria-label="Ir a la sección de música"
          >
            Escuchar música
          </Link>
        </div>

        <div className="mt-12 font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)]" aria-hidden="true">
          404 interactiva • Visualizador + glitch • Fase 6 a11y safe
        </div>

        <div className="mt-6">
          <Link href="/es/#booking" className="font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)] underline hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]">
            ¿Necesitás ayuda? Contactanos →
          </Link>
        </div>
      </div>
    </div>
  );
}
