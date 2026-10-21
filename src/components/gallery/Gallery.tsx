"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react"
import { lockScroll, unlockScroll } from "@/lib/scroll-lock"
import { useUIStore } from "@/stores/uiStore"
import { gsap } from "@/lib/motion"
import { getMediaUrl } from "@/lib/media"
import type { GalleryCity } from "@/lib/content"

const FLAGS: Record<string, string> = {
  AR: "🇦🇷",
  BR: "🇧🇷",
  DE: "🇩🇪",
  ES: "🇪🇸",
  FR: "🇫🇷",
  CZ: "🇨🇿",
  MX: "🇲🇽",
  US: "🇺🇸",
  IT: "🇮🇹",
  UY: "🇺🇾",
  CL: "🇨🇱",
  CO: "🇨🇴",
  PE: "🇵🇪"
}

interface Props {
  /** Ciudades leídas de content/gallery/<ciudad>/ (una carpeta por ciudad). */
  galleries: GalleryCity[]
}

/**
 * Coverflow: la galería activa al frente como una tapa de disco, las vecinas
 * retirándose en perspectiva. Flechas, swipe, teclado y lightbox con las fotos
 * reales de la carpeta de la ciudad.
 */
export function GalleryCarousel({ galleries }: Props) {
  const [active, setActive] = useState(0)
  const [lightboxId, setLightboxId] = useState<string | null>(null)
  const [photoIndex, setPhotoIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{ x: number; dragged: boolean } | null>(null)
  const reducedMotion = useUIStore((s) => s.reducedMotion)

  const lightbox = galleries.find((g) => g.id === lightboxId) ?? null

  // Lightbox con transición FLIP (misma idea que CineMode): el panel nace
  // desde la card activa, se expande a su lugar final y al cerrar vuelve.
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const sourceRectRef = useRef<DOMRect | null>(null)
  const closingRef = useRef(false)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const openLightbox = (gallery: GalleryCity, sourceEl?: HTMLElement | null) => {
    const el =
      sourceEl ??
      (containerRef.current?.querySelector(
        `[data-gallery-id="${gallery.id}"]`
      ) as HTMLElement | null)
    sourceRectRef.current = el ? el.getBoundingClientRect() : null
    closingRef.current = false
    setPhotoIndex(null)
    setLightboxId(gallery.id)
  }

  const closeLightbox = useCallback(() => {
    if (closingRef.current || !lightboxId) return
    const overlay = overlayRef.current
    const panel = panelRef.current
    const rect = sourceRectRef.current
    const reduced = useUIStore.getState().reducedMotion
    if (!overlay || !panel || !rect || rect.width === 0 || reduced) {
      setLightboxId(null)
      setPhotoIndex(null)
      return
    }
    closingRef.current = true
    tlRef.current?.kill()

    const finish = () => {
      closingRef.current = false
      setLightboxId(null)
      setPhotoIndex(null)
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
  }, [lightboxId])

  // Animación de apertura
  useEffect(() => {
    if (!lightboxId) return
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
  }, [lightboxId])

  const go = useCallback(
    (dir: 1 | -1) => setActive((i) => Math.min(galleries.length - 1, Math.max(0, i + dir))),
    [galleries.length]
  )

  // Lightbox: lock de scroll + teclado (Esc cierra la foto grande o el panel)
  useEffect(() => {
    if (!lightboxId) return
    const token = lockScroll()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (photoIndex !== null) setPhotoIndex(null)
        else closeLightbox()
      } else if (e.key === "ArrowRight" && lightbox && photoIndex !== null) {
        setPhotoIndex((i) => (i === null ? i : (i + 1) % lightbox.photos.length))
      } else if (e.key === "ArrowLeft" && lightbox && photoIndex !== null) {
        setPhotoIndex((i) =>
          i === null ? i : (i - 1 + lightbox.photos.length) % lightbox.photos.length
        )
      }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      unlockScroll(token)
      window.removeEventListener("keydown", onKey)
    }
  }, [lightboxId, photoIndex, lightbox, closeLightbox])

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
      if (galleries[active]) openLightbox(galleries[active])
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

  if (galleries.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--bg)] p-12 text-center">
        <p className="font-mono text-sm tracking-widest text-[var(--fg-muted)] uppercase">
          Todavía no hay galerías
        </p>
        <p className="mx-auto mt-3 max-w-md font-mono text-xs leading-relaxed text-[var(--fg-dim)]">
          Creá una carpeta por ciudad en{" "}
          <code className="text-[var(--accent-gold)]">content/gallery/&lt;ciudad&gt;/</code> y soltá
          las fotos adentro: se optimizan solas y aparecen acá.
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl uppercase md:text-3xl">Galerías por ciudad</h3>
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
            disabled={active === galleries.length - 1}
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
        {galleries.map((gallery, i) => {
          const off = i - active
          const abs = Math.abs(off)
          const isActive = off === 0
          // Más allá de ±2 la card no aporta: se congela en el borde y se
          // oculta (rotateY de ángulos grandes proyecta bounds enormes).
          const voff = Math.sign(off) * Math.min(abs, 2)
          const hidden = abs > 2
          const coverUrl = getMediaUrl(gallery.coverThumb ?? gallery.cover)
          return (
            <article
              key={gallery.id}
              data-gallery-id={gallery.id}
              className="absolute inset-x-0 top-1/2 mx-auto block h-[340px] w-[min(78vw,320px)] -translate-y-1/2 cursor-pointer overflow-hidden rounded-[1.75rem] border bg-[var(--bg-2)] transition-[transform,opacity,filter,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--accent-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] md:h-[400px]"
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
                if (isActive) openLightbox(gallery, e.currentTarget)
                else setActive(i)
              }}
            >
              {/* Foto de tapa de la ciudad */}
              {coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverUrl}
                  alt={`Galería de ${gallery.city}`}
                  loading={isActive ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/25 via-[var(--bg-2)] to-[var(--accent-fire)]/15" />
              )}
              {/* Scrim para que el texto se lea sobre cualquier foto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

              <div className="relative flex h-full flex-col justify-between p-6">
                <div className="flex items-start justify-between">
                  <div className="rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] tracking-widest text-white uppercase backdrop-blur">
                    {gallery.country
                      ? `${FLAGS[gallery.country] ?? ""} ${gallery.country}`
                      : "Galería"}
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
                    {gallery.city}
                  </div>
                  <div className="mt-1 font-mono text-xs text-white/60 uppercase">
                    {gallery.count} {gallery.count === 1 ? "foto" : "fotos"}
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
        className="mt-6 flex flex-wrap items-center justify-center gap-2"
        role="tablist"
        aria-label="Galerías"
      >
        {galleries.map((gallery, i) => (
          <button
            key={gallery.id}
            role="tab"
            aria-selected={i === active}
            aria-label={`Galería de ${gallery.city}`}
            onClick={() => setActive(i)}
            className="dot-btn flex h-6 items-center justify-center gap-2 rounded-full px-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
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
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--bg-2)] will-change-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-content flex max-h-[90vh] flex-col">
              <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] p-6">
                <div>
                  <div className="font-display text-2xl uppercase md:text-3xl">
                    {lightbox.country ? `${FLAGS[lightbox.country] ?? ""} ` : ""}
                    {lightbox.city}
                  </div>
                  <div className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase">
                    {photoIndex === null
                      ? `${lightbox.photos.length} ${lightbox.photos.length === 1 ? "foto" : "fotos"}`
                      : `${photoIndex + 1} / ${lightbox.photos.length}`}
                    {lightbox.date ? ` • ${lightbox.date}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {photoIndex !== null && (
                    <button
                      onClick={() => setPhotoIndex(null)}
                      className="flex h-10 items-center rounded-full bg-[var(--bg)] px-4 font-mono text-[10px] tracking-widest uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
                    >
                      Ver todas
                    </button>
                  )}
                  <button
                    onClick={closeLightbox}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
                    aria-label="Cerrar galería"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {photoIndex === null ? (
                <div className="grid max-h-[70vh] grid-cols-2 gap-3 overflow-y-auto p-6 md:grid-cols-3">
                  {lightbox.photos.map((photo, i) => {
                    const thumbUrl = getMediaUrl(photo.thumb)
                    return (
                      <button
                        key={photo.src}
                        onClick={() => setPhotoIndex(i)}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
                        aria-label={`Ampliar ${photo.alt}`}
                      >
                        {thumbUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbUrl}
                            alt={photo.alt}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="relative flex min-h-[50vh] flex-1 items-center justify-center bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getMediaUrl(lightbox.photos[photoIndex].src) ?? undefined}
                    alt={lightbox.photos[photoIndex].alt}
                    className="max-h-[70vh] w-full object-contain"
                  />
                  {lightbox.photos.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setPhotoIndex(
                            (i) => ((i ?? 0) - 1 + lightbox.photos.length) % lightbox.photos.length
                          )
                        }
                        className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
                        aria-label="Foto anterior"
                      >
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() =>
                          setPhotoIndex((i) => ((i ?? 0) + 1) % lightbox.photos.length)
                        }
                        className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
                        aria-label="Foto siguiente"
                      >
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
