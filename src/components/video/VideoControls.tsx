"use client";

import { useState, useEffect } from "react";

interface VideoControlsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onClose: () => void;
  title: string;
}

export function VideoControls({ videoRef, onClose, title }: VideoControlsProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress(video.currentTime / video.duration);
        setCurrentTime(video.currentTime);
      }
    };
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    const handlePipChange = () => setIsPiP(document.pictureInPictureElement === video);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    document.addEventListener("fullscreenchange", handleFsChange);
    video.addEventListener("enterpictureinpicture", handlePipChange);
    video.addEventListener("leavepictureinpicture", handlePipChange);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      document.removeEventListener("fullscreenchange", handleFsChange);
      video.removeEventListener("enterpictureinpicture", handlePipChange);
      video.removeEventListener("leavepictureinpicture", handlePipChange);
    };
  }, [videoRef]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const newProgress = parseFloat(e.target.value);
    video.currentTime = newProgress * duration;
    setProgress(newProgress);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const v = parseFloat(e.target.value);
    video.volume = v;
    setVolume(v);
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (!document.fullscreenElement) {
        await video.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {}
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch {}
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 md:p-6">
      {/* Title */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="font-display text-lg font-bold text-white md:text-xl">{title}</div>
          <div className="font-mono text-[10px] tracking-widest text-white/60 uppercase">
            {formatTime(currentTime)} / {formatTime(duration)} • Modo Cine • Ambilight
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
          aria-label="Cerrar y volver"
        >
          ✕
        </button>
      </div>

      {/* Seek */}
      <div className="group relative">
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={progress}
          onChange={handleSeek}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-[var(--accent-fire)]"
        />
        <div className="absolute bottom-full left-0 mb-2 hidden rounded bg-black px-2 py-1 font-mono text-[10px] text-white group-hover:block">
          Seek: {(progress * 100).toFixed(1)}%
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-fire)] text-black hover:scale-105"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <div className="hidden items-center gap-2 md:flex">
            <span className="font-mono text-xs text-white/60">Vol</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolume}
              className="h-1 w-20 accent-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={togglePiP}
            className={`rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase ${isPiP ? "border-[var(--accent-lime)] bg-[var(--accent-lime)] text-black" : "border-white/20 bg-white/10 text-white hover:bg-white/20"}`}
          >
            PiP
          </button>
          <button
            onClick={toggleFullscreen}
            className={`rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase ${isFullscreen ? "border-[var(--accent-magenta)] bg-[var(--accent-magenta)] text-black" : "border-white/20 bg-white/10 text-white hover:bg-white/20"}`}
          >
            {isFullscreen ? "Exit FS" : "Fullscreen"}
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-white px-4 py-1.5 font-mono text-[10px] font-bold tracking-widest text-black uppercase hover:bg-[var(--accent-fire)]"
          >
            Cerrar (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
