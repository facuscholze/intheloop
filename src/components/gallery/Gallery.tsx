"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
import { lockScroll, unlockScroll } from "@/lib/scroll-lock"
import { useUIStore } from "@/stores/uiStore"
import { gsap } from "@/lib/motion"

interface GalleryItem {
  id: string
  city: string
  country: string
  count?: number
}

const mockGalleries: GalleryItem[] = [
  { id: "paris", city: "París", country: "FR", count: 12 },
  { id: "berlin", city: "Berlín", country: "DE", count: 8 },
  { id: "recoleta", city: "Recoleta", country: "AR", count: 15 },
  { id: "tandil", city: "Tandil", country: "AR", count: 20 },
  { id: "azul", city: "Azul", country: "AR", count: 10 },
  { id: "olavarria", city: "Olavarría", country: "AR", count: 18 },
  { id: "camboriu", city: "Camboriú", country: "BR", count: 9 },
  { id: "vitoria", city: "Vitoria-Gasteiz", country: "ES", count: 6 }
]

const FLAGS: Record<string, string> = {
  AR: "🇦🇷",
  BR: "🇧🇷",
  DE: "🇩🇪",
  ES: "🇪🇸",
  FR: "🇫🇷"
}

/**
 * Coverflow: la galería activa al frente como una tapa de disco, las vecinas
 * retirándose en perspectiva. Flechas, swipe, teclado y lightbox.
 */
