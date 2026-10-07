/**
 * Convenciones de contenido + media derivada.
 *
 * Este módulo lo usan DOS lados y por eso vive acá (no dentro de los scripts):
 *  - `src/lib/content.ts` → los loaders que leen `content/` en build.
 *  - `scripts/sync-media.ts` → el script que materializa las imágenes.
 * Si las reglas de nombres estuvieran duplicadas, se desincronizarían y las
 * fotos aparecerían rotas.
 *
 * IDEA GENERAL
 * ------------
 * Cada cosa vive en su carpeta dentro de `content/` y trae sus archivos al lado:
 *
 *   content/gallery/<ciudad>/01.jpg                galería por ciudad (solo soltar fotos)
 *   content/shows/<show>/show.json + hero.jpg      show + imagen hero (la del hover)
 *   content/songs/<tema>/song.json + cover.jpg     tema + portada + audio
 *   content/videos/<video>/video.json + poster.jpg video + poster
 *
 * El sitio es estático (`output: "export"`), así que Next no puede servir
 * archivos que estén fuera de `public/`. `sync-media` copia/optimiza cada
 * imagen a:
 *
 *   public/media/content/<tipo>/<slug>/<nombre>.webp        (optimizada)
 *   public/media/content/<tipo>/<slug>/<nombre>-thumb.webp  (mini para grillas)
 *
 * y acá abajo está la función que dice ese nombre en un solo lugar
 * ([derivedMediaPath]) para que loaders y sync coincidan siempre.
 *
 * Reglas de un valor de media dentro de un JSON de contenido (`hero`, `cover`,
 * `audio`, `poster`, …):
 *   1. `https://…`      → se usa tal cual (bucket/CDN/YouTube).
 *   2. `/algo`          → ruta absoluta del sitio (public/), se usa tal cual.
 *   3. `hero.jpg`       → archivo DENTRO de la carpeta del item (lo optimiza el sync).
 *   4. `audio/viejo.wav`→ formato viejo: ruta relativa a `public/media/`.
 */

export type ContentKind = "gallery" | "shows" | "songs" | "videos"
export type MediaVariant = "full" | "thumb"

/** Carpeta dentro de `content/` para cada tipo. */
export const KIND_DIR: Record<ContentKind, string> = {
  gallery: "gallery",
  shows: "shows",
  songs: "songs",
  videos: "videos"
}

/**
 * Nombre del JSON principal de cada item (queda al lado de la imagen).
 * Es una lista: el primero es el canónico y los demás son alias que seguimos
 * aceptando para no romper carpetas ya creadas.
 */
export const KIND_JSON: Record<ContentKind, string[]> = {
  gallery: ["city.json", "_city.json"],
  shows: ["show.json"],
  songs: ["track.json", "song.json"],
  videos: ["video.json"]
}

/** Nombres preferidos al elegir la imagen principal de una carpeta. */
export const PRIMARY_IMAGE_NAMES: Record<ContentKind, string[]> = {
  gallery: ["cover", "portada", "hero"],
  shows: ["hero", "foto", "photo", "show"],
  songs: ["cover", "portada", "tapa", "artwork", "caratula"],
  videos: ["poster", "cover", "frame", "miniatura"]
}

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".tif", ".tiff"])
const AUDIO_EXT = new Set([
  ".mp3",
  ".wav",
  ".m4a",
  ".aac",
  ".ogg",
  ".oga",
  ".opus",
  ".flac",
  ".aiff"
])
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v", ".ogv", ".m3u8", ".mkv"])
/**
 * Archivos que acompañan a un video y hay que copiar tal cual sin tratarlos
 * como imagen: los segmentos de un HLS (.ts, .m4s) que referencia el .m3u8.
 * Sin esto, subir un HLS quedaba a medias (el playlist viajaba y los pedazos no).
 */
const STREAM_EXT = new Set([".ts", ".m4s"])

/** Archivos/carpetas que se ignoran: `_TEMPLATE`, `.DS_Store`, etc. */
export function isIgnoredName(name: string): boolean {
  return name.startsWith("_") || name.startsWith(".")
}

// ---------------------------------------------------------------- path helpers
// Implementados a mano para que este módulo no dependa de node:path y pueda
// importarse desde cualquier lado (build, script o test).

export function extname(file: string): string {
  const base = basename(file)
  const i = base.lastIndexOf(".")
  return i <= 0 ? "" : base.slice(i).toLowerCase()
}

export function basename(file: string, ext = ""): string {
  const clean = file.replace(/\/+$/, "")
  const i = clean.lastIndexOf("/")
  const base = i === -1 ? clean : clean.slice(i + 1)
  return ext && base.toLowerCase().endsWith(ext.toLowerCase())
    ? base.slice(0, base.length - ext.length)
    : base
}

export function dirname(file: string): string {
  const clean = file.replace(/\/+$/, "")
  const i = clean.lastIndexOf("/")
  return i === -1 ? "." : clean.slice(0, i) || "/"
}

const extOf = (file: string) => extname(file)
export const isImageFile = (file: string): boolean => IMAGE_EXT.has(extOf(file))
export const isAudioFile = (file: string): boolean => AUDIO_EXT.has(extOf(file))
export const isVideoFile = (file: string): boolean => VIDEO_EXT.has(extOf(file))

// ---------------------------------------------------------------- slugify

