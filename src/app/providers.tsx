"use client";

import { useEffect } from "react";
import { registerGSAP } from "@/lib/motion";
import { useLenis } from "@/hooks/useLenis";
import { useQualityStore } from "@/stores/qualityStore";
import { useUIStore } from "@/stores/uiStore";
import { installAnchorScroll } from "@/lib/smooth-scroll";

export function Providers({ children }: { children: React.ReactNode }) {
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const hasEntered = useUIStore((s) => s.hasEntered);

  // Register GSAP
  useEffect(() => {
    registerGSAP();
  }, []);

  // Links internos (#music, #booking...) con scroll animado en vez de salto
  useEffect(() => installAnchorScroll(), []);

  // Lenis smooth scroll - only after enter and not reduced motion
  useLenis(hasEntered && !reducedMotion);

  // Quality init
  useEffect(() => {
    if (hasEntered) {
      useQualityStore.getState().init();
    }
  }, [hasEntered]);

  // Reduced motion media query listener
  // (accesibilidad: pausa animaciones; la calidad sigue siempre en MAX)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => {
      useUIStore.getState().setReducedMotion(e.matches);
    };
    mq.addEventListener("change", handler);
    if (mq.matches) useUIStore.getState().setReducedMotion(true);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return <>{children}</>;
}
