"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "@/lib/motion";

export function KonamiCode() {
  const [isRaveActive, setIsRaveActive] = useState(false);
  const sequenceRef = useRef<string[]>([]);
  const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      sequenceRef.current.push(e.key);
      if (sequenceRef.current.length > konami.length) sequenceRef.current.shift();

      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (sequenceRef.current.join(",") === konami.join(",")) {
        setIsRaveActive(true);
        // Rave mode for 10 seconds
        document.documentElement.classList.add("rave-mode");
        gsap.to("body", {
          backgroundColor: "#FF5A1F",
          duration: 0.1,
          yoyo: true,
          repeat: 50,
          onComplete: () => {
            document.documentElement.classList.remove("rave-mode");
            setIsRaveActive(false);
            gsap.set("body", { clearProps: "backgroundColor" });
          },
        });

        // Confetti
        for (let i = 0; i < 50; i++) {
          const confetti = document.createElement("div");
          confetti.style.position = "fixed";
          confetti.style.left = Math.random() * 100 + "vw";
          confetti.style.top = "-10px";
          confetti.style.width = "10px";
          confetti.style.height = "10px";
          confetti.style.background = ["#FF5A1F", "#FF2E93", "#C8FF00", "#FFD60A"][Math.floor(Math.random() * 4)];
          confetti.style.zIndex = "9999";
          confetti.style.pointerEvents = "none";
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
  }, []);

  if (!isRaveActive) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center">
      <div className="animate-pulse font-display text-[clamp(48px,12vw,120px)] font-bold text-white mix-blend-difference">RAVE MODE!</div>
      <style>{`
        .rave-mode {
          animation: rave 0.1s infinite;
        }
        @keyframes rave {
          0% { filter: hue-rotate(0deg) contrast(1.5); }
          100% { filter: hue-rotate(360deg) contrast(1.5); }
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
      timeoutRef.current = setTimeout(() => setIsActive(true), 30000); // 30s inactivity
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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

      // Visualizer bars
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
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black" onClick={() => setIsActive(false)}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="relative z-10 text-center">
        <div className="font-display text-6xl font-bold text-white">IN THE LOOP</div>
        <div className="mt-4 font-mono text-xs uppercase tracking-widest text-white/60">Screensaver visualizer • Mové el mouse para salir • 30s inactividad</div>
      </div>
    </div>
  );
}

export function Counters() {
  const shows = 20; // real from content
  const countries = 5;
  const years = 3;

  return (
    <div className="grid grid-cols-3 gap-6 rounded-[2rem] border border-[var(--border)] bg-[var(--bg-2)] p-8">
      {[
        { value: shows, label: "Shows", sub: "2023-2026" },
        { value: countries, label: "Países", sub: "AR, ES, BR, FR, DE" },
        { value: years, label: "Años", sub: "Desde los 14" },
      ].map((c) => (
        <div key={c.label} className="text-center">
          <div className="font-display text-4xl font-bold text-[var(--accent-fire)] md:text-5xl">{c.value}+</div>
          <div className="font-mono text-xs uppercase tracking-widest text-[var(--fg)]">{c.label}</div>
          <div className="font-mono text-[10px] uppercase text-[var(--fg-dim)]">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
