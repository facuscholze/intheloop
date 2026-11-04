#!/usr/bin/env tsx
/**
 * pnpm add:video
 * CLI para agregar un video de YouTube a la sección VISUALS:
 * crea su carpeta en `content/videos/<id>/` con el `video.json` y, opcionalmente,
 * un poster (miniatura personalizada) dentro de la carpeta.
 *
 * También podés hacerlo a mano: copiá `content/videos/_TEMPLATE/` a
 * `content/videos/<id>/`, editar el `video.json` con el `youtubeId` y listo.
 */

import fs from "node:fs";
import path from "node:path";
import { VideoSchema } from "../src/lib/content";
import { extractYouTubeId } from "../src/lib/youtube";
import {
  copyIntoContentFolder,
  findFirstExisting,
  logStep,
  logSuccess,
  logWarn,
  prompt,
  promptNumber,
  slugify
} from "../src/lib/cli";

const CATEGORIES = ["Live", "Aftermovie", "Set"] as const;

async function main() {
  console.log("🎬 In The Loop — Agregar Video (YouTube)\n");

  const title = await prompt("Título del video", "Live @ Venue");
  const id = slugify(await prompt("ID (nombre de la carpeta)", slugify(title)));

  // ---- YouTube: URL o ID crudo, se extrae y valida el ID automáticamente
  logStep("YouTube")
  console.log(
    "📎 Pegá la URL del video (youtube.com/watch?v=..., youtu.be/..., /shorts/, /live/)\n"
  )
  const ytInput = await prompt("URL o ID de YouTube", "")
  const youtubeId = extractYouTubeId(ytInput)
  if (!youtubeId) {
    logWarn("No se pudo extraer un ID de YouTube válido: el video se guarda como borrador (no se verá hasta que se corrija).")
  }

  // ---- Categoría
  logStep("Categoría")
  CATEGORIES.forEach((c, i) => console.log(`   ${i + 1}) ${c}`))
  const categoryInput = await prompt("Categoría (1-3)", "1")
  const categoryIndex = Number(categoryInput)
  const category = Number.isInteger(categoryIndex) && categoryIndex >= 1 && categoryIndex <= CATEGORIES.length
    ? CATEGORIES[categoryIndex - 1]
    : "Live"

  // ---- Fecha / venue / color
  const date = await prompt("Fecha (YYYY-MM-DD)", new Date().toISOString().slice(0, 10))
  const venue = await prompt("Venue / lugar", "Nombre del venue")
  const colorAccent = await prompt("Color accent", "#FF2E93")

  const itemDir = path.join("content", "videos", id)

  // ---- Poster opcional (miniatura personalizada; si falta se usa la de YouTube)
  let poster = fs.existsSync(path.join(itemDir, "poster.jpg")) ? "poster.jpg" : null
  if (!poster) {
    logStep("Poster (opcional)")
    const posterInput = await prompt(
      "Ruta del poster (Enter para buscar en media-src/images/posters/, o dejar vacío para usar la miniatura de YouTube)",
      ""
    )
    const posterSource =
      posterInput ||
      findFirstExisting([
        `media-src/images/posters/${id}.jpg`,
        `media-src/images/posters/${id}.png`,
        `media-src/images/posters/${id}.webp`
      ])
    poster = posterSource ? copyIntoContentFolder(posterSource, itemDir, "poster") : null
    if (!poster) logWarn("Sin poster personalizado: la card usará la miniatura oficial de YouTube (i.ytimg.com).")
  }

  const videoData = {
    title,
    src: null,
    youtubeId: youtubeId ?? null,
    poster,
    previewSrc: null,
    date,
    venue,
    category,
    order: null,
    colorAccent,
    draft: !youtubeId
  }

  const parsed = VideoSchema.safeParse(videoData)
  if (!parsed.success) {
    console.error("❌ Validación Zod falló:", parsed.error.flatten())
    process.exit(1)
  }

  const jsonPath = path.join(itemDir, "video.json")
  fs.mkdirSync(itemDir, { recursive: true })
  fs.writeFileSync(jsonPath, `${JSON.stringify(parsed.data, null, 2)}\n`)
  logSuccess(`JSON escrito en ${jsonPath}`)

  console.log("\n✅ Video agregado!")
  console.log(`   - Carpeta: ${itemDir}`)
  console.log(`   - YouTube: ${youtubeId ?? "ID inválido (borrador)"}`)
  console.log(`   - Categoría: ${category}`)
  console.log(`   - Poster: ${poster ?? "miniatura de YouTube"}`)
  console.log("\nSiguiente: `pnpm sync:media` (o `pnpm dev`) y mirá /es#videos")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
