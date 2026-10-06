"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Track } from "@/lib/content";

interface PlayerState {
  queue: Track[];
  currentIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: "off" | "all" | "one";
  favorites: string[];

  setQueue: (tracks: Track[]) => void;
  playTrack: (track: Track, queue?: Track[]) => void;
  play: () => void;
  pause: () => void;
  toggleMute: () => void;
  next: () => void;
  prev: () => void;
  setProgress: (p: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: (id: string) => void;
  setDuration: (d: number) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      queue: [],
      currentIndex: -1,
      currentTrack: null,
      isPlaying: false,
      volume: 0.9,
      muted: false,
      progress: 0,
      duration: 0,
      shuffle: false,
      repeat: "off",
      favorites: [],

      setQueue: (tracks) => set({ queue: tracks }),

      playTrack: (track, queue) => {
        const q = queue || get().queue;
        const current = get().currentTrack;

        // Same track: resume where it left off (never reset progress).
        // The UI relies on this to pause/resume from the card button.
        if (current && current.id === track.id) {
          const idx = get().queue.findIndex((t) => t.id === track.id);
          set({ isPlaying: true, ...(idx >= 0 ? { currentIndex: idx } : {}) });
          return;
        }

        let idx = q.findIndex((t) => t.id === track.id);
        if (idx === -1) {
          // add to queue
          const newQueue = [...q, track];
          idx = newQueue.length - 1;
          set({
            queue: newQueue,
            currentIndex: idx,
            currentTrack: track,
            isPlaying: true,
            progress: 0,
          });
        } else {
          set({ currentIndex: idx, currentTrack: track, isPlaying: true, progress: 0, queue: q });
        }
      },

      // With no track loaded, "play" starts the first track of the queue.
      play: () => {
        const { queue, currentTrack, currentIndex } = get();
        if (!currentTrack) {
          if (queue.length > 0) get().playTrack(queue[0]);
          return;
        }
        if (currentIndex < 0 && queue.length > 0) {
          const idx = queue.findIndex((t) => t.id === currentTrack.id);
          if (idx >= 0) set({ currentIndex: idx });
        }
        set({ isPlaying: true });
      },
      pause: () => set({ isPlaying: false }),

      toggleMute: () => set((s) => ({ muted: !s.muted })),

      next: () => {
        const { queue, currentIndex, shuffle, repeat } = get();
        if (!queue.length) return;
        let nextIdx: number;
        if (shuffle) {
          nextIdx = Math.floor(Math.random() * queue.length);
        } else {
          nextIdx = currentIndex + 1;
          if (nextIdx >= queue.length) {
            if (repeat === "all") nextIdx = 0;
            else return;
          }
        }
        set({ currentIndex: nextIdx, currentTrack: queue[nextIdx], progress: 0, isPlaying: true });
      },

      prev: () => {
        const { queue, currentIndex } = get();
        if (!queue.length) return;
        const prevIdx = currentIndex - 1 < 0 ? queue.length - 1 : currentIndex - 1;
        set({ currentIndex: prevIdx, currentTrack: queue[prevIdx], progress: 0, isPlaying: true });
      },

      setProgress: (p) => set({ progress: p }),
      setVolume: (v) => set({ volume: v, ...(v > 0 ? { muted: false } : {}) }),
      setDuration: (d) => set({ duration: d }),

      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
      toggleRepeat: () =>
        set((s) => ({ repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off" })),

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
    }),
    {
      name: "itl-player",
      partialize: (state) => ({
        volume: state.volume,
        muted: state.muted,
        favorites: state.favorites,
        shuffle: state.shuffle,
        repeat: state.repeat,
      }),
    }
  )
);
