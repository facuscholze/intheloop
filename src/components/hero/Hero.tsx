"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { HeroShader } from "./HeroShader";
import { HeroShaderR3F } from "./HeroShaderR3F";
import { useQualityStore } from "@/stores/qualityStore";
import { useUIStore } from "@/stores/uiStore";

export function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const entranceRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const tier = useQualityStore((s) => s.tier);
  const reducedMotion = useUIStore((s) => s.reducedMotion);

  useEffect(() => {
    if (!titleRef.current || reducedMotion) return;
    const ctx = gsap.context(() => {
      const chars = titleRef.current!.querySelectorAll(".char");
      gsap.fromTo(
        chars,
        { y: 140, opacity: 0, rotateX: -90, transformOrigin: "bottom" },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.4, stagger: 0.03, ease: "club", delay: 0.3 }
      );

      if (subRef.current) {
        gsap.fromTo(
          subRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, delay: 0.9, ease: "power3.out" }
        );
      }

      // Entrance animates the OUTER wrapper so it never fights the
      // audio-reactive transform of the inner image (CSS vars)
      if (entranceRef.current) {
        gsap.fromTo(
          entranceRef.current,
          { scale: 1.2, opacity: 0, clipPath: "inset(20% 20% 20% 20%)" },
          {
            scale: 1,
            opacity: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.5,
            ease: "expo",
            delay: 0.5,
          }
        );
      }
    });
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[var(--bg)] px-6 py-24 md:px-10"
      aria-label="Hero - Tommy Petersen DJ"
    >
      {/* Shader background */}
      <div className="absolute inset-0" aria-hidden="true">
        <HeroShader />
        <HeroShaderR3F />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_rgba(255,90,31,0.18),_transparent_60%),radial-gradient(ellipse_at_80%_80%,_rgba(255,46,147,0.15),_transparent_60%),radial-gradient(ellipse_at_50%_50%,_rgba(200,255,0,0.05),_transparent_70%)]" />
      </div>

      {/* Tribal pattern SVG */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" role="presentation">
          <defs>
            <pattern id="tribal" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path
                d="M0 50 Q25 0 50 50 T100 50"
                stroke="var(--accent-fire)"
                strokeWidth="0.5"
                fill="none"
              />
              <circle cx="50" cy="50" r="2" fill="var(--accent-fire)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tribal)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[var(--content-max)] gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div>
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-2)]/80 px-4 py-1 font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase backdrop-blur"
            aria-label="Ubicación y estado"
          >
            <span
              className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent-lime)]"
              aria-hidden="true"
            />
            IN THE LOOP AGENCY • ARG → EU → BR • LIVE
          </div>

          <h1
            ref={titleRef}
            className="font-display text-[clamp(56px,13vw,190px)] leading-[0.85] font-extrabold tracking-[-0.05em] text-[var(--fg)]"
            style={{ perspective: "1000px" }}
          >
            <span className="block overflow-hidden">
              {"TOMMY".split("").map((c, i) => (
                <span
                  key={i}
                  className="char inline-block will-change-transform"
                  aria-hidden="true"
                >
                  {c}
                </span>
              ))}
              <span className="sr-only">Tommy</span>
            </span>
            <span className="block overflow-hidden bg-gradient-to-r from-[var(--accent-fire)] via-[var(--accent-magenta)] to-[var(--accent-gold)] bg-clip-text text-transparent">
              {"PETERSEN".split("").map((c, i) => (
                <span
                  key={i}
                  className="char inline-block will-change-transform"
                  aria-hidden="true"
                >
                  {c}
                </span>
              ))}
              <span className="sr-only">Petersen</span>
            </span>
          </h1>

          <div className="mt-8 flex max-w-xl flex-col gap-8">
            <p
              ref={subRef}
              className="font-sans text-lg leading-relaxed text-[var(--fg-muted)] md:text-xl"
            >
              DJ y productor de Argentina. <span className="text-[var(--fg)]">Tribal House</span> /
              House / Latin grooves con texturas melódicas. Desde los 14 años.{" "}
              <em
                className="kinetic text-[var(--accent-fire)]"
                style={{ fontVariationSettings: `"wght" var(--bass-wght)` }}
              >
                Every dancefloor has its own story.
              </em>
            </p>

            <div className="flex flex-wrap gap-4">
              <MagneticButton className="bg-[var(--fg)] text-black hover:bg-[var(--accent-lime)]">
                <a
                  href="#booking"
                  data-cursor="view"
                  aria-label="Ir a formulario de booking para contratar a Tommy"
                  className="rounded-full px-2 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  BOOK TOMMY
                </a>
              </MagneticButton>
              <a
                href="#music"
                data-cursor="play"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-8 py-4 font-mono text-xs tracking-widest text-[var(--fg)] uppercase transition-colors hover:border-[var(--fg)] hover:bg-[var(--fg)] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
                aria-label="Ir a sección de música y reproducir tracks"
              >
                <span aria-hidden="true">▶</span> Escuchar
              </a>
            </div>

            <dl className="grid grid-cols-2 gap-6 border-t border-[var(--border)] pt-8 font-mono text-xs tracking-widest text-[var(--fg-dim)] uppercase md:grid-cols-4">
              <div>
                <dt className="text-[var(--fg)]">5 países</dt>
                <dd>AR, ES, BR, FR, DE</dd>
              </div>
              <div>
                <dt className="text-[var(--fg)]">Tribal / House</dt>
                <dd>Sunset • Beach • Club</dd>
              </div>
              <div>
                <dt className="text-[var(--fg)]">In The Loop</dt>
                <dd>Agency & events</dd>
              </div>
              <div>
                <dt className="text-[var(--fg)]">124 BPM</dt>
                <dd className="text-[var(--accent-fire)]" aria-label="En vivo">
                  ● LIVE
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Image with organic mask + duotone + RGB-split */}
        <div
          className="relative hidden md:block"
          role="img"
          aria-label="Imagen hero de Tommy Petersen - placeholder, agregar foto real en media-src/images/hero/"
        >
          <div ref={entranceRef}>
            <div
              ref={imageRef}
              className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--bg-2)] will-change-transform"
              style={{
                clipPath: "polygon(10% 0, 100% 0, 90% 100%, 0 100%)",
                transform:
                  tier === "low" || reducedMotion
                    ? "scale(1)"
                    : "scale(calc(1 + var(--bass) * 0.05 + var(--beat) * 0.03))",
              }}
              data-cursor="view"
            >
              <div
                className="absolute inset-0 bg-gradient-to-br from-[var(--accent-fire)] via-[var(--bg-2)] to-[var(--accent-magenta)]"
                aria-hidden="true"
              />
              <div
                className="bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')] absolute inset-0 opacity-20 mix-blend-soft-light"
                aria-hidden="true"
              />

              {/* RGB-split effect layers - disabled for reduced motion */}
              {!reducedMotion && (
                <>
                  <div
                    className="absolute inset-0 opacity-60 mix-blend-screen"
                    style={{
                      transform: "translateX(calc(var(--bass) * 4px))",
                      background:
                        "linear-gradient(45deg, transparent 30%, rgba(255,90,31,0.2), transparent 70%)",
                    }}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 opacity-40 mix-blend-screen"
                    style={{
                      transform: "translateX(calc(var(--bass) * -4px))",
                      background:
                        "linear-gradient(-45deg, transparent 30%, rgba(255,46,147,0.2), transparent 70%)",
                    }}
                    aria-hidden="true"
                  />
                </>
              )}

              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="font-mono text-[10px] tracking-widest text-white/60 uppercase">
                  Foto hero placeholder
                </div>
                <div className="font-display text-lg font-bold text-white">
                  Agregá foto en media-src/images/hero/
                </div>
                <div className="mt-1 font-mono text-[9px] text-white/40 uppercase">
                  Optimizada WebP 2500px + thumb • next/image priority
                </div>
              </div>

              <div
                className="pointer-events-none absolute -inset-10 bg-[radial-gradient(ellipse_at_center,_rgba(255,90,31,0.2),_transparent_60%)] blur-2xl"
                aria-hidden="true"
              />
            </div>
          </div>

          <div
            className="absolute top-10 -right-6 rotate-3 rounded-full bg-[var(--accent-lime)] px-4 py-1 font-mono text-[10px] font-bold tracking-widest text-black uppercase"
            aria-hidden="true"
          >
            Tribal House
          </div>
          <div
            className="absolute bottom-20 -left-6 -rotate-2 rounded-full bg-[var(--accent-fire)] px-4 py-1 font-mono text-[10px] font-bold tracking-widest text-black uppercase"
            aria-hidden="true"
          >
            Buenos Aires → Berlín
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-widest text-[var(--fg-dim)] uppercase"
        aria-hidden="true"
      >
        <span>Scroll</span>
        <div className="h-12 w-[1px] overflow-hidden bg-[var(--border)]">
          <div className="h-full w-full animate-[scrollDown_1.5s_ease-in-out_infinite] bg-[var(--accent-fire)]" />
        </div>
      </div>

      <style>{`
        @keyframes scrollDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-[scrollDown_1.5s_ease-in-out_infinite] {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
