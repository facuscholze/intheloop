#!/usr/bin/env tsx
/**
 * pnpm gen:waveform
 *
 * Genera los peaks de la waveform para los temas que no los tengan y los
 * escribe en el `track.json` (así el build no recalcula nada).
 *
 * Ojo: ya no hace falta correrlo — `content.ts` los calcula solo en build.
 * WAV se lee en JS; MP3/M4A/… necesitan ffmpeg (si no está, se avisa).
 *
 * Uso: pnpm gen:waveform [--force]
 */
import fs from "node:fs"
import path from "node:path"
import { contentItemDirs, listContentFiles, PUBLIC_MEDIA_DIR } from "../src/lib/content-fs"
import { analyzeAudioFile, hasFfmpeg } from "../src/lib/audio-analysis"
import { extname, slugifySegment, sortContentFiles, isAudioFile } from "../src/lib/content-media"

const force = process.argv.includes("--force")

/** Ruta local del audio: primero la carpeta del tema, después el formato viejo. */
function resolveAudioPath(value: string | null | undefined, itemDir: string, files: string[]) {
  if (!value || /^(https?:)?\/\//i.test(value)) return null
  const rel = value.trim().replace(/^\.\//, "").replace(/^\/+/, "")
  const wanted = slugifySegment(rel)
  const inFolder = files.find(
    (f) => f.toLowerCase() === rel.toLowerCase() || slugifySegment(f) === wanted
  )
  if (inFolder) return path.join(itemDir, inFolder)
  const legacy = path.join(PUBLIC_MEDIA_DIR, rel.replace(/^media\//, ""))
  return fs.existsSync(legacy) ? legacy : null
}

let updated = 0
for (const { slug, dir } of contentItemDirs("songs")) {
  const jsonPath = path.join(dir, "track.json")
  if (!fs.existsSync(jsonPath)) {
    console.log(`⏭️  content/songs/${slug}/ sin track.json`)
    continue
  }
  const json = JSON.parse(fs.readFileSync(jsonPath, "utf-8"))

  if (!force && Array.isArray(json.waveformPeaks) && json.waveformPeaks.length > 0) {
    console.log(`⏭️  ${slug}: ya tiene peaks (${json.waveformPeaks.length})`)
    continue
  }

  const files = sortContentFiles(listContentFiles(dir))
  const audioValue = json.audio ?? json.audioSrc ?? files.filter(isAudioFile)[0] ?? null
  const audioPath = resolveAudioPath(audioValue, dir, files)

  const analysis = audioPath ? analyzeAudioFile(audioPath) : null
  if (analysis) {
    json.waveformPeaks = analysis.peaks
    if (!json.duration && analysis.duration) json.duration = Math.round(analysis.duration)
    fs.writeFileSync(jsonPath, `${JSON.stringify(json, null, 2)}\n`)
    console.log(
      `✅ ${slug}: ${analysis.peaks.length} peaks (${analysis.source}) desde ${path.basename(audioPath!)}`
    )
    updated++
    continue
  }

  console.log(
    `⚠️  ${slug}: no se pudieron calcular peaks (${hasFfmpeg() ? "audio ilegible" : "ffmpeg no está instalado"}) → la UI usa su waveform decorativa`
  )
}

console.log(`\n✅ ${updated} tema(s) actualizados`)
