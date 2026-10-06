"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/stores/playerStore";
import { getMediaUrl } from "@/lib/media";
import { useAudioReactive } from "@/hooks/useAudioReactive";
import type { Track } from "@/lib/content";

interface Props {
  tracks: Track[];
}

export function MusicSection({ tracks }: Props) {
  const setQueue = usePlayerStore((s) => s.setQueue);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const { bass, beat } = useAudioReactive();

  useEffect(() => {
    if (tracks.length > 0) {
      setQueue(tracks);
    }
  }, [tracks, setQueue]);

  if (tracks.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--bg)] p-12 text-center">
        <p className="font-mono text-sm uppercase tracking-widest text-[var(--fg-muted)]">No hay tracks</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tracks.map((track) => {
        const isCurrent = currentTrack?.id === track.id;
        const coverUrl = getMediaUrl(track.cover);

        return (
          <div
            key={track.id}
            className={`group relative overflow-hidden rounded-[1.5rem] border bg-[var(--bg)] p-6 transition-all hover:scale-[1.02] ${isCurrent ? "border-[var(--accent-fire)] shadow-[0_0_30px_rgba(255,90,31,0.2)]" : "border-[var(--border)] hover:border-[var(--accent-fire)]/50"}`}
            style={{
              transform: isCurrent ? `scale(${1 + beat * 0.02})` : undefined,
            }}
            data-cursor="play"
          >
            {/* Glow */}
            <div
              className="pointer-events-none absolute -inset-px rounded-[1.5rem] opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                background: `radial-gradient(600px circle at ${50 + bass * 20}% ${50 + beat * 10}%, ${track.colorAccent || "var(--accent-fire)"}15, transparent 80%)`,
              }}
            />

            <div className="relative flex items-start justify-between">
              <div className="flex gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--bg-2)]">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl} alt={track.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--accent-fire)]/30 to-[var(--accent-magenta)]/30 font-display text-lg font-bold">
                      {track.title[0]}
                    </div>
                  )}
                  {isCurrent && isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-3 w-0.5 animate-[eq_0.5s_ease-in-out_infinite] bg-[var(--accent-fire)]" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="font-display text-lg font-bold leading-tight">{track.title}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">
                    {track.artist} • {track.bpm} BPM • {track.key}
                  </div>
                  <div className="mt-1 flex gap-2">
                    {track.genres.map((g) => (
                      <span key={g} className="rounded-full bg-[var(--bg-2)] px-2 py-0.5 font-mono text-[9px] uppercase text-[var(--fg-dim)]">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => playTrack(track, tracks)}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${isCurrent && isPlaying ? "bg-[var(--accent-fire)] text-black" : "bg-[var(--bg-2)] text-[var(--fg)] hover:bg-[var(--fg)] hover:text-black"}`}
                aria-label={`Play ${track.title}`}
              >
                {isCurrent && isPlaying ? "⏸" : "▶"}
              </button>
            </div>

            {/* Waveform */}
            <div className="mt-4">
              <div className="flex h-10 items-end gap-[2px]">
                {(track.waveformPeaks || Array.from({ length: 40 }, () => Math.random())).slice(0, 40).map((p, i) => {
                  const isPlayed = isCurrent ? i / 40 <= (usePlayerStore.getState().progress || 0) : false;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-full transition-all"
                      style={{
                        height: `${p * 100}%`,
                        background: isCurrent && isPlayed ? track.colorAccent || "var(--accent-fire)" : "rgba(245,243,239,0.15)",
                        transform: isCurrent ? `scaleY(${1 + (i % 5 === 0 ? beat * 0.5 : 0)})` : undefined,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase text-[var(--fg-dim)]">
              <span>{track.duration ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, "0")}` : "8:00"} • {track.type}</span>
              <span className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${isCurrent ? "animate-pulse bg-[var(--accent-fire)]" : "bg-[var(--border)]"}`} />
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
      })}
    </div>
  );
}
