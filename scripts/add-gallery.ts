#!/usr/bin/env tsx
/**
 * pnpm add:gallery [ciudad]
 *
 * Crea `content/gallery/<ciudad>/` y, si le pasás una carpeta (o un archivo),
 * copia ahí las fotos. Es lo único que hace falta: las fotos de esa carpeta
 * aparecen solas en la sección GALLERY, ordenadas por nombre de archivo.
 *
 * Ejemplos:
 *   pnpm add:gallery madrid
 *   pnpm add:gallery madrid ~/Escritorio/fotos-madrid
 */

import fs from "node:fs"
import path from "node:path"
import { isImageFile, slugifySegment, sortContentFiles } from "../src/lib/content-media"
import { logStep, logSuccess, logWarn, prompt, slugify } from "../src/lib/cli"

async function main() {
  console.log("🖼️  In The Loop — Agregar galería de ciudad\n")

  const cityArg = process.argv[2]
  const city = cityArg || (await prompt("Ciudad (nombre visible)", "Madrid"))
  const slug = slugify((await prompt("Carpeta (slug)", slugify(city))) || slugify(city))
  const itemDir = path.join("content", "gallery", slug)

  fs.mkdirSync(itemDir, { recursive: true })
  fs.writeFileSync(path.join(itemDir, ".gitkeep"), "")

  // Fotos: carpeta o archivo opcional por argumento
  const sourceArg = process.argv[3]
  const source =
    sourceArg || (await prompt("Carpeta o archivo con las fotos (Enter para copiarlas a mano)", ""))

  if (source) {
    logStep(`Copiando fotos desde ${source}`)
    if (!fs.existsSync(source)) {
      logWarn(`No encontré ${source}`)
    } else if (fs.statSync(source).isDirectory()) {
      const photos = sortContentFiles(
        fs.readdirSync(source).filter((file) => isImageFile(file) && !file.startsWith("."))
      )
      if (photos.length === 0) logWarn(`${source} no tiene imágenes (jpg, png, webp, avif…)`)
      for (const [index, photo] of photos.entries()) {
        const ext = path.extname(photo).toLowerCase()
        // Se renumeran para que el orden sea el del nombre original (01, 02, …)
        const dest = `${String(index + 1).padStart(2, "0")}${ext}`
        fs.copyFileSync(path.join(source, photo), path.join(itemDir, dest))
        logSuccess(`${photo} → ${path.join(itemDir, dest)}`)
      }
    } else if (isImageFile(source)) {
      fs.copyFileSync(source, path.join(itemDir, `01${path.extname(source).toLowerCase()}`))
      logSuccess(`${source} → ${path.join(itemDir, `01${path.extname(source).toLowerCase()}`)}`)
    } else {
      logWarn(`${source} no parece una imagen (jpg, png, webp, avif…)`)
    }
  }

  // city.json opcional: sólo si el nombre visible difiere del slug o si
  // querés fijar país/orden.
  const country = await prompt("País ISO2 para la bandera (opcional)", "")
  const order = await prompt("Orden en el carrusel (opcional, menor = antes)", "")
  const meta: Record<string, unknown> = {}
  if (city !== slug) meta.city = city
  if (country) meta.country = country.toUpperCase()
  if (order && !Number.isNaN(Number(order))) meta.order = Number(order)

  if (Object.keys(meta).length > 0) {
    fs.writeFileSync(path.join(itemDir, "city.json"), `${JSON.stringify(meta, null, 2)}\n`)
    logSuccess(`Metadatos en ${path.join(itemDir, "city.json")}`)
  }

  const photos = sortContentFiles(
    fs.readdirSync(itemDir).filter((file) => isImageFile(file) && !file.startsWith("."))
  )

  console.log("\n✅ Galería lista!")
  console.log(`   - Carpeta: ${itemDir}`)
  console.log(`   - Ciudad: ${city}`)
  console.log(
    `   - Fotos: ${photos.length > 0 ? `${photos.length} (tapa: ${photos[0]})` : "todavía ninguna"}`
  )
  if (photos.length === 0) {
    console.log(`   Soltá las fotos en ${itemDir}/ (01.jpg, 02.jpg…) y aparecen solas.`)
  }
  console.log("\nSiguiente: `pnpm dev` (o `pnpm sync:media`) y mirá /es#gallery")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
