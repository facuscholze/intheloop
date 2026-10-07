/**
 * Lectura mínima de WAV (PCM) para sacar peaks de waveform y duración sin
 * dependencias. Se usa en build: los loaders de contenido calculan los peaks
 * solos, así no hace falta correr `pnpm gen:waveform` a mano.
 */
import fs from "node:fs"

export interface WavAnalysis {
  /** Alturas normalizadas 0..1 (max por bloque). */
  peaks: number[]
  /** Duración en segundos (null si el header no es confiable). */
  duration: number | null
  sampleRate: number
  channels: number
  bitsPerSample: number
}

interface WavHeader {
  dataOffset: number
  dataSize: number
  sampleRate: number
  channels: number
  bitsPerSample: number
  byteRate: number
}

function readHeader(buffer: Buffer): WavHeader | null {
  if (buffer.length < 44) return null
  if (buffer.toString("ascii", 0, 4) !== "RIFF") return null
  if (buffer.toString("ascii", 8, 12) !== "WAVE") return null

  let offset = 12
  let fmt: Omit<WavHeader, "dataOffset" | "dataSize"> | null = null
  let data: { offset: number; size: number } | null = null

  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4)
    const size = buffer.readUInt32LE(offset + 4)
    const body = offset + 8
    if (id === "fmt " && body + 16 <= buffer.length) {
      fmt = {
        // audioFormat = buffer.readUInt16LE(body)
        channels: buffer.readUInt16LE(body + 2),
        sampleRate: buffer.readUInt32LE(body + 4),
        byteRate: buffer.readUInt32LE(body + 8),
        bitsPerSample: buffer.readUInt16LE(body + 14)
      }
    } else if (id === "data") {
      data = { offset: body, size: Math.min(size, buffer.length - body) }
      break
    }
    offset = body + size + (size % 2) // los chunks se alinean a 2 bytes
  }

  if (!fmt || !data) return null
  return { ...fmt, dataOffset: data.offset, dataSize: data.size }
}

/**
 * Calcula `buckets` peaks (max absoluto por bloque) y la duración.
 * Devuelve null si el archivo no es un WAV PCM legible.
 */
export function analyzeWav(filePath: string, buckets = 120): WavAnalysis | null {
  let buffer: Buffer
  try {
    buffer = fs.readFileSync(filePath)
  } catch {
    return null
  }
  const header = readHeader(buffer)
  if (!header || header.bitsPerSample <= 0) return null

  const bytesPerSample = header.bitsPerSample / 8
  const frameSize = Math.max(1, bytesPerSample * Math.max(1, header.channels))
  const frames = Math.floor(header.dataSize / frameSize)
  if (frames === 0) return null

  const step = Math.max(1, Math.floor(frames / buckets))
  const peaks: number[] = []
  const end = header.dataOffset + header.dataSize

  for (let b = 0; b < buckets; b++) {
    const from = header.dataOffset + b * step * frameSize
    const to = Math.min(from + step * frameSize, end)
    let max = 0
    if (header.bitsPerSample === 16) {
      for (let i = from; i + 1 < to; i += frameSize) {
        const sample = Math.abs(buffer.readInt16LE(i) / 32768)
        if (sample > max) max = sample
      }
    } else if (header.bitsPerSample === 8) {
      for (let i = from; i < to; i += frameSize) {
        const sample = Math.abs((buffer[i] - 128) / 128)
        if (sample > max) max = sample
      }
    } else if (header.bitsPerSample === 32) {
      for (let i = from; i + 3 < to; i += frameSize) {
        const sample = Math.abs(buffer.readInt32LE(i) / 2147483648)
        if (sample > max) max = sample
      }
    } else {
      return null
    }
    peaks.push(Math.round(max * 100) / 100)
  }

  const duration = header.byteRate > 0 ? header.dataSize / header.byteRate : null
  return {
    peaks,
    duration,
    sampleRate: header.sampleRate,
    channels: header.channels,
    bitsPerSample: header.bitsPerSample
  }
}
