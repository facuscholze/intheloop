"use client";

import { useQualityStore } from "@/stores/qualityStore";

/**
 * Grano de película global. Opacidad FIJA por tier, a propósito: antes seguía
 * los agudos del audio en un loop de rAF y, como esta capa cubre toda la
 * pantalla por encima de todo (z-9999), con un tema sonando la página entera
 * titilaba. No volver a atarla al audio.
 */
export function Grain() {
  const tier = useQualityStore((s) => s.tier);

  if (tier === "low") {
    // Tier bajo: grain desactivado por completo (perf)
    return null;
  }

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
        aria-hidden="true"
      >
        <div className="grain" style={{ opacity: tier === "high" ? 0.06 : 0.04 }} />
      </div>
      {/* Additional canvas grain for high tier */}
      {tier === "high" && (
        <div className="pointer-events-none fixed inset-0 z-[1] opacity-[0.015] mix-blend-soft-light">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
      )}
    </>
  );
}
