#!/usr/bin/env tsx
/**
 * pnpm add:video
 * CLI para agregar un video: crea su carpeta en `content/videos/<id>/` con el
 * `video.json`, el poster y (si lo tenés) el archivo de video.
 *
 * También podés hacerlo a mano: copiá `content/videos/_TEMPLATE/` a
 * `content/videos/<id>/` y soltá ahí el poster.
 */

import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import { VideoSchema } from "../src/lib/content"
import {
  copyIntoContentFolder,
  findFirstExisting,
  logStep,
  logSuccess,
  logWarn,
  prompt,
  slugify
} from "../src/lib/cli"

async function main() {
  console.log("🎬 In The Loop — Agregar Video\n")

  const title = await prompt("Título del video", "Live @ Venue")
  const id = slugify(await prompt("ID (nombre de la carpeta)", slugify(title)))
  const venue = await prompt("Venue", "Nombre del venue")
  const date = await prompt("Fecha (YYYY-MM-DD)", new Date().toISOString().slice(0, 10))
  const colorAccent = await prompt("Color accent", "#FF2E93")
  const youtubeId = await prompt("YouTube ID (opcional)", "")

  const itemDir = path.join("content", "videos", id)

  // ---- Video local (o embed de YouTube)
  logStep("Video")
  console.log("📎 Subí UN archivo de video con el audio adentro (si grabaste video y")
  console.log(
    "   audio por separado, unilos antes con ffmpeg: ver content/videos/_TEMPLATE/LEEME.txt)\n"
  )
  const srcInput = await prompt(
    "Ruta del video local (Enter para buscar en media-src/video/, o dejalo vacío si usás YouTube)",
    ""
  )
  const videoSource =
    srcInput ||
    findFirstExisting([
      `media-src/video/live/${id}.mp4`,
      `media-src/video/clips/${id}.mp4`,
      `media-src/video/${id}.mp4`
    ])
  const src = videoSource ? copyIntoContentFolder(videoSource, itemDir, id) : null

  if (src) {
    const sizeMb = fs.statSync(path.join(itemDir, src)).size / 1024 / 1024
    if (sizeMb > 100) {
      logWarn(
        `${src} pesa ${sizeMb.toFixed(0)} MB: mejor subilo a un bucket y usá una URL en "src".`
      )
    }
    // Poster automático con ffmpeg si está disponible
    if (!fs.existsSync(path.join(itemDir, "poster.jpg"))) {
      try {
        execSync(
          `ffmpeg -y -i "${path.join(itemDir, src)}" -ss 00:00:01 -vframes 1 -q:v 2 "${path.join(itemDir, "poster.jpg")}"`,
          { stdio: "pipe" }
        )
        logSuccess("Poster generado con ffmpeg (poster.jpg)")
      } catch {
        logWarn("ffmpeg no disponible: agregá un poster.jpg a mano en la carpeta.")
      }
    }
    // Preview corto para el hover
    if (!fs.existsSync(path.join(itemDir, "preview.mp4"))) {
      try {
        execSync(
          `ffmpeg -y -i "${path.join(itemDir, src)}" -ss 00:00:02 -t 5 -an -vf scale=640:-2 -c:v libx264 -crf 28 "${path.join(itemDir, "preview.mp4")}"`,
          { stdio: "pipe" }
        )
        logSuccess("Preview 5s generado (preview.mp4)")
      } catch {
        logWarn("No se pudo generar el preview: la card usa el video completo.")
      }
    }
  } else if (!youtubeId) {
    logWarn("Sin video ni YouTube ID: la card queda como placeholder.")
  }

  // ---- Poster manual (si no lo generó ffmpeg)
  let poster = fs.existsSync(path.join(itemDir, "poster.jpg")) ? "poster.jpg" : null
  if (!poster) {
    logStep("Poster")
    const posterInput = await prompt(
      "Ruta del poster (Enter para buscar en media-src/images/posters/)",
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
    if (!poster) logWarn("Sin poster: la card usa un degradado.")
  }

  const preview = fs.existsSync(path.join(itemDir, "preview.mp4")) ? "preview.mp4" : null

  const videoData = {
    title,
    src,
    youtubeId: youtubeId || null,
    poster,
    previewSrc: preview,
    date,
    venue,
    colorAccent,
    draft: !src && !youtubeId
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
  console.log(`   - Video: ${src ?? youtubeId ?? "placeholder"}`)
  console.log(`   - Poster: ${poster ?? "placeholder gradient"}`)
  console.log("\nSiguiente: `pnpm sync:media` (o `pnpm dev`) y mirá /es#videos")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
