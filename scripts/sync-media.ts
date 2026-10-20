#!/usr/bin/env tsx
/**
 * pnpm sync:media
 *
 * Materializa lo que hay en `content/` hacia `public/media/content/`, que es lo
 * único que un sitio estático (`output: "export"`) puede servir:
 *
 *   content/gallery/<ciudad>/foto.jpg  → public/media/content/gallery/<ciudad>/foto.webp (+ -thumb.webp)
 *   content/shows/<show>/hero.jpg      → public/media/content/shows/<show>/hero.webp (+ -thumb.webp)
 *   content/songs/<tema>/cover.jpg     → public/media/content/songs/<tema>/cover.webp (+ -thumb.webp)
 *   content/songs/<tema>/tema.wav      → public/media/content/songs/<tema>/tema.wav  (copiado tal cual)
 *   content/videos/<video>/poster.jpg  → public/media/content/videos/<video>/poster.webp (+ -thumb.webp)
 *
 * Los nombres salen de `src/lib/content-media.ts`, las mismas reglas que usan
 * los loaders, así que nunca se desincronizan.
 *
 * Es incremental (salta lo que ya está al día), borra los derivados huérfanos
 * y con `--watch` queda escuchando: soltás una foto y aparece sola.
 *
 * Normalmente no lo corrés a mano: `pnpm dev` y `pnpm build` ya lo ejecutan.
 */
import fs from "node:fs"
import path from "node:path"
import {
  copiedMediaPath,
  dedupeByDerived,
  derivedMediaPath,
  extname,
  isImageFile,
  isPassthroughFile,
  KIND_DIR,
  sortContentFiles,
  type ContentKind
} from "../src/lib/content-media"
import {
  contentItemDirs,
  CONTENT_DIR,
  listContentFiles,
  PUBLIC_MEDIA_DIR
} from "../src/lib/content-fs"

const OUT_ROOT = path.join(PUBLIC_MEDIA_DIR, "content")

/** Ancho máximo de la versión grande / de la mini, por tipo de contenido. */
const MAX_WIDTH: Record<ContentKind, number> = {
  gallery: 1920,
  shows: 1600,
  songs: 1200,
  videos: 1600
}
const THUMB_WIDTH: Record<ContentKind, number> = {
  gallery: 640,
  shows: 720,
  songs: 320,
  videos: 720
}

/** Video/audio pesado: avisamos pero copiamos. */
const HEAVY_FILE_BYTES = 100 * 1024 * 1024

interface Stats {
  images: number
  copies: number
  skipped: number
  pruned: number
  failures: string[]
  /** Bytes de imágenes (antes/después) para mostrar el ahorro. */
  bytesIn: number
  bytesOut: number
  /** Bytes copiados tal cual (audio/video). */
  bytesCopied: number
}

type Sharp = typeof import("sharp")

let sharpPromise: Promise<Sharp | null> | null = null
async function getSharp(): Promise<Sharp | null> {
  if (!sharpPromise) {
    sharpPromise = import("sharp").then((mod) => mod.default).catch(() => null)
  }
  return sharpPromise
}

function mtimeMs(file: string): number {
  try {
    return fs.statSync(file).mtimeMs
  } catch {
    return 0
  }
}

function isUpToDate(src: string, dest: string): boolean {
  return fs.existsSync(dest) && mtimeMs(dest) >= mtimeMs(src)
}

/**
 * Optimiza una imagen a WebP (full + thumb). Escribe a un temporal y renombra
 * para que nunca se sirva un archivo a medio escribir.
 */
async function writeImage(
  sharp: Sharp,
  srcAbs: string,
  destAbs: string,
  width: number,
  quality: number
): Promise<void> {
  fs.mkdirSync(path.dirname(destAbs), { recursive: true })
  const tmp = `${destAbs}.${process.pid}.tmp.webp`
  try {
    await sharp(srcAbs)
      // .rotate() sin argumentos aplica la orientación EXIF: las fotos de
      // celular vienen "acostadas" y sin esto el WebP sale de costado.
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toFile(tmp)
    fs.renameSync(tmp, destAbs)
  } catch (error) {
    if (fs.existsSync(tmp)) fs.rmSync(tmp, { force: true })
    throw error
  }
}

