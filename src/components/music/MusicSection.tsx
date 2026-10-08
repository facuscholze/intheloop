"use client"

import { memo, useEffect, useMemo, useState } from "react"
import { Disc3, ExternalLink, Headphones, Music2, Pause, Play } from "lucide-react"
import { usePlayerStore } from "@/stores/playerStore"
import { getMediaUrl } from "@/lib/media"
import type { Track } from "@/lib/content"

interface Props {
  tracks: Track[]
}

/** Stable fallback peaks — the old code called Math.random() on every
 *  render, so the waveform bars flickered/reshuffled constantly. */
const FALLBACK_PEAKS = Array.from({ length: 40 }, (_, i) => {
  const s = Math.sin(i * 12.9898) * 43758.5453
  const frac = s - Math.floor(s)
  return 0.3 + frac * 0.6
})

/** URL del widget oficial de SoundCloud (theme dark + acento de la marca). */
function soundcloudEmbedSrc(url: string): string {
  const params = new URLSearchParams({
    url,
    color: "#ff5a1f",
    auto_play: "false",
    hide_related: "true",
    show_comments: "false",
    show_user: "true",
    show_reposts: "false",
    visual: "false"
  })
  return `https://w.soundcloud.com/player/?${params.toString()}`
}

interface CardProps {
  track: Track
  /** Solo los temas con audio propio entran a la cola del player. */
  playable: Track[]
}

