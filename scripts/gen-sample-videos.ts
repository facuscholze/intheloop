#!/usr/bin/env tsx
/**
 * Genera 4 videos demo JSON + posters placeholder (gradientes)
 * Videos reales placeholder: si no hay ffmpeg, usa canvas placeholder en UI
 * Crea content/videos/*.json
 */

import fs from "node:fs";
import path from "node:path";

const videos = [
  {
    id: "live-le-fleurus-paris",
    title: "Live @ Le Fleurus Paris",
    venue: "Le Fleurus",
    city: "París",
    country: "FR",
    date: "2025-09-12",
    colorAccent: "#FF2E93",
    youtubeId: null,
    src: null, // placeholder - en prod sería video/live/le-fleurus.mp4 o HLS
    poster: null,
    previewSrc: null,
  },
  {
    id: "sundowner-colonia",
    title: "Sundowner Session",
    venue: "Sundowner",
    city: "Colonia San Miguel",
    country: "AR",
    date: "2026-01-31",
    colorAccent: "#FF5A1F",
    youtubeId: null,
    src: null,
    poster: null,
    previewSrc: null,
  },
  {
    id: "pirata-berlin",
    title: "Pirata Berlin",
    venue: "Pirata",
    city: "Berlín",
    country: "DE",
    date: "2025-08-08",
    colorAccent: "#C8FF00",
    youtubeId: null,
    src: null,
    poster: null,
    previewSrc: null,
  },
  {
    id: "temple-caba",
    title: "Temple CABA",
    venue: "Temple",
    city: "CABA",
    country: "AR",
    date: "2026-06-27",
    colorAccent: "#8B5CF6",
    youtubeId: "dQw4w9WgXcQ", // demo youtube facade (Rickroll placeholder, cambiar por real)
    src: null,
    poster: null,
    previewSrc: null,
  },
];

const contentDir = path.join(process.cwd(), "content/videos");
fs.mkdirSync(contentDir, { recursive: true });

for (const v of videos) {
  const json = {
    title: v.title,
    src: v.src,
    youtubeId: v.youtubeId,
    poster: v.poster,
    previewSrc: v.previewSrc,
    date: v.date,
    venue: v.venue,
    colorAccent: v.colorAccent,
  };
  const itemDir = path.join(contentDir, v.id);
  fs.mkdirSync(itemDir, { recursive: true });
  const filePath = path.join(itemDir, "video.json");
  fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`✅ ${filePath}`);
}

console.log("\n4 demo videos generados en content/videos/<id>/video.json. Para videos reales:");
console.log("- Poné MP4 en media-src/video/live/");
console.log("- Posters en media-src/images/posters/");
console.log("- Previews 3-6s en media-src/video/previews/ o se generan automático con ffmpeg");
console.log("- HLS: .m3u8 + segmentos en public/media/video/hls/");
