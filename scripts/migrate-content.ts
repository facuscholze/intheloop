#!/usr/bin/env tsx
/**
 * pnpm migrate:content
 *
 * Pasa el contenido del formato viejo (un JSON suelto por tipo) al nuevo
 * (una carpeta por item, con el JSON y sus archivos adentro):
 *
 *   content/shows.json         → content/shows/<id>/show.json        (+ hero)
 *   content/tracks/<id>.json   → content/songs/<id>/song.json        (+ audio + cover)
 *   content/videos/<id>.json   → content/videos/<id>/video.json      (+ poster + video)
 *
 * Los archivos que apuntaba cada JSON (audio, cover, poster…) se copian desde
 * `public/media/` a la carpeta del item, así el original vive al lado del JSON
 * y `pnpm sync:media` lo vuelve a materializar.
 *
 * Es seguro correrlo dos veces: si una carpeta ya existe, la saltea.
 * Los archivos viejos se borran (quedan en el historial de git).
 */
import fs from "node:fs"
import path from "node:path"
import { basename, slugifySegment } from "../src/lib/content-media"

const CONTENT = path.join(process.cwd(), "content")
const PUBLIC_MEDIA = path.join(process.cwd(), "public", "media")

const migrated: string[] = []
const skipped: string[] = []
const warnings: string[] = []

function writeJson(file: string, data: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const clean = Object.fromEntries(
    Object.entries(data as Record<string, unknown>).filter(([, value]) => value !== undefined)
  )
  fs.writeFileSync(file, `${JSON.stringify(clean, null, 2)}\n`)
}

/**
 * Copia un archivo referenciado por un JSON (relativo a public/media) a la
 * carpeta del item. Devuelve el valor nuevo para el JSON: el nombre del archivo
 * dentro de la carpeta, o el valor original si es una URL o una ruta absoluta.
 */
function bringFile(value: string | null | undefined, itemDir: string): string | null {
  if (!value) return null
  const raw = String(value).trim()
  if (!raw) return null
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("/")) return raw

  const rel = raw.replace(/^media\//, "")
  const source = path.join(PUBLIC_MEDIA, rel)
  if (!fs.existsSync(source)) {
    warnings.push(`no encontré ${path.relative(process.cwd(), source)} (lo dejo como estaba)`)
    return raw
  }
  const name = basename(rel)
  const dest = path.join(itemDir, name)
  fs.mkdirSync(itemDir, { recursive: true })
  if (!fs.existsSync(dest)) fs.copyFileSync(source, dest)
  // El archivo optimizado en public/media ya no hace falta: sync:media lo
  // regenera desde la carpeta de contenido.
  fs.rmSync(source, { force: true })
  return name
}

// ---------------------------------------------------------------- shows
function migrateShows() {
  const legacy = path.join(CONTENT, "shows.json")
  if (!fs.existsSync(legacy)) {
    skipped.push("content/shows.json (no existe)")
    return
  }
  const shows = JSON.parse(fs.readFileSync(legacy, "utf-8")) as Record<string, unknown>[]
  for (const show of shows) {
    const id = slugifySegment(String(show.id ?? `${show.date}-${show.venue}`))
    const itemDir = path.join(CONTENT, "shows", id)
    if (fs.existsSync(path.join(itemDir, "show.json"))) {
      skipped.push(`content/shows/${id}/ (ya existía)`)
      continue
    }
    const hero = bringFile(show.photo as string | null, itemDir)
    writeJson(path.join(itemDir, "show.json"), {
      venue: show.venue,
      city: show.city,
      country: show.country,
      date: show.date,
      instagram: show.instagram ?? null,
      galleryUrl: show.galleryUrl ?? null,
      hero,
      featured: show.featured ?? false,
      needsReview: show.needsReview ?? null
    })
    migrated.push(`content/shows/${id}/show.json`)
  }
  fs.rmSync(legacy)
}

