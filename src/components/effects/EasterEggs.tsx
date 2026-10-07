"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "@/lib/motion";
import { useUIStore } from "@/stores/uiStore";
import { useVideoStore } from "@/stores/videoStore";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

export function KonamiCode() {
  const [isRaveActive, setIsRaveActive] = useState(false);
  const sequenceRef = useRef<string[]>([]);
  const reducedMotion = useUIStore((s) => s.reducedMotion);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      sequenceRef.current.push(e.key);
      if (sequenceRef.current.length > KONAMI.length) sequenceRef.current.shift();

      if (sequenceRef.current.join(",") === (KONAMI as readonly string[]).join(",")) {
        // Respect reduced motion - disable flashing
        if (reducedMotion) {
          setIsRaveActive(true);
          setTimeout(() => setIsRaveActive(false), 3000);
          sequenceRef.current = [];
          return;
        }

        setIsRaveActive(true);
        document.documentElement.classList.add("rave-mode");

        // Fixed: was 0.1s = 10Hz flashing (WCAG violation >3Hz)
        // Now 0.6s = 1.6Hz safe, <3Hz
        gsap.to("body", {
          backgroundColor: "#FF5A1F",
          duration: 0.6,
          yoyo: true,
          repeat: 8,
          ease: "power1.inOut",
          onComplete: () => {
            document.documentElement.classList.remove("rave-mode");
            setIsRaveActive(false);
            gsap.set("body", { clearProps: "backgroundColor" });
          },
        });

        // Confetti - non-flashing, safe
        for (let i = 0; i < 40; i++) {
          const confetti = document.createElement("div");
          confetti.style.position = "fixed";
          confetti.style.left = Math.random() * 100 + "vw";
          confetti.style.top = "-10px";
          confetti.style.width = "10px";
          confetti.style.height = "10px";
          confetti.style.background = ["#FF5A1F", "#FF2E93", "#C8FF00", "#FFD60A"][
            Math.floor(Math.random() * 4)
          ];
          confetti.style.zIndex = "9999";
          confetti.style.pointerEvents = "none";
          confetti.setAttribute("aria-hidden", "true");
          document.body.appendChild(confetti);
          gsap.to(confetti, {
            y: "100vh",
            x: (Math.random() - 0.5) * 200,
            rotation: 720,
            duration: 2 + Math.random() * 2,
            ease: "power1.out",
            onComplete: () => confetti.remove(),
          });
        }

        sequenceRef.current = [];
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [reducedMotion]);

  if (!isRaveActive) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
      aria-live="polite"
      aria-label="Easter egg activado: modo rave"
    >
      <div className="font-display animate-pulse text-[clamp(64px,15vw,150px)] font-bold text-white mix-blend-difference">
        RAVE MODE!
      </div>
      <style>{`
        .rave-mode {
          animation: rave 0.6s ease-in-out infinite;
        }
        @keyframes rave {
          0%, 100% { filter: hue-rotate(0deg) contrast(1.2) brightness(1); }
          50% { filter: hue-rotate(60deg) contrast(1.3) brightness(1.1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rave-mode {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export function Screensaver() {
  const [isActive, setIsActive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsActive(false);
      timeoutRef.current = setTimeout(() => {
        // Never cover the screen while the user is watching a video in cine
        // mode, the menu is open, the player is expanded, or before entering.
        const ui = useUIStore.getState();
        const cine = useVideoStore.getState().isCineMode;
        if (cine || ui.isMenuOpen || ui.isPlayerExpanded || !ui.hasEntered) {
          resetTimer(); // try again in 30s
          return;
        }
        setIsActive(true);
      }, 30000);
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Esc exits the screensaver (capture phase so it doesn't also close the
  // cine mode underneath)
  useEffect(() => {
    if (!isActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setIsActive(false);
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
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

      for (let i = 0; i < 64; i++) {
        const x = (i / 64) * canvas.width;
        const h = Math.sin(i * 0.3 + t * 2) * 100 + Math.cos(i * 0.1 + t) * 50 + 100;
        const hue = (i * 5 + t * 20) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
        ctx.fillRect(x, canvas.height / 2 - h / 2, canvas.width / 64 - 2, h);
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black"
      onClick={() => setIsActive(false)}
      role="dialog"
      aria-label="Screensaver visualizer"
      aria-modal="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />
      <div className="relative z-10 text-center">
        <div className="font-display text-6xl font-bold text-white">IN THE LOOP</div>
        <div className="mt-4 font-mono text-xs tracking-widest text-white/60 uppercase">
          Screensaver visualizer • Mové el mouse para salir • 30s inactividad
        </div>
        <button
          onClick={() => setIsActive(false)}
          className="mt-8 rounded-full border border-white/20 bg-white/10 px-6 py-2 font-mono text-xs tracking-widest text-white uppercase hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          autoFocus
        >
          Salir del screensaver (Esc)
        </button>
      </div>
    </div>
  );
}

export function Counters({
  shows,
  countries,
  yearsRange,
}: {
  shows: number;
  countries: string[];
  yearsRange: string;
}) {
  return (
    <div
      className="grid grid-cols-3 gap-6 rounded-[2rem] border border-[var(--border)] bg-[var(--bg-2)] p-8"
      role="region"
      aria-label="Estadísticas"
    >
      {[
        { value: shows, label: "Shows", sub: yearsRange },
        { value: countries.length, label: "Países", sub: countries.join(", ") },
        { value: 3, label: "Años", sub: "Desde los 14" },
      ].map((c) => (
        <div key={c.label} className="text-center">
          <div
            className="font-display text-4xl font-bold text-[var(--accent-fire)] md:text-5xl"
            aria-label={`${c.value} ${c.label}`}
          >
            {c.value}
          </div>
          <div className="font-mono text-xs tracking-widest text-[var(--fg)] uppercase">
            {c.label}
          </div>
          <div className="font-mono text-[10px] text-[var(--fg-dim)] uppercase">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
