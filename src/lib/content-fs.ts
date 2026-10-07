/**
 * Filesystem de `content/` — compartido por los loaders (`src/lib/content.ts`)
 * y por `scripts/sync-media.ts` para que ambos vean exactamente lo mismo:
 * qué carpetas son items, qué archivos entran y qué se ignora.
 *
 * Convención: todo lo que empieza con `_` o `.` se ignora (`_TEMPLATE`, `.DS_Store`).
 */
import fs from "node:fs"
import path from "node:path"
import { isIgnoredName, KIND_DIR, type ContentKind } from "./content-media"

export const CONTENT_DIR = path.join(process.cwd(), "content")
export const PUBLIC_MEDIA_DIR = path.join(process.cwd(), "public", "media")

const warned = new Set<string>()

/** Aviso una sola vez por build (si no, se repite en cada render). */
export function warnOnce(message: string) {
  if (warned.has(message)) return
  warned.add(message)
  console.warn(`⚠️  ${message}`)
}

export function listContentDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !isIgnoredName(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "es", { numeric: true }))
}

/** Archivos dentro de una carpeta (recursivo), relativos y en POSIX. */
export function listContentFiles(dir: string, base = dir): string[] {
  if (!fs.existsSync(dir)) return []
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (isIgnoredName(entry.name)) continue
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listContentFiles(abs, base))
    else if (entry.isFile()) out.push(path.relative(base, abs).split(path.sep).join("/"))
  }
  return out
}

/**
 * Lee el JSON del item dentro de su carpeta: el nombre canónico
 * (`show.json`, `song.json`, `video.json`, `_city.json`) o el primer `.json`
 * que haya, para que se pueda llamar como sea.
 */
export function readFolderJson(
  dir: string,
  primaryName: string
): { data: unknown; file: string } | null {
  if (!fs.existsSync(dir)) return null
  const jsonFiles = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"))
    .map((entry) => entry.name)
    .sort()
  if (jsonFiles.length === 0) return null
  const file = jsonFiles.includes(primaryName)
    ? primaryName
    : (jsonFiles.find((name) => !isIgnoredName(name)) ?? jsonFiles[0])
  const ignored = jsonFiles.filter((name) => name !== file)
  if (ignored.length > 0) {
    warnOnce(
      `${path.basename(dir)}/ tiene varios JSON (${jsonFiles.join(", ")}): uso ${file} e ignoro el resto`
    )
  }
  try {
    return { data: JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8")), file }
  } catch (error) {
    warnOnce(`${path.basename(dir)}/${file} tiene un JSON inválido: ${String(error)}`)
    return null
  }
}

/** Carpetas de item de un tipo: content/<tipo>/<slug>/ */
export function contentItemDirs(kind: ContentKind): { slug: string; dir: string }[] {
  const base = path.join(CONTENT_DIR, KIND_DIR[kind])
  return listContentDirs(base).map((slug) => ({ slug, dir: path.join(base, slug) }))
}

export function mediaExists(mediaRelPath: string): boolean {
  return fs.existsSync(path.join(PUBLIC_MEDIA_DIR, mediaRelPath))
}
