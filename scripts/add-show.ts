#!/usr/bin/env tsx
/**
 * pnpm add:show
 * CLI para agregar un show: crea su carpeta en `content/shows/<id>/` con el
 * `show.json` y la imagen hero (la que aparece al pasar el mouse).
 *
 * También podés hacerlo a mano: copiá `content/shows/_TEMPLATE/` a
 * `content/shows/<id>/` y soltá ahí la foto.
 */

import path from "node:path"
import { ShowSchema } from "../src/lib/content"
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
  console.log("📍 In The Loop — Agregar Show\n")

  const venue = await prompt("Venue", "Nombre del venue")
  const city = await prompt("Ciudad", "CABA")
  const country = await prompt("País (ISO2 ej: AR, ES, BR, FR, DE, CZ)", "AR")
  const date = await prompt("Fecha (YYYY-MM-DD)", new Date().toISOString().slice(0, 10))
  const id = slugify(await prompt("ID (nombre de la carpeta)", `${date}-${slugify(venue)}`))
  const instagram = await prompt("Instagram del venue (url, opcional)", "")
  const galleryUrl = await prompt("Gallery URL OneDrive (opcional)", "")
  const featured = (await prompt("Featured? (y/n)", "n")).toLowerCase() === "y"

  // Imagen hero: la foto que aparece en el hover de la fila.
  logStep("Imagen hero (opcional)")
  const heroInput = await prompt(
    "Ruta de la imagen (Enter para buscar sola en media-src/images/shows/)",
    ""
  )
  const heroSource =
    heroInput ||
    findFirstExisting([
      `media-src/images/shows/${id}.jpg`,
      `media-src/images/shows/${id}.jpeg`,
      `media-src/images/shows/${id}.png`,
      `media-src/images/shows/${id}.webp`,
      `media-src/images/shows/${date}-${slugify(venue)}.jpg`
    ])

  const itemDir = path.join("content", "shows", id)
  const hero = heroSource ? copyIntoContentFolder(heroSource, itemDir, "hero") : null
  if (!hero) logWarn("Sin foto hero: la fila usa el degradado de marca. Podés soltarla después.")

  const showData = {
    venue,
    city,
    country: country.toUpperCase(),
    date,
    instagram: instagram || null,
    galleryUrl: galleryUrl || null,
    hero,
    featured,
    needsReview: null
  }

  const parsed = ShowSchema.safeParse(showData)
  if (!parsed.success) {
    console.error("❌ Validación Zod falló:", parsed.error.flatten())
    process.exit(1)
  }

  const jsonPath = path.join(itemDir, "show.json")
  const { writeFileSync, mkdirSync } = await import("node:fs")
  mkdirSync(itemDir, { recursive: true })
  writeFileSync(jsonPath, `${JSON.stringify(parsed.data, null, 2)}\n`)
  logSuccess(`JSON escrito en ${jsonPath}`)

  console.log("\n✅ Show agregado!")
  console.log(`   - ${venue} — ${city} ${country.toUpperCase()} ${date}`)
  console.log(`   - Carpeta: ${itemDir}`)
  console.log(`   - Hero: ${hero ?? "sin imagen (soltá una en la carpeta)"}`)
  console.log("\nSiguiente: `pnpm sync:media` (o `pnpm dev`, que ya lo hace solo) y mirá /es#shows")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
