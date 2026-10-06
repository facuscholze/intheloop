"use client";

import { SkipBack, SkipForward, Pause, Play, ChevronDown, ChevronUp } from "lucide-react";
import { usePlayerStore } from "@/stores/playerStore";
import { useUIStore } from "@/stores/uiStore";
import { Vinyl } from "./Vinyl";
import { MiniWaveform } from "./Waveform";
import { getMediaUrl } from "@/lib/media";

export function PlayerBar() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const progress = usePlayerStore((s) => s.progress);
  const volume = usePlayerStore((s) => s.volume);
  const queue = usePlayerStore((s) => s.queue);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const isExpanded = useUIStore((s) => s.isPlayerExpanded);
  const setExpanded = useUIStore((s) => s.setPlayerExpanded);

  if (!currentTrack) {
    return (
      <div
        className="fixed right-0 bottom-0 left-0 z-30 flex h-[var(--player-h)] items-center justify-between border-t border-[var(--border)] bg-[var(--bg)]/90 px-6 backdrop-blur-xl"
        role="region"
        aria-label="Reproductor de música"
      >
        <div className="flex items-center gap-4">
          <div
            className="h-12 w-12 animate-[spin_3s_linear_infinite] rounded-full bg-gradient-to-br from-[var(--accent-fire)] to-[var(--accent-magenta)]"
            aria-hidden="true"
          />
          <div>
            <div className="font-display text-sm font-bold">IN THE LOOP • Player</div>
            <div className="font-mono text-[10px] text-[var(--fg-muted)] uppercase">
              Seleccioná un track para empezar
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

  return (
    <div
      className="fixed right-0 bottom-0 left-0 z-30 flex h-[var(--player-h)] items-center justify-between border-t border-[var(--border)] bg-[var(--bg)]/95 px-4 backdrop-blur-xl md:px-6"
      style={{
        boxShadow: `0 0 calc(10px + var(--bass) * 30px) rgba(255,90,31, calc(0.1 + var(--bass) * 0.2))`,
        borderTopColor: `rgba(255,90,31, calc(0.2 + var(--bass) * 0.3))`,
      }}
      role="region"
      aria-label="Reproductor de música"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Vinyl size={48} cover={coverUrl} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div
              className="font-display truncate text-sm leading-tight font-bold"
              aria-live="polite"
              aria-atomic="true"
            >
              {currentTrack.title}
            </div>
            {currentTrack.bpm && (
              <span
                className="hidden rounded-full bg-[var(--bg-2)] px-2 py-0.5 font-mono text-[9px] text-[var(--fg-muted)] uppercase md:inline"
                aria-label={`${currentTrack.bpm} BPM, tonalidad ${currentTrack.key}`}
              >
                {currentTrack.bpm} BPM • {currentTrack.key}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="truncate font-mono text-[10px] text-[var(--fg-muted)] uppercase">
              {currentTrack.artist} • {currentTrack.genres.join(", ")}
            </div>
            <div className="hidden md:block" aria-hidden="true">
              <MiniWaveform peaks={currentTrack.waveformPeaks} progress={progress} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-3">
        <button
          onClick={() => prev()}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)] text-xs transition-colors hover:border-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] md:h-9 md:w-9"
          aria-label="Pista anterior"
        >
          <SkipBack className="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          onClick={() => (isPlaying ? pause() : play())}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-fire)] text-black transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] active:scale-95 md:h-10 md:w-10"
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
          aria-pressed={isPlaying}
          data-cursor="play"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />
          )}
        </button>

        <button
          onClick={() => next()}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)] text-xs transition-colors hover:border-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] md:h-9 md:w-9"
          aria-label="Siguiente pista"
        >
          <SkipForward className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="hidden items-center gap-2 md:flex">
          <label htmlFor="volume-slider" className="sr-only">
            Volumen
          </label>
          <input
            id="volume-slider"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="h-1 w-20 accent-[var(--accent-fire)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
            aria-label={`Volumen ${Math.round(volume * 100)}%`}
          />
        </div>

        <button
          onClick={() => setExpanded(!isExpanded)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)] font-mono text-[10px] uppercase transition-colors hover:border-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] md:h-9 md:w-9"
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

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-1 w-full bg-[var(--border)]"
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