export function GalleryCarousel() {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{ x: number; dragged: boolean } | null>(null)
  const reducedMotion = useUIStore((s) => s.reducedMotion)

  // Lightbox con transición FLIP (misma idea que CineMode): el panel nace
  // desde la card activa, se expande a su lugar final y al cerrar vuelve.
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const sourceRectRef = useRef<DOMRect | null>(null)
  const closingRef = useRef(false)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const openLightbox = (item: GalleryItem, sourceEl?: HTMLElement | null) => {
    const el =
      sourceEl ??
      (containerRef.current?.querySelector(`[data-gallery-id="${item.id}"]`) as HTMLElement | null)
    sourceRectRef.current = el ? el.getBoundingClientRect() : null
    closingRef.current = false
    setLightbox(item)
  }

  const closeLightbox = useCallback(() => {
    if (closingRef.current || !lightbox) return
    const overlay = overlayRef.current
    const panel = panelRef.current
    const rect = sourceRectRef.current
    const reduced = useUIStore.getState().reducedMotion
    if (!overlay || !panel || !rect || rect.width === 0 || reduced) {
      setLightbox(null)
      return
    }
    closingRef.current = true
    tlRef.current?.kill()

    const finish = () => {
      closingRef.current = false
      setLightbox(null)
    }
    const safety = window.setTimeout(finish, 1200)
    const panelRect = panel.getBoundingClientRect()

    tlRef.current = gsap
      .timeline({
        onComplete: () => {
          window.clearTimeout(safety)
          finish()
        }
      })
      .to(
        panel,
        {
          x: rect.left - panelRect.left,
          y: rect.top - panelRect.top,
          scaleX: rect.width / panelRect.width,
          scaleY: rect.height / panelRect.height,
          borderRadius: "1.75rem",
          duration: 0.6,
          ease: "club"
        },
        0
      )
      .to(panel.querySelector(".lightbox-content"), { opacity: 0, duration: 0.2 }, 0)
      .to(overlay, { opacity: 0, duration: 0.4, ease: "power2.in" }, 0.2)
  }, [lightbox])

  // Animación de apertura
  useEffect(() => {
    if (!lightbox) return
    const overlay = overlayRef.current
    const panel = panelRef.current
    const rect = sourceRectRef.current
    if (!overlay || !panel) return
    const content = panel.querySelector(".lightbox-content")
    const reduced = useUIStore.getState().reducedMotion

    if (!rect || rect.width === 0 || reduced) {
      gsap.set(overlay, { opacity: 1 })
      gsap.set(panel, { clearProps: "all" })
      return
    }

    const panelRect = panel.getBoundingClientRect()
    gsap.set(panel, {
      transformOrigin: "top left",
      x: rect.left - panelRect.left,
      y: rect.top - panelRect.top,
      scaleX: rect.width / panelRect.width,
      scaleY: rect.height / panelRect.height,
      borderRadius: "1.75rem"
    })
    gsap.set(overlay, { opacity: 0 })
    gsap.set(content, { opacity: 0, y: 16 })

    tlRef.current?.kill()
    tlRef.current = gsap
      .timeline()
      .to(overlay, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0)
      .to(
        panel,
        { x: 0, y: 0, scaleX: 1, scaleY: 1, borderRadius: "2rem", duration: 0.8, ease: "club" },
        0.05
      )
      .to(content, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.25")

    return () => {
      tlRef.current?.kill()
    }
  }, [lightbox])

  const go = useCallback(
    (dir: 1 | -1) => setActive((i) => Math.min(mockGalleries.length - 1, Math.max(0, i + dir))),
    []
  )

  // Lightbox: lock de scroll + Esc
  useEffect(() => {
    if (!lightbox) return
    const token = lockScroll()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      unlockScroll(token)
      window.removeEventListener("keydown", onKey)
    }
  }, [lightbox, closeLightbox])

  // Teclado sobre el carrusel
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault()
      go(1)
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      go(-1)
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      openLightbox(mockGalleries[active])
    }
  }

  // Swipe / drag
  const onPointerDown = (e: React.PointerEvent) => {
    dragState.current = { x: e.clientX, dragged: false }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return
    if (Math.abs(e.clientX - dragState.current.x) > 8) dragState.current.dragged = true
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const st = dragState.current
    dragState.current = null
    if (!st) return
    const dx = e.clientX - st.x
    if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1)
  }

  return (
    <div className="relative">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl uppercase md:text-3xl">Galerías por ciudad</h3>
          <p className="mt-1 font-mono text-xs tracking-widest text-[var(--fg-muted)] uppercase">
            Elegí una ciudad • Swipe o flechas
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => go(-1)}
            disabled={active === 0}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)] transition-colors hover:border-[var(--accent-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] disabled:opacity-30"
            aria-label="Galería anterior"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            onClick={() => go(1)}
            disabled={active === mockGalleries.length - 1}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)] transition-colors hover:border-[var(--accent-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] disabled:opacity-30"
            aria-label="Galería siguiente"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        role="group"
        aria-roledescription="carrusel"
        aria-label="Galerías de fotos por ciudad"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative h-[380px] cursor-grab touch-pan-y overflow-hidden select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-lime)] active:cursor-grabbing md:h-[440px]"
      >
        {mockGalleries.map((item, i) => {
          const off = i - active
          const abs = Math.abs(off)
          const isActive = off === 0
          // Más allá de ±2 la card no aporta: se congela en el borde y se
          // oculta (rotateY de ángulos grandes proyecta bounds enormes).
          const voff = Math.sign(off) * Math.min(abs, 2)
          const hidden = abs > 2
          return (
            <article
              key={item.id}
              data-gallery-id={item.id}
              className="absolute inset-x-0 top-1/2 mx-auto block h-[340px] w-[min(78vw,320px)] -translate-y-1/2 overflow-hidden rounded-[1.75rem] border bg-[var(--bg-2)] transition-[transform,opacity,filter,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] md:h-[400px]"
              style={{
                borderColor: isActive ? "var(--accent-gold)" : "var(--border)",
                zIndex: 20 - abs,
                opacity: hidden ? 0 : 1 - abs * 0.22,
                filter: isActive ? undefined : `brightness(${0.55 - abs * 0.08})`,
                pointerEvents: hidden ? "none" : "auto",
                transform: `perspective(1400px) translateX(${voff * 34}vw) rotateY(${voff * -28}deg) translateZ(${-Math.min(abs, 2) * 150}px) scale(${1 - Math.min(abs, 2) * 0.06})`,
                transitionDuration: reducedMotion ? "0ms" : undefined
              }}
              aria-hidden={hidden || undefined}
              onClick={(e) => {
                if (dragState.current?.dragged) return
                if (isActive) openLightbox(item, e.currentTarget)
                else setActive(i)
              }}
            >
              {/* Fondo de marca por ciudad (sin foto real todavía) */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/25 via-[var(--bg-2)] to-[var(--accent-fire)]/15" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_rgba(255,214,10,0.16),_transparent_60%)]" />

              <div className="relative flex h-full flex-col justify-between p-6">
                <div className="flex items-start justify-between">
                  <div className="rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] tracking-widest text-white uppercase backdrop-blur">
                    {FLAGS[item.country] ?? item.country} {item.country}
                  </div>
                  {isActive && (
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-transform hover:scale-110"
                      aria-hidden="true"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="font-display text-3xl text-white uppercase md:text-4xl">
                    {item.city}
                  </div>
                  <div className="mt-1 font-mono text-xs text-white/60 uppercase">
                    {item.count ? `${item.count} fotos` : "Galería"}
                  </div>
                </div>
              </div>

              {/* Pulso al ritmo en la tapa activa (propiedad scale independiente) */}
              {isActive && !reducedMotion && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-[1.75rem]"
                  style={{
                    boxShadow: "inset 0 0 0 1px var(--accent-gold)",
                    scale: "calc(1 + var(--beat) * 0.012)",
                    // Suaviza el salto 0→1 del beat (antes el aro "pegaba" un
                    // salto seco en cada golpe y la tapa parecía parpadear)
                    transition: "scale 150ms ease-out"
                  }}
                  aria-hidden="true"
                />
              )}
            </article>
          )
        })}
      </div>

      {/* Posición */}
      <div
        className="mt-6 flex items-center justify-center gap-2"
        role="tablist"
        aria-label="Galerías"
      >
        {mockGalleries.map((item, i) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={i === active}
            aria-label={`Galería de ${item.city}`}
            onClick={() => setActive(i)}
            className="dot-btn flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                i === active
                  ? "h-2 w-8 bg-[var(--accent-gold)]"
                  : "h-2 w-2 bg-[var(--border)] hover:bg-[var(--fg-dim)]"
              }`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-6 backdrop-blur-xl"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Galería de ${lightbox.city}`}
        >
          <div
            ref={panelRef}
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--bg-2)] p-8 will-change-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-content">
              <div className="flex items-center justify-between">
                <div className="font-display text-3xl uppercase">
                  {FLAGS[lightbox.country]} {lightbox.city}
                </div>
                <button
                  onClick={closeLightbox}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
                  aria-label="Cerrar galería"
                >
                  ✕
                </button>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl bg-gradient-to-br from-[var(--bg)] to-[var(--bg-3)]"
                  />
                ))}
              </div>
              <div className="mt-6 font-mono text-xs text-[var(--fg-muted)] uppercase">
                Fotos en camino — seguí a Tommy en Instagram para ver el archivo completo
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
