#!/usr/bin/env tsx
/**
 * pnpm add:video
 * CLI para agregar video: pide datos, valida Zod, copia poster/preview, escribe JSON
 */

import fs from "node:fs";
import path from "node:path";
import { VideoSchema } from "../src/lib/content";
import { prompt, slugify, logStep, logSuccess, logWarn } from "../src/lib/cli";

async function main() {
  console.log("🎬 In The Loop — Agregar Video\n");

  const title = await prompt("Título del video", "Live @ Venue");
  const id = slugify(await prompt("ID (slug)", slugify(title)));
  const venue = await prompt("Venue", "Nombre del venue");
  const date = await prompt("Fecha (YYYY-MM-DD)", new Date().toISOString().slice(0, 10));
  const colorAccent = await prompt("Color accent", "#FF2E93");
  const youtubeId = await prompt("YouTube ID (opcional, ej: dQw4w9WgXcQ)", "");
  const srcInput = await prompt("Ruta video local en media-src/video/ (opcional)", "");

  logStep("Buscando archivos...");

  let finalSrc: string | null = null;
  let finalPoster: string | null = null;
  let finalPreview: string | null = null;

  const publicVideoDir = "public/media/video";
  const publicPosterDir = "public/media/images/posters";
  fs.mkdirSync(publicVideoDir, { recursive: true });
  fs.mkdirSync(publicPosterDir, { recursive: true });

  if (srcInput && fs.existsSync(srcInput)) {
    const ext = path.extname(srcInput);
    const dest = path.join(publicVideoDir, `${id}${ext}`);
    fs.copyFileSync(srcInput, dest);
    finalSrc = `video/${id}${ext}`;
    logSuccess(`Video copiado a ${dest}`);

    // Try generate poster via ffmpeg if available
    try {
      const { execSync } = await import("node:child_process");
      const posterDest = path.join(publicPosterDir, `${id}.jpg`);
      execSync(`ffmpeg -y -i ${dest} -ss 00:00:01 -vframes 1 -q:v 2 ${posterDest} 2>&1 | head -n 20`, { stdio: "pipe" });
      if (fs.existsSync(posterDest)) {
        finalPoster = `images/posters/${id}.jpg`;
        logSuccess(`Poster generado con ffmpeg: ${posterDest}`);
      }
    } catch {
      logWarn("ffmpeg no disponible, poster manual requerido en media-src/images/posters/");
    }

    // Preview 3-6s
    try {
      const { execSync } = await import("node:child_process");
      const previewDest = path.join(publicVideoDir, `previews/${id}.mp4`);
      fs.mkdirSync(path.dirname(previewDest), { recursive: true });
      execSync(`ffmpeg -y -i ${dest} -ss 00:00:02 -t 5 -an -vf scale=640:-2 -c:v libx264 -crf 28 ${previewDest} 2>&1 | tail -n 5`, { stdio: "pipe" });
      if (fs.existsSync(previewDest)) {
        finalPreview = `video/previews/${id}.mp4`;
        logSuccess(`Preview 5s generado: ${previewDest}`);
      }
    } catch {
      logWarn("No se pudo generar preview, usar loop del video completo o crear manual");
    }
  } else if (srcInput) {
    logWarn(`No se encontró ${srcInput}, se usará placeholder`);
  }

  const posterCandidates = [`media-src/images/posters/${id}.jpg`, `media-src/images/hero/${id}.jpg`, `media-src/images/shows/${id}.jpg`];
  for (const c of posterCandidates) {
    if (fs.existsSync(c)) {
      try {
        const sharp = (await import("sharp")).default;
        const dest = path.join(publicPosterDir, `${id}.webp`);
        await sharp(c).resize(1280, 720, { fit: "cover" }).webp({ quality: 80 }).toFile(dest);
        finalPoster = `images/posters/${id}.webp`;
        logSuccess(`Poster optimizado WebP: ${dest}`);
        break;
      } catch {
        const ext = path.extname(c);
        const dest = path.join(publicPosterDir, `${id}${ext}`);
        fs.copyFileSync(c, dest);
        finalPoster = `images/posters/${id}${ext}`;
        logSuccess(`Poster copiado: ${dest}`);
        break;
      }
    }
  }

  const videoData = {
    id,
    title,
    src: finalSrc,
    youtubeId: youtubeId || null,
    poster: finalPoster,
    previewSrc: finalPreview,
    date,
    venue,
    colorAccent,
  };

  const parsed = VideoSchema.safeParse(videoData);
  if (!parsed.success) {
    console.error("Zod error", parsed.error.flatten());
    process.exit(1);
  }

  const out = `content/videos/${id}.json`;
  fs.writeFileSync(out, JSON.stringify(parsed.data, null, 2));
  logSuccess(`JSON escrito ${out}`);

  console.log("\n✅ Video agregado!");
  console.log(`   - Src: ${finalSrc || youtubeId || "placeholder"}`);
  console.log(`   - Poster: ${finalPoster || "placeholder gradient"}`);
  console.log(`   - Preview: ${finalPreview || "usará src como preview"}`);
  console.log("\nProbá en /es#videos -> click para Modo Cine");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
