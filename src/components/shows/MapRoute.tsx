"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion";
import { useAudioReactive } from "@/hooks/useAudioReactive";
import { useIntersectionPause } from "@/hooks/useIntersectionPause";

const route = [
  { id: "AR", name: "Argentina", x: 150, y: 320, color: "#FF5A1F" },
  { id: "ES", name: "España", x: 480, y: 180, color: "#FF2E93" },
  { id: "BR", name: "Brasil", x: 220, y: 280, color: "#C8FF00" },
  { id: "FR", name: "Francia", x: 500, y: 160, color: "#FF2E93" },
  { id: "CZ", name: "Rep. Checa", x: 540, y: 150, color: "#8B5CF6" },
  { id: "DE", name: "Alemania", x: 530, y: 130, color: "#FFD60A" },
  { id: "JP", name: "Japón", x: 800, y: 180, color: "#666", soon: true },
];

export function MapRoute() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { ref: containerRef, isVisible } = useIntersectionPause<HTMLDivElement>();
  const { bass, beat } = useAudioReactive();

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    const ctx = gsap.context(() => {
      // Animate path drawing
      const paths = svgRef.current!.querySelectorAll(".route-path");
      paths.forEach((path, i) => {
        const length = (path as SVGPathElement).getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.5,
          delay: i * 0.3,
          ease: "power2.out",
        });
      });

      // Animate dots pulsing
      const dots = svgRef.current!.querySelectorAll(".route-dot");
      dots.forEach((dot, i) => {
        gsap.fromTo(
          dot,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, delay: 0.5 + i * 0.2, ease: "back.out(1.7)" }
        );
      });
    });

    return () => ctx.revert();
  }, [isVisible]);

  // Beat reactive pulse for dots
  useEffect(() => {
    if (!svgRef.current) return;
    const dots = svgRef.current.querySelectorAll(".route-dot");
    dots.forEach((dot) => {
      gsap.to(dot, {
        scale: 1 + beat * 0.5 + bass * 0.3,
        duration: 0.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  }, [beat, bass]);

  return (
    <div ref={containerRef as any} className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--bg)] p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Ruta animada • 5 países confirmados</div>
          <div className="mt-1 font-display text-2xl font-bold">
            ARG → ESP → BRA → FRA → CZE → GER → <span className="text-[var(--fg-dim)]">JPN SOON</span>
          </div>
        </div>
        <div className="hidden items-center gap-2 font-mono text-[10px] uppercase md:flex">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent-lime)]" />
          Live tour
        </div>
      </div>

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[var(--bg-2)]">
        <svg ref={svgRef} viewBox="0 0 1000 400" className="h-full w-full">
          {/* World map simplified background */}
          <rect width="1000" height="400" fill="#12101A" />
          {/* Grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent-fire)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent-fire)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1000" height="400" fill="url(#grid)" />

          {/* Route paths */}
          {route.slice(0, -1).map((point, i) => {
            const next = route[i + 1];
            if (!next || next.soon) return null;
            // Curved path
            const mx = (point.x + next.x) / 2;
            const my = Math.min(point.y, next.y) - 30 - i * 10;
            return (
              <path
                key={`${point.id}-${next.id}`}
                className="route-path"
                d={`M ${point.x} ${point.y} Q ${mx} ${my} ${next.x} ${next.y}`}
                fill="none"
                stroke={point.color}
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            );
          })}

          {/* Dots */}
          {route.map((point) => (
            <g key={point.id} className="route-dot" style={{ transformOrigin: `${point.x}px ${point.y}px` }}>
              <circle cx={point.x} cy={point.y} r="20" fill={point.color} opacity="0.15" />
              <circle cx={point.x} cy={point.y} r="8" fill={point.color} />
              <circle cx={point.x} cy={point.y} r="3" fill="white" />
              <text
                x={point.x}
                y={point.y - 20}
                textAnchor="middle"
                fontFamily="monospace"
                fontSize="12"
                fontWeight="bold"
                fill={point.soon ? "#666" : "white"}
              >
                {point.id} {point.soon ? "SOON" : ""}
              </text>
              <text x={point.x} y={point.y + 30} textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#8A8890">
                {point.name}
              </text>
            </g>
          ))}

          {/* Animated plane */}
          <g className="plane" opacity="0.8">
            <circle r="4" fill="var(--accent-fire)">
              <animateMotion dur="12s" repeatCount="indefinite" rotate="auto">
                <mpath href="#mainRoute" />
              </animateMotion>
            </circle>
          </g>

          {/* Main route for plane */}
          <path
            id="mainRoute"
            d={`M ${route[0].x} ${route[0].y} Q 300 100 480 180 Q 350 120 220 280 Q 360 200 500 160 Q 520 100 540 150 Q 500 80 530 130`}
            fill="none"
            stroke="none"
          />
        </svg>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-1 w-full bg-[var(--border)]">
          <div className="h-full w-[85%] bg-gradient-to-r from-[var(--accent-fire)] via-[var(--accent-magenta)] to-[var(--accent-gold)]" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)]">
        <span>5 países • 20+ shows • 2023-2026 • Próximo: Japón</span>
        <span className="ml-auto hidden items-center gap-1 md:flex">
          <span className="h-1 w-1 rounded-full bg-[var(--accent-fire)]" />
          En vivo • Audio reactive
        </span>
      </div>
    </div>
  );
}
