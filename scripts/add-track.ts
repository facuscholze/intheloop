#!/usr/bin/env tsx
/**
 * pnpm add:track
 * CLI interactivo para agregar track en 2 minutos
 * - Pide datos
 * - Valida con Zod
 * - Busca audio en media-src/audio/tracks/ y cover en media-src/covers/
 * - Copia y optimiza a public/media/ con sharp
 * - Genera waveform peaks (lee WAV o genera placeholder)
 * - Escribe content/tracks/{id}.json
 */

import fs from "node:fs";
import path from "node:path";
import { TrackSchema } from "../src/lib/content";
import { prompt, promptNumber, slugify, logStep, logSuccess, logWarn } from "../src/lib/cli";

async function main() {
  console.log("🎵 In The Loop — Agregar Track (2 min)\n");

  const title = await prompt("Título del track", "Mi Track Tribal");
  const id = slugify(await prompt("ID (slug)", slugify(title)));
  const artist = await prompt("Artista", "Tommy Petersen");
  const type = await prompt("Tipo (track/set/mix)", "track");
  const bpm = await promptNumber("BPM", 124);
  const key = await prompt("Tonalidad (ej: Am, Fm)", "Am");
  const genres = (await prompt("Géneros (coma separado)", "Tribal House, House")).split(",").map((g) => g.trim());
  const date = await prompt("Fecha (YYYY-MM-DD)", new Date().toISOString().slice(0, 10));
  const colorAccent = await prompt("Color accent hex", "#FF5A1F");
  const soundcloud = await prompt("SoundCloud link (opcional)", "");
  const spotify = await prompt("Spotify link (opcional)", "");
  const beatport = await prompt("Beatport link (opcional)", "");

  // Buscar archivos
  logStep("Buscando archivos en media-src/...");

  const audioCandidates = [
    `media-src/audio/tracks/${id}.wav`,
    `media-src/audio/tracks/${id}.mp3`,
    `media-src/audio/tracks/${title}.wav`,
    `media-src/audio/sets/${id}.mp3`,
  ];

  let audioSrc: string | null = null;
  for (const candidate of audioCandidates) {
    if (fs.existsSync(candidate)) {
      audioSrc = candidate;
      logSuccess(`Audio encontrado: ${candidate}`);
      break;
    }
  }

  if (!audioSrc) {
    logWarn(`No se encontró audio para ${id}. Podés poner archivo en media-src/audio/tracks/${id}.wav`);
    logWarn("Por ahora se usará placeholder y link externo si hay");
  }

  const coverCandidates = [`media-src/covers/${id}.jpg`, `media-src/covers/${id}.png`, `media-src/covers/${id}.webp`, `media-src/images/hero/${id}.jpg`];
  let coverSrc: string | null = null;
  for (const c of coverCandidates) {
    if (fs.existsSync(c)) {
      coverSrc = c;
      logSuccess(`Cover encontrado: ${c}`);
      break;
    }
  }

  // Generar waveform peaks
  let waveformPeaks: number[] | null = null;
  if (audioSrc && audioSrc.endsWith(".wav")) {
    try {
      const buffer = fs.readFileSync(audioSrc);
      // Simple peak generation: read PCM data (skip 44 byte header)
      const data = buffer.slice(44);
      const numPeaks = 120;
      const blockSize = Math.floor(data.length / 2 / numPeaks);
      waveformPeaks = [];
      for (let i = 0; i < numPeaks; i++) {
        let max = 0;
        for (let j = 0; j < blockSize; j++) {
          const idx = i * blockSize * 2 + j * 2;
          if (idx + 1 < data.length) {
            const sample = Math.abs(data.readInt16LE(idx) / 32768);
            max = Math.max(max, sample);
          }
        }
        waveformPeaks.push(Math.round(max * 100) / 100);
      }
      logSuccess(`Waveform peaks generados: ${waveformPeaks.length} puntos`);
    } catch (e) {
      logWarn(`No se pudo generar waveform: ${e}`);
    }
  }

  if (!waveformPeaks) {
    waveformPeaks = Array.from({ length: 120 }, () => Math.round((0.2 + Math.random() * 0.8) * 100) / 100);
    logWarn("Usando waveform placeholder aleatorio");
  }

  // Copiar y optimizar
  const publicAudioDir = "public/media/audio";
  const publicCoverDir = "public/media/images/covers";
  fs.mkdirSync(publicAudioDir, { recursive: true });
  fs.mkdirSync(publicCoverDir, { recursive: true });

  let finalAudioSrc: string | null = null;
  let finalCover: string | null = null;

  if (audioSrc) {
    const ext = path.extname(audioSrc);
    const dest = path.join(publicAudioDir, `${id}${ext}`);
    fs.copyFileSync(audioSrc, dest);
    finalAudioSrc = `audio/${id}${ext}`;
    logSuccess(`Audio copiado a ${dest}`);
  }

  if (coverSrc) {
    try {
      const sharp = (await import("sharp")).default;
      const dest = path.join(publicCoverDir, `${id}.webp`);
      await sharp(coverSrc).resize(800, 800, { fit: "cover" }).webp({ quality: 80 }).toFile(dest);
      finalCover = `images/covers/${id}.webp`;
      logSuccess(`Cover optimizado a ${dest} (WebP 800x800)`);

      // Thumb
      const thumbDest = path.join(publicCoverDir, `${id}-thumb.webp`);
      await sharp(coverSrc).resize(200, 200, { fit: "cover" }).webp({ quality: 70 }).toFile(thumbDest);
      logSuccess(`Thumb generado ${thumbDest}`);
    } catch (e) {
      logWarn(`Sharp falló, copiando original: ${e}`);
      const ext = path.extname(coverSrc);
      const dest = path.join(publicCoverDir, `${id}${ext}`);
      fs.copyFileSync(coverSrc, dest);
      finalCover = `images/covers/${id}${ext}`;
    }
  }

  const trackData = {
    id,
    title,
    artist,
    type: type as any,
    audioSrc: finalAudioSrc,
    cover: finalCover,
    bpm,
    key,
    duration: null,
    date,
    genres,
    colorAccent,
    links: {
      soundcloud: soundcloud || null,
      spotify: spotify || null,
      beatport: beatport || null,
    },
    waveformPeaks,
  };

  const parsed = TrackSchema.safeParse(trackData);
  if (!parsed.success) {
    console.error("❌ Validación Zod falló:", parsed.error.flatten());
    process.exit(1);
  }

  const outputPath = `content/tracks/${id}.json`;
  fs.writeFileSync(outputPath, JSON.stringify(parsed.data, null, 2));
  logSuccess(`JSON escrito en ${outputPath}`);

  console.log("\n✅ Track agregado en 2 minutos!");
  console.log(`   - Audio: ${finalAudioSrc || "sin audio (usar embed externo)"}`);
  console.log(`   - Cover: ${finalCover || "sin cover (fallback gradiente)"}`);
  console.log(`   - JSON: ${outputPath}`);
  console.log("\nPróximos pasos:");
  console.log("- pnpm dev y probar en /es#music");
  console.log("- Si es producción, subir audio a bucket y setear NEXT_PUBLIC_MEDIA_BASE_URL");
  console.log("- No commitear WAV >5MB, usar bucket o Git LFS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
