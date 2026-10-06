"use client";

import { useEffect, useRef } from "react";

export function useHLS(videoRef: React.RefObject<HTMLVideoElement | null>, src: string | null) {
  const hlsRef = useRef<any>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const isHLS = src.endsWith(".m3u8") || src.includes("m3u8");

    if (!isHLS) {
      if (video.src !== src) video.src = src;
      return;
    }

    // HLS via hls.js dynamic import
    const loadHLS = async () => {
      const Hls = (await import("hls.js")).default;
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      }
    };

    loadHLS();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, videoRef]);
}
