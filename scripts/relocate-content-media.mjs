#!/usr/bin/env node
/**
 * Reubica archivos que Pages CMS dejó en la raíz de una media dentro de la
 * carpeta del ítem que los referencia desde su JSON.
 *
 * Pages CMS sube el archivo apenas el usuario lo elige en el formulario. Si
 * el ítem todavía se está creando (o si se usa Upload directo sobre el
 * campo), la carpeta del ítem no existe y el archivo cae en la raíz:
 *
 *   content/shows/foto.jpg
 *   content/gallery/foto.jpg
 *   content/songs/tema.mp3
 *
 * Recién al guardar la ficha, el JSON queda apuntando a
 * `/media/content/<tipo>/<archivo>`. Este script usa esa referencia para
 * mover el archivo a `content/<tipo>/<carpeta-del-ítem>/<archivo>` y corregir
 * el JSON. Lo corre el workflow `.github/workflows/relocate-content-media.yml`
 * después de cada push que toca `content/`, y también se puede correr a mano:
 *
 *   pnpm fix:content-media           # mueve y corrige
 *   pnpm fix:content-media -- --check # solo informa (falla si hay pendientes)
 *
 * Es intencionalmente conservador:
 * - solo mueve archivos que están en la raíz y están referenciados por el
 *   JSON de UN ítem (si dos ítems comparten el mismo archivo de raíz, no
 *   adivina: informa el conflicto y falla sin tocar nada);
 * - si en la carpeta destino ya hay un archivo con el mismo nombre y el
 *   mismo contenido, reutiliza ese y elimina el de la raíz;
 * - si el nombre ya existe con otro contenido, busca un sufijo libre
 *   (`-1`, `-2`, …) igual que hace Pages CMS ante un conflicto;
 * - los archivos de raíz que ningún JSON referencia quedan donde están
 *   (no hay forma de saber a qué ítem pertenecen);
 * - las carpetas/archivos que empiezan con `_` (plantillas) se ignoran.
 *
 * Solo usa la librería estándar de Node para que el workflow no necesite
 * instalar dependencias.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const CONTENT_DIR = path.join(ROOT_DIR, "content")

const CHECK_ONLY = process.argv.includes("--check")
const VERBOSE = process.argv.includes("--verbose")

/**
 * Tipos de contenido administrables desde el CMS. `jsonNames` refleja
 * `KIND_JSON` de `src/lib/content-media.ts` y `fields` los campos de media
 * que el formulario puede escribir con rutas de Pages CMS.
 */
const KINDS = [
  { dir: "shows", jsonNames: ["show.json"], fields: ["hero", "photo"] },
  { dir: "gallery", jsonNames: ["city.json", "_city.json"], fields: ["cover"] },
  { dir: "songs", jsonNames: ["track.json", "song.json"], fields: ["audio", "cover"] }
]

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".tif", ".tiff"])
const AUDIO_EXT = new Set([".mp3", ".wav", ".m4a", ".aac", ".ogg", ".oga", ".opus", ".flac", ".aiff"])

function isMediaFile(name) {
  const ext = path.extname(name).toLowerCase()
  return IMAGE_EXT.has(ext) || AUDIO_EXT.has(ext)
}

function isIgnoredName(name) {
  return name.startsWith("_") || name.startsWith(".")
}

function relativePosix(file) {
  return path.relative(ROOT_DIR, file).split(path.sep).join("/")
}

