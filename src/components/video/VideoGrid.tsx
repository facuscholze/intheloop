"use client";

import { VideoCard } from "./VideoCard";
import type { Video } from "@/lib/content";

interface VideoGridProps {
  videos: Video[];
}

export function VideoGrid({ videos }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--bg-2)] p-12 text-center font-mono text-sm uppercase text-[var(--fg-muted)]">
        No hay videos aún. Agregá JSONs en content/videos/ + archivos en media-src/video/
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
