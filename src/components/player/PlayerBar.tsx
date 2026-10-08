"use client";

import { useRef } from "react";
import {
  SkipBack,
  SkipForward,
  Pause,
  Play,
  ChevronDown,
  ChevronUp,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
} from "lucide-react";
import { usePlayerStore } from "@/stores/playerStore";
import { useUIStore } from "@/stores/uiStore";
import { Vinyl } from "./Vinyl";
import { getMediaUrl } from "@/lib/media";

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

export function PlayerBar() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const queue = usePlayerStore((s) => s.queue);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const favorites = usePlayerStore((s) => s.favorites);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const seek = usePlayerStore((s) => s.seek);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeat);
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);
  const isExpanded = useUIStore((s) => s.isPlayerExpanded);
  const setExpanded = useUIStore((s) => s.setPlayerExpanded);
  const seekBarRef = useRef<HTMLDivElement>(null);

  const seekFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = seekBarRef.current;
    if (!el || !currentTrack) return;
    const rect = el.getBoundingClientRect();
    seek((e.clientX - rect.left) / rect.width);
  };

  const handleSeekKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!currentTrack) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      seek(progress + 0.05);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      seek(progress - 0.05);
    }
  };

  if (!currentTrack) {
    return (
      <div
        className="fixed right-0 bottom-0 left-0 z-30 flex h-[var(--player-h)] items-center justify-between border-t border-[var(--border)] bg-[var(--bg)]/90 px-4 backdrop-blur-xl md:px-6"
        role="region"
        aria-label="Reproductor de música"
      >
        <div className="flex items-center gap-4">
          <div
            className="h-11 w-11 animate-[spin_3s_linear_infinite] rounded-full bg-gradient-to-br from-[var(--accent-fire)] to-[var(--accent-magenta)]"
            aria-hidden="true"
          />
          <div>
            <div className="font-display text-sm uppercase">In The Loop • Player</div>
            <div className="font-mono text-[10px] text-[var(--fg-muted)] uppercase">
              Elegí un track para empezar
            </div>
          </div>
        </div>
        <div className="font-mono text-[10px] text-[var(--fg-dim)] uppercase" aria-live="polite">
          {queue.length} tracks en cola
        </div>
      </div>
    );
  }

  const coverUrl = getMediaUrl(currentTrack.cover);
  const isFav = favorites.includes(currentTrack.id);
  const elapsed = progress * (duration || currentTrack.duration || 0);

  return (
    <div
      className="player-bar-shell fixed right-0 bottom-0 left-0 z-30 border-t border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-xl"
      role="region"
      aria-label="Reproductor de música"
    >
      <div className="mx-auto grid h-[var(--player-h)] max-w-[var(--content-max)] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)_minmax(0,1fr)] md:gap-6 md:px-6">
        {/* ── Izquierda: tapa + pista ── */}
        <div className="flex min-w-0 items-center gap-3">
          <Vinyl size={44} cover={coverUrl} />
          <div className="min-w-0 flex-1">
            <div
              className="font-display min-w-0 truncate text-sm leading-tight uppercase"
              aria-live="polite"
              aria-atomic="true"
            >
              {currentTrack.title}
            </div>
            <div className="min-w-0 truncate font-mono text-[10px] text-[var(--fg-muted)] uppercase">
              {currentTrack.artist}
              {currentTrack.bpm ? ` • ${currentTrack.bpm} BPM` : ""}
            </div>
          </div>
        </div>

        {/* ── Centro (desktop): controles + barra seekable ── */}
        <div className="hidden flex-col items-center justify-center gap-1.5 md:flex">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleShuffle}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] ${
                shuffle
                  ? "text-[var(--accent-lime)]"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
              aria-pressed={shuffle}
              aria-label="Aleatorio"
            >
              <Shuffle className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => prev()}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
              aria-label="Pista anterior"
            >
              <SkipBack className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => (isPlaying ? pause() : play())}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--fg)] text-black transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] active:scale-95"
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
              aria-pressed={isPlaying}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <button
              onClick={() => next()}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
              aria-label="Siguiente pista"
            >
              <SkipForward className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] ${
                repeat !== "off"
                  ? "text-[var(--accent-lime)]"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
              }`}
              aria-pressed={repeat !== "off"}
              aria-label={repeat === "one" ? "Repetir una" : repeat === "all" ? "Repetir todo" : "Repetir"}
            >
              {repeat === "one" ? (
                <Repeat1 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Repeat className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Barra de progreso seekable */}
          <div className="flex w-full max-w-xl items-center gap-2">
            <span className="w-10 text-right font-mono text-[10px] text-[var(--fg-dim)]">
              {fmt(elapsed)}
            </span>
            <div
              ref={seekBarRef}
              role="slider"
              tabIndex={0}
              aria-label="Posición de la pista"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                seekFromEvent(e);
              }}
              onPointerMove={(e) => {
                if (e.currentTarget.hasPointerCapture(e.pointerId)) seekFromEvent(e);
              }}
              onKeyDown={handleSeekKey}
              className="group relative flex h-5 flex-1 cursor-pointer items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
            >
              <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--border)]">
                <div
                  className="h-full rounded-full bg-[var(--fg)] transition-[width] duration-100 group-hover:bg-[var(--accent-fire)]"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div
                className="absolute h-3 w-3 rounded-full bg-[var(--fg)] opacity-0 shadow-[0_0_8px_rgba(255,90,31,0.6)] transition-opacity group-hover:opacity-100"
                style={{ left: `calc(${progress * 100}% - 6px)` }}
                aria-hidden="true"
              />
            </div>
            <span className="w-10 font-mono text-[10px] text-[var(--fg-dim)]">
              {fmt(duration || currentTrack.duration || 0)}
            </span>
          </div>
        </div>

        {/* ── Derecha: like, volumen, expandir ── */}
        <div className="flex items-center justify-end gap-1 md:gap-2">
          <button
            onClick={() => toggleFavorite(currentTrack.id)}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] ${
              isFav ? "text-[var(--accent-fire)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
            aria-pressed={isFav}
            aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} aria-hidden="true" />
          </button>

          {/* Mobile: prev / play / next compactos */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => prev()}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
              aria-label="Pista anterior"
            >
              <SkipBack className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => (isPlaying ? pause() : play())}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-fire)] text-black transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] active:scale-95"
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
              aria-pressed={isPlaying}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <button
              onClick={() => next()}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
              aria-label="Siguiente pista"
            >
              <SkipForward className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Volumen (desktop) */}
          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={toggleMute}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
              aria-pressed={muted}
              aria-label={muted ? "Activar sonido" : "Silenciar"}
            >
              {muted ? (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <label htmlFor="volume-slider" className="sr-only">
              Volumen
            </label>
            <input
              id="volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="h-1 w-24 accent-[var(--accent-fire)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
              aria-label={`Volumen ${Math.round(volume * 100)}%`}
            />
          </div>

          <button
            onClick={() => setExpanded(!isExpanded)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
            aria-label={isExpanded ? "Colapsar reproductor" : "Expandir reproductor"}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Seek mobile: barra fina al borde inferior */}
      <div
        className="absolute bottom-0 left-0 h-1 w-full bg-[var(--border)] md:hidden"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso de reproducción"
      >
        <div
          className="h-full bg-[var(--accent-fire)] transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