/**
 * Convierte cualquier nombre en un segmento seguro para URL:
 * "Foto 01 (playa).JPG" → "foto-01-playa".
 * Loaders y sync usan esta misma función, así que "FOTO 01.jpg" y
 * "foto-01.jpg" terminan apuntando al mismo archivo público.
 */
export function slugifySegment(input: string): string {
  const slug = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || "item"
}

/** "colonia-san-miguel" → "Colonia San Miguel" (para carpetas sin _city.json). */
export function titleFromSlug(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// ---------------------------------------------------------------- orden + elección

/** Orden natural: 2.jpg antes que 10.jpg. */
export function sortContentFiles<T extends string>(files: T[]): T[] {
  return [...files].sort((a, b) => a.localeCompare(b, "es", { numeric: true, sensitivity: "base" }))
}

/**
 * Elige la imagen "principal" de un set: primero las que se llaman hero/cover/
 * poster/portada… y si no, la primera por orden natural. Así "solo soltar la
 * foto" alcanza: si hay una sola, esa es.
 */
export function pickPrimaryFile(files: string[], preferred: string[]): string | null {
  const sorted = sortContentFiles(files)
  if (sorted.length === 0) return null
  for (const name of preferred) {
    const hit = sorted.find((f) => basename(f).toLowerCase().startsWith(name))
    if (hit) return hit
  }
  return sorted[0]
}

/**
 * Deja un solo archivo por salida derivada. Sin esto, `foto.JPG` y `foto.png`
 * en la misma carpeta escribirían el mismo `.webp` y una de las dos quedaría
 * pisada (el loader mostraría la equivocada).
 */
export function dedupeByDerived(files: string[], variant: MediaVariant = "full"): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const file of files) {
    const key = derivedName(file, variant).toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(file)
  }
  return out
}

// ---------------------------------------------------------------- salida pública

/** "sub/Foto 01.JPG" → "sub/foto-01.webp" (+ "-thumb" en la variante mini). */
export function derivedName(relPath: string, variant: MediaVariant = "full"): string {
  const dir = dirname(relPath)
  const name = slugifySegment(basename(relPath, extname(relPath)))
  const prefix = dir === "." || dir === "" ? "" : `${dir.split("/").map(slugifySegment).join("/")}/`
  return `${prefix}${name}${variant === "thumb" ? "-thumb" : ""}.webp`
}

/**
 * Ruta del archivo copiado tal cual (audio/video: no se reconvierten).
 * "Mi Tema.WAV" → "content/songs/<slug>/mi-tema.wav"
 */
export function copiedMediaPath(kind: ContentKind, slug: string, relPath: string): string {
  const dir = dirname(relPath)
  const ext = extname(relPath)
  const prefix = dir === "." || dir === "" ? "" : `${dir.split("/").map(slugifySegment).join("/")}/`
  return `content/${KIND_DIR[kind]}/${slugifySegment(slug)}/${prefix}${slugifySegment(
    basename(relPath, ext)
  )}${ext}`
}

/** ¿Es parte de un stream (segmento HLS) y no un archivo suelto? */
export const isStreamSegment = (file: string): boolean => STREAM_EXT.has(extOf(file))

/** Los audio/video se copian tal cual; las imágenes se optimizan a WebP. */
export function isPassthroughFile(file: string): boolean {
  return isAudioFile(file) || isVideoFile(file) || isStreamSegment(file)
}

/**
 * Ruta del archivo optimizado, relativa a `public/media/` (o sea: lo que
 * espera `getMediaUrl()`). Ej:
 *   derivedMediaPath("gallery", "tandil", "2024/01.jpg") → "content/gallery/tandil/2024/01.webp"
 */
export function derivedMediaPath(
  kind: ContentKind,
  slug: string,
  relPath: string,
  variant: MediaVariant = "full"
): string {
  return `content/${KIND_DIR[kind]}/${slugifySegment(slug)}/${derivedName(relPath, variant)}`
}

// ---------------------------------------------------------------- resolver

export interface ResolveContext {
  kind: ContentKind
  slug: string
  /** Archivos de la carpeta del item (rutas relativas, POSIX). */
  files: string[]
  variant?: MediaVariant
}

/**
 * Resuelve el valor de un campo de media (hero, cover, audio, poster…) a algo
 * que entienda `getMediaUrl()`. Ver el encabezado del archivo para las reglas.
 */
export function resolveMediaValue(
  value: string | null | undefined,
  { kind, slug, files, variant = "full" }: ResolveContext
): string | null {
  if (!value) return null
  const raw = value.trim()
  if (!raw) return null
  // 1) externo (bucket, YouTube, SoundCloud…)
  if (/^(https?:)?\/\//i.test(raw)) return raw
  // 2) ruta absoluta del sitio (public/)
  if (raw.startsWith("/")) return raw

  const rel = raw.replace(/^\.\//, "").replace(/^\/+/, "")
  const wanted = slugifySegment(rel)
  // 3) archivo dentro de la carpeta del item (match exacto o "normalizado")
  const hit = files.find(
    (f) => f.toLowerCase() === rel.toLowerCase() || slugifySegment(f) === wanted
  )
  if (hit) {
    // audio/video: se copian tal cual (no hay variante mini)
    if (isPassthroughFile(hit)) return copiedMediaPath(kind, slug, hit)
    return derivedMediaPath(kind, slug, hit, variant)
  }

  // 4) formato viejo: ruta relativa a public/media (ej. "audio/tema.wav")
  return rel.replace(/^media\//, "")
}
