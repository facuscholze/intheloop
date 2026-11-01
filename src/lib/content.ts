/**
 * CONTENIDO — cada cosa en su carpeta.
 *
 *   content/gallery/<ciudad>/…imágenes + city.json (opcional)
 *   content/shows/<show>/show.json + hero.jpg      (la foto del hover)
 *   content/songs/<tema>/track.json + cover.jpg + tema.wav|mp3
 *   content/videos/<video>/video.json + poster.jpg
 *
 * Los loaders leen TODO lo que haya en cada carpeta (nada hardcodeado) y
 * devuelven rutas de media resueltas, listas para pasar por `getMediaUrl()`.
 * Los archivos de imagen se optimizan a `public/media/content/…` con
 * `scripts/sync-media.ts` (lo corren `pnpm dev` y `pnpm build` solos).
 *
 * Carpetas/archivos que empiezan con `_` se ignoran (plantillas, borradores).
 */
import fs from "node:fs"
import path from "node:path"
import { z } from "zod"
import {
  basename,
  dedupeByDerived,
  extname,
  isAudioFile,
  isImageFile,
  KIND_JSON,
  pickPrimaryFile,
  PRIMARY_IMAGE_NAMES,
  resolveMediaValue,
  slugifySegment,
  sortContentFiles,
  titleFromSlug,
  type ContentKind,
  type MediaVariant
} from "./content-media"
import {
  contentError,
  contentItemDirs,
  CONTENT_DIR,
  listContentFiles,
  mediaExists,
  PUBLIC_MEDIA_DIR,
  readFolderJson,
  warnOnce
} from "./content-fs"
import { analyzeAudioFile } from "./audio-analysis"
import { normalizeCountryCode } from "./countries"

// ---------------------------------------------------------------- schemas
// Estos schemas describen el JSON **tal cual lo escribe el artista** dentro de
// cada carpeta. Los loaders de más abajo devuelven tipos ya resueltos.

export const TrackSchema = z.object({
  /** Opcional: si falta, se usa el nombre de la carpeta. */
  id: z.string().optional(),
  title: z.string(),
  artist: z.string().default("Tommy Petersen"),
  type: z.enum(["track", "set", "mix"]).default("track"),
  /** Archivo de audio dentro de la carpeta (ej. "tema.wav") o URL. */
  audio: z.string().nullable().optional(),
  /**
   * Embed oficial (SoundCloud) para temas sin audio propio: si no hay archivo
   * en la carpeta, la tarjeta muestra el widget en vez del player del sitio.
   */
  embedUrl: z.string().nullable().optional(),
  /** Formato viejo: ruta relativa a public/media (ej. "audio/tema.wav"). */
  audioSrc: z.string().nullable().optional(),
  /** Imagen dentro de la carpeta (si falta, se usa la primera que haya). */
  cover: z.string().nullable().optional(),
  bpm: z.number().min(60).max(200).nullable().optional(),
  key: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
  date: z.string().nullable().optional(),
  genres: z.array(z.string()).default([]),
  colorAccent: z.string().nullable().optional(),
  links: z
    .object({
      soundcloud: z.string().nullable().optional(),
      spotify: z.string().nullable().optional(),
      beatport: z.string().nullable().optional(),
      youtube: z.string().nullable().optional()
    })
    .default({}),
  waveformPeaks: z.array(z.number()).nullable().optional(),
  draft: z.boolean().default(false)
})

export const VideoSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  /** Archivo de video dentro de la carpeta o URL (m3u8, mp4, bucket…). */
  src: z.string().nullable().optional(),
  youtubeId: z.string().nullable().optional(),
  /** Imagen dentro de la carpeta (si falta, se usa la primera que haya). */
  poster: z.string().nullable().optional(),
  previewSrc: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  colorAccent: z.string().nullable().optional(),
  draft: z.boolean().default(false)
})

export const ShowSchema = z.object({
  id: z.string().optional(),
  venue: z.string(),
  city: z.string().default(""),
  country: z.string().default(""),
  date: z.string(),
  instagram: z.string().nullable().optional(),
  galleryUrl: z.string().nullable().optional(),
  /** Imagen hero del show (la que aparece al pasar el mouse). */
  hero: z.string().nullable().optional(),
  /** Formato viejo de `hero`. */
  photo: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  needsReview: z.string().nullable().optional(),
  draft: z.boolean().default(false)
})

