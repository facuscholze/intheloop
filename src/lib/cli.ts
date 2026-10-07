/**
 * CLI helpers for content scripts
 * Simple prompts via readline, no external deps
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

export function prompt(question: string, defaultValue?: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const q = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
  return new Promise((resolve) => {
    rl.question(q, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue || "");
    });
  });
}

export async function promptNumber(question: string, defaultValue?: number): Promise<number | null> {
  const answer = await prompt(question, defaultValue?.toString());
  if (!answer) return null;
  const num = Number(answer);
  return isNaN(num) ? null : num;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function logStep(msg: string) {
  console.log(`\n✦ ${msg}`);
}

export function logSuccess(msg: string) {
  console.log(`✅ ${msg}`);
}

export function logWarn(msg: string) {
  console.log(`⚠️  ${msg}`);
}

/**
 * Copia un archivo (de `media-src/`, del Escritorio, donde sea) a la carpeta
 * del item en `content/`, conservando la extensión. Devuelve el nombre final
 * del archivo dentro de la carpeta (lo que va en el JSON) o null si no hay
 * nada para copiar.
 */
export function copyIntoContentFolder(
  sourcePath: string,
  itemDir: string,
  destBaseName: string
): string | null {
  const source = sourcePath.trim();
  if (!source) return null;
  if (!fs.existsSync(source)) {
    logWarn(`No encontré ${source}`);
    return null;
  }
  const ext = path.extname(source).toLowerCase();
  const fileName = `${destBaseName}${ext}`;
  fs.mkdirSync(itemDir, { recursive: true });
  fs.copyFileSync(source, path.join(itemDir, fileName));
  logSuccess(`${source} → ${path.join(itemDir, fileName)}`);
  return fileName;
}

/** Primer archivo existente de una lista de candidatos. */
export function findFirstExisting(candidates: string[]): string | null {
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return null;
}
