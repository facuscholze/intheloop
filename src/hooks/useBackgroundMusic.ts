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
 * Cuánto esperamos antes del primer reintento propio: lo justo para que
 * PlayerProvider haya enganchado el <audio> al engine. Los listeners de gesto
 * se arman de una, no después de esta espera.
 */
const RETRY_AFTER_MS = 250

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

    // El navegador puede frenar el play() (política de autoplay). Los listeners
    // van armados DESDE YA: antes se activaban recién pasado un tiempo y, si el
    // visitante clickeaba en esa ventana, el audio no arrancaba nunca y la barra
    // quedaba clavada en 0 mientras la UI decía "reproduciendo".
    let checkTimer = 0

    function detach() {
      window.clearTimeout(checkTimer)
      window.removeEventListener("pointerdown", tryStart)
      window.removeEventListener("keydown", tryStart)
    }

    function sounding() {
      const el = audioEngine?.audioEl
      return Boolean(el && !el.paused)
    }

    function tryStart() {
      if (sounding()) {
        detach()
        return
      }
      audioEngine?.resume()
      // Todo por el store: si llamáramos a play() directo sobre el elemento, la
      // UI y el <audio> podrían volver a desincronizarse.
      usePlayerStore.getState().play()
      window.clearTimeout(checkTimer)
      checkTimer = window.setTimeout(() => {
        if (sounding()) detach()
      }, 300)
    }

    window.addEventListener("pointerdown", tryStart)
    window.addEventListener("keydown", tryStart)
    // Cubre el caso en que el gesto ya ocurrió (el click en ENTER).
    checkTimer = window.setTimeout(tryStart, RETRY_AFTER_MS)

    return detach
  }, [hasEntered, queueLength])
}
