"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "@/lib/motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.08,
      smoothWheel: true,
      gestureOrientation: "vertical",
    });

    lenis.on("scroll", ScrollTrigger.update);

    // Keep a stable reference: the cleanup previously passed a NEW arrow
    // function to gsap.ticker.remove(), which never removed the callback —
    // every enable/disable cycle leaked another ticker tick on a destroyed
    // Lenis instance.
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
    };
  }, [enabled]);
}
