"use client"

import type Lenis from "lenis"
import { gsap } from "@/lib/motion"
import { useUIStore } from "@/stores/uiStore"

/**
 * Scroll animado a una sección (#music, #gallery, ...).
 *
 * Usa la instancia activa de Lenis cuando existe (así el smooth scroll de la
 * página y la navegación comparten el mismo motor y no se pelean) y cae a un
 * tween de GSAP sobre window.scrollY cuando Lenis está apagado (antes de
 * entrar al sitio, o con reduced motion).
 */

let lenisInstance: Lenis | null = null

export function setLenisInstance(lenis: Lenis | null) {
  lenisInstance = lenis
}

export function getLenisInstance() {
  return lenisInstance
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

function readHeaderOffset(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--header-h")
  const n = parseFloat(raw)
  return Number.isFinite(n) ? n : 64
}

export interface ScrollToSectionOptions {
  duration?: number
  offset?: number
  onComplete?: () => void
}

export function scrollToSection(hash: string, opts: ScrollToSectionOptions = {}) {
  if (typeof window === "undefined") return
  const id = hash.replace(/^#/, "")
  const target = document.getElementById(id)
  if (!target) return

  const reducedMotion = useUIStore.getState().reducedMotion
  const headerOffset = opts.offset ?? -readHeaderOffset()
  const duration = reducedMotion ? 0 : (opts.duration ?? 1.4)

  const finish = () => {
    // Mantener la URL sincronizada sin disparar el salto nativo del hash
    try {
      window.history.replaceState(window.history.state, "", `#${id}`)
    } catch {}
    opts.onComplete?.()
  }

  if (lenisInstance) {
    lenisInstance.scrollTo(target, {
      offset: headerOffset,
      duration,
      easing: easeOutExpo,
      immediate: duration === 0,
      lock: true,
      onComplete: finish
    })
    return
  }

  const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top + headerOffset)
  if (duration === 0) {
    window.scrollTo(0, top)
    finish()
    return
  }

  const proxy = { y: window.scrollY }
  gsap.to(proxy, {
    y: top,
    duration,
    ease: "expo",
    overwrite: true,
    onUpdate: () => window.scrollTo(0, proxy.y),
    onComplete: finish
  })
}

/**
 * Intercepta clicks en `<a href="#seccion">` de toda la página y los convierte
 * en scroll animado (Header, Hero, footer...). Los links que manejan su propia
 * navegación (el menú) hacen preventDefault antes y acá se ignoran.
 */
export function installAnchorScroll(): () => void {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return
    const anchor = (e.target as HTMLElement | null)?.closest?.("a[href^='#']")
    if (!(anchor instanceof HTMLAnchorElement)) return
    const hash = anchor.getAttribute("href") || ""
    if (hash.length < 2 || hash === "#main-content") return
    if (!document.getElementById(hash.slice(1))) return
    e.preventDefault()
    scrollToSection(hash)
  }
  document.addEventListener("click", onClick)
  return () => document.removeEventListener("click", onClick)
}