const TrackCard = memo(function TrackCard({ track, playable }: CardProps) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const pause = usePlayerStore((s) => s.pause)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  // Only the CURRENT card subscribes to progress (others return a constant,
  // so they don't re-render on every timeupdate)
  const progress = usePlayerStore((s) => (s.currentTrack?.id === track.id ? s.progress : -1))
  // El iframe de SoundCloud se carga SOLO al hacer click (facade): si no,
  // cada tarjeta sin audio propio traería un player externo en el load.
  const [showEmbed, setShowEmbed] = useState(false)

  const isCurrent = currentTrack?.id === track.id
  const isCurrentPlaying = isCurrent && isPlaying
  // La caja del cover es chica (64px): usamos la versión mini si existe.
  const coverUrl = getMediaUrl(track.coverThumb ?? track.cover)
  const peaks =
    track.waveformPeaks && track.waveformPeaks.length > 0 ? track.waveformPeaks : FALLBACK_PEAKS
  const shownPeaks = peaks.slice(0, 40)
  const trackMetadata = [track.artist, track.bpm != null ? `${track.bpm} BPM` : null, track.key]
    .filter(Boolean)
    .join(" • ")

  const externalLinks = [
    { label: "SoundCloud", href: track.links.soundcloud },
    { label: "Spotify", href: track.links.spotify },
    { label: "Beatport", href: track.links.beatport },
    { label: "YouTube", href: track.links.youtube }
  ].filter((link): link is { label: string; href: string } => Boolean(link.href))

  const handleToggle = () => {
    // FIX: the old button ALWAYS called playTrack (isPlaying: true + progress
    // reset), so the pause icon could never actually pause anything.
    if (isCurrentPlaying) pause()
    else playTrack(track, playable)
  }

  return (
    <div
      // Sin escala al beat en la tarjeta que suena: latía con la tapa adentro
      // y se veía como un parpadeo. El ritmo ya lo marcan las barras de abajo.
      className={`group relative overflow-hidden rounded-[1.5rem] border bg-[var(--bg)] p-6 transition-all hover:scale-[1.02] ${isCurrent ? "border-[var(--accent-fire)] shadow-[0_0_30px_rgba(255,90,31,0.2)]" : "border-[var(--border)] hover:border-[var(--accent-fire)]/50"}`}
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[1.5rem] opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at calc(50% + var(--bass) * 20%) calc(50% + var(--beat) * 10%), ${track.colorAccent || "var(--accent-fire)"}15, transparent 80%)`
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between">
        <div className="flex gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--bg-2)]">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt={track.title} className="h-full w-full object-cover" />
            ) : (
              <div className="font-display flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--accent-fire)]/30 to-[var(--accent-magenta)]/30 text-lg font-bold">
                {track.title[0]}
              </div>
            )}
            {isCurrentPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="flex gap-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-3 w-0.5 animate-[eq_0.5s_ease-in-out_infinite] bg-[var(--accent-fire)]"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="font-display text-lg leading-tight font-bold">{track.title}</div>
            <div className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase">
              {trackMetadata}
            </div>
            <div className="mt-1 flex flex-wrap gap-2">
              {track.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-[var(--bg-2)] px-2 py-0.5 font-mono text-[9px] text-[var(--fg-dim)] uppercase"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Solo los temas con audio propio tienen botón de play: los demás
            se escuchan en su embed / en las plataformas. */}
        {track.playable ? (
          <button
            onClick={handleToggle}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${isCurrentPlaying ? "bg-[var(--accent-fire)] text-black" : "bg-[var(--bg-2)] text-[var(--fg)] hover:bg-[var(--fg)] hover:text-black"}`}
            aria-label={isCurrentPlaying ? `Pausar ${track.title}` : `Reproducir ${track.title}`}
            aria-pressed={isCurrentPlaying}
          >
            {/* SVG (Lucide), nunca caracteres Unicode: en Android/Chrome
                U+23F8/U+25B6 se renderizan como emoji a color y tapan el
                diseño. Mismo estilo que el botón del reproductor inferior. */}
            {isCurrentPlaying ? (
              <Pause className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />
            )}
          </button>
        ) : (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)] text-[var(--fg-dim)]"
            title="Se escucha en SoundCloud / Spotify"
          >
            <Music2 className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Sin audio propio en el sitio</span>
          </div>
        )}
      </div>

      {track.playable ? (
        <>
          {/* Waveform */}
          <div className="mt-4">
            <div className="flex h-10 items-end gap-[2px]">
              {shownPeaks.map((p, i) => {
                const isPlayed = isCurrent && progress >= 0 && i / 40 <= progress
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-full transition-all"
                    style={{
                      height: `${p * 100}%`,
                      background: isPlayed
                        ? track.colorAccent || "var(--accent-fire)"
                        : "rgba(245,243,239,0.15)",
                      transform:
                        isCurrent && i % 5 === 0 ? "scaleY(calc(1 + var(--beat) * 0.5))" : undefined
                    }}
                  />
                )
              })}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-[var(--fg-dim)] uppercase">
            <span>
              {track.duration != null
                ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, "0")}`
                : "—"}{" "}
              • {track.type}
            </span>
            <span className="flex items-center gap-1">
              <span
                className={`h-1.5 w-1.5 rounded-full ${isCurrent ? "animate-pulse bg-[var(--accent-fire)]" : "bg-[var(--border)]"}`}
              />
              {isCurrent ? "NOW" : "TAP TO PLAY"}
            </span>
          </div>
        </>
      ) : (
        <div className="mt-4">
          {track.embedUrl ? (
            showEmbed ? (
              <iframe
                title={`${track.title} en SoundCloud`}
                src={soundcloudEmbedSrc(track.embedUrl)}
                className="h-[120px] w-full rounded-xl border border-[var(--border)]"
                loading="lazy"
                allow="autoplay"
              />
            ) : (
              <button
                onClick={() => setShowEmbed(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] px-4 py-3 font-mono text-[10px] tracking-widest uppercase transition-colors hover:border-[var(--accent-fire)] hover:text-[var(--accent-fire)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
              >
                <Music2 className="h-4 w-4" aria-hidden="true" />
                Escuchar en SoundCloud
              </button>
            )
          ) : (
            <div className="flex flex-wrap gap-2">
              {externalLinks.length > 0 ? (
                externalLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-2)] px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors hover:border-[var(--accent-fire)] hover:text-[var(--accent-fire)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
                    aria-label={`Escuchar ${track.title} en ${link.label} (nueva pestaña)`}
                  >
                    {link.label === "SoundCloud" || link.label === "Spotify" ? (
                      <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : link.label === "Beatport" ? (
                      <Disc3 className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {link.label}
                  </a>
                ))
              ) : (
                <p className="font-mono text-[10px] tracking-widest text-[var(--fg-dim)] uppercase">
                  Pronto en las plataformas
                </p>
              )}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-[var(--fg-dim)] uppercase">
            <span>
              {[track.bpm != null ? `${track.bpm} BPM` : null, track.type]
                .filter(Boolean)
                .join(" • ")}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--border)]" />
              Escuchar afuera
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes eq {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  )
})

export function MusicSection({ tracks }: Props) {
  const setQueue = usePlayerStore((s) => s.setQueue)
  // La cola del player son solo los temas que pueden sonar en el sitio: si un
  // tema vive en SoundCloud/Spotify, no tiene sentido que next() caiga ahí.
  // useMemo: el array tiene que ser estable o el effect de abajo se dispara en
  // cada render (setQueue → re-render → array nuevo → loop).
  const playable = useMemo(() => tracks.filter((track) => track.playable), [tracks])

  useEffect(() => {
    setQueue(playable)
  }, [playable, setQueue])

  if (tracks.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--bg)] p-12 text-center">
        <p className="font-mono text-sm tracking-widest text-[var(--fg-muted)] uppercase">
          No hay tracks
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tracks.map((track) => (
        <TrackCard key={track.id} track={track} playable={playable} />
      ))}
    </div>
  )
}
