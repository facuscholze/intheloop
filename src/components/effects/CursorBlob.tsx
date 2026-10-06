"use client";

import { useEffect, useRef } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useQualityStore } from "@/stores/qualityStore";
import { useAudioReactive } from "@/hooks/useAudioReactive";

export function CursorBlob() {
  const ref = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<HTMLDivElement[]>([]);
  const cursorType = useUIStore((s) => s.cursorType);
  const tier = useQualityStore((s) => s.tier);
  const { bass, beat } = useAudioReactive();
  const audioRef = useRef({ bass, beat });
  audioRef.current = { bass, beat };

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

    const trailPositions: { x: number; y: number }[] = Array.from({ length: 5 }, () => ({ x: mouseX, y: mouseY }));

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

    const animate = () => {
      // Main blob lerp
      currentX += (mouseX - currentX) * 0.18;
      currentY += (mouseY - currentY) * 0.18;

      // Audio reactive scale
      const { bass: currentBass, beat: currentBeat } = audioRef.current;
      const scale = 1 + currentBass * 0.8 + currentBeat * 0.5;
      const glow = 10 + currentBass * 30 + currentBeat * 20;

      if (el) {
        el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${scale})`;
        el.style.boxShadow = `0 0 ${glow}px rgba(255,90,31,${0.3 + currentBass * 0.4})`;
      }

      // Trail
      trailPositions.unshift({ x: currentX, y: currentY });
      trailPositions.pop();

      trailRefs.current.forEach((trail, i) => {
        if (!trail) return;
        const pos = trailPositions[i];
        if (!pos) return;
        const trailScale = 1 - i * 0.15;
        const opacity = 0.15 - i * 0.02;
        trail.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${trailScale * scale})`;
        trail.style.opacity = `${opacity}`;
      });

      raf = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseover", handleEnter);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleEnter);
      root.classList.remove("custom-cursor-active");
    };
  }, [tier]);

  if (tier === "low") return null;

  const size = cursorType === "view" ? 80 : cursorType === "play" ? 56 : cursorType === "drag" ? 48 : cursorType === "close" ? 40 : 28;
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
          className="custom-cursor-visual pointer-events-none fixed left-0 top-0 z-[9997] hidden -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-difference md:block"
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
        className="custom-cursor-visual pointer-events-none fixed left-0 top-0 z-[9998] hidden -translate-x-1/2 -translate-y-1/2 mix-blend-difference md:flex md:items-center md:justify-center"
        style={{
          width: size,
          height: size,
          background: isView ? "white" : isPlay ? "var(--accent-fire)" : "white",
          borderRadius: cursorType === "default" ? "50%" : isView ? "50%" : "50%",
          transition: "width 0.3s var(--ease-smooth), height 0.3s var(--ease-smooth), background 0.3s",
          willChange: "transform",
        }}
      >
        {isView && <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-black">VIEW</span>}
        {isPlay && <span className="ml-0.5 text-black">▶</span>}
        {cursorType === "drag" && <span className="font-mono text-[10px] font-bold uppercase text-black">DRAG</span>}
        {cursorType === "close" && <span className="text-sm font-bold text-black">✕</span>}
      </div>
    </>
  );
}
