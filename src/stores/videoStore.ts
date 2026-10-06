"use client";

import { create } from "zustand";
import type { Video } from "@/lib/content";

interface VideoStore {
  activeVideo: Video | null;
  activeElement: HTMLElement | null;
  isCineMode: boolean;
  openVideo: (video: Video, element: HTMLElement) => void;
  closeVideo: () => void;
}

export const useVideoStore = create<VideoStore>((set) => ({
  activeVideo: null,
  activeElement: null,
  isCineMode: false,
  openVideo: (video, element) => set({ activeVideo: video, activeElement: element, isCineMode: true }),
  closeVideo: () => set({ activeVideo: null, activeElement: null, isCineMode: false }),
}));