async function syncItem(
  kind: ContentKind,
  slug: string,
  itemDir: string,
  options: { force: boolean },
  stats: Stats,
  expected: Set<string>
) {
  const files = sortContentFiles(listContentFiles(itemDir))
  // La carpeta puede haber sido borrada mientras corría el sync
  if (files.length === 0 && !fs.existsSync(itemDir)) return
  const images = dedupeByDerived(files.filter(isImageFile))
  // Audio, video y segmentos de HLS: se copian tal cual (no se reconvierten).
  const copies = files.filter((f) => isPassthroughFile(f))

  for (const rel of images) {
    const fullRel = derivedMediaPath(kind, slug, rel)
    const thumbRel = derivedMediaPath(kind, slug, rel, "thumb")
    expected.add(path.resolve(PUBLIC_MEDIA_DIR, fullRel))
    expected.add(path.resolve(PUBLIC_MEDIA_DIR, thumbRel))

    const srcAbs = path.join(itemDir, rel)
    const fullAbs = path.join(PUBLIC_MEDIA_DIR, fullRel)
    const thumbAbs = path.join(PUBLIC_MEDIA_DIR, thumbRel)
    if (!options.force && isUpToDate(srcAbs, fullAbs) && isUpToDate(srcAbs, thumbAbs)) {
      stats.skipped++
      continue
    }

    const sharp = await getSharp()
    if (!sharp) {
      stats.failures.push(`${rel}: sharp no está disponible (pnpm install)`)
      continue
    }
    try {
      await writeImage(sharp, srcAbs, fullAbs, MAX_WIDTH[kind], 80)
      await writeImage(sharp, srcAbs, thumbAbs, THUMB_WIDTH[kind], 72)
      stats.images++
      stats.bytesIn += fs.statSync(srcAbs).size
      stats.bytesOut += fs.statSync(fullAbs).size + fs.statSync(thumbAbs).size
    } catch (error) {
      const relativePath = path.relative(CONTENT_DIR, srcAbs)
      const errorMessage = String(error)
      stats.failures.push(
        `${relativePath}: Sharp no pudo optimizar la imagen (${errorMessage}). ` +
          `Es probable que sea HEIC aunque tenga extensión .jpg. Convertí el archivo a un JPEG real ` +
          `(por ejemplo, con ImageMagick: convert origen.heic -auto-orient -quality 88 destino.jpg); ` +
          `no alcanza con cambiarle la extensión.`
      )
    }
  }

  for (const rel of copies) {
    const destRel = copiedMediaPath(kind, slug, rel)
    expected.add(path.resolve(PUBLIC_MEDIA_DIR, destRel))
    const srcAbs = path.join(itemDir, rel)
    const destAbs = path.join(PUBLIC_MEDIA_DIR, destRel)
    if (!options.force && isUpToDate(srcAbs, destAbs)) {
      stats.skipped++
      continue
    }
    const size = fs.statSync(srcAbs).size
    if (size > HEAVY_FILE_BYTES) {
      console.warn(
        `⚠️  ${path.relative(CONTENT_DIR, srcAbs)} pesa ${(size / 1024 / 1024).toFixed(0)} MB: mejor subilo a un bucket (NEXT_PUBLIC_MEDIA_BASE_URL)`
      )
    }
    fs.mkdirSync(path.dirname(destAbs), { recursive: true })
    const tmp = `${destAbs}.${process.pid}.tmp${extname(rel)}`
    fs.copyFileSync(srcAbs, tmp)
    fs.renameSync(tmp, destAbs)
    stats.copies++
    stats.bytesCopied += size
  }
}

/** Borra derivados que ya no tienen origen en `content/`. */
function prune(publicMedia: string, expected: Set<string>, stats: Stats) {
  if (!fs.existsSync(publicMedia)) return
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(abs)
        if (fs.readdirSync(abs).length === 0) fs.rmdirSync(abs)
      } else if (!expected.has(path.resolve(abs))) {
        fs.rmSync(abs, { force: true })
        stats.pruned++
      }
    }
  }
  walk(publicMedia)
}

interface SyncOptions {
  force?: boolean
  quiet?: boolean
}

