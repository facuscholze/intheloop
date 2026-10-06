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
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: "off" | "all" | "one";
  favorites: string[];

  setQueue: (tracks: Track[]) => void;
  playTrack: (track: Track, queue?: Track[]) => void;
  play: () => void;
  pause: () => void;
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
      progress: 0,
      duration: 0,
      shuffle: false,
      repeat: "off",
      favorites: [],

      setQueue: (tracks) => set({ queue: tracks }),

      playTrack: (track, queue) => {
        const q = queue || get().queue;
        let idx = q.findIndex((t) => t.id === track.id);
        if (idx === -1) {
          // add to queue
          const newQueue = [...q, track];
          idx = newQueue.length - 1;
          set({ queue: newQueue, currentIndex: idx, currentTrack: track, isPlaying: true, progress: 0 });
        } else {
          set({ currentIndex: idx, currentTrack: track, isPlaying: true, progress: 0, queue: q });
        }
      },

      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),

      next: () => {
        const { queue, currentIndex, shuffle, repeat } = get();
        if (!queue.length) return;
        if (repeat === "one") {
          set({ progress: 0, isPlaying: true });
          return;
        }
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
      setVolume: (v) => set({ volume: v }),
      setDuration: (d) => set({ duration: d }),

      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
      toggleRepeat: () => set((s) => ({ repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off" })),

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
        })),
    }),
    {
      name: "itl-player",
      partialize: (state) => ({ volume: state.volume, favorites: state.favorites, shuffle: state.shuffle, repeat: state.repeat }),
    }
  )
);
