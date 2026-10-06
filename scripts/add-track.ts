#!/usr/bin/env tsx
/**
 * pnpm add:track
 * CLI para agregar un track: pide datos, valida con Zod, copia audio desde media-src a public/media, genera waveform peaks placeholder.
 * Fase 0: placeholder, implementación completa en Fase 5.
 */
import fs from "node:fs";
import path from "node:path";

console.log("🎵 add:track — placeholder Fase 0");
console.log("Flujo final:");
console.log("1. Pedir id, title, bpm, key, genres");
console.log("2. Buscar audio en media-src/audio/tracks/");
console.log("3. Optimizar (ffmpeg) y copiar a public/media/audio/");
console.log("4. Generar waveform peaks (audiowaveform o wavesurfer)");
console.log("5. Buscar cover en media-src/covers/ y optimizar con sharp a public/media/images/covers/");
console.log("6. Escribir content/tracks/{id}.json validado con Zod");
console.log("\nPor ahora, copiá manualmente _TEMPLATE.json y completá los campos.");
