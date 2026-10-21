"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { gsap } from "@/lib/motion"
import { useUIStore } from "@/stores/uiStore"
import { lockScroll, unlockScroll } from "@/lib/scroll-lock"
import { scrollToSection } from "@/lib/smooth-scroll"

const links = [
  { href: "#music", label: "MUSIC", sub: "Tracks / Sets" },
  { href: "#videos", label: "VISUALS", sub: "Live / Aftermovies" },
  { href: "#shows", label: "SHOWS", sub: "Donde toqué" },
  { href: "#gallery", label: "GALLERY", sub: "Fotos" },
  { href: "#booking", label: "BOOKING", sub: "Contratá" }
]

export function Menu() {
  const isOpen = useUIStore((s) => s.isMenuOpen)
  const setOpen = useUIStore((s) => s.setMenuOpen)
  const reducedMotion = useUIStore((s) => s.reducedMotion)
  const containerRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const pendingHashRef = useRef<string | null>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  /**
   * Navegación con animación: el link no salta al ancla. Cerramos el menú
   * (cortina clip-path hacia arriba) y, apenas la cortina empieza a revelar
   * la página, arrancamos el scroll suave hacia la sección.
   */
  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    pendingHashRef.current = href
    setOpen(false)
  }

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isOpen) return

    // Save previous focus
    previousFocusRef.current = document.activeElement as HTMLElement

    // Focus close button after animation
    const timeout = setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 300)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        return
      }

      // Focus trap
      if (e.key === "Tab" && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      clearTimeout(timeout)
      document.removeEventListener("keydown", handleKeyDown)
      // Restore focus
      previousFocusRef.current?.focus()
    }
  }, [isOpen, setOpen])

  // Open/close animation — without gsap.context revert that was killing the close transition
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const linksEls = linksRef.current?.querySelectorAll(".menu-link") ?? []

    // Kill any previous timeline so open/close don't fight
    tlRef.current?.kill()
    tlRef.current = null

    // Reduced motion: instant toggle, no animation
    if (reducedMotion) {
      gsap.set(container, { display: isOpen ? "flex" : "none", clipPath: "inset(0 0 0% 0)" })
      gsap.set(linksEls, { clearProps: "all", opacity: 1, y: 0, rotateX: 0 })
      if (!isOpen) {
        const hash = pendingHashRef.current
        pendingHashRef.current = null
        if (hash) window.setTimeout(() => scrollToSection(hash), 50)
      }
      return
    }

    if (isOpen) {
      gsap.set(container, { display: "flex" })
      // Reset links to starting state for entrance
      gsap.set(linksEls, { y: 100, opacity: 0, rotateX: -30 })

      const tl = gsap.timeline()
      tlRef.current = tl
      tl.fromTo(
        container,
        { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: 0.8, ease: "club" },
        0
      )
      tl.fromTo(
        linksEls,
        { y: 100, opacity: 0, rotateX: -30 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: "power3.out",
          delay: 0.2
        },
        0.2
      )
    } else {
      const hash = pendingHashRef.current
      pendingHashRef.current = null

      const tl = gsap.timeline({
        onStart: () => {
          if (hash) window.setTimeout(() => scrollToSection(hash), 120)
        },
        onComplete: () => {
          if (containerRef.current) gsap.set(containerRef.current, { display: "none" })
          // reset links so next open starts from hidden correctly; clear inline styles but keep opacity 0 until next open's set
          if (linksEls.length) gsap.set(linksEls, { clearProps: "transform,opacity" })
        }
      })
      tlRef.current = tl

      // Reverse stagger for links — same easing family, slightly shorter duration, inverted order
      if (linksEls.length) {
        tl.to(
          Array.from(linksEls),
          {
            y: -24,
            opacity: 0,
            rotateX: 15,
            duration: 0.35,
            stagger: { each: 0.04, from: "end" },
            ease: "power2.in"
          },
          0
        )
      }

      // Container slides up (clipPath) — slightly delayed so links start fading before the curtain closes
      tl.to(
        container,
        {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.6,
          ease: "club"
        },
        linksEls.length ? 0.1 : 0
      )

      // Safety: if onComplete never fires, ensure display none
      const safety = window.setTimeout(() => {
        if (containerRef.current && !useUIStore.getState().isMenuOpen) {
          gsap.set(containerRef.current, { display: "none" })
        }
      }, 1200)
      const prevComplete = tl.eventCallback("onComplete")
      tl.eventCallback("onComplete", () => {
        window.clearTimeout(safety)
        if (typeof prevComplete === "function") prevComplete.call(tl)
        else if (containerRef.current) gsap.set(containerRef.current, { display: "none" })
      })
    }

    return () => {
      // Only kill the timeline, don't revert — revert was resetting display:none before the close could animate
      tlRef.current?.kill()
    }
  }, [isOpen, reducedMotion])

  useEffect(() => {
    if (!isOpen) return
    const token = lockScroll()
    return () => unlockScroll(token)
  }, [isOpen])

  // Click en el fondo (fuera de los links) cierra con la misma animación de salida
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    // No cerrar si se tocó un link o un botón (ya tienen su propio handler)
    if (target.closest("a[href]") || target.closest("button")) return
    setOpen(false)
  }

  return (
    <div
      ref={containerRef}
      id="main-menu"
      className="fixed inset-0 z-50 flex h-[100svh] w-full flex-col bg-[var(--bg)]"
      style={{ display: "none" }}
      role="dialog"
      aria-modal="true"
      aria-label="Menú principal"
      aria-hidden={!isOpen}
      onClick={handleContainerClick}
    >
      {/* Background shader */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,_rgba(255,90,31,0.15),_transparent_60%),radial-gradient(ellipse_at_80%_80%,_rgba(255,46,147,0.12),_transparent_60%)]"
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col p-6 md:p-10">
        <div className="flex items-center justify-between">
          <div className="font-display text-lg font-bold" aria-hidden="true">
            IN THE LOOP.
          </div>
          <button
            ref={closeButtonRef}
            onClick={() => setOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)] text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav
          ref={linksRef}
          className="mt-20 flex flex-1 flex-col gap-2"
          aria-label="Navegación principal"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavigate(e, link.href)}
              className="menu-link group flex items-baseline gap-6 overflow-hidden rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-lime)]"
            >
              <span className="font-display text-[clamp(44px,11vw,128px)] leading-none font-bold tracking-tight transition-colors group-hover:text-[var(--accent-fire)] group-focus-visible:text-[var(--accent-fire)]">
                {link.label}
              </span>
              <span
                className="hidden font-mono text-xs tracking-widest text-[var(--fg-muted)] uppercase md:block"
                aria-hidden="true"
              >
                {link.sub}
              </span>
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-6 border-t border-[var(--border)] pt-8 md:flex-row md:items-end md:justify-between">
          <div className="font-mono text-xs leading-relaxed text-[var(--fg-muted)] uppercase">
            <div>TOMMY PETERSEN</div>
            <div>TRIBAL HOUSE / ARGENTINA</div>
            <div className="mt-2 text-[var(--fg-dim)]">Every dancefloor has its own story.</div>
          </div>
          <div
            className="flex gap-4 font-mono text-xs uppercase"
            role="list"
            aria-label="Redes sociales"
          >
            <a
              href="https://www.instagram.com/tommypetersen/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded px-2 py-2 hover:text-[var(--accent-fire)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
              role="listitem"
              aria-label="Instagram de Tommy Petersen (abre en nueva pestaña)"
            >
              Instagram
            </a>
            <a
              href="https://soundcloud.com/tommypetersendj"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded px-2 py-2 hover:text-[var(--accent-fire)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
              role="listitem"
              aria-label="SoundCloud de Tommy Petersen (abre en nueva pestaña)"
            >
              SoundCloud
            </a>
            <a
              href="https://www.youtube.com/@InTheLoopAgency"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded px-2 py-2 hover:text-[var(--accent-fire)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
              role="listitem"
              aria-label="YouTube de In The Loop Agency (abre en nueva pestaña)"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
