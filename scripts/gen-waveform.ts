#!/usr/bin/env tsx
/**
 * pnpm gen:waveform
 * Genera waveform peaks para todos los tracks que no tengan o regenera
 * Lee WAV (PCM 16-bit) y calcula max por bloque
 */

import fs from "node:fs";
import path from "node:path";

const tracksDir = "content/tracks";

function genPeaksFromWav(wavPath: string, numPeaks = 120): number[] {
  const buffer = fs.readFileSync(wavPath);
  const data = buffer.slice(44); // skip header
  const blockSize = Math.floor(data.length / 2 / numPeaks);
  const peaks: number[] = [];
  for (let i = 0; i < numPeaks; i++) {
    let max = 0;
    for (let j = 0; j < blockSize; j++) {
      const idx = i * blockSize * 2 + j * 2;
      if (idx + 1 < data.length) {
        const sample = Math.abs(data.readInt16LE(idx) / 32768);
        max = Math.max(max, sample);
      }
    }
    peaks.push(Math.round(max * 100) / 100);
  }
  return peaks;
}

const files = fs.readdirSync(tracksDir).filter((f) => f.endsWith(".json") && !f.startsWith("_"));

for (const file of files) {
  const filePath = path.join(tracksDir, file);
  const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (json.waveformPeaks && json.waveformPeaks.length > 0) {
    console.log(`⏭️  ${file} ya tiene peaks (${json.waveformPeaks.length})`);
    continue;
  }

  const audioSrc = json.audioSrc;
  if (!audioSrc) {
    console.log(`⚠️  ${file} sin audioSrc, usando random`);
    json.waveformPeaks = Array.from({ length: 120 }, () => Math.round((0.2 + Math.random() * 0.8) * 100) / 100);
  } else {
    const wavPath = path.join("public/media", audioSrc);
    if (fs.existsSync(wavPath) && wavPath.endsWith(".wav")) {
      json.waveformPeaks = genPeaksFromWav(wavPath);
      console.log(`✅ ${file} peaks generados desde ${wavPath}`);
    } else {
      console.log(`⚠️  ${file} audio no es WAV o no existe (${wavPath}), random`);
      json.waveformPeaks = Array.from({ length: 120 }, () => Math.round((0.2 + Math.random() * 0.8) * 100) / 100);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
}

console.log("\n✅ Waveform peaks actualizados");
