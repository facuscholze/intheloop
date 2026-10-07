"use client"

import { useEffect, useRef } from "react"
import { usePlayerStore } from "@/stores/playerStore"
import { useUIStore } from "@/stores/uiStore"
import { audioEngine } from "@/lib/audio-engine"
import { getMediaUrl } from "@/lib/media"
import { useMediaSession } from "@/hooks/useMediaSession"

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
      audio.play().catch((e) => console.warn("Play failed", e))
      audioEngine?.resume()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack])

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      if (audio.src) audio.play().catch(() => {})
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

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
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
