"use client"

/**
 * Música de fondo al entrar al sitio.
 *
 * Cuando el visitante entra arranca UN TEMA AL AZAR (no siempre el primero) a un
 * volumen bajo, tipo ambiente. El que quiera más lo sube con el slider del
 * player, que ya está visible en la barra.
 *
 * Vive en un hook (y no dentro de EnterScreen) por dos motivos:
 *
 *  1. `hasEntered` queda guardado en localStorage, así que la pantalla ENTER
 *     solo aparece la primera vez. En las visitas siguientes no hay ningún click
 *     que habilite el audio: lo intentamos igual y, si el navegador lo bloquea
 *     (política de autoplay de Chrome/Safari), esperamos el primer gesto del
 *     usuario y reintentamos una sola vez.
 *  2. Así el arranque no depende de qué componente se montó primero.
 *
 * El volumen se baja con `setState` y no con `setVolume()`: `setVolume()`
 * desmutea, y quien silenció el sitio la vez pasada lo hizo a propósito.
 */
import { useEffect, useRef } from "react"
import { usePlayerStore } from "@/stores/playerStore"
import { useUIStore } from "@/stores/uiStore"
import { audioEngine } from "@/lib/audio-engine"

/** Nivel "de fondo" con el que arranca el sitio (el visitante lo sube si quiere). */
const BACKGROUND_VOLUME = 0.25

/**
 * Cuánto le damos al <audio> para que arranque antes de asumir que el navegador
 * frenó el autoplay. Sobran: el elemento tarda un render en tener `src`.
 */
const AUTOPLAY_GRACE_MS = 1500

export function useBackgroundMusic() {
  const hasEntered = useUIStore((s) => s.hasEntered)
  const queueLength = usePlayerStore((s) => s.queue.length)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current || !hasEntered || queueLength === 0) return
    startedRef.current = true

    const { queue, isPlaying, playTrack } = usePlayerStore.getState()

    // Si ya suena algo (le dio play a una tarjeta), no lo pisamos.
    if (isPlaying) return

    const pick = queue[Math.floor(Math.random() * queue.length)]
    if (!pick) return

    usePlayerStore.setState({ volume: BACKGROUND_VOLUME })
    playTrack(pick)

    // ¿El navegador dejó sonar el tema? Si no, esperamos el primer gesto.
    let timer = 0
    const detach = () => {
      window.clearTimeout(timer)
      window.removeEventListener("pointerdown", retry)
      window.removeEventListener("keydown", retry)
    }
    const retry = () => {
      detach()
      audioEngine?.resume()
      const el = audioEngine?.audioEl
      if (el) el.play().catch(() => {})
      else usePlayerStore.getState().play()
    }

    timer = window.setTimeout(() => {
      const el = audioEngine?.audioEl
      if (el && !el.paused) return
      window.addEventListener("pointerdown", retry, { once: true })
      window.addEventListener("keydown", retry, { once: true })
    }, AUTOPLAY_GRACE_MS)

    return detach
  }, [hasEntered, queueLength])
}
