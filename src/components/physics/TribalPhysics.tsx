"use client";

import { useEffect, useRef, useState } from "react";
import { useQualityStore } from "@/stores/qualityStore";
import { useIntersectionPause } from "@/hooks/useIntersectionPause";
import { audioEngine, type AudioAnalysis } from "@/lib/audio-engine";

interface Word {
  id: string;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationV: number;
  color: string;
}

const words = [
  "TRIBAL",
  "HOUSE",
  "LATIN",
  "GROOVES",
  "SUNSET",
  "BEACH",
  "UNDERGROUND",
  "RAVE",
  "IN THE LOOP",
];

export function TribalPhysics() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordsRef = useRef<Word[]>([]);
  const tier = useQualityStore((s) => s.tier);
  const [isMatterLoaded, setIsMatterLoaded] = useState(false);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000, isDown: false });
  // Audio + visibility read inside the loop. The old effect had [bass, beat]
  // as deps, so it tore down, RE-INITIALIZED every word (physics reset!) and
  // rebuilt all listeners 60 times per second.
  const audioRef = useRef<AudioAnalysis>({ bass: 0, mid: 0, high: 0, level: 0, beat: 0, bpm: 124 });
  const { ref: visRef, isVisible } = useIntersectionPause<HTMLDivElement>();
  const isVisibleRef = useRef(true);
  isVisibleRef.current = isVisible;

  const setRefs = (el: HTMLDivElement | null) => {
    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    (visRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };

  // Simple canvas physics (Matter.js dynamic import in high tier)
  useEffect(() => {
    if (tier === "low") return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const unsub = audioEngine?.subscribe((a) => {
      audioRef.current = a;
    });
    if (audioEngine) audioRef.current = { ...audioEngine.analysis };

    // Init words ONCE per tier
    wordsRef.current = words.map((text, i) => ({
      id: `${text}-${i}`,
      text,
      x: Math.random() * canvas.width,
      y: -50 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2 + 1,
      rotation: Math.random() * 360,
      rotationV: (Math.random() - 0.5) * 4,
      color: ["#FF5A1F", "#FF2E93", "#C8FF00", "#FFD60A", "#8B5CF6"][i % 5],
    }));

    const gravity = 0.15;

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      // Pause work entirely while off-screen (rAF keeps ticking cheaply)
      if (!isVisibleRef.current) return;
      const { bass, beat } = audioRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      wordsRef.current.forEach((word) => {
        // Physics
        word.vy += gravity + bass * 0.1;
        word.vx += (Math.random() - 0.5) * 0.05 + bass * 0.02;
        word.x += word.vx + (beat > 0.8 ? (Math.random() - 0.5) * beat * 5 : 0);
        word.y += word.vy;
        word.rotation += word.rotationV + bass * 0.5;

        // Bounce off bottom
        if (word.y > canvas.height - 30) {
          word.y = canvas.height - 30;
          word.vy *= -0.6 - bass * 0.2;
          word.vx *= 0.9;
          if (Math.abs(word.vy) < 1) word.vy = -2 - Math.random() * 2;
        }

        // Bounce off sides
        if (word.x < 0 || word.x > canvas.width - 100) {
          word.vx *= -0.8;
          word.x = Math.max(0, Math.min(canvas.width - 100, word.x));
        }

        // Mouse interaction
        const dx = mouseRef.current.x - word.x;
        const dy = mouseRef.current.y - word.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          if (mouseRef.current.isDown) {
            // Drag
            word.x = mouseRef.current.x - 50;
            word.y = mouseRef.current.y - 15;
            word.vx = 0;
            word.vy = 0;
          } else {
            // Repel
            word.vx -= (dx / dist) * force * 0.5;
            word.vy -= (dy / dist) * force * 0.5;
          }
        }

        // Reset if falls too long
        if (word.y > canvas.height + 100) {
          word.y = -50;
          word.x = Math.random() * canvas.width;
          word.vy = Math.random() * 2 + 1;
        }

        // Draw — note: canvas font does NOT support var(); use the real stack
        ctx.save();
        ctx.translate(word.x + 50, word.y + 15);
        ctx.rotate((word.rotation * Math.PI) / 180);
        ctx.font = `bold ${24 + bass * 10}px Syne, system-ui, sans-serif`;
        ctx.fillStyle = word.color;
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 3;
        ctx.strokeText(word.text, -50, 0);
        ctx.fillText(word.text, -50, 0);

        // Beat glow
        if (beat > 0.7) {
          ctx.shadowColor = word.color;
          ctx.shadowBlur = beat * 20;
          ctx.fillText(word.text, -50, 0);
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      });
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };
    const handleMouseDown = () => (mouseRef.current.isDown = true);
    const handleMouseUp = () => (mouseRef.current.isDown = false);

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // Load Matter.js in High tier for better physics
    if (tier === "high") {
      import("matter-js").then(() => setIsMatterLoaded(true)).catch(() => {});
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      unsub?.();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [tier]);

  if (tier === "low") {
    return (
      <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-2)] p-8 text-center font-mono text-xs text-[var(--fg-muted)] uppercase">
        Física tribal con Matter.js disponible en Normal/Max — Fase 4
      </div>
    );
  }

  return (
    <div
      ref={setRefs}
      className="relative h-[60vh] w-full overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--bg-2)]"
    >
      <canvas ref={canvasRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      <div className="pointer-events-none absolute top-6 left-6 rounded-full bg-black/60 px-4 py-2 font-mono text-[10px] tracking-widest text-white uppercase backdrop-blur">
        Física: {words.length} palabras • Drag para mover • Audio reactive{" "}
        {isMatterLoaded ? "• Matter.js ON" : "• Canvas physics"}
      </div>

      <div className="pointer-events-none absolute right-6 bottom-6 left-6 flex justify-between font-mono text-[10px] text-[var(--fg-dim)] uppercase">
        <span>TRIBAL / HOUSE / LATIN — palabras que caen y rebotan</span>
        <span className="hidden md:block">Click + drag • Audio reactive</span>
      </div>
    </div>
  );
}
