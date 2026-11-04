"use client";

import { useTranslations } from "next-intl";
import { VideoGrid } from "./VideoGrid";
import type { Video } from "@/lib/content";

interface VideoSectionProps {
  videos: Video[];
}

export function VideoSection({ videos }: VideoSectionProps) {
  const t = useTranslations("videos");

  return (
    <section
      id="videos"
      className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-24 md:px-10"
      aria-label={t("ariaLabel")}
    >
      <div className="mx-auto max-w-[var(--content-max)]">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-[clamp(44px,11vw,132px)] font-bold leading-none tracking-tight">
              VISUALS<span className="text-[var(--accent-magenta)]" aria-hidden="true">.</span>
            </h2>
            <p className="mt-2 max-w-xl font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">
              {t("description")}
            </p>
          </div>
          <div
            className="font-mono text-xs uppercase text-[var(--fg-muted)]"
            aria-label={t("countAria", { count: videos.length })}
          >
            {t("count", { count: videos.length })}
          </div>
        </div>

        <VideoGrid videos={videos} />
      </div>
    </section>
  );
}
