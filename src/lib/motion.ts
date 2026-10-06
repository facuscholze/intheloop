"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
// Free plugins always available
// Club plugins (SplitText, DrawSVG, MorphSVG, Inertia) are optional - loaded dynamically if available

let registered = false;

export function registerGSAP() {
  if (registered) return;
  if (typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, CustomEase);

  // Custom eases - tribal/rave
  CustomEase.create("club", "0.76, 0, 0.24, 1");
  CustomEase.create("tribal", "0.34, 1.56, 0.64, 1");
  CustomEase.create("smooth", "0.16, 1, 0.3, 1");
  CustomEase.create("expo", "0.19, 1, 0.22, 1");

  registered = true;
}

export { gsap, ScrollTrigger, CustomEase };

// Try to load Club plugins dynamically (if user has license)
// NOTE: GSAP Club plugins (SplitText, DrawSVG, etc) are paid. If you have them, install via `npm install` from GreenSock private registry
// and uncomment the dynamic import below. For now we use free fallbacks.
export async function loadClubPlugins() {
  return null;
}

// Fallback SplitText using simple span split
export function splitTextFallback(el: HTMLElement) {
  const text = el.textContent || "";
  el.innerHTML = text
    .split("")
    .map((char) => (char === " " ? " " : `<span class="inline-block">${char}</span>`))
    .join("");
  return el.querySelectorAll("span");
}
