"use client";

import { memo, useEffect } from "react";
import { usePlayerStore } from "@/stores/playerStore";
import { getMediaUrl } from "@/lib/media";
import type { Track } from "@/lib/content";

interface Props {
  tracks: Track[];
}

/** Stable fallback peaks — the old code called Math.random() on every
 *  render, so the waveform bars flickered/reshuffled constantly. */
const FALLBACK_PEAKS = Array.from({ length: 40 }, (_, i) => {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  const frac = s - Math.floor(s);
  return 0.3 + frac * 0.6;
});

interface CardProps {
  track: Track;
  tracks: Track[];
}

const TrackCard = memo(function TrackCard({ track, tracks }: CardProps) {
  const playTrack = usePlayerStore((s) => s.playTrack);
  const pause = usePlayerStore((s) => s.pause);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  // Only the CURRENT card subscribes to progress (others return a constant,
  // so they don't re-render on every timeupdate)
  const progress = usePlayerStore((s) => (s.currentTrack?.id === track.id ? s.progress : -1));

  const isCurrent = currentTrack?.id === track.id;
  const isCurrentPlaying = isCurrent && isPlaying;
  // La caja del cover es chica (64px): usamos la versión mini si existe.
  const coverUrl = getMediaUrl(track.coverThumb ?? track.cover);
  const peaks =
    track.waveformPeaks && track.waveformPeaks.length > 0 ? track.waveformPeaks : FALLBACK_PEAKS;
  const shownPeaks = peaks.slice(0, 40);
  const trackMetadata = [
    track.artist,
    track.bpm != null ? `${track.bpm} BPM` : null,
    track.key,
  ]
    .filter(Boolean)
    .join(" • ");

  const handleToggle = () => {
    // FIX: the old button ALWAYS called playTrack (isPlaying: true + progress
    // reset), so the ⏸ icon could never actually pause anything.
    if (isCurrentPlaying) pause();
    else playTrack(track, tracks);
  };

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
          background: `radial-gradient(600px circle at calc(50% + var(--bass) * 20%) calc(50% + var(--beat) * 10%), ${track.colorAccent || "var(--accent-fire)"}15, transparent 80%)`,
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
            <div className="mt-1 flex gap-2">
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

        <button
          onClick={handleToggle}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${isCurrentPlaying ? "bg-[var(--accent-fire)] text-black" : "bg-[var(--bg-2)] text-[var(--fg)] hover:bg-[var(--fg)] hover:text-black"}`}
          aria-label={isCurrentPlaying ? `Pausar ${track.title}` : `Reproducir ${track.title}`}
          aria-pressed={isCurrentPlaying}
        >
          {isCurrentPlaying ? "⏸" : "▶"}
        </button>
      </div>

      {/* Waveform */}
      <div className="mt-4">
        <div className="flex h-10 items-end gap-[2px]">
          {shownPeaks.map((p, i) => {
            const isPlayed = isCurrent && progress >= 0 && i / 40 <= progress;
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
                    isCurrent && i % 5 === 0 ? "scaleY(calc(1 + var(--beat) * 0.5))" : undefined,
                }}
              />
            );
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

      <style>{`
        @keyframes eq {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
});

export function MusicSection({ tracks }: Props) {
  const setQueue = usePlayerStore((s) => s.setQueue);

  useEffect(() => {
    if (tracks.length > 0) {
      setQueue(tracks);
    }
  }, [tracks, setQueue]);

  if (tracks.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--bg)] p-12 text-center">
        <p className="font-mono text-sm tracking-widest text-[var(--fg-muted)] uppercase">
          No hay tracks
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tracks.map((track) => (
        <TrackCard key={track.id} track={track} tracks={tracks} />
      ))}
    </div>
  );
}
