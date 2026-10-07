"use client"

import { useEffect, useRef } from "react"
import { usePlayerStore } from "@/stores/playerStore"
import { useUIStore } from "@/stores/uiStore"
import { audioEngine } from "@/lib/audio-engine"
import { getMediaUrl } from "@/lib/media"
import { useMediaSession } from "@/hooks/useMediaSession"

/**
 * ¿Hubo que aceptar que el <audio> no va a sonar?
 *
 * Si el store se queda en `isPlaying: true` con el elemento en pausa, la barra
 * dice "reproduciendo" con el tiempo clavado en 0 — que es exactamente lo que se
 * ve cuando el navegador frena el autoplay, o cuando el archivo no carga.
 *
 * `AbortError` no cuenta: es un play() interrumpido por un pause()/load()
 * nuestro, y enseguida viene otro intento.
 */
function playbackFailed(error: unknown): boolean {
  return (error as { name?: string } | null)?.name !== "AbortError"
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const volume = usePlayerStore((s) => s.volume)
  const muted = usePlayerStore((s) => s.muted)
  const setProgress = usePlayerStore((s) => s.setProgress)
  const setDuration = usePlayerStore((s) => s.setDuration)

  // Handle track change
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    const src = getMediaUrl(currentTrack.audioSrc)
    if (!src) {
      // Tema sin audio propio (vive en SoundCloud/Spotify): la cola del player
      // solo lleva temas reproducibles, así que esto es una red de seguridad
      // (p. ej. una cola vieja guardada en localStorage).
      console.warn("No audio src for track", currentTrack.id)
      audio.pause()
      if (usePlayerStore.getState().isPlaying) usePlayerStore.getState().pause()
      return
    }

    // Only change src if different
    const absolute = new URL(src, window.location.href).href
    if (audio.src !== absolute) {
      audio.src = src
      audio.load()
    }

    // connectMediaElement is idempotent (graph is built only once)
    if (audioEngine) {
      audioEngine.connectMediaElement(audio, currentTrack.bpm || 124)
    }

    if (isPlaying) {
      audio.play().catch((e) => {
        console.warn("Play failed", e)
        if (playbackFailed(e)) usePlayerStore.getState().pause()
      })
      audioEngine?.resume()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack])

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      if (audio.src)
        audio.play().catch((e) => {
          if (playbackFailed(e)) usePlayerStore.getState().pause()
        })
      audioEngine?.resume()
      audioEngine?.start()
    } else {
      audio.pause()
    }
  }, [isPlaying])

  // Volume + mute (single place that decides the effective volume)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const effective = muted ? 0 : volume
    audio.volume = effective
    audioEngine?.setVolume(effective)
  }, [volume, muted])

  // Time update
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      const state = usePlayerStore.getState()
      // Repeat-one: loop the same track (the store's next() must NOT handle
      // this, otherwise the audio element stays "ended" forever).
      if (state.repeat === "one") {
        audio.currentTime = 0
        state.setProgress(0)
        audio.play().catch(() => {})
        return
      }
      state.next()
    }

    // Si el archivo no carga (404, formato que el navegador no decodifica,
    // bucket sin CORS) el elemento se queda en pausa y el store seguiría
    // diciendo que suena: avisamos y bajamos el estado de reproducción.
    const handleError = () => {
      const code = audio.error?.code
      // 1 = MEDIA_ERR_ABORTED: lo interrumpimos nosotros (cambio de tema).
      if (code === 1) return
      console.warn("El audio no se pudo reproducir (MediaError", code, ")", audio.currentSrc)
      usePlayerStore.getState().pause()
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
    }
  }, [setProgress, setDuration])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Ignore when typing, when a control already handled the key, on key
      // repeat, and before the user has entered the experience.
      if (e.defaultPrevented || e.repeat) return
      if (!useUIStore.getState().hasEntered) return
      const t = e.target
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLSelectElement
      )
        return
      if (t instanceof HTMLElement && t.isContentEditable) return

      switch (e.code) {
        case "Space":
          e.preventDefault()
          usePlayerStore.getState().isPlaying
            ? usePlayerStore.getState().pause()
            : usePlayerStore.getState().play()
          break
        case "ArrowRight":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            usePlayerStore.getState().next()
          }
          break
        case "ArrowLeft":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            usePlayerStore.getState().prev()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  useMediaSession()

  return (
    <>
      <audio ref={audioRef} crossOrigin="anonymous" preload="metadata" className="hidden" />
      {children}
    </>
  )
}
