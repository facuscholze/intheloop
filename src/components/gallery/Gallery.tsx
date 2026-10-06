"use client";

import { useRef, useState, useEffect } from "react";
import { gsap } from "@/lib/motion";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

interface GalleryItem {
  id: string;
  src: string;
  city: string;
  country: string;
  count?: number;
}

const mockGalleries: GalleryItem[] = [
  { id: "paris", src: "", city: "París", country: "FR", count: 12 },
  { id: "berlin", src: "", city: "Berlín", country: "DE", count: 8 },
  { id: "recoleta", src: "", city: "Recoleta", country: "AR", count: 15 },
  { id: "tandil", src: "", city: "Tandil", country: "AR", count: 20 },
  { id: "azul", src: "", city: "Azul", country: "AR", count: 10 },
  { id: "olavarria", src: "", city: "Olavarría", country: "AR", count: 18 },
  { id: "camboriu", src: "", city: "Camboriú", country: "BR", count: 9 },
  { id: "vitoria", src: "", city: "Vitoria-Gasteiz", country: "ES", count: 6 },
];

export function GalleryCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const velocity = useRef(0);
  const rafRef = useRef<number>(0);

  // Lock background scroll while the lightbox is open + Esc to close
  useEffect(() => {
    if (!activeId) return;
    const token = lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unlockScroll(token);
      window.removeEventListener("keydown", onKey);
    };
  }, [activeId]);

  // Drag with inertia
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    let lastX = 0;
    let lastTime = 0;

    const handleStart = (e: MouseEvent | TouchEvent) => {
      isDragging.current = true;
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      startX.current = clientX - container.offsetLeft;
      scrollLeft.current = container.scrollLeft;
      lastX = clientX;
      lastTime = performance.now();
      container.style.cursor = "grabbing";
      cancelAnimationFrame(rafRef.current);
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const x = clientX - container.offsetLeft;
      const walk = (x - startX.current) * 1.5;
      container.scrollLeft = scrollLeft.current - walk;

      // Velocity for inertia
      const now = performance.now();
      const deltaTime = now - lastTime;
      if (deltaTime > 0) {
        velocity.current = (clientX - lastX) / deltaTime;
        lastX = clientX;
        lastTime = now;
      }
    };

    const handleEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      container.style.cursor = "grab";

      // Inertia
      const inertia = () => {
        if (Math.abs(velocity.current) < 0.01) return;
        container.scrollLeft -= velocity.current * 15;
        velocity.current *= 0.95;
        rafRef.current = requestAnimationFrame(inertia);
      };
      inertia();
    };

    container.addEventListener("mousedown", handleStart);
    container.addEventListener("touchstart", handleStart, { passive: false });
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchend", handleEnd);

    return () => {
      container.removeEventListener("mousedown", handleStart);
      container.removeEventListener("touchstart", handleStart);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchend", handleEnd);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Tilt 3D on mouse move
  const handleTilt = (e: React.MouseEvent, id: string) => {
    const card = document.getElementById(`gallery-${id}`);
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = (x - centerX) / 10;
    const rotateX = (centerY - y) / 10;

    gsap.to(card, {
      rotateY,
      rotateX,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 1000,
      overwrite: "auto",
    });
  };

  const handleTiltLeave = (id: string) => {
    const card = document.getElementById(`gallery-${id}`);
    if (!card) return;
    gsap.to(card, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.6,
      ease: "elastic.out(1,0.5)",
      overwrite: "auto",
    });
  };

  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-2xl font-bold">Galerías por ciudad</h3>
        <div className="font-mono text-xs text-[var(--fg-muted)] uppercase">
          Drag con inercia • Tilt 3D • Click para lightbox
        </div>
      </div>

      <div
        ref={containerRef}
        className="scrollbar-hide flex cursor-grab gap-4 overflow-x-auto pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div ref={trackRef} className="flex gap-4">
          {mockGalleries.map((item) => (
            <div
              key={item.id}
              id={`gallery-${item.id}`}
              className="group relative h-64 w-80 shrink-0 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--bg-2)] transition-all hover:border-[var(--accent-gold)]"
              onMouseMove={(e) => handleTilt(e, item.id)}
              onMouseLeave={() => handleTiltLeave(item.id)}
              onClick={() => setActiveId(item.id)}
              data-cursor="view"
              style={{
                transformStyle: "preserve-3d",
                // Independent `scale` property so GSAP's tilt (transform) and
                // the beat pulse don't overwrite each other
                scale: `calc(1 + ${activeId === item.id ? 0.02 : 0} + var(--beat) * 0.01)`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/20 via-[var(--bg-2)] to-[var(--accent-fire)]/10" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_rgba(255,214,10,0.15),_transparent_60%)]" />

              <div className="relative flex h-full flex-col justify-between p-6">
                <div className="flex items-start justify-between">
                  <div className="rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] tracking-widest text-white uppercase backdrop-blur">
                    {item.country} • {item.count} fotos
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur">
                    ↗
                  </div>
                </div>

                <div>
                  <div className="font-display text-2xl font-bold text-white">{item.city}</div>
                  <div className="font-mono text-xs text-white/60 uppercase">
                    Galería • OneDrive
                  </div>
                </div>
              </div>

              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  boxShadow: `inset 0 0 0 1px var(--accent-gold), 0 0 30px rgba(255,214,10,0.2)`,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {activeId && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-6 backdrop-blur-xl"
          onClick={() => setActiveId(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--bg-2)] p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="font-display text-3xl font-bold">
                {mockGalleries.find((g) => g.id === activeId)?.city}
              </div>
              <button
                onClick={() => setActiveId(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg)]"
              >
                ✕
              </button>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-[var(--bg)]" />
              ))}
            </div>
            <div className="mt-6 font-mono text-xs text-[var(--fg-muted)] uppercase">
              Lightbox con Flip animation — Fase 4 completo. Agregá fotos en
              media-src/images/galleries/{activeId}/
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
