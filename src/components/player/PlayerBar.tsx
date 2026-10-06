"use client";

import { usePlayerStore } from "@/stores/playerStore";
import { useUIStore } from "@/stores/uiStore";
import { Vinyl } from "./Vinyl";
import { MiniWaveform } from "./Waveform";
import { getMediaUrl } from "@/lib/media";
import { useAudioReactive } from "@/hooks/useAudioReactive";

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
  const { bass } = useAudioReactive();

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-30 flex h-[var(--player-h)] items-center justify-between border-t border-[var(--border)] bg-[var(--bg)]/90 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-[spin_3s_linear_infinite] rounded-full bg-gradient-to-br from-[var(--accent-fire)] to-[var(--accent-magenta)]" />
          <div>
            <div className="font-display text-sm font-bold">IN THE LOOP • Player</div>
            <div className="font-mono text-[10px] uppercase text-[var(--fg-muted)]">Seleccioná un track para empezar</div>
          </div>
        </div>
        <div className="font-mono text-[10px] uppercase text-[var(--fg-dim)]">{queue.length} tracks en cola</div>
      </div>
    );
  }

  const coverUrl = getMediaUrl(currentTrack.cover);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 flex h-[var(--player-h)] items-center justify-between border-t border-[var(--border)] bg-[var(--bg)]/95 px-4 backdrop-blur-xl md:px-6"
      style={{
        boxShadow: `0 0 ${10 + bass * 30}px rgba(255,90,31,${0.1 + bass * 0.2})`,
        borderTopColor: `rgba(255,90,31,${0.2 + bass * 0.3})`,
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Vinyl size={48} cover={coverUrl} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate font-display text-sm font-bold leading-tight">{currentTrack.title}</div>
            {currentTrack.bpm && (
              <span className="hidden rounded-full bg-[var(--bg-2)] px-2 py-0.5 font-mono text-[9px] uppercase text-[var(--fg-muted)] md:inline">
                {currentTrack.bpm} BPM • {currentTrack.key}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="truncate font-mono text-[10px] uppercase text-[var(--fg-muted)]">{currentTrack.artist} • {currentTrack.genres.join(", ")}</div>
            <div className="hidden md:block">
              <MiniWaveform peaks={currentTrack.waveformPeaks} progress={progress} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={() => prev()}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)] text-xs transition-colors hover:border-[var(--fg)]"
          aria-label="Previous"
        >
          ⏮
        </button>

        <button
          onClick={() => (isPlaying ? pause() : play())}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-fire)] text-black transition-transform hover:scale-105 active:scale-95"
          aria-label={isPlaying ? "Pause" : "Play"}
          data-cursor="play"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        <button
          onClick={() => next()}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)] text-xs transition-colors hover:border-[var(--fg)]"
          aria-label="Next"
        >
          ⏭
        </button>

        <div className="hidden items-center gap-2 md:flex">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="h-1 w-20 accent-[var(--accent-fire)]"
            aria-label="Volume"
          />
        </div>

        <button
          onClick={() => setExpanded(!isExpanded)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-2)] font-mono text-[10px] uppercase transition-colors hover:border-[var(--fg)]"
          aria-label="Expand player"
        >
          {isExpanded ? "↓" : "↑"}
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-[var(--border)]">
        <div className="h-full bg-[var(--accent-fire)] transition-all duration-100" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}
