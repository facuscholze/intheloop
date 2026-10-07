#!/usr/bin/env tsx
/**
 * Genera 3 audios demo WAV pequeños (mono, 22kHz, 8 segundos) para Fase 2
 * Tribal House 124 BPM con kick sintético + sine + shaker
 * No requiere ffmpeg, genera WAV PCM 16-bit
 */

import fs from "node:fs"
import path from "node:path"

const SAMPLE_RATE = 22050
const DURATION = 8 // seconds
const NUM_SAMPLES = SAMPLE_RATE * DURATION

function writeWavFile(filePath: string, samples: Float32Array) {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  // RIFF header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  writeString(0, "RIFF")
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(8, "WAVE")
  writeString(12, "fmt ")
  view.setUint32(16, 16, true) // PCM chunk size
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, SAMPLE_RATE * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeString(36, "data")
  view.setUint32(40, samples.length * 2, true)

  // PCM data
  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    offset += 2
  }

  fs.writeFileSync(filePath, Buffer.from(buffer))
}

function generateTribalTrack(bpm: number, rootFreq: number, variation: number): Float32Array {
  const samples = new Float32Array(NUM_SAMPLES)
  const beatInterval = (60 / bpm) * SAMPLE_RATE // samples per beat
  const kickFreq = 60

  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE
    const beatPos = (i % beatInterval) / beatInterval // 0-1 within beat
    const beatIndex = Math.floor(i / beatInterval)

    let sample = 0

    // Kick on every beat (tribal)
    if (beatPos < 0.15) {
      const kickEnv = Math.exp(-beatPos * 20) * (1 - beatPos * 2)
      const kickPitch = kickFreq * Math.exp(-beatPos * 10) + 30
      sample += Math.sin(2 * Math.PI * kickPitch * t * 0.5) * kickEnv * 0.8
    }

    // Off-beat shaker (16th notes)
    const sixteenthPos = (i % (beatInterval / 4)) / (beatInterval / 4)
    if (sixteenthPos < 0.05 && beatIndex % 2 === 1) {
      sample += (Math.random() * 2 - 1) * 0.15 * Math.exp(-sixteenthPos * 30)
    }

    // Bassline - root + fifth, tribal groove
    const bassPattern = [0, 0, 7, 0, 0, 7, 5, 7] // semitones
    const patternIndex = beatIndex % bassPattern.length
    const bassNote = rootFreq * Math.pow(2, bassPattern[patternIndex] / 12)
    const bassEnv = beatPos < 0.8 ? 1 : 1 - (beatPos - 0.8) * 5
    sample += Math.sin(2 * Math.PI * bassNote * t) * 0.25 * bassEnv
    sample += Math.sin(2 * Math.PI * bassNote * 2 * t) * 0.08 * bassEnv

    // Latin percussion - conga-like
    if (variation > 0.5 && beatPos > 0.4 && beatPos < 0.45) {
      const congaEnv = Math.exp(-(beatPos - 0.4) * 40)
      sample += Math.sin(2 * Math.PI * 180 * t) * congaEnv * 0.2
    }

    // High melodic texture
    if (beatIndex % 8 >= 4) {
      const melFreq = rootFreq * 4 * (1 + Math.sin(t * 0.5) * 0.02)
      sample += Math.sin(2 * Math.PI * melFreq * t) * 0.05 * Math.sin(t * 2) * 0.5 + 0.5
    }

    // Subtle noise for warmth
    sample += (Math.random() * 2 - 1) * 0.01

    // Soft clipping
    sample = Math.tanh(sample * 1.2) * 0.8

    samples[i] = sample
  }

  return samples
}

function generatePeaks(samples: Float32Array, numPeaks = 100): number[] {
  const peaks: number[] = []
  const blockSize = Math.floor(samples.length / numPeaks)
  for (let i = 0; i < numPeaks; i++) {
    let max = 0
    for (let j = 0; j < blockSize; j++) {
      const idx = i * blockSize + j
      if (idx < samples.length) {
        max = Math.max(max, Math.abs(samples[idx]))
      }
    }
    peaks.push(Math.round(max * 100) / 100)
  }
  return peaks
}

// Cada tema vive en su carpeta: content/songs/<id>/ (audio + track.json).
const songsDir = path.join(process.cwd(), "content/songs")
fs.mkdirSync(songsDir, { recursive: true })

const tracks = [
  { id: "tribal-sunset-124", title: "Tribal Sunset", bpm: 124, root: 55, var: 0.3 }, // A1
  { id: "beach-groove-126", title: "Beach Groove", bpm: 126, root: 65.41, var: 0.7 }, // C2
  { id: "underground-house-122", title: "Underground House", bpm: 122, root: 49, var: 0.5 } // G1
]

for (const track of tracks) {
  console.log(`Generating ${track.id} - ${track.bpm} BPM...`)
  const samples = generateTribalTrack(track.bpm, track.root, track.var)
  const itemDir = path.join(songsDir, track.id)
  fs.mkdirSync(itemDir, { recursive: true })
  const wavPath = path.join(itemDir, `${track.id}.wav`)
  writeWavFile(wavPath, samples)

  const peaks = generatePeaks(samples, 120)
  console.log(`  -> ${wavPath} (${(fs.statSync(wavPath).size / 1024).toFixed(1)} KB)`)
  console.log(`  -> Peaks: [${peaks.slice(0, 5).join(", ")}...]`)

  const jsonPath = path.join(itemDir, "track.json")
  const json = {
    title: track.title,
    artist: "Tommy Petersen",
    type: "track",
    audio: `${track.id}.wav`,
    cover: null,
    bpm: track.bpm,
    key: track.id === "tribal-sunset-124" ? "Am" : track.id === "beach-groove-126" ? "Fm" : "Gm",
    duration: DURATION,
    date: "2026-01-15",
    genres: ["Tribal House", "House"],
    colorAccent:
      track.id === "tribal-sunset-124"
        ? "#FF5A1F"
        : track.id === "beach-groove-126"
          ? "#FF2E93"
          : "#C8FF00",
    links: { soundcloud: null, spotify: null, beatport: null },
    waveformPeaks: peaks
  }
  fs.writeFileSync(jsonPath, `${JSON.stringify(json, null, 2)}\n`)
  console.log(`  -> ${jsonPath}`)
}

console.log("\n✅ 3 demo tracks generados en content/songs/<id>/ (audio + track.json)")
console.log(
  "Note: WAV files are small (mono 22kHz 8s ~ 350KB each) for dev. In production, convert to MP3/AAC and upload to bucket."
)
