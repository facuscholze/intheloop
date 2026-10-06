import { z } from "zod";

export const TrackSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string().default("Tommy Petersen"),
  type: z.enum(["track", "set", "mix"]).default("track"),
  audioSrc: z.string().nullable().optional(),
  cover: z.string().nullable().optional(),
  bpm: z.number().min(60).max(200).nullable().optional(),
  key: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
  date: z.string().nullable().optional(),
  genres: z.array(z.string()).default([]),
  colorAccent: z.string().nullable().optional(),
  links: z
    .object({
      soundcloud: z.string().nullable().optional(),
      spotify: z.string().nullable().optional(),
      beatport: z.string().nullable().optional(),
      youtube: z.string().nullable().optional(),
    })
    .default({}),
  waveformPeaks: z.array(z.number()).nullable().optional(),
});

export const VideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  src: z.string().nullable().optional(),
  youtubeId: z.string().nullable().optional(),
  poster: z.string().nullable().optional(),
  previewSrc: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  colorAccent: z.string().nullable().optional(),
});

export const ShowSchema = z.object({
  id: z.string(),
  venue: z.string(),
  city: z.string(),
  country: z.string(),
  date: z.string(),
  instagram: z.string().nullable().optional(),
  galleryUrl: z.string().nullable().optional(),
  photo: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  needsReview: z.string().nullable().optional(),
});

export const SiteSchema = z.object({
  artist: z.string(),
  agency: z.string(),
  tagline: z.object({ en: z.string().nullable(), es: z.string().nullable() }),
  contact: z.object({
    email: z.string(),
    whatsapp: z.string(),
    instagram: z.array(z.string()),
    youtube: z.string(),
    soundcloud: z.string(),
  }),
  genres: z.array(z.string()),
});

export type Track = z.infer<typeof TrackSchema>;
export type Video = z.infer<typeof VideoSchema>;
export type Show = z.infer<typeof ShowSchema>;
export type Site = z.infer<typeof SiteSchema>;

// Loaders (build-time, server only)
import fs from "node:fs";
import path from "node:path";

const contentDir = path.join(process.cwd(), "content");

export function loadSite(): Site {
  const raw = JSON.parse(fs.readFileSync(path.join(contentDir, "site.json"), "utf-8"));
  return SiteSchema.parse(raw);
}

export function loadShows(): Show[] {
  const raw = JSON.parse(fs.readFileSync(path.join(contentDir, "shows.json"), "utf-8"));
  const arr = z.array(ShowSchema).parse(raw);
  // sort recent first
  return arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function loadTracks(): Track[] {
  const dir = path.join(contentDir, "tracks");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
  const tracks = files.map((f) => {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"));
    return TrackSchema.parse(raw);
  });
  return tracks.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export function loadVideos(): Video[] {
  const dir = path.join(contentDir, "videos");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
  const videos = files.map((f) => {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"));
    return VideoSchema.parse(raw);
  });
  return videos.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