/** `city.json` (o `_city.json`) opcional dentro de cada carpeta de galería. */
export const GalleryCitySchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  date: z.string().nullable().optional(),
  order: z.number().optional(),
  description: z.string().nullable().optional(),
  cover: z.string().nullable().optional()
})

export const SiteSchema = z.object({
  artist: z.string(),
  agency: z.string(),
  // Los CMS basados en formularios suelen omitir claves vacías al guardar.
  // El default mantiene el tipo público (`string | null`) y evita que borrar
  // una traducción opcional invalide todo `site.json`.
  tagline: z.object({
    en: z.string().nullable().default(null),
    es: z.string().nullable().default(null)
  }),
  contact: z.object({
    email: z.string(),
    whatsapp: z.string(),
    instagram: z.array(z.string()),
    youtube: z.string(),
    soundcloud: z.string()
  }),
  genres: z.array(z.string())
})

export type TrackRaw = z.infer<typeof TrackSchema>
export type VideoRaw = z.infer<typeof VideoSchema>
export type ShowRaw = z.infer<typeof ShowSchema>
export type GalleryCityRaw = z.infer<typeof GalleryCitySchema>
export type Site = z.infer<typeof SiteSchema>

// ---------------------------------------------------------------- tipos resueltos

export interface Track {
  id: string
  title: string
  artist: string
  type: "track" | "set" | "mix"
  /** Ruta de media resuelta (pasala por `getMediaUrl`). */
  audioSrc: string | null
  cover: string | null
  coverThumb: string | null
  bpm: number | null
  key: string | null
  duration: number | null
  date: string | null
  genres: string[]
  colorAccent: string | null
  links: TrackRaw["links"]
  /** Embed oficial (SoundCloud) para temas que no tienen audio propio. */
  embedUrl: string | null
  waveformPeaks: number[] | null
  /** false = la tarjeta no puede sonar en el player (solo embed/links). */
  playable: boolean
  /** Carpeta de origen, relativa al repo (para mensajes de debug). */
  folder: string
}

export interface Video {
  id: string
  title: string
  src: string | null
  youtubeId: string | null
  poster: string | null
  posterThumb: string | null
  previewSrc: string | null
  date: string | null
  venue: string | null
  colorAccent: string | null
  folder: string
}

export interface Show {
  id: string
  venue: string
  city: string
  country: string
  date: string
  instagram: string | null
  galleryUrl: string | null
  featured: boolean
  /** Imagen hero resuelta (la del hover). */
  hero: string | null
  heroThumb: string | null
  folder: string
}

export interface GalleryPhoto {
  /** Ruta de media resuelta (pasala por `getMediaUrl`). */
  src: string
  /** Versión chica para la grilla. */
  thumb: string
  name: string
  alt: string
}

export interface GalleryCity {
  /** Slug de la carpeta (id estable para keys/DOM). */
  id: string
  city: string
  country: string
  date: string | null
  description: string | null
  count: number
  cover: string | null
  coverThumb: string | null
  photos: GalleryPhoto[]
  folder: string
}

// ---------------------------------------------------------------- helpers

