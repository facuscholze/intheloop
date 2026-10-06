"use client";

import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/stores/playerStore";
import { audioEngine } from "@/lib/audio-engine";
import { getMediaUrl } from "@/lib/media";
import { useMediaSession } from "@/hooks/useMediaSession";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const progress = usePlayerStore((s) => s.progress);
  const setProgress = usePlayerStore((s) => s.setProgress);
  const setDuration = usePlayerStore((s) => s.setDuration);
  const next = usePlayerStore((s) => s.next);
  const queue = usePlayerStore((s) => s.queue);

  // Init queue from content if empty (client side)
  useEffect(() => {
    if (queue.length === 0) {
      // Will be populated by page via setQueue
    }
  }, [queue.length]);

  // Handle track change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const src = getMediaUrl(currentTrack.audioSrc);
    if (!src) {
      console.warn("No audio src for track", currentTrack.id);
      return;
    }

    // Only change src if different
    if (audio.src !== src && !audio.src.endsWith(src)) {
      audio.src = src;
      audio.load();
      if (audioEngine) {
        audioEngine.connectMediaElement(audio, currentTrack.bpm || 124);
      }
    }

    if (isPlaying) {
      audio.play().catch((e) => console.warn("Play failed", e));
      audioEngine?.resume();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
      audioEngine?.resume();
      audioEngine?.start();
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audioEngine?.setVolume(volume);
  }, [volume]);

  // Time update
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      next();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [setProgress, setDuration, next]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          usePlayerStore.getState().isPlaying ? usePlayerStore.getState().pause() : usePlayerStore.getState().play();
          break;
        case "ArrowRight":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            usePlayerStore.getState().next();
          }
          break;
        case "ArrowLeft":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            usePlayerStore.getState().prev();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useMediaSession();

  return (
    <>
      <audio ref={audioRef} crossOrigin="anonymous" preload="metadata" className="hidden" />
      {children}
    </>
  );
}
