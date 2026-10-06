"use client";

import { useEffect, useRef } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useQualityStore } from "@/stores/qualityStore";

export function CursorBlob() {
  const ref = useRef<HTMLDivElement>(null);
  const cursorType = useUIStore((s) => s.cursorType);
  const tier = useQualityStore((s) => s.tier);

  useEffect(() => {
    if (tier === "low") return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // no cursor on touch

    const el = ref.current;
    if (!el) return;

    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    let raf = 0;

    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      currentX += (mouseX - currentX) * 0.15;
      currentY += (mouseY - currentY) * 0.15;
      if (el) {
        el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      raf = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener("mousemove", handleMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMove);
    };
  }, [tier]);

  if (tier === "low") return null;

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 z-[9998] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 mix-blend-difference md:block"
      style={{
        background: "white",
        borderRadius: cursorType === "default" ? "50%" : cursorType === "play" ? "0%" : "50%",
        transition: "width 0.3s var(--ease-smooth), height 0.3s var(--ease-smooth), border-radius 0.3s",
        width: cursorType === "view" ? "80px" : cursorType === "play" ? "48px" : "32px",
        height: cursorType === "view" ? "80px" : cursorType === "play" ? "48px" : "32px",
        opacity: 0.9,
        willChange: "transform",
      }}
    />
  );
}