function decodeSafely(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * Si el valor del JSON apunta a la RAÍZ de la media de su tipo, devuelve el
 * nombre del archivo en la raíz (`foto.jpg`). En cualquier otro caso
 * (externo, nombre suelto de la carpeta, ruta ya dentro de una carpeta,
 * otro tipo de contenido) devuelve null y no se toca.
 *
 * Formatos aceptados (el primero es el que escribe Pages CMS):
 *   /media/content/shows/foto.jpg
 *   media/content/shows/foto.jpg
 *   content/shows/foto.jpg
 *   shows/foto.jpg
 */
function rootMediaFilename(value, kindDir) {
  if (typeof value !== "string") return null
  const raw = value.trim()
  if (!raw || /^(https?:)?\/\//i.test(raw) || raw.startsWith("data:")) return null

  const clean = decodeSafely(raw.split(/[?#]/)[0]).replace(/\\/g, "/").replace(/^\.\//, "")
  const withoutLeadingSlash = clean.replace(/^\/+/, "")
  const prefixes = [`media/content/${kindDir}/`, `content/${kindDir}/`, `${kindDir}/`]
  const prefix = prefixes.find((candidate) =>
    withoutLeadingSlash.toLowerCase().startsWith(candidate)
  )
  if (!prefix) return null

  const rest = withoutLeadingSlash.slice(prefix.length).replace(/^\/+/, "")
  // Tiene que ser exactamente un archivo en la raíz: sin subcarpetas.
  if (!rest || rest.includes("/") || rest === "." || rest === "..") return null
  if (isIgnoredName(rest) || !isMediaFile(rest)) return null
  return rest
}

function listItemDirs(kindDir) {
  const base = path.join(CONTENT_DIR, kindDir)
  if (!fs.existsSync(base)) return []
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !isIgnoredName(entry.name))
    .map((entry) => ({ slug: entry.name, dir: path.join(base, entry.name) }))
    .sort((a, b) => a.slug.localeCompare(b.slug))
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"))
  } catch (error) {
    throw new Error(`No se pudo leer ${relativePosix(file)}: ${error.message}`)
  }
}

/** Conserva el formato del JSON: reemplaza solo el string de ese campo. */
function replaceJsonFieldValue(text, field, oldValue, newValue) {
  const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const pattern = new RegExp(`("${escapedField}"\\s*:\\s*)"(?:\\\\.|[^"\\\\])*"`, "g")
  let replaced = 0
  const next = text.replace(pattern, (match, prefix) => {
    // El primer string con ese valor exacto es el que escribió el CMS.
    const current = JSON.parse(match.slice(prefix.length))
    if (current !== oldValue || replaced > 0) return match
    replaced += 1
    return prefix + JSON.stringify(newValue)
  })
  if (replaced !== 1) {
    throw new Error(`No se encontró "${field}": ${JSON.stringify(oldValue)} para corregir`)
  }
  return next
}

function sameFileContent(a, b) {
  const statA = fs.statSync(a)
  const statB = fs.statSync(b)
  if (statA.size !== statB.size) return false
  return fs.readFileSync(a).equals(fs.readFileSync(b))
}

/**
 * Nombre libre dentro de la carpeta destino (o el mismo si ya es idéntico).
 * `reserved` evita que dos archivos de la misma corrida planifiquen el mismo
 * destino cuando uno necesita sufijo (`foto-1.jpg`) y otro ya se llama así.
 */
function destinationName(itemDir, filename, sourceFile, reserved) {
  const ext = path.extname(filename)
  const stem = filename.slice(0, filename.length - ext.length)
  for (let index = 0; index < 1000; index += 1) {
    const candidate = index === 0 ? filename : `${stem}-${index}${ext}`
    const candidateFile = path.join(itemDir, candidate)
    if (reserved.has(candidateFile)) continue
    if (!fs.existsSync(candidateFile)) {
      reserved.add(candidateFile)
      return { name: candidate, file: candidateFile, identical: false }
    }
    if (sameFileContent(sourceFile, candidateFile)) {
      reserved.add(candidateFile)
      return { name: candidate, file: candidateFile, identical: true }
    }
  }
  throw new Error(`No hay un nombre libre para ${filename} en ${relativePosix(itemDir)}`)
}

function collectRelocations() {
  const relocations = []
  const problems = []
  const bySource = new Map()

  for (const kind of KINDS) {
    const kindRoot = path.join(CONTENT_DIR, kind.dir)
    for (const { slug, dir: itemDir } of listItemDirs(kind.dir)) {
      const jsonName = kind.jsonNames.find((name) => fs.existsSync(path.join(itemDir, name)))
      if (!jsonName) continue
      const jsonFile = path.join(itemDir, jsonName)
      const data = readJson(jsonFile)

      for (const field of kind.fields) {
        const value = data?.[field]
        const filename = rootMediaFilename(value, kind.dir)
        if (!filename) continue

        const sourceFile = path.join(kindRoot, filename)
        const relocation = {
          kindDir: kind.dir,
          slug,
          itemDir,
          jsonFile,
          field,
          oldValue: value,
          filename,
          sourceFile
        }
        relocations.push(relocation)

        const group = bySource.get(sourceFile) ?? []
        group.push(relocation)
        bySource.set(sourceFile, group)

        if (!fs.existsSync(sourceFile)) {
          problems.push(
            `${relativePosix(jsonFile)}: "${field}" apunta a ${value}, pero no existe ${relativePosix(sourceFile)}`
          )
        }
      }
    }
  }

  for (const [sourceFile, group] of bySource.entries()) {
    const destinations = new Set(group.map((item) => item.itemDir))
    if (destinations.size > 1) {
      const refs = group
        .map((item) => `${relativePosix(item.jsonFile)} ("${item.field}")`)
        .join(", ")
      problems.push(
        `${relativePosix(sourceFile)} está referenciado por más de un ítem (${refs}); no se mueve automáticamente para no adivinar a cuál pertenece`
      )
    }
  }

  return { relocations, problems }
}

function listUnreferencedRootMedia(relocations) {
  const referenced = new Set(relocations.map((item) => item.sourceFile))
  const unreferenced = []
  for (const kind of KINDS) {
    const kindRoot = path.join(CONTENT_DIR, kind.dir)
    if (!fs.existsSync(kindRoot)) continue
    for (const entry of fs.readdirSync(kindRoot, { withFileTypes: true })) {
      if (!entry.isFile() || isIgnoredName(entry.name) || !isMediaFile(entry.name)) continue
      const file = path.join(kindRoot, entry.name)
      if (!referenced.has(file)) unreferenced.push(file)
    }
  }
  return unreferenced
}

function applyRelocations(relocations) {
  // Primero se resuelven los destinos y se preparan/validan todos los JSON
  // (sin tocar nada). Recién después se mueven los archivos y se escriben
  // los JSON, para no dejar el árbol a medias ante un conflicto inesperado.
  const reservedDestinations = new Set()
  const planBySource = new Map()
  for (const relocation of relocations) {
    if (planBySource.has(relocation.sourceFile)) continue
    planBySource.set(
      relocation.sourceFile,
      destinationName(
        relocation.itemDir,
        relocation.filename,
        relocation.sourceFile,
        reservedDestinations
      )
    )
  }

  const updatedJsons = new Map()
  for (const relocation of relocations) {
    const destination = planBySource.get(relocation.sourceFile)
    const newValue = `/media/content/${relocation.kindDir}/${relocation.slug}/${destination.name}`
    const text =
      updatedJsons.get(relocation.jsonFile) ?? fs.readFileSync(relocation.jsonFile, "utf8")
    const nextText = replaceJsonFieldValue(text, relocation.field, relocation.oldValue, newValue)
    JSON.parse(nextText) // validar antes de mover/escribir nada
    updatedJsons.set(relocation.jsonFile, nextText)
    relocation.newValue = newValue
  }

  const moved = []
  for (const [sourceFile, destination] of planBySource.entries()) {
    if (!destination.identical) {
      fs.mkdirSync(path.dirname(destination.file), { recursive: true })
      fs.renameSync(sourceFile, destination.file)
    } else {
      fs.unlinkSync(sourceFile)
    }
    moved.push({ sourceFile, destination })
  }

  for (const [jsonFile, text] of updatedJsons.entries()) {
    fs.writeFileSync(jsonFile, text, "utf8")
  }

  return moved
}

function main() {
  const { relocations, problems } = collectRelocations()
  const unreferenced = listUnreferencedRootMedia(relocations)

  if (unreferenced.length > 0) {
    console.log("Archivos en la raíz sin ninguna referencia (quedan donde están):")
    for (const file of unreferenced) console.log(`  - ${relativePosix(file)}`)
  }

  if (problems.length > 0) {
    console.error("No se reubicó nada porque hay referencias que requieren revisión manual:")
    for (const problem of problems) console.error(`  - ${problem}`)
    process.exitCode = 1
    return
  }

  if (relocations.length === 0) {
    console.log("No hay archivos referenciados en la raíz de shows/gallery/songs.")
    return
  }

  if (CHECK_ONLY) {
    console.error("Hay archivos para reubicar:")
    for (const item of relocations) {
      console.error(
        `  - ${relativePosix(item.sourceFile)} -> content/${item.kindDir}/${item.slug}/${item.filename} (desde ${relativePosix(item.jsonFile)}, campo "${item.field}")`
      )
    }
    process.exitCode = 1
    return
  }

  const moved = applyRelocations(relocations)
  console.log(`Reubicados ${moved.length} archivo(s):`)
  for (const item of relocations) {
    console.log(
      `  - ${relativePosix(item.sourceFile)} -> content/${item.kindDir}/${item.slug}/${path.basename(item.newValue)} (${relativePosix(item.jsonFile)}, campo "${item.field}")`
    )
  }
  if (VERBOSE) {
    for (const item of relocations) console.log(`    ${item.field}: ${item.oldValue} -> ${item.newValue}`)
  }
}

main()
