"use client";

import { Heart, Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { usePlayerStore } from "@/stores/playerStore";
import { useUIStore } from "@/stores/uiStore";
import { Vinyl } from "./Vinyl";
import { Waveform } from "./Waveform";
import { getMediaUrl } from "@/lib/media";
import { useAudioReactive } from "@/hooks/useAudioReactive";

export function PlayerExpanded() {
  const isExpanded = useUIStore((s) => s.isPlayerExpanded);
  const setExpanded = useUIStore((s) => s.setPlayerExpanded);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const queue = usePlayerStore((s) => s.queue);
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const favorites = usePlayerStore((s) => s.favorites);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeat);
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);
  const { bass, mid, high } = useAudioReactive();

  if (!isExpanded || !currentTrack) return null;

  const coverUrl = getMediaUrl(currentTrack.cover);
  const audioEl =
    typeof document !== "undefined" ? (document.querySelector("audio") as HTMLAudioElement) : null;

  const handleSeek = (newProgress: number) => {
    if (audioEl && duration) {
      audioEl.currentTime = newProgress * duration;
      usePlayerStore.getState().setProgress(newProgress);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-[35] flex flex-col bg-[var(--bg)]">
      {/* Background reactive */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, rgba(255,90,31,${0.15 + bass * 0.2}) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(255,46,147,${0.12 + mid * 0.15}) 0%, transparent 60%), radial-gradient(ellipse at 50% 50%, rgba(200,255,0,${0.05 + high * 0.1}) 0%, transparent 70%)`,
        }}
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-[var(--border)] p-6">
          <div className="font-mono text-xs tracking-widest text-[var(--fg-muted)] uppercase">
            Player • {queue.length} tracks • {favorites.length} favs
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)]"
            aria-label="Cerrar reproductor expandido"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-8 overflow-auto p-6 md:flex-row md:p-10">
          {/* Left: vinyl + info */}
          <div className="flex flex-col items-center gap-8 md:w-[45%]">
            <Vinyl size={280} cover={coverUrl} />

            <div className="w-full text-center">
              <h2 className="font-display text-3xl leading-tight font-bold">
                {currentTrack.title}
              </h2>
              <p className="mt-2 font-mono text-xs tracking-widest text-[var(--fg-muted)] uppercase">
                {[
                  currentTrack.artist,
                  currentTrack.bpm != null ? `${currentTrack.bpm} BPM` : null,
                  currentTrack.key,
                  currentTrack.genres.length ? currentTrack.genres.join(", ") : null,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </p>

              {/* Transport — the expanded view covers the PlayerBar, so it
                  needs its own transport controls */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => prev()}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)] transition-colors hover:border-[var(--fg)]"
                  aria-label="Pista anterior"
                >
                  <SkipBack className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => (isPlaying ? pause() : play())}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-fire)] text-black transition-transform hover:scale-105 active:scale-95"
                  aria-label={isPlaying ? "Pausar" : "Reproducir"}
                  aria-pressed={isPlaying}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Play className="ml-0.5 h-6 w-6" aria-hidden="true" />
                  )}
                </button>
                <button
                  onClick={() => next()}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)] transition-colors hover:border-[var(--fg)]"
                  aria-label="Siguiente pista"
                >
                  <SkipForward className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  onClick={() => toggleFavorite(currentTrack.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-2 font-mono text-xs uppercase ${favorites.includes(currentTrack.id) ? "border-[var(--accent-fire)] bg-[var(--accent-fire)] text-black" : "border-[var(--border)] text-[var(--fg-muted)]"}`}
                  aria-pressed={favorites.includes(currentTrack.id)}
                >
                  {/* Icono SVG: U+2665/U+2661 pueden verse como emoji en mobile */}
                  <Heart
                    className={`h-3.5 w-3.5 ${favorites.includes(currentTrack.id) ? "fill-current" : ""}`}
                    aria-hidden="true"
                  />
                  {favorites.includes(currentTrack.id) ? "Favorito" : "Fav"}
                </button>
                <button
                  onClick={toggleShuffle}
                  className={`rounded-full border px-4 py-2 font-mono text-xs uppercase ${shuffle ? "border-[var(--accent-lime)] bg-[var(--accent-lime)] text-black" : "border-[var(--border)]"}`}
                >
                  Shuffle {shuffle ? "ON" : "OFF"}
                </button>
                <button
                  onClick={toggleRepeat}
                  className={`rounded-full border px-4 py-2 font-mono text-xs uppercase ${repeat !== "off" ? "border-[var(--accent-magenta)] bg-[var(--accent-magenta)] text-black" : "border-[var(--border)]"}`}
                >
                  Repeat {repeat}
                </button>
              </div>
            </div>

            <div className="w-full">
              <div className="mb-2 flex justify-between font-mono text-[10px] text-[var(--fg-dim)] uppercase">
                <span>{formatTime((progress || 0) * (duration || 0))}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <Waveform
                peaks={currentTrack.waveformPeaks}
                progress={progress}
                onSeek={handleSeek}
                color={currentTrack.colorAccent || "var(--accent-fire)"}
                height={80}
              />
            </div>
          </div>

          {/* Right: queue */}
          <div className="flex flex-1 flex-col">
            <h3 className="font-display text-xl font-bold">Cola</h3>
            <div className="mt-4 flex-1 divide-y divide-[var(--border)] overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-2)]">
              {queue.map((track, idx) => {
                const isCurrent = currentTrack.id === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className={`flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[var(--bg)] ${isCurrent ? "bg-[var(--bg)] text-[var(--accent-fire)]" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-xs text-[var(--fg-dim)]">{idx + 1}</div>
                      <div>
                        <div className="font-display text-sm font-bold">{track.title}</div>
                        <div className="font-mono text-[10px] text-[var(--fg-muted)] uppercase">
                          {[
                            track.bpm != null ? `${track.bpm} BPM` : null,
                            track.key,
                          ]
                            .filter(Boolean)
                            .join(" • ") || track.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCurrent && isPlaying && (
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent-fire)]" />
                      )}
                      {favorites.includes(track.id) && (
                        <Heart
                          className="h-3.5 w-3.5 fill-current text-[var(--accent-fire)]"
                          aria-label="Favorito"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-4 font-mono text-[10px] leading-relaxed text-[var(--fg-muted)] uppercase">
              <div>
                Audio reactivo: bass {bass.toFixed(2)} • mid {mid.toFixed(2)} • high{" "}
                {high.toFixed(2)}
              </div>
              <div className="mt-1 text-[var(--fg-dim)]">
                Todo el sitio late con la música. Efectos siempre en MAX.
              </div>
              <div className="mt-2 text-[9px]">
                Atajos: Space play/pause, Cmd+→ next, Cmd+← prev. Media Session API activo.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