function describe(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join(".") || "(raíz)"}: ${i.message}`).join("; ")
}

/** ¿El tema tiene algún link externo para escuchar? */
function hasLinks(links: TrackRaw["links"]): boolean {
  return Boolean(links.soundcloud || links.spotify || links.beatport || links.youtube)
}

/** Orden por fecha descendente (las fechas sin valor van al final). */
function byDateDesc(a: { date: string | null }, b: { date: string | null }): number {
  return (b.date ?? "").localeCompare(a.date ?? "")
}

/**
 * Resuelve un valor de media y verifica que el archivo exista en
 * `public/media/`. Si falta (p. ej. no corrió `pnpm sync:media`) devuelve null
 * para que la UI use su fallback en vez de mostrar una imagen rota.
 */
function resolveMedia(
  value: string | null | undefined,
  ctx: { kind: ContentKind; slug: string; files: string[]; variant?: MediaVariant }
): string | null {
  const resolved = resolveMediaValue(value, ctx)
  if (!resolved) return null
  if (/^(https?:)?\/\//i.test(resolved) || resolved.startsWith("/")) return resolved
  if (!mediaExists(resolved)) {
    contentError(
      `falta public/media/${resolved} — el JSON apunta a un archivo que no existe (revisá el nombre en la carpeta) o no corrió "pnpm sync:media"`
    )
    return null
  }
  return resolved
}

/** Imágenes de una carpeta, ordenadas y sin colisiones de salida. */
function folderImages(files: string[]): string[] {
  return dedupeByDerived(sortContentFiles(files.filter(isImageFile)))
}

// ---------------------------------------------------------------- loaders

export function loadSite(): Site {
  const raw = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, "site.json"), "utf-8"))
  return SiteSchema.parse(raw)
}

export function loadShows(): Show[] {
  const shows: Show[] = []

  for (const { slug, dir: itemDir } of contentItemDirs("shows")) {
    const json = readFolderJson(itemDir, KIND_JSON.shows)
    if (!json) {
      // Pages CMS sube media antes de guardar la ficha y puede dejarla al
      // borrar el ítem. Sin JSON no hay un ítem publicado; conservamos la media.
      warnOnce(`content/shows/${slug}/ sin ficha JSON: se omite el ítem y se conservan sus archivos`)
      continue
    }
    const parsed = ShowSchema.safeParse(json.data)
    if (!parsed.success) {
      contentError(`content/shows/${slug}/${json.file} no valida → ${describe(parsed.error)}`)
      continue
    }
    const raw = parsed.data
    const files = listContentFiles(itemDir)
    const ctx = { kind: "shows" as const, slug, files }
    const images = folderImages(files)
    const heroValue =
      declaredMedia(
        raw.hero ?? raw.photo,
        images,
        itemDir,
        files,
        `content/shows/${slug}/${json.file}`
      ) ?? pickPrimaryFile(images, PRIMARY_IMAGE_NAMES.shows)

    if (raw.draft) continue
    shows.push({
      id: raw.id ?? slug,
      venue: raw.venue,
      city: raw.city,
      country: normalizeCountryCode(raw.country),
      date: raw.date,
      instagram: raw.instagram ?? null,
      galleryUrl: raw.galleryUrl ?? null,
      featured: raw.featured,
      hero: resolveMedia(heroValue, ctx),
      heroThumb: resolveMedia(heroValue, { ...ctx, variant: "thumb" }),
      folder: `content/shows/${slug}`
    })
  }

  return shows.sort(byDateDesc)
}

export function loadTracks(): Track[] {
  const tracks: Track[] = []

  for (const { slug, dir: itemDir } of contentItemDirs("songs")) {
    const json = readFolderJson(itemDir, KIND_JSON.songs)
    if (!json) {
      // Pages CMS sube media antes de guardar la ficha y puede dejarla al
      // borrar el ítem. Sin JSON no hay un ítem publicado; conservamos la media.
      warnOnce(`content/songs/${slug}/ sin ficha JSON: se omite el ítem y se conservan sus archivos`)
      continue
    }
    const parsed = TrackSchema.safeParse(json.data)
    if (!parsed.success) {
      contentError(`content/songs/${slug}/${json.file} no valida → ${describe(parsed.error)}`)
      continue
    }
    const raw = parsed.data
    if (raw.draft) continue

    const files = listContentFiles(itemDir)
    const ctx = { kind: "songs" as const, slug, files }
    const images = folderImages(files)
    const audios = sortContentFiles(files.filter(isAudioFile))

    const where = `content/songs/${slug}/${json.file}`
    const coverValue =
      declaredMedia(raw.cover, images, itemDir, files, where) ??
      pickPrimaryFile(images, PRIMARY_IMAGE_NAMES.songs)
    const audioValue =
      declaredMedia(raw.audio ?? raw.audioSrc, audios, itemDir, files, where) ?? audios[0] ?? null

    // Audio local (carpeta del tema o formato viejo): peaks y duración se
    // calculan solos — WAV con JS, MP3/M4A/… con ffmpeg si está instalado.
    // Ojo: solo se decodifica si REALMENTE falta algo (un MP3 de una hora no
    // se analiza en cada build si el JSON ya trae peaks y duración).
    const needsPeaks = !(raw.waveformPeaks && raw.waveformPeaks.length > 0)
    const needsDuration = raw.duration == null
    const audioPath = needsPeaks || needsDuration ? findLocalFile(audioValue, itemDir, files) : null
    const analysis = audioPath ? analyzeAudioFile(audioPath) : null

    const audioSrc = resolveMedia(audioValue, ctx)
    const embedUrl = raw.embedUrl ?? null
    if (!audioSrc && !embedUrl && !hasLinks(raw.links)) {
      warnOnce(
        `content/songs/${slug}/ no tiene audio ni links: la tarjeta va a quedar muda (agregá audio.*, embedUrl o links.*)`
      )
    }

    tracks.push({
      id: raw.id ?? slug,
      title: raw.title,
      artist: raw.artist,
      type: raw.type,
      audioSrc,
      embedUrl,
      cover: resolveMedia(coverValue, ctx),
      coverThumb: resolveMedia(coverValue, { ...ctx, variant: "thumb" }),
      bpm: raw.bpm ?? null,
      key: raw.key ?? null,
      duration: raw.duration ?? (analysis?.duration ? Math.round(analysis.duration) : null),
      date: raw.date ?? null,
      genres: raw.genres,
      colorAccent: raw.colorAccent ?? null,
      links: raw.links,
      waveformPeaks:
        raw.waveformPeaks && raw.waveformPeaks.length > 0
          ? raw.waveformPeaks
          : (analysis?.peaks ?? null),
      playable: audioSrc !== null,
      folder: `content/songs/${slug}`
    })
  }

  return tracks.sort(byDateDesc)
}

/**
 * Valor de media declarado en el JSON (`audio`, `cover`, `hero`, `poster`…)
 * llevado a un archivo que exista de verdad.
 *
 * Devuelve:
 *  - `undefined` si el JSON no declara nada → sigue el auto-pick de siempre;
 *  - el valor tal cual si es externo, absoluto o apunta a un archivo que existe;
 *  - el ÚNICO archivo de ese tipo que haya en la carpeta, si el declarado no
 *    está (típico: renombraron el archivo después de escribir el JSON). La
 *    intención no es ambigua y la convención documentada es "si no ponés el
 *    campo, se usa el archivo que haya", así que avisamos en vez de tirar el
 *    build abajo por un typo;
 *  - el valor declarado si hay varios candidatos o ninguno: ahí no adivinamos y
 *    deja que `resolveMedia` → `contentError` lo corte en CI, que es lo que
 *    corresponde cuando el archivo realmente falta.
 */
function declaredMedia(
  declared: string | null | undefined,
  candidates: string[],
  itemDir: string,
  files: string[],
  where: string
): string | undefined {
  if (!declared) return undefined
  if (/^(https?:)?\/\//i.test(declared) || declared.startsWith("/")) return declared
  if (findLocalFile(declared, itemDir, files)) return declared
  if (candidates.length !== 1) return declared
  warnOnce(
    `${where} declara "${declared}", que no está en la carpeta: uso ${candidates[0]} (corregí el JSON)`
  )
  return candidates[0]
}

/** Ubica el archivo local de un valor de media (carpeta del item o public/media). */
function findLocalFile(
  value: string | null | undefined,
  itemDir: string,
  files: string[]
): string | null {
  if (!value || /^(https?:)?\/\//i.test(value)) return null
  const rel = value.trim().replace(/^\.\//, "").replace(/^\/+/, "")
  if (!rel) return null
  const wanted = slugifySegment(rel)
  let inFolder = files.find(
    (f) => f.toLowerCase() === rel.toLowerCase() || slugifySegment(f) === wanted
  )
  // Match por nombre de archivo: el CMS guarda la ruta pública completa
  // ("/media/content/songs/<slug>/tema.mp3"); el archivo es el de la carpeta.
  if (!inFolder) {
    const base = basename(rel)
    const wantedBase = slugifySegment(base)
    const byName = files.filter(
      (f) =>
        basename(f).toLowerCase() === base.toLowerCase() ||
        slugifySegment(basename(f)) === wantedBase
    )
    if (byName.length === 1) inFolder = byName[0]
  }
  if (inFolder) return path.join(itemDir, inFolder)
  const legacy = path.join(PUBLIC_MEDIA_DIR, rel.replace(/^media\//, ""))
  return fs.existsSync(legacy) ? legacy : null
}

export function loadVideos(): Video[] {
  const videos: Video[] = []

  for (const { slug, dir: itemDir } of contentItemDirs("videos")) {
    const json = readFolderJson(itemDir, KIND_JSON.videos)
    if (!json) {
      // Pages CMS sube media antes de guardar la ficha y puede dejarla al
      // borrar el ítem. Sin JSON no hay un ítem publicado; conservamos la media.
      warnOnce(`content/videos/${slug}/ sin ficha JSON: se omite el ítem y se conservan sus archivos`)
      continue
    }
    const parsed = VideoSchema.safeParse(json.data)
    if (!parsed.success) {
      contentError(`content/videos/${slug}/${json.file} no valida → ${describe(parsed.error)}`)
      continue
    }
    const raw = parsed.data
    if (raw.draft) continue

    const files = listContentFiles(itemDir)
    const ctx = { kind: "videos" as const, slug, files }
    const images = folderImages(files)
    const posterValue =
      declaredMedia(raw.poster, images, itemDir, files, `content/videos/${slug}/${json.file}`) ??
      pickPrimaryFile(images, PRIMARY_IMAGE_NAMES.videos)

    videos.push({
      id: raw.id ?? slug,
      title: raw.title,
      src: resolveMedia(raw.src, ctx),
      youtubeId: raw.youtubeId ?? null,
      poster: resolveMedia(posterValue, ctx),
      posterThumb: resolveMedia(posterValue, { ...ctx, variant: "thumb" }),
      previewSrc: resolveMedia(raw.previewSrc, ctx),
      date: raw.date ?? null,
      venue: raw.venue ?? null,
      colorAccent: raw.colorAccent ?? null,
      folder: `content/videos/${slug}`
    })
  }

  return videos.sort(byDateDesc)
}

/**
 * Galerías por ciudad: una carpeta por ciudad dentro de `content/gallery/` y
 * adentro las fotos. No hace falta JSON: el nombre de la carpeta es la ciudad.
 * Si querés bandera/fecha/orden, agregá `city.json` (ver `_TEMPLATE/`).
 */
export function loadGalleries(): GalleryCity[] {
  const entries: { order: number | null; city: GalleryCity }[] = []

  // País por ciudad: si un show ya tiene esa ciudad, la galería hereda el país.
  const countryByCity = new Map<string, string>()
  for (const show of loadShows()) {
    if (show.city && show.country) countryByCity.set(slugifySegment(show.city), show.country)
  }

  for (const { slug, dir: itemDir } of contentItemDirs("gallery")) {
    const files = listContentFiles(itemDir)
    const images = folderImages(files)
    if (images.length === 0) {
      warnOnce(`content/gallery/${slug}/ no tiene fotos (jpg, png, webp, avif…)`)
      continue
    }

    const json = readFolderJson(itemDir, KIND_JSON.gallery)
    const parsed = json ? GalleryCitySchema.safeParse(json.data) : null
    if (parsed && !parsed.success) {
      contentError(`content/gallery/${slug}/${json!.file} no valida → ${describe(parsed.error)}`)
    }
    const meta = parsed?.success ? parsed.data : {}
    const order = meta.order ?? null

    const city = meta.city ?? titleFromSlug(slug)
    const ctx = { kind: "gallery" as const, slug, files }
    const coverValue =
      declaredMedia(meta.cover, images, itemDir, files, `content/gallery/${slug}/city.json`) ??
      pickPrimaryFile(images, PRIMARY_IMAGE_NAMES.gallery)
    const cover = resolveMedia(coverValue, ctx)
    const coverThumb = resolveMedia(coverValue, { ...ctx, variant: "thumb" })

    const photos: GalleryPhoto[] = []
    for (const image of images) {
      const src = resolveMedia(image, ctx)
      if (!src) continue
      photos.push({
        src,
        thumb: resolveMedia(image, { ...ctx, variant: "thumb" }) ?? src,
        name: basename(image),
        alt: `${city} — ${basename(image, extname(image))}`
      })
    }
    if (photos.length === 0) continue

    entries.push({
      order,
      city: {
        id: slugifySegment(slug),
        city,
        country:
          normalizeCountryCode(meta.country) ||
          countryByCity.get(slugifySegment(city)) ||
          "",
        date: meta.date ?? null,
        description: meta.description ?? null,
        count: photos.length,
        cover: cover ?? photos[0].src,
        coverThumb: coverThumb ?? photos[0].thumb,
        photos,
        folder: `content/gallery/${slug}`
      }
    })
  }

  // Orden: `order` de city.json (si está), después la ciudad con más fotos.
  return entries
    .sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER
      if (orderA !== orderB) return orderA - orderB
      if (b.city.count !== a.city.count) return b.city.count - a.city.count
      return a.city.city.localeCompare(b.city.city, "es")
    })
    .map((entry) => entry.city)
}