async function syncMedia(options: SyncOptions = {}): Promise<Stats & { changed: boolean }> {
  const stats: Stats = {
    images: 0,
    copies: 0,
    skipped: 0,
    pruned: 0,
    failures: [],
    bytesIn: 0,
    bytesOut: 0,
    bytesCopied: 0
  }
  const expected = new Set<string>()

  if (!fs.existsSync(OUT_ROOT)) fs.mkdirSync(OUT_ROOT, { recursive: true })

  const kinds = Object.keys(KIND_DIR) as ContentKind[]
  for (const kind of kinds) {
    for (const { slug, dir } of contentItemDirs(kind)) {
      await syncItem(kind, slug, dir, { force: options.force ?? false }, stats, expected)
    }
  }
  prune(OUT_ROOT, expected, stats)

  const changed = stats.images > 0 || stats.copies > 0 || stats.pruned > 0
  if (!options.quiet) report(stats, changed)
  return { ...stats, changed }
}

function formatMb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function report(stats: Stats, changed: boolean) {
  const parts: string[] = []
  if (stats.images > 0) {
    const saved =
      stats.bytesIn > 0 ? ` (${formatMb(stats.bytesIn)} → ${formatMb(stats.bytesOut)})` : ""
    parts.push(`🖼️  ${stats.images} imagen${stats.images === 1 ? "" : "es"} optimizadas${saved}`)
  }
  if (stats.copies > 0) {
    parts.push(`📎 ${stats.copies} archivos de media copiados (${formatMb(stats.bytesCopied)})`)
  }
  if (stats.pruned > 0) parts.push(`🧹 ${stats.pruned} derivado(s) huérfano(s) borrados`)
  if (stats.skipped > 0) parts.push(`⏭️  ${stats.skipped} al día`)
  for (const failure of stats.failures) console.warn(`⚠️  ${failure}`)
  if (parts.length === 0) {
    if (!changed) console.log("✅ content/ sin cambios")
    return
  }
  console.log(`✅ ${parts.join(" • ")}`)
}

// ---------------------------------------------------------------- watch

function debounce(fn: () => void, ms: number): () => void {
  let timer: NodeJS.Timeout | null = null
  return () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn()
    }, ms)
  }
}

/** Firma rápida del árbol de content/ (para el fallback de polling). */
function contentSignature(): string {
  return listContentFiles(CONTENT_DIR)
    .map((rel) => `${rel}:${mtimeMs(path.join(CONTENT_DIR, rel))}`)
    .join("|")
}

function watchContent(onChange: () => void): () => void {
  try {
    const watcher = fs.watch(CONTENT_DIR, { recursive: true }, onChange)
    return () => watcher.close()
  } catch {
    // recursive no soportado (Linux con Node viejo): un watcher por carpeta
  }
  const closers: fs.FSWatcher[] = []
  try {
    for (const kind of Object.keys(KIND_DIR)) {
      const dir = path.join(CONTENT_DIR, kind)
      if (fs.existsSync(dir)) closers.push(fs.watch(dir, { recursive: true }, onChange))
    }
    if (closers.length > 0) return () => closers.forEach((c) => c.close())
  } catch {
    /* seguimos con polling */
  }
  let last = contentSignature()
  const interval = setInterval(() => {
    const current = contentSignature()
    if (current !== last) {
      last = current
      onChange()
    }
  }, 3000)
  return () => clearInterval(interval)
}

async function main() {
  const args = process.argv.slice(2)
  const force = args.includes("--force")
  const watch = args.includes("--watch") || args.includes("-w")

  console.log("🔄 sync:media — content/ → public/media/content/")
  const stats = await syncMedia({ force })
  if (stats.failures.length > 0 && !watch) {
    console.error(
      `❌ sync:media no pudo procesar ${stats.failures.length} archivo(s) de imagen; ` +
        "se cancela antes de ejecutar Next.js. Corregí o convertí las imágenes y volvé a correr pnpm build."
    )
    process.exitCode = 1
    return
  }

  if (!watch) return

  console.log("👀  Vigilando content/ … soltá fotos y aparecen solas (Ctrl+C para salir)")
  let running = false
  let pending = false
  const run = async () => {
    if (running) {
      pending = true
      return
    }
    running = true
    try {
      await syncMedia({})
    } catch (error) {
      console.error(`⚠️  sync falló: ${String(error)}`)
    } finally {
      running = false
      if (pending) {
        pending = false
        void run()
      }
    }
  }
  const onChange = debounce(() => void run(), 250)
  const close = watchContent(onChange)

  const stop = () => {
    close()
    process.exit(0)
  }
  process.on("SIGINT", stop)
  process.on("SIGTERM", stop)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
