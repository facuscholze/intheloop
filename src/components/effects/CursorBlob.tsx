"use client";

import { useEffect, useRef } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useQualityStore } from "@/stores/qualityStore";
import { audioEngine } from "@/lib/audio-engine";

export function CursorBlob() {
  const ref = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<HTMLDivElement[]>([]);
  const cursorType = useUIStore((s) => s.cursorType);
  const tier = useQualityStore((s) => s.tier);
  // Audio read inside the animation loop — no React re-renders at audio rate
  const audioRef = useRef({ bass: 0, beat: 0 });

  useEffect(() => {
    if (tier === "low") return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const el = ref.current;
    if (!el) return;

    const root = document.documentElement;
    root.classList.add("custom-cursor-active");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let raf = 0;

    const trailPositions: { x: number; y: number }[] = Array.from({ length: 5 }, () => ({
      x: mouseX,
      y: mouseY,
    }));

    const unsubAudio = audioEngine?.subscribe((a) => {
      audioRef.current.bass = a.bass;
      audioRef.current.beat = a.beat;
    });

    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cursor = target.closest("[data-cursor]")?.getAttribute("data-cursor") as any;
      if (cursor) {
        useUIStore.getState().setCursorType(cursor);
      } else {
        useUIStore.getState().setCursorType("default");
      }
    };

    let lastWrite = "";

    const animate = () => {
      // Main blob lerp
      currentX += (mouseX - currentX) * 0.18;
      currentY += (mouseY - currentY) * 0.18;

      // Audio reactive scale
      const { bass: currentBass, beat: currentBeat } = audioRef.current;
      const scale = 1 + currentBass * 0.8 + currentBeat * 0.5;
      const glow = 10 + currentBass * 30 + currentBeat * 20;

      // Skip DOM writes when everything has settled (idle CPU → 0).
      // Key covers main + trail history so trails never freeze mid-lerp.
      const qx = Math.round(currentX);
      const qy = Math.round(currentY);
      let writeKey = `${qx}|${qy}|${scale.toFixed(2)}`;
      for (let i = 1; i < trailPositions.length; i++) {
        const p = trailPositions[i];
        writeKey += `|${Math.round(p.x)},${Math.round(p.y)}`;
      }
      const moved = writeKey !== lastWrite;
      lastWrite = writeKey;

      if (el && moved) {
        el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${scale})`;
        el.style.boxShadow = `0 0 ${glow}px rgba(255,90,31,${0.3 + currentBass * 0.4})`;
      }

      // Trail
      trailPositions.unshift({ x: currentX, y: currentY });
      trailPositions.pop();

      if (moved) {
        trailRefs.current.forEach((trail, i) => {
          if (!trail) return;
          const pos = trailPositions[i];
          if (!pos) return;
          const trailScale = 1 - i * 0.15;
          const opacity = 0.15 - i * 0.02;
          trail.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${trailScale * scale})`;
          trail.style.opacity = `${opacity}`;
        });
      }

      raf = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseover", handleEnter);

    return () => {
      cancelAnimationFrame(raf);
      unsubAudio?.();
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleEnter);
      root.classList.remove("custom-cursor-active");
    };
  }, [tier]);

  if (tier === "low") return null;

  const size =
    cursorType === "view"
      ? 80
      : cursorType === "play"
        ? 56
        : cursorType === "drag"
          ? 48
          : cursorType === "close"
            ? 40
            : 28;
  const isView = cursorType === "view";
  const isPlay = cursorType === "play";

  return (
    <>
      {/* Trail */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) trailRefs.current[i] = el;
          }}
          className="custom-cursor-visual pointer-events-none fixed top-0 left-0 z-[9997] hidden -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-difference md:block"
          style={{
            width: size,
            height: size,
            background: i === 0 ? "rgba(255,90,31,0.3)" : "white",
            willChange: "transform",
            transition: "width 0.3s var(--ease-smooth), height 0.3s var(--ease-smooth)",
          }}
        />
      ))}

      {/* Main */}
      <div
        ref={ref}
        className="custom-cursor-visual pointer-events-none fixed top-0 left-0 z-[9998] hidden -translate-x-1/2 -translate-y-1/2 mix-blend-difference md:flex md:items-center md:justify-center"
        style={{
          width: size,
          height: size,
          background: isView ? "white" : isPlay ? "var(--accent-fire)" : "white",
          borderRadius: cursorType === "default" ? "50%" : isView ? "50%" : "50%",
          transition:
            "width 0.3s var(--ease-smooth), height 0.3s var(--ease-smooth), background 0.3s",
          willChange: "transform",
        }}
      >
        {isView && (
          <span className="font-mono text-[10px] font-bold tracking-widest text-black uppercase">
            VIEW
          </span>
        )}
        {isPlay && <span className="ml-0.5 text-black">▶</span>}
        {cursorType === "drag" && (
          <span className="font-mono text-[10px] font-bold text-black uppercase">DRAG</span>
        )}
        {cursorType === "close" && <span className="text-sm font-bold text-black">✕</span>}
      </div>
    </>
  );
}