// ---------------------------------------------------------------- songs
function migrateTracks() {
  const legacy = path.join(CONTENT, "tracks")
  if (!fs.existsSync(legacy)) {
    skipped.push("content/tracks/ (no existe)")
    return
  }
  for (const file of fs
    .readdirSync(legacy)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))) {
    const raw = JSON.parse(fs.readFileSync(path.join(legacy, file), "utf-8")) as Record<
      string,
      unknown
    >
    const id = slugifySegment(String(raw.id ?? file.replace(/\.json$/, "")))
    const itemDir = path.join(CONTENT, "songs", id)
    if (fs.existsSync(path.join(itemDir, "song.json"))) {
      skipped.push(`content/songs/${id}/ (ya existía)`)
      continue
    }
    const audio = bringFile((raw.audio ?? raw.audioSrc) as string | null, itemDir)
    const cover = bringFile(raw.cover as string | null, itemDir)
    writeJson(path.join(itemDir, "song.json"), {
      title: raw.title,
      artist: raw.artist ?? "Tommy Petersen",
      type: raw.type ?? "track",
      audio,
      cover,
      bpm: raw.bpm ?? null,
      key: raw.key ?? null,
      duration: raw.duration ?? null,
      date: raw.date ?? null,
      genres: raw.genres ?? [],
      colorAccent: raw.colorAccent ?? null,
      links: raw.links ?? {},
      waveformPeaks: raw.waveformPeaks ?? null,
      draft: raw.draft ?? false
    })
    migrated.push(`content/songs/${id}/song.json`)
  }
  fs.rmSync(legacy, { recursive: true, force: true })
}

// ---------------------------------------------------------------- videos
function migrateVideos() {
  const legacy = path.join(CONTENT, "videos")
  if (!fs.existsSync(legacy)) return
  const files = fs.readdirSync(legacy).filter((f) => f.endsWith(".json") && !f.startsWith("_"))
  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(legacy, file), "utf-8")) as Record<
      string,
      unknown
    >
    const id = slugifySegment(String(raw.id ?? file.replace(/\.json$/, "")))
    const itemDir = path.join(CONTENT, "videos", id)
    if (fs.existsSync(path.join(itemDir, "video.json"))) {
      skipped.push(`content/videos/${id}/ (ya existía)`)
      continue
    }
    writeJson(path.join(itemDir, "video.json"), {
      title: raw.title,
      src: bringFile(raw.src as string | null, itemDir),
      youtubeId: raw.youtubeId ?? null,
      poster: bringFile(raw.poster as string | null, itemDir),
      previewSrc: bringFile(raw.previewSrc as string | null, itemDir),
      date: raw.date ?? null,
      venue: raw.venue ?? null,
      colorAccent: raw.colorAccent ?? null,
      draft: raw.draft ?? false
    })
    migrated.push(`content/videos/${id}/video.json`)
    fs.rmSync(path.join(legacy, file))
  }
  // Plantilla vieja del formato plano
  const oldTemplate = path.join(legacy, "_TEMPLATE.json")
  if (fs.existsSync(oldTemplate)) fs.rmSync(oldTemplate)
}

// ---------------------------------------------------------------- run
console.log("🚚 Migrando contenido al formato «una carpeta por item»…\n")
migrateShows()
migrateTracks()
migrateVideos()

for (const line of migrated) console.log(`✅ ${line}`)
for (const line of skipped) console.log(`⏭️  ${line}`)
for (const line of warnings) console.log(`⚠️  ${line}`)

// Limpieza de archivos .gitkeep/plantillas que ya no aplican
for (const stale of [
  path.join(CONTENT, "videos", ".gitkeep"),
  path.join(CONTENT, "tracks", ".gitkeep")
]) {
  if (fs.existsSync(stale)) fs.rmSync(stale)
}

console.log(
  `\n${migrated.length > 0 ? "✅ Listo" : "ℹ️  Nada para migrar"}: ${migrated.length} item(s).` +
    (migrated.length > 0
      ? "\n   Corré `pnpm sync:media` (o `pnpm dev`) para generar las imágenes optimizadas."
      : "")
)
