#!/usr/bin/env tsx
/**
 * pnpm add:track
 * CLI para agregar un tema: crea su carpeta en `content/songs/<id>/` con el
 * `song.json`, el audio y la portada. Si el audio es WAV, los peaks de la
 * waveform y la duración se calculan solos.
 *
 * También podés hacerlo a mano: copiá `content/songs/_TEMPLATE/` a
 * `content/songs/<id>/` y soltá ahí el audio + la portada.
 */

import fs from "node:fs"
import path from "node:path"
import { TrackSchema } from "../src/lib/content"
import { analyzeWav } from "../src/lib/wav"
import {
  copyIntoContentFolder,
  findFirstExisting,
  logStep,
  logSuccess,
  logWarn,
  prompt,
  promptNumber,
  slugify
} from "../src/lib/cli"

async function main() {
  console.log("🎵 In The Loop — Agregar Track (2 min)\n")

  const title = await prompt("Título del track", "Mi Track Tribal")
  const id = slugify(await prompt("ID (nombre de la carpeta)", slugify(title)))
  const artist = await prompt("Artista", "Tommy Petersen")
  const type = await prompt("Tipo (track/set/mix)", "track")
  const bpm = await promptNumber("BPM", 124)
  const key = await prompt("Tonalidad (ej: Am, Fm)", "Am")
  const genres = (await prompt("Géneros (separados por coma)", "Tribal House, House"))
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean)
  const date = await prompt("Fecha (YYYY-MM-DD)", new Date().toISOString().slice(0, 10))
  const colorAccent = await prompt("Color accent hex", "#FF5A1F")
  const soundcloud = await prompt("SoundCloud link (opcional)", "")
  const spotify = await prompt("Spotify link (opcional)", "")
  const beatport = await prompt("Beatport link (opcional)", "")

  const itemDir = path.join("content", "songs", id)

  // ---- Audio
  logStep("Audio")
  const audioInput = await prompt("Ruta del audio (Enter para buscar en media-src/audio/…)", "")
  const audioSource =
    audioInput ||
    findFirstExisting([
      `media-src/audio/tracks/${id}.wav`,
      `media-src/audio/tracks/${id}.mp3`,
      `media-src/audio/sets/${id}.wav`,
      `media-src/audio/sets/${id}.mp3`
    ])
  const audio = audioSource ? copyIntoContentFolder(audioSource, itemDir, id) : null
  if (!audio) {
    logWarn(`Sin audio: soltá el archivo en ${itemDir}/ y poné su nombre en el JSON.`)
  }

  // ---- Portada
  logStep("Portada")
  const coverInput = await prompt("Ruta de la portada (Enter para buscar en media-src/covers/)", "")
  const coverSource =
    coverInput ||
    findFirstExisting([
      `media-src/covers/${id}.jpg`,
      `media-src/covers/${id}.jpeg`,
      `media-src/covers/${id}.png`,
      `media-src/covers/${id}.webp`
    ])
  const cover = coverSource ? copyIntoContentFolder(coverSource, itemDir, "cover") : null
  if (!cover) logWarn("Sin portada: se usa un degradado con la inicial del tema.")

  // ---- Waveform + duración (solo si el audio es WAV: no hay decoder a mano)
  let waveformPeaks: number[] | null = null
  let duration: number | null = null
  if (audio && path.extname(audio).toLowerCase() === ".wav") {
    const analysis = analyzeWav(path.join(itemDir, audio))
    if (analysis) {
      waveformPeaks = analysis.peaks
      duration = analysis.duration ? Math.round(analysis.duration) : null
      logSuccess(`Waveform: ${analysis.peaks.length} peaks • duración ${duration}s`)
    }
  }
  if (!waveformPeaks) {
    logWarn("Sin peaks (el audio no es WAV): la card usa una waveform decorativa.")
  }

  const trackData = {
    title,
    artist,
    type,
    audio,
    cover,
    bpm,
    key,
    duration,
    date,
    genres,
    colorAccent,
    links: {
      soundcloud: soundcloud || null,
      spotify: spotify || null,
      beatport: beatport || null
    },
    waveformPeaks
  }

  const parsed = TrackSchema.safeParse(trackData)
  if (!parsed.success) {
    console.error("❌ Validación Zod falló:", parsed.error.flatten())
    process.exit(1)
  }

  const jsonPath = path.join(itemDir, "song.json")
  fs.mkdirSync(itemDir, { recursive: true })
  fs.writeFileSync(jsonPath, `${JSON.stringify(parsed.data, null, 2)}\n`)
  logSuccess(`JSON escrito en ${jsonPath}`)

  console.log("\n✅ Track agregado!")
  console.log(`   - Carpeta: ${itemDir}`)
  console.log(`   - Audio: ${audio ?? "sin audio (usar embed externo)"}`)
  console.log(`   - Portada: ${cover ?? "sin portada"}`)
  console.log("\nSiguiente: `pnpm sync:media` (o `pnpm dev`, que ya lo hace solo) y mirá /es#music")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
