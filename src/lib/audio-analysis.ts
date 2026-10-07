/**
 * Análisis de audio para la waveform, en build (server) — sin dependencias npm.
 *
 * - WAV: lo lee `analyzeWav()` (JS puro, siempre disponible).
 * - MP3 / M4A / FLAC / OGG / … : se decodifica con **ffmpeg** a PCM crudo y se
 *   calculan los peaks igual que en WAV. Se probó con mp3 320kbps y m4a; en
 *   cuanto a duración, la derivamos del tamaño del PCM a 8 kHz (no hace falta
 *   ffprobe ni parsear el header).
 *
 * ffmpeg es OPCIONAL: si no está, se devuelve null y la UI usa su waveform
 * decorativa (nada se rompe). Se lo busca en:
 *   1. `process.env.FFMPEG_PATH`
 *   2. `node_modules/ffmpeg-static/ffmpeg` (si alguien corre `pnpm add -D ffmpeg-static`)
 *   3. `ffmpeg` del PATH (los runners de GitHub Actions ya lo traen; local:
 *      `brew install ffmpeg` / `apt install ffmpeg`)
 *
 * Los resultados se memoizan por archivo + mtime, así que un mismo audio no se
 * decodifica dos veces en el mismo build.
 */
import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { analyzeWav } from "./wav"

/** Sample rate del PCM intermedio: sobra para dibujar 120 barras. */
const ANALYSIS_SAMPLE_RATE = 8000
/** ~5 h de audio a 8 kHz mono 16-bit; un set largo entra holgado. */
const MAX_PCM_BYTES = 512 * 1024 * 1024

export interface AudioAnalysis {
  /** Alturas normalizadas 0..1 (max por bloque). */
  peaks: number[]
  /** Duración en segundos (null si no se pudo determinar). */
  duration: number | null
  /** De dónde salieron los peaks. */
  source: "wav" | "ffmpeg"
}

const cache = new Map<string, AudioAnalysis | null>()

let ffmpegPath: string | null | undefined

/** Ruta de ffmpeg, o null si no está disponible. Se resuelve una sola vez. */
export function findFfmpeg(): string | null {
  if (ffmpegPath !== undefined) return ffmpegPath

  const candidates = [
    process.env.FFMPEG_PATH,
    path.join(
      process.cwd(),
      "node_modules",
      "ffmpeg-static",
      process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg"
    )
  ].filter((candidate): candidate is string => Boolean(candidate))

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      ffmpegPath = candidate
      return ffmpegPath
    }
  }

  try {
    const probe = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" })
    ffmpegPath = probe.status === 0 ? "ffmpeg" : null
  } catch {
    ffmpegPath = null
  }
  return ffmpegPath
}

/** Aviso una sola vez: si no hay ffmpeg no queremos un warning por archivo. */
let warnedNoFfmpeg = false
function warnNoFfmpeg(file: string) {
  if (warnedNoFfmpeg) return
  warnedNoFfmpeg = true
  console.warn(
    `⚠️  Sin peaks para ${path.basename(file)} (y los demás no-WAV): ffmpeg no está instalado. ` +
      `La UI usa su waveform decorativa. Para peaks reales: instalá ffmpeg o corré "pnpm add -D ffmpeg-static".`
  )
}

function peaksFromPcm(buffer: Buffer, buckets: number): number[] {
  const frames = Math.floor(buffer.length / 2)
  const step = Math.max(1, Math.floor(frames / buckets))
  const peaks: number[] = []
  for (let b = 0; b < buckets; b++) {
    const from = b * step * 2
    const to = Math.min(from + step * 2, buffer.length)
    let max = 0
    for (let i = from; i + 1 < to; i += 2) {
      const sample = Math.abs(buffer.readInt16LE(i) / 32768)
      if (sample > max) max = sample
    }
    peaks.push(Math.round(max * 100) / 100)
  }
  return peaks
}

function analyzeWithFfmpeg(filePath: string, buckets: number): AudioAnalysis | null {
  const ffmpeg = findFfmpeg()
  if (!ffmpeg) {
    warnNoFfmpeg(filePath)
    return null
  }

  // -v error: silencio salvo errores reales; PCM s16le mono a 8 kHz por stdout.
  const proc = spawnSync(
    ffmpeg,
    [
      "-v",
      "error",
      "-i",
      filePath,
      "-f",
      "s16le",
      "-c:a",
      "pcm_s16le",
      "-ac",
      "1",
      "-ar",
      String(ANALYSIS_SAMPLE_RATE),
      "-"
    ],
    { maxBuffer: MAX_PCM_BYTES }
  )

  if (proc.error || proc.status !== 0 || !proc.stdout || proc.stdout.length === 0) {
    return null
  }

  const pcm = proc.stdout
  return {
    peaks: peaksFromPcm(pcm, buckets),
    duration: Math.round((pcm.length / 2 / ANALYSIS_SAMPLE_RATE) * 100) / 100,
    source: "ffmpeg"
  }
}

/**
 * Peaks + duración de un archivo de audio local.
 * Devuelve null si no se pudo analizar (formato raro, ffmpeg ausente, etc.).
 */
export function analyzeAudioFile(filePath: string, buckets = 120): AudioAnalysis | null {
  if (!fs.existsSync(filePath)) return null

  const key = `${filePath}:${fs.statSync(filePath).mtimeMs}:${buckets}`
  const cached = cache.get(key)
  if (cached !== undefined) return cached

  const extension = path.extname(filePath).toLowerCase()
  let result: AudioAnalysis | null = null

  if (extension === ".wav") {
    const wav = analyzeWav(filePath, buckets)
    if (wav) {
      result = { peaks: wav.peaks, duration: wav.duration, source: "wav" }
    }
  }
  if (!result) {
    result = analyzeWithFfmpeg(filePath, buckets)
  }

  cache.set(key, result)
  return result
}

/** true si se pueden calcular peaks de formatos comprimidos (mp3, m4a…). */
export function hasFfmpeg(): boolean {
  return findFfmpeg() !== null
}
