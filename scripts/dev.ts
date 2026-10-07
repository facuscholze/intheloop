#!/usr/bin/env tsx
/**
 * pnpm dev
 *
 * Levanta `next dev` y, en paralelo, el watcher de `content/` que materializa
 * las imágenes en `public/media/content/`. Resultado: soltás una foto en
 * `content/gallery/<ciudad>/` (o un `hero.jpg` en la carpeta de un show) y
 * aparece sola en el sitio, sin reiniciar nada ni correr otro comando.
 */
import { spawn, type ChildProcess } from "node:child_process"

const children: ChildProcess[] = []
let shuttingDown = false

function shutdown(code: number) {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill("SIGTERM")
  }
  setTimeout(() => process.exit(code), 150)
}

function start(label: string, command: string, args: string[]) {
  const child = spawn(command, args, {
    stdio: "inherit",
    // En Windows los binarios de node_modules/.bin son .cmd
    shell: process.platform === "win32",
    env: process.env
  })
  child.on("error", (error) => {
    console.error(`⚠️  ${label} no arrancó: ${String(error)}`)
    shutdown(1)
  })
  child.on("exit", (code) => {
    if (!shuttingDown) shutdown(code ?? 0)
  })
  children.push(child)
  return child
}

process.on("SIGINT", () => shutdown(0))
process.on("SIGTERM", () => shutdown(0))

start("sync:media", "tsx", ["scripts/sync-media.ts", "--watch"])
// -H 0.0.0.0 para que la preview sea accesible desde fuera del contenedor.
start("next dev", "next", ["dev", "-H", "0.0.0.0"])
