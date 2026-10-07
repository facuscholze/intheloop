"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "@/lib/motion"
import { useUIStore } from "@/stores/uiStore"

/**
 * Pantalla de carga animada. Se muestra encima de todo (incluida la
 * EnterScreen) mientras cargan fuentes y assets. El contador avanza con la
 * carga real (fonts.ready + window.load) pero con un tiempo mínimo para que
 * la animación se lea y no parpadee en conexiones rápidas. Sale con una
 * cortina clip-path hacia arriba, igual que el menú.
 */

const MIN_DURATION = 1.6 // s — tiempo mínimo en pantalla
const MAX_WAIT = 6 // s — nunca bloquear más que esto aunque algo no cargue

const WORDS = ["TRIBAL", "HOUSE", "LATIN", "GROOVES", "IN THE LOOP"]

export function Preloader() {
  const reducedMotion = useUIStore((s) => s.reducedMotion)
  const [done, setDone] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const wordRef = useRef<HTMLDivElement>(null)
  const vinylRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const state = { value: 0 }
    let finished = false
    let ready = false
    let minElapsed = false
    let wordIdx = 0

    const render = () => {
      const v = Math.round(state.value)
      if (counterRef.current) counterRef.current.textContent = String(v).padStart(3, "0")
      if (barRef.current) barRef.current.style.transform = `scaleX(${state.value / 100})`
    }

    const exit = () => {
      if (finished) return
      finished = true
      // Habilitar scroll por si algo quedó bloqueado — la salida nunca falla
      const safety = window.setTimeout(() => setDone(true), 1500)
      if (reducedMotion) {
        window.clearTimeout(safety)
        setDone(true)
        return
      }
      gsap
        .timeline({
          onComplete: () => {
            window.clearTimeout(safety)
            setDone(true)
          }
        })
        .to([logoRef.current, wordRef.current, vinylRef.current], {
          y: -40,
          opacity: 0,
          duration: 0.45,
          stagger: 0.05,
          ease: "club"
        })
        .to(root, { clipPath: "inset(0 0 100% 0)", duration: 0.8, ease: "club" }, "-=0.2")
    }

    // Rematar a 100 y salir cuando: cargó todo Y pasó el tiempo mínimo
    const tryFinish = () => {
      if (finished || !ready || !minElapsed) return
      gsap.killTweensOf(state)
      gsap.to(state, {
        value: 100,
        duration: reducedMotion ? 0 : 0.5,
        ease: "power2.out",
        onUpdate: render,
        onComplete: exit
      })
    }

    // Progreso "orgánico": rápido al inicio, se frena cerca de 90 esperando la carga real
    const ctx = gsap.context(() => {
      gsap.set(root, { clipPath: "inset(0 0 0% 0)" })
      gsap.to(state, {
        value: 92,
        duration: reducedMotion ? 0.2 : Math.max(MIN_DURATION, 2.2),
        ease: "power3.out",
        onUpdate: render
      })

      if (!reducedMotion) {
        gsap.fromTo(
          logoRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "club" }
        )
        gsap.to(vinylRef.current, {
          rotate: 360,
          duration: 1.8,
          ease: "none",
          repeat: -1
        })
      }
    }, root)

    // Rotación de palabras
    const wordTimer = window.setInterval(() => {
      if (!wordRef.current || finished) return
      wordIdx = (wordIdx + 1) % WORDS.length
      const el = wordRef.current
      if (reducedMotion) {
        el.textContent = WORDS[wordIdx]
        return
      }
      gsap
        .timeline()
        .to(el, { y: -14, opacity: 0, duration: 0.2, ease: "power2.in" })
        .add(() => {
          el.textContent = WORDS[wordIdx]
        })
        .fromTo(el, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" })
    }, 420)

    // Señales de carga reales
    const fontsReady =
      typeof document !== "undefined" && "fonts" in document
        ? document.fonts.ready.catch(() => undefined)
        : Promise.resolve()
    const windowLoaded = new Promise<void>((resolve) => {
      if (document.readyState === "complete") resolve()
      else window.addEventListener("load", () => resolve(), { once: true })
    })
    Promise.all([fontsReady, windowLoaded]).then(() => {
      ready = true
      tryFinish()
    })

    const minTimer = window.setTimeout(
      () => {
        minElapsed = true
        tryFinish()
      },
      (reducedMotion ? 0.3 : MIN_DURATION) * 1000
    )

    const maxTimer = window.setTimeout(() => {
      ready = true
      minElapsed = true
      tryFinish()
    }, MAX_WAIT * 1000)

    return () => {
      ctx.revert()
      window.clearInterval(wordTimer)
      window.clearTimeout(minTimer)
      window.clearTimeout(maxTimer)
    }
    // Solo al montar: la preferencia de reduced motion ya está hidratada
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (done) return null

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[10001] flex flex-col items-center justify-center overflow-hidden bg-[var(--bg)] text-[var(--fg)]"
      role="status"
      aria-live="polite"
      aria-label="Cargando In The Loop"
    >
      {/* Glow de fondo */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[80vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(255,90,31,0.16),_transparent_60%)] md:blur-[80px]"
        aria-hidden="true"
      />

      {/* Vinilo */}
      <div ref={vinylRef} className="relative mb-10 h-20 w-20 md:h-24 md:w-24" aria-hidden="true">
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,_#1a1a1f,_#2a2a30,_#111115,_#2a2a30,_#1a1a1f)] shadow-[0_0_40px_rgba(255,90,31,0.25)]" />
        <div className="absolute inset-[18%] rounded-full border border-white/5" />
        <div className="absolute inset-[30%] rounded-full border border-white/5" />
        <div className="absolute inset-[38%] rounded-full bg-gradient-to-br from-[var(--accent-fire)] to-[var(--accent-magenta)]" />
        <div className="absolute inset-[47%] rounded-full bg-[var(--bg)]" />
      </div>

      {/* Logo */}
      <div ref={logoRef} className="relative z-10 text-center">
        <div className="font-display text-[clamp(36px,8vw,88px)] leading-none font-extrabold tracking-tight uppercase">
          IN THE LOOP<span className="text-[var(--accent-fire)]">.</span>
        </div>
        <div
          ref={wordRef}
          className="mt-3 h-4 font-mono text-[11px] tracking-[0.35em] text-[var(--fg-muted)] uppercase"
        >
          {WORDS[0]}
        </div>
      </div>

      {/* Contador */}
      <div
        className="font-display absolute right-6 bottom-8 text-[clamp(56px,14vw,160px)] leading-none tracking-tight tabular-nums md:right-10 md:bottom-10"
        aria-hidden="true"
      >
        <span ref={counterRef}>000</span>
        <span className="text-[0.35em] text-[var(--accent-fire)]">%</span>
      </div>

      <div
        className="absolute bottom-8 left-6 font-mono text-[10px] tracking-[0.3em] text-[var(--fg-dim)] uppercase md:bottom-10 md:left-10"
        aria-hidden="true"
      >
        Loading experience
        <br />
        Tommy Petersen — ARG
      </div>

      {/* Barra de progreso */}
      <div
        className="absolute bottom-0 left-0 h-[3px] w-full bg-[var(--border)]"
        aria-hidden="true"
      >
        <div
          ref={barRef}
          className="h-full w-full origin-left bg-gradient-to-r from-[var(--accent-fire)] via-[var(--accent-magenta)] to-[var(--accent-gold)]"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </div>
  )
}
